# app/routes/posts.py

from fastapi import APIRouter, Depends, HTTPException, Request  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from pydantic import BaseModel  # type: ignore

from ..db.db import db as database
from ..db.models import Post, Vote
from ..utils.logger import logger
from ..utils.session_manager import session_manager
from ..db.synthetic_models import ActionType

router = APIRouter()

class VoteRequest(BaseModel):
    post_id: int 
    user_id: str
    vote: str  # "up", "down", "neutral"

@router.post("/vote")
def vote_on_post(vote_data: VoteRequest, request: Request, db: Session = Depends(database.get_db)):
    session_id = request.headers.get("x-session-id", "no_session")

    post = db.query(Post).filter(Post.id == vote_data.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_vote = (
        db.query(Vote)
        .filter(Vote.post_id == vote_data.post_id, Vote.user_id == vote_data.user_id)
        .first()
    )

    if vote_data.vote == "neutral":
        if existing_vote:
            db.delete(existing_vote)
            post.votes -= existing_vote.value

            logger.log_action(
                session_id,
                ActionType.DB_UPDATE,
                {
                    "table_name": "votes",
                    "update_type": "delete",
                    "text": f"User {vote_data.user_id} removed their vote on Post {vote_data.post_id}",
                    "values": {
                        "post_id": vote_data.post_id,
                        "user_id": vote_data.user_id,
                        "removed_value": existing_vote.value,
                        "new_total_votes": post.votes
                    }
                }
            )

    else:
        new_value = 1 if vote_data.vote == "up" else -1
        if existing_vote:
            if existing_vote.value == new_value:
                return {"message": "Vote unchanged", "new_votes": post.votes}

            post.votes += new_value - existing_vote.value

            logger.log_action(
                session_id,
                ActionType.DB_UPDATE,
                {
                    "table_name": "votes",
                    "update_type": "update",
                    "text": f"User {vote_data.user_id} changed vote on Post {vote_data.post_id}",
                    "values": {
                        "post_id": vote_data.post_id,
                        "user_id": vote_data.user_id,
                        "old_value": existing_vote.value,
                        "new_value": new_value,
                        "new_total_votes": post.votes
                    }
                }
            )
            existing_vote.value = new_value
        else:
            new_vote = Vote(user_id=vote_data.user_id, post_id=vote_data.post_id, value=new_value)
            db.add(new_vote)
            post.votes += new_value

            logger.log_action(
                session_id,
                ActionType.DB_UPDATE,
                {
                    "table_name": "votes",
                    "update_type": "insert",
                    "text": f"User {vote_data.user_id} cast a new vote on Post {vote_data.post_id}",
                    "values": {
                        "post_id": vote_data.post_id,
                        "user_id": vote_data.user_id,
                        "value": new_value,
                        "new_total_votes": post.votes
                    }
                }
            )

    db.commit()
    return {"message": "Vote recorded", "new_votes": post.votes}
