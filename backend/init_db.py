# init_db.py
from database import engine, Base
import models  # registers models on Base

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")
