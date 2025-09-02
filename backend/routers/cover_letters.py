from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CoverLetter, Resume
from config import settings
from fastapi.security import OAuth2PasswordBearer
from openai import AsyncOpenAI
import json
from jose import JWTError, jwt
from routers.auth import get_current_user

router = APIRouter(prefix="/cover-letters", tags=["Cover Letters"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
ALGORITHM = "HS256"

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise creds_exc

    sub = payload.get("sub")
    if sub is None:
        raise creds_exc

    try:
        user_id = int(sub)  # 👈 cast to int to match INTEGER PK
    except ValueError:
        raise creds_exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise creds_exc
    return user

async def generate_cover_letter(resume_text: str, job_description: str, tone: str) -> str:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""Generate a professional cover letter based on the following resume and job description.
    The tone should be {tone}.
    
    Resume:
    {resume_text}
    
    Job Description:
    {job_description}
    
    Generate a well-structured cover letter that:
    1. Highlights relevant experience and skills
    2. Shows enthusiasm for the position
    3. Demonstrates understanding of the company's needs
    4. Maintains a {tone} tone throughout
    """
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    content = response.choices[0].message.content
    return content

@router.post("/generate")
async def create_cover_letter(
    resume_id: int = Form(...),
    job_description: str = Form(...),
    tone: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate tone
    valid_tones = ["formal", "informal", "enthusiastic", "persuasive"]
    if tone not in valid_tones:
        raise HTTPException(status_code=400, detail=f"Tone must be one of: {', '.join(valid_tones)}")
    
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Generate cover letter
    cover_letter_text = await generate_cover_letter(
        resume.parsed_data["text"],
        job_description,
        tone
    )
    
    # Create cover letter record
    cover_letter = CoverLetter(
        user_id=current_user.id,
        resume_id=resume_id,
        job_description=job_description,
        content=cover_letter_text,
        tone=tone
    )
    
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)
    
    return {
        "id": cover_letter.id,
        "content": cover_letter.content,
        "tone": cover_letter.tone,
        "created_at": cover_letter.created_at
    }

@router.get("/")
async def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cover_letters = db.query(CoverLetter).filter(CoverLetter.user_id == current_user.id).all()
    return [
        {
            "id": cl.id,
            "tone": cl.tone,
            "created_at": cl.created_at,
            "resume_id": cl.resume_id,
            "job_description": cl.job_description,
            "content": cl.content
        }
        for cl in cover_letters
    ]


@router.get("/{cover_letter_id}")
async def get_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    
    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    return {
        "id": cover_letter.id,
        "content": cover_letter.content,
        "tone": cover_letter.tone,
        "job_description": cover_letter.job_description,
        "created_at": cover_letter.created_at,
        "resume_id": cover_letter.resume_id
    }

@router.post("/{cover_letter_id}/regenerate")
async def regenerate_cover_letter(
    cover_letter_id: int,
    tone: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cover_letter = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    
    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    resume = db.query(Resume).filter(Resume.id == cover_letter.resume_id).first()
    
    # Generate new cover letter
    new_content = await generate_cover_letter(
        resume.parsed_data["text"],
        cover_letter.job_description,
        tone
    )
    
    # Update cover letter
    cover_letter.content = new_content
    cover_letter.tone = tone
    db.commit()
    db.refresh(cover_letter)
    
    return {
        "id": cover_letter.id,
        "content": cover_letter.content,
        "tone": cover_letter.tone,
        "created_at": cover_letter.created_at
    }

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }