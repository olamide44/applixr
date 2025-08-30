from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models import User, Resume, CoverLetter, Application
from routers import auth, resumes, cover_letters, applications, admin
from database import engine, Base
from config import settings


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Application Platform API",
    description="API for managing job applications, resumes, and cover letters",
    version="1.0.0",
    debug=True
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins = os.getenv("ALLOW_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(cover_letters.router)
app.include_router(applications.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Job Application Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
