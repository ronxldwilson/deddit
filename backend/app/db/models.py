from datetime import datetime
import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, UniqueConstraint # type: ignore
from sqlalchemy.sql import func # type: ignore
from sqlalchemy.orm import relationship # type: ignore
from .base import Base

# ----------------
# Notes Table 
# ----------------
class Note(Base):
    __tablename__ = "notes"
 
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="notes")

# ----------------
# Users Table
# ----------------
class User(Base):
    __tablename__ = "users"
 
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
 
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")

    comments = relationship("Comment", back_populates="author")
    
    saved_posts = relationship("SavedPost", back_populates="user", cascade="all, delete-orphan")
    saved_comments = relationship("SavedComment", back_populates="user", cascade="all, delete-orphan")

    
# ----------------
# Posts Table
# ----------------
class Post(Base):
    __tablename__ = "posts"  

    id = Column(Integer, primary_key=True, index=True, autoincrement=True) 
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    votes = Column(Integer, default=0)
    subreddit = Column(String, default="general")
    author_id = Column(String, ForeignKey("users.id"))

    author = relationship("User", back_populates="posts")
    votes_relation = relationship("Vote", back_populates="post", cascade="all, delete-orphan")

    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    saved_by_users = relationship("SavedPost", back_populates="post", cascade="all, delete-orphan")

# ----------------
# Votes Table
# ---------------- 
class Vote(Base):
    __tablename__ = "votes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"))  # UUID as string
    post_id = Column(Integer, ForeignKey("posts.id"))
    value = Column(Integer)  # 1 for upvote, -1 for downvote

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="unique_user_post_vote"),
    )

    user = relationship("User", back_populates="votes")
    post = relationship("Post", back_populates="votes_relation")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True)

    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    children = relationship("Comment", backref="parent", remote_side=[id])
    
    votes = relationship("CommentVote", back_populates="comment", cascade="all, delete-orphan")
    post = relationship("Post", back_populates="comments")
    saved_by_users = relationship("SavedComment", back_populates="comment", cascade="all, delete-orphan")


    
class CommentVote(Base):
    __tablename__ = "comment_votes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id")) 
    comment_id = Column(Integer, ForeignKey("comments.id"))
    value = Column(Integer)  # 1 = upvote, -1 = downvote

    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="unique_user_comment_vote"),
    )

    user = relationship("User")
    comment = relationship("Comment", back_populates="votes") 

class SavedPost(Base):
    __tablename__ = "saved_posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"))
    post_id = Column(ForeignKey("posts.id"))

    user = relationship("User", back_populates="saved_posts")
    post = relationship("Post", back_populates="saved_by_users")


class SavedComment(Base):
    __tablename__ = "saved_comments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"))
    comment_id = Column(ForeignKey("comments.id"))

    user = relationship("User", back_populates="saved_comments")
    comment = relationship("Comment", back_populates="saved_by_users")  


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String, ForeignKey("users.id"))
    receiver_id = Column(String, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
