# app/routes/posts.py

from app.models import PostCreate, PostUpdate
from fastapi import APIRouter, Depends, HTTPException, Path, status # type: ignore
from faker import Faker # type: ignore

from sqlalchemy.orm import Session # type: ignore
from pydantic import BaseModel # type: ignore
from ..db.db import db as database 
from ..db.models import Post, User  # Import your models
from fastapi import Query # type: ignore

router = APIRouter()

fake = Faker() 


@router.get("/posts")
def get_fake_posts(
    sort: str = Query("hot"),  # default to 'hot'
    db: Session = Depends(database.get_db)
    ):
    """Fetches posts from the database, sorts them based on the specified criteria, and returns a list of posts.
    If no posts exist, it generates fake posts using Faker and returns them sorted. """
    posts = db.query(Post).all()

    if not posts:
        Faker.seed(0)
        for _ in range(15):
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
        posts = db.query(Post).all()

    # 🧠 Simple in-memory sort
    if sort == "top":
        posts.sort(key=lambda p: p.votes, reverse=True)
    elif sort == "new":
        posts.sort(key=lambda p: p.id, reverse=True)  # assuming higher id = newer
    else:
        # Fallback to "hot" or default: can be based on votes or mixed logic
        posts.sort(key=lambda p: (p.votes + p.id), reverse=True)

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
    

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()

    return {"message": "Post deleted successfully"}

@router.put("/posts/{post_id}")
def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: Session = Depends(database.get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.title = post_update.title
    post.content = post_update.content
    db.commit()
    db.refresh(post)

    return { 
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "subreddit": post.subreddit,
        "votes": post.votes,
        "author": post.author,
        "author_id": post.author_id
    }