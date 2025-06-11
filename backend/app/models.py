from pydantic import BaseModel

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