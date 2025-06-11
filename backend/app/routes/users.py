from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db.db import db as database
from ..db.models import User

router = APIRouter()

@router.get("/debug/users")
def list_users(db: Session = Depends(database.get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "password": user.password,  # In production, never expose passwords
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            "posts": [post.id for post in user.posts],
            "notes": [note.id for note in user.notes], 
            
        }
        for user in users
    ] 
