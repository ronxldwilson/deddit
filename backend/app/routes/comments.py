# app/routes/comments.py

import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..db.db import db as database
from ..db.models import Comment, User, Post, CommentVote
from ..models import CommentCreate, CommentResponse

router = APIRouter()

def build_comment_tree(comments, parent_id=None):
    tree = []
    for comment in comments:
        if comment.parent_id == parent_id:
            children = build_comment_tree(comments, comment.id)
            tree.append(CommentResponse(
                id=comment.id,
                content=comment.content,
                created_at=comment.created_at,
                author_username=comment.author.username,
                parent_id=comment.parent_id,
                children=children, 
                votes=random.randint(-5, 100)  # Simulating votes for the example
            )) 
    return tree 

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(database.get_db)):
    comments = db.query(Comment)\
        .options(joinedload(Comment.author), joinedload(Comment.votes))\
        .filter(Comment.post_id == post_id)\
        .all()
    return build_comment_tree(comments)

@router.post("/comments/", response_model=CommentResponse)
def create_comment(comment: CommentCreate, db: Session = Depends(database.get_db)):
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
        children=[]
    )


@router.post("/comments/{comment_id}/vote")
def vote_on_comment(comment_id: int, vote: dict, db: Session = Depends(database.get_db)):
    user_id = vote.get("user_id")
    value = vote.get("value")  # 1 or -1 

    if value not in [1, -1]:
        raise HTTPException(status_code=400, detail="Invalid vote value")

    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing_vote = db.query(CommentVote).filter_by(user_id=user_id, comment_id=comment_id).first()

    if existing_vote:
        existing_vote.value = value  # Update the vote
    else:
        new_vote = CommentVote(user_id=user_id, comment_id=comment_id, value=value)
        db.add(new_vote)

    db.commit()
    return {"message": "Vote recorded"}
