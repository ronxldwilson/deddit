from fastapi import FastAPI # type : ignore
from fastapi.middleware.cors import CORSMiddleware # type : ignore
from contextlib import asynccontextmanager
from .routes import posts, vote, synthetic, notes, users, comments, messages

from .db.db import db
from .utils.logger import LogMiddleware

@asynccontextmanager 
async def lifespan(app: FastAPI):
    # Startup 
    db.create_database() 
    db.populate_database(seed = "0" * 16) # Consistent seed for synthetic data — can add this as a parameter
    yield
    # Shutdown

app = FastAPI(title="Synthetic App Template (FastAPI)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

# Attach logging middleware
app.middleware("http")(LogMiddleware())

# Routers
app.include_router(synthetic.router, prefix="/_synthetic", tags=["synthetic"])
app.include_router(notes.router, prefix="/api", tags=["notes"])

# Routes for posts
app.include_router(posts.router)

# Routes for votes
app.include_router(vote.router)

app.include_router(users.router)  # no prefix = available at /debug/users

app.include_router(comments.router)

app.include_router(messages.router)

@app.get("/") 
def read_root():
    return {"message": "Notes App Backend is running."} 

@app.get("/debug/routes")
def list_routes():
    return [route.path for route in app.routes]
