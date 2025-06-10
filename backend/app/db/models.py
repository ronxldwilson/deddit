from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

# ----------------
# Notes Table
# ----------------
class Note(Base):
    __tablename__ = "notes"
 
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="notes")

# ----------------
# Users Table
# ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")

# ----------------
# Posts Table
# ----------------
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    votes = Column(Integer, default=0)
    subreddit = Column(String, default="general")
    author_id = Column(Integer, ForeignKey("users.id"))

    author = relationship("User", back_populates="posts")
    votes_relation = relationship("Vote", back_populates="post", cascade="all, delete-orphan")

# ----------------
# Votes Table
# ----------------
class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) 
    post_id = Column(Integer, ForeignKey("posts.id"))
    value = Column(Integer)  # 1 for upvote, -1 for downvote

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="unique_user_post_vote"),
    )

    user = relationship("User", back_populates="votes")
    post = relationship("Post", back_populates="votes_relation")
