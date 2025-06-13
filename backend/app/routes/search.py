# app/routes/search.py

from fastapi import APIRouter, Depends, HTTPException # type: ignore

from sqlalchemy.orm import Session # type: ignore
from pydantic import BaseModel # type: ignore
from ..db.db import db as database
from ..db.models import Post, Vote, User  # Import your models

router = APIRouter()

# FastAPI route
@router.get("/search")
def search(q: str, db: Session = Depends(database.get_db)):
    return db.query(Post).filter(Post.title.contains(q)).limit(10).all()

