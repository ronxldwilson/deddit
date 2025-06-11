# app/routes/posts.py

from app.models import PostCreate
from fastapi import APIRouter, Depends, HTTPException, Path # type: ignore
from faker import Faker # type: ignore

from sqlalchemy.orm import Session # type: ignore
from pydantic import BaseModel # type: ignore
from ..db.db import db as database 
from ..db.models import Post, User  # Import your models

router = APIRouter()

fake = Faker() 

@router.get("/posts")
def get_fake_posts(db: Session = Depends(database.get_db)):
    # Check if there are any posts in the database
    posts = db.query(Post).all()
    if not posts:
        # Seed the database with fake posts if empty
        Faker.seed(0)  # Consistent seed for reproducibility
        for i in range(15):
            post = Post(
                id=fake.unique.random_int(min=1, max=1000),
                title=fake.sentence(nb_words=6),
                content=fake.paragraph(nb_sentences=5),
                votes=fake.random_int(min=-5, max=100),
                author=fake.user_name(),
                subreddit=fake.random_element(elements=("general", "memes", "news", "tech")),
            )
            db.add(post)
        db.commit()
        posts = db.query(Post).all()  # Fetch the newly created posts

    return [ 
        {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "votes": post.votes,
            "author": post.author,
            "subreddit": post.subreddit,
        }
        for post in posts
    ]
    
@router.post("/posts/create")
def create_post(post: PostCreate, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.id == post.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_post = Post(
        title=post.title,
        content=post.content,
        subreddit=post.subreddit,
        author_id=user.id,
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "subreddit": new_post.subreddit,
        "votes": new_post.votes,
        "author": user.username,
    }
    
@router.get("/posts/{postId}")
def get_post(postId: int = Path(...), db: Session = Depends(database.get_db)):
    post = db.query(Post).filter(Post.id == postId).first()
      
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
  
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "votes": post.votes,
        "author": post.author,
        "subreddit": post.subreddit,
        "userID": post.author_id,
    }