from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from ..db.db import db as database
from ..db.models import User, Post, Comment, SavedComment, SavedPost

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", summary="List all users")
def list_users(db: Session = Depends(database.get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        }
        for user in users
    ]


@router.get("/{user_id}", summary="Get user by ID")
def get_user(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "username": user.username,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "notes": [{"id": note.id, "title": note.title} for note in user.notes],
        "posts": [{"id": post.id, "title": post.title} for post in user.posts],
    }


@router.get("/{user_id}/posts", summary="Get all posts by user")
def get_user_posts(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return [
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "votes": post.votes,
            "subreddit": post.subreddit,
        }
        for post in user.posts
    ]



@router.get("/{user_id}/comments", summary="Get all comments by user")
def get_user_comments(user_id: str, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return [
        {
            "id": comment.id,
            "content": comment.content,
            "post_id": comment.post_id,
            "post_title": comment.post.title if comment.post else None,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
        }
        for comment in user.comments
    ]
    
@router.get("/{user_id}/saved_posts")
def get_saved_posts(user_id: str, db: Session = Depends(database.get_db)):
    saved = db.query(SavedPost).filter_by(user_id=user_id).all()
    return [s.post for s in saved] 

@router.get("/{user_id}/saved_comments")
def get_saved_comments(user_id: str, db: Session = Depends(database.get_db)):
    saved = db.query(SavedComment).filter_by(user_id=user_id).all()
    return [s.comment for s in saved]
