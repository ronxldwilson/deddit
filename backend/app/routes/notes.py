from fastapi import APIRouter, Request, HTTPException, Depends
from typing import List

from ..db.synthetic_models import ActionType
from ..db.db import db
from ..db.models import User, Note
from ..models import UserIn, NoteIn
from ..utils.logger import logger
from ..utils.session_manager import session_manager

router = APIRouter()

def get_current_user(request: Request):
    db_session = next(db.get_db())
    user_id = request.headers.get("x-user-id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db_session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register")
def register(user_in: UserIn, request: Request):
    session_id = request.query_params.get("session_id", "no_session")
    db_session = next(db.get_db())

    # Check if username already exists
    existing_user = db_session.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    new_user = User(
        username=user_in.username,
        password=user_in.password  # In production, hash this password
    )
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    logger.log_action(
        session_id, 
        ActionType.DB_UPDATE, 
        {
            "table_name": "users", 
            "update_type": "insert", 
            "text": f"User {new_user.username} created in database with id {new_user.id}, username {new_user.username}, password {new_user.password}",
            "values": {
                "id": new_user.id,
                "username": new_user.username,
                "password": new_user.password,
                "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
                "updated_at": new_user.updated_at.isoformat() if new_user.updated_at else None
            }
        }
    )

    return {"userId": new_user.id, "username": new_user.username}

@router.post("/login")
def login(user_in: UserIn, request: Request):
    session_id = request.query_params.get("session_id", "no_session")
    db_session = next(db.get_db())
    
    user = db_session.query(User).filter(
        User.username == user_in.username,
        User.password == user_in.password  # In production, use proper password verification
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_id = request.query_params.get("session_id", "no_session")
    logger.log_action(
        session_id,
        ActionType.CUSTOM,
        {
            "custom_action": "login", 
            "text": f"User {user.username} logged in",
            "data": {"userId": user.id}
        }
    )

    return {"userId": user.id}

@router.post("/notes", response_model=dict)
def create_note(note_in: NoteIn, request: Request, user: User = Depends(get_current_user)):
    session_id = session_manager.get_session()
    db_session = next(db.get_db())

    new_note = Note(
        title=note_in.title,
        content=note_in.content,
        user_id=user.id
    )
    db_session.add(new_note)
    db_session.commit()
    db_session.refresh(new_note)

    logger.log_action(
        session_id, 
        ActionType.DB_UPDATE, 
        {
            "table_name": "notes", 
            "update_type": "insert", 
            "text": f"Note {new_note.title} created in database with id {new_note.id}, title {new_note.title}, content {new_note.content}",
            "values": {
                "id": new_note.id,
                "title": new_note.title,
                "content": new_note.content,
                "created_at": new_note.created_at.isoformat() if new_note.created_at else None,
                "updated_at": new_note.updated_at.isoformat() if new_note.updated_at else None
            }
        }
    )
    
    return {
        "id": new_note.id,
        "title": new_note.title,
        "content": new_note.content,
        "created_at": new_note.created_at,
        "updated_at": new_note.updated_at
    }

@router.get("/notes", response_model=List[dict])
def get_notes():
    db_session = next(db.get_db())
    notes = db_session.query(Note).all()
    return [{"id": note.id, "title": note.title, "content": note.content} for note in notes]

@router.get("/notes/{note_id}", response_model=dict)
def get_note(note_id: int):
    db_session = next(db.get_db())
    note = db_session.query(Note).filter(Note.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"id": note.id, "title": note.title, "content": note.content}

@router.put("/notes/{note_id}", response_model=dict)
def update_note(note_id: int, note_in: NoteIn, request: Request, user: User = Depends(get_current_user)):
    session_id = session_manager.get_session()
    db_session = next(db.get_db())

    note = db_session.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note.title = note_in.title
    note.content = note_in.content
    db_session.commit()
    db_session.refresh(note)

    logger.log_action(
        session_id,
        ActionType.DB_UPDATE,
        {
            "table_name": "notes",
            "update_type": "update",
            "text": f"Note {note.title} updated in database with id {note.id}, title {note.title}, content {note.content}",
            "values": {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "created_at": note.created_at.isoformat() if note.created_at else None,
                "updated_at": note.updated_at.isoformat() if note.updated_at else None
            }
        }
    )

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, request: Request, user: User = Depends(get_current_user)):
    session_id = session_manager.get_session()
    db_session = next(db.get_db())
    
    note = db_session.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db_session.delete(note)
    db_session.commit()

    logger.log_action(
        session_id,
        ActionType.DB_UPDATE,
        {
            "table_name": "notes",
            "update_type": "delete",
            "text": f"Note {note.title} deleted from database with id {note.id}",
            "values": {"noteId": note_id}
        }
    )
    
    return {"status": "deleted"}

