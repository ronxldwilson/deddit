from fastapi import APIRouter
from faker import Faker

router = APIRouter()

fake = Faker()

@router.get("/posts")
def get_fake_posts():
    posts = []
    for _ in range(15):  # You can tweak this number
        posts.append({
            "title": fake.sentence(nb_words=6),
            "content": fake.paragraph(nb_sentences=3),
            "votes": fake.random_int(min=-5, max=100),
            "subreddit": fake.random_element(elements=("general", "memes", "news", "tech")),
        })
    return posts
