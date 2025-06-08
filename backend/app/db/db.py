from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from faker import Faker
import os
from .base import Base
from .models import User, Note

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
        # Create users first
        users = []
        for _ in range(5):
            user = User(
                username=fake.user_name(),
                password=fake.password()
            )
            db.add(user)
            users.append(user)
        db.commit()

        # Create notes for each user
        for user in users:
            for _ in range(3):  # 3 notes per user
                note = Note(
                    title=fake.catch_phrase(),
                    content=fake.text(max_nb_chars=200),
                    user_id=user.id
                )
                db.add(note)
        db.commit()

    def reset_database(self, seed: str = None):
        # Drop all tables and recreate them
        Base.metadata.drop_all(bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        # Repopulate tables
        self.populate_database(seed)

# Create a singleton instance
db = Database()
