from pydantic import BaseModel # type: ignore
from typing import Optional, List
from datetime import datetime

class UserIn(BaseModel):
    username: str
    password: str

class NoteIn(BaseModel):
    title: str
    content: str
    
class PostCreate(BaseModel): 
    title: str
    content: str
    subreddit: str 
    user_id: str  
    

class CommentCreate(BaseModel):
    content: str
    post_id: int
    author_id: str
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author_username: str
    parent_id: Optional[int] = None
    children: List["CommentResponse"] = []
    votes: int  # <-- Add this line
    class Config:
        orm_mode = True
class VoteCreate(BaseModel):
    post_id: int
    value: int  # 1 or -1

class VoteResponse(BaseModel):
    id: str
    user_id: str
    post_id: int
    value: int 
 

CommentResponse.update_forward_refs()
