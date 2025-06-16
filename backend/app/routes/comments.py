# app/routes/comments.py

import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request # type: ignore
from sqlalchemy.orm import Session, joinedload # type: ignore
from sqlalchemy import func # type: ignore
from ..db.db import db as database
from ..db.models import Comment, User, Post, CommentVote
from ..models import CommentCreate, CommentResponse

from ..utils.logger import logger
from ..db.synthetic_models import ActionType

router = APIRouter()

def build_comment_tree(comments, parent_id=None, db=None):
    """Build comment tree with actual vote counts"""
    tree = []
    for comment in comments: 
        if comment.parent_id == parent_id: 
            children = build_comment_tree(comments, comment.id, db)
            
            # Calculate actual vote count from database
            vote_sum = db.query(func.sum(CommentVote.value)).filter(CommentVote.comment_id == comment.id).scalar() or 0
            
            tree.append(CommentResponse(
                id=comment.id,
                content=comment.content,
                created_at=comment.created_at,
                author_username=comment.author.username,
                parent_id=comment.parent_id,
                post_id=comment.post_id,
                children=children, 
                votes=vote_sum  # Use actual vote count instead of random
            )) 
    return tree 

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(database.get_db)):
    """Get all comments for a post with actual vote counts"""
    comments = db.query(Comment)\
        .options(joinedload(Comment.author), joinedload(Comment.votes))\
        .filter(Comment.post_id == post_id)\
        .all()
    return build_comment_tree(comments, db=db)

@router.get("/comments/{comment_id}", response_model=CommentResponse)
def get_comment(comment_id: int, db: Session = Depends(database.get_db)):
    """Get a single comment by ID with its current vote count"""
    comment = db.query(Comment)\
        .options(joinedload(Comment.author), joinedload(Comment.votes))\
        .filter(Comment.id == comment_id)\
        .first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Calculate actual vote count from the database
    vote_sum = db.query(func.sum(CommentVote.value)).filter(CommentVote.comment_id == comment_id).scalar() or 0
    
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        author_username=comment.author.username,
        parent_id=comment.parent_id,
        post_id=comment.post_id,
        children=[],  # Single comment doesn't need children populated
        votes=vote_sum  # Return actual vote count
    )

@router.post("/comments/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(database.get_db)):
    print("Received comment:", comment)
    user = db.query(User).filter(User.id == comment.author_id).first()
    post = db.query(Post).filter(Post.id == comment.post_id).first()

    if not user or not post:
        raise HTTPException(status_code=404, detail="User or Post not found")

    db_comment = Comment( 
        content=comment.content,
        post_id=comment.post_id,
        author_id=comment.author_id,
        parent_id=comment.parent_id
    )

    db.add(db_comment)
    db.commit()
    db.refresh(db_comment) 

    return CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        created_at=db_comment.created_at,
        author_username=user.username, 
        parent_id=db_comment.parent_id,
        post_id=db_comment.post_id,    
        children=[],
        votes=0  # New comments start with 0 votes
    )

@router.post("/comments/{comment_id}/vote")
def vote_on_comment(comment_id: int, vote: dict, request: Request, db: Session = Depends(database.get_db)):
    session_id = request.headers.get("x-session-id", "no_session")

    user_id = vote.get("user_id")
    value = vote.get("value")  # should be 1 (upvote), -1 (downvote), or 0 (neutral/remove)

    if value not in [1, -1, 0]:
        raise HTTPException(status_code=400, detail="Invalid vote value")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing_vote = db.query(CommentVote).filter_by(user_id=user_id, comment_id=comment_id).first()

    if value == 0:
        if existing_vote:
            db.delete(existing_vote)
            db.commit()

            logger.log_action(
                session_id,
                ActionType.DB_UPDATE,
                {
                    "table_name": "comment_votes",
                    "update_type": "delete",
                    "text": f"User {user_id} removed vote from Comment {comment_id}",
                    "values": {
                        "comment_id": comment_id,
                        "user_id": user_id,
                        "old_value": existing_vote.value
                    }
                }
            )
        return {"status": "vote removed"}

    # Upvote or downvote
    if existing_vote:
        old_value = existing_vote.value
        existing_vote.value = value
        update_type = "update"
    else:
        new_vote = CommentVote(user_id=user_id, comment_id=comment_id, value=value)
        db.add(new_vote)
        old_value = None
        update_type = "insert"

    db.commit()

    logger.log_action(
        session_id,
        ActionType.DB_UPDATE,
        {
            "table_name": "comment_votes",
            "update_type": update_type,
            "text": (
                f"User {user_id} {'updated' if update_type == 'update' else 'cast'} vote "
                f"on Comment {comment_id} with value {value}"
            ),
            "values": {
                "comment_id": comment_id,
                "user_id": user_id,
                "old_value": old_value,
                "new_value": value
            }
        }
    )

    return {"status": "vote recorded"}
 

    # # Return updated vote count
    # vote_sum = db.query(func.sum(CommentVote.value)).filter(CommentVote.comment_id == comment_id).scalar() or 0
    # return {"message": "Vote recorded", "votes": vote_sum} 

@router.put("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: int,
    updated_data: CommentCreate,
    request: Request,
    db: Session = Depends(database.get_db)
):
    session_id = request.headers.get("x-session-id", "no_session")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    old_content = comment.content
    comment.content = updated_data.content
    db.commit()
    db.refresh(comment)

    vote_sum = db.query(func.sum(CommentVote.value)).filter(CommentVote.comment_id == comment_id).scalar() or 0

    logger.log_action(
        session_id,
        ActionType.DB_UPDATE,
        {
            "table_name": "comments",
            "update_type": "update",
            "text": f"User updated comment {comment_id}",
            "values": {
                "comment_id": comment.id,
                "old_content": old_content,
                "new_content": comment.content,
                "votes": vote_sum,
            },
        }
    )

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        author_username=comment.author.username,
        parent_id=comment.parent_id,
        post_id=comment.post_id,
        children=[],
        votes=vote_sum,
    )

@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, request: Request, db: Session = Depends(database.get_db)):
    session_id = request.headers.get("x-session-id", "no_session")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db.delete(comment)
    db.commit()

    logger.log_action(
        session_id,
        ActionType.DB_UPDATE,
        {
            "table_name": "comments",
            "update_type": "delete",
            "text": f"User deleted comment {comment_id}",
            "values": {
                "comment_id": comment_id,
                "post_id": comment.post_id,
                "author_id": comment.author_id,
            }, 
        }
    )

    return {"message": "Comment deleted"}
