# routes/messages.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.models import User
from ..db.db import db as database
from ..db.models import Message, User  # include User if not already
from app.models import MessageCreate, MessageRead

router = APIRouter() 

# Use the shared get_db function
def get_db():
    return database.get_db()

# Temporary mock implementation of get_current_user
def get_current_user(db: Session = Depends(database.get_db)) -> User:
    user = db.query(User).first()  # Replace this with actual authentication later
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user

@router.get("/messages", response_model=list[MessageRead])
def get_messages_between_users(
    user1: str = Query(...),
    user2: str = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(Message).filter(
        ((Message.sender_id == user1) & (Message.receiver_id == user2)) |
        ((Message.sender_id == user2) & (Message.receiver_id == user1))
    ).order_by(Message.timestamp.asc()).all()


@router.post("/messages/", response_model=MessageRead) 
def send_message(msg: MessageCreate, db: Session = Depends(database.get_db)):
    message = Message(**msg.dict())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/messages/{user_id}", response_model=list[MessageRead])
def get_messages(user_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(database.get_db)):
    return db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
        ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()
