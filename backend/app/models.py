#app/models.py

from pydantic import BaseModel, Field # type: ignore
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
    post_id: int  # <-- Add this
    children: List["CommentResponse"] = Field(default_factory=list)
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

class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    content: str

class MessageRead(BaseModel):
    id: str  # ✅ fix here
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True

class MessageResponse(BaseModel):
    id: str  # ✅ fix here
    sender_id: str
    receiver_id: str
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True 

class PostUpdate(BaseModel):
    title: str
    content: str
    
CommentResponse.update_forward_refs()
