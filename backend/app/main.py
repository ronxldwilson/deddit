from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.db import db
from .routes import synthetic, notes
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

@app.get("/")
def read_root():
    return {"message": "Notes App Backend is running."}