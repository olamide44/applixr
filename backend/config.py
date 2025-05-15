from pydantic_settings import BaseSettings
import secrets

class Settings(BaseSettings):
    # Database settings
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "job_application_application"
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    # JWT settings
    SECRET_KEY: str = secrets.token_urlsafe(32)  # Generate a secure random key
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI settings
    OPENAI_API_KEY: str = ""  # Set this in environment variables
    
    # File upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields in .env file

settings = Settings() 