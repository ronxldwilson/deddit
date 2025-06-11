# app/routes/comments.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.db import db as database
from ..db.models import Comment, User, Post
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
                children=children
            ))
    return tree 

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(database.get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
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
