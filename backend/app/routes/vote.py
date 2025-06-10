# app/routes/posts.py

from fastapi import APIRouter, Depends, HTTPException # type: ignore

from sqlalchemy.orm import Session # type: ignore
from pydantic import BaseModel # type: ignore
from ..db.db import db as database
from ..db.models import Post, Vote, User  # Import your models

router = APIRouter()

class VoteRequest(BaseModel):
    post_id: int 
    user_id: int 
    vote: str  # "up", "down", "neutral"

@router.post("/vote")
def vote_on_post(vote_data: VoteRequest, db: Session = Depends(database.get_db)):
    post = db.query(Post).filter(Post.id == vote_data.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_vote = (
        db.query(Vote)
        .filter(Vote.post_id == vote_data.post_id, Vote.user_id == vote_data.user_id)
        .first()
    )

    # Neutral: Remove vote
    if vote_data.vote == "neutral":
        if existing_vote:
            db.delete(existing_vote)
            post.votes -= existing_vote.value
    else:
        new_value = 1 if vote_data.vote == "up" else -1
        if existing_vote:
            if existing_vote.value == new_value:
                return {"message": "Vote unchanged", "new_votes": post.votes}
            # Change vote
            post.votes += new_value - existing_vote.value
            existing_vote.value = new_value
        else:
            new_vote = Vote(user_id=vote_data.user_id, post_id=vote_data.post_id, value=new_value)
            db.add(new_vote)
            post.votes += new_value

    db.commit()
    return {"message": "Vote recorded", "new_votes": post.votes}