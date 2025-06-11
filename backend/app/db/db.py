# app/db/db.py

from sqlalchemy import create_engine # type: ignore
from sqlalchemy.orm import sessionmaker # type: ignore
from faker import Faker # type: ignore
import os 
from .base import Base
from .models import User, Note, Post, Comment

class Database:
    def __init__(self):  
        self.db_path = os.path.join(os.path.dirname(__file__), "app.sqlite")
        self.db_url = f"sqlite:///{self.db_path}"
        self.engine = None 
        self.SessionLocal = None

    def create_database(self): 
        self.engine = create_engine(self.db_url, connect_args={"check_same_thread": False})
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)

    def get_db(self):
        if not self.SessionLocal:
            self.create_database()
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    """
    Populate the database with synthetic data.
    You should update this function set the database in its initial state.
    Feel free to use the Faker library (with a seed), or hardcode the data.
    """
    def populate_database(self, seed: str = None):
        fake = Faker()
        if seed:
            fake.seed_instance(seed)

        db = next(self.get_db())

        # --- USERS ---
        users = []
        for _ in range(5):
            user = User(
                id=str(fake.uuid4()),
                username=fake.user_name(),
                password=fake.password()
            )
            db.add(user)
            users.append(user)
        db.commit()

        # --- NOTES ---
        for user in users:
            for _ in range(3):
                note = Note(
                    title=fake.catch_phrase(),
                    content=fake.text(max_nb_chars=200),
                    user_id=user.id
                )
                db.add(note)

        # --- POSTS ---
        posts = []
        for user in users:
            for _ in range(5):
                post = Post(
                    title=fake.sentence(nb_words=6),
                    content=fake.paragraph(nb_sentences=3),
                    votes=fake.random_int(min=-5, max=100),
                    subreddit=fake.random_element(elements=("general", "memes", "news", "tech")),
                    author_id=user.id
                )
                db.add(post)
                posts.append(post)
        db.commit()

        # --- COMMENTS ---
        def create_comment(post_id, author_id, parent_id=None):
            return Comment(
                content=fake.paragraph(nb_sentences=2),
                post_id=post_id,
                author_id=author_id,
                parent_id=parent_id,
                created_at=fake.date_time_this_year() 
            )

        def seed_replies(parent_comment, depth=0, max_depth=2):
            if depth >= max_depth:
                return []
            replies = []
            for _ in range(fake.random_int(min=0, max=2)):
                reply = create_comment(parent_comment.post_id, fake.random_element(users).id, parent_comment.id)
                db.add(reply)
                db.flush()
                replies.append(reply)
                replies += seed_replies(reply, depth + 1, max_depth)
            return replies

        for post in posts:
            for _ in range(fake.random_int(min=2, max=5)):
                top_comment = create_comment(post.id, fake.random_element(users).id)
                db.add(top_comment)
                db.flush()
                replies = seed_replies(top_comment)
                db.add_all(replies)

        db.commit()

    def reset_database(self, seed: str = None):
        # Drop all tables and recreate them
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        # Repopulate tables
        self.populate_database(seed)
        

# Create a singleton instance
db = Database()
