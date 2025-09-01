from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from config import settings

def _coalesce_db_url() -> str:
    # Prefer SQLALCHEMY_DATABASE_URL, fall back to Railway's DATABASE_URL
    url = (os.getenv("SQLALCHEMY_DATABASE_URL") or os.getenv("DATABASE_URL") or "").strip()
    if not url:
        raise RuntimeError(
            "No database URL found. Set DATABASE_URL (or SQLALCHEMY_DATABASE_URL) in Railway."
        )
    # Normalize postgres scheme for SQLAlchemy 2.x + psycopg
    if url.startswith("postgres://"):
        url = "postgresql+psycopg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url

SQLALCHEMY_DATABASE_URL = _coalesce_db_url()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,     # validate connections before using
    pool_recycle=1800,      # recycle stale connections (~30 min)
    # echo=True,            # uncomment for SQL logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 