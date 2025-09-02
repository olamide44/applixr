from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Resume
from config import settings
from fastapi.security import OAuth2PasswordBearer
import os
import json
from datetime import datetime
from openai import AsyncOpenAI
from PyPDF2 import PdfReader
from docx import Document
import shutil
from jose import JWTError, jwt
from routers.auth import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
ALGORITHM = "HS256"

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

def extract_text_from_pdf(file_path: str) -> str:
    with open(file_path, 'rb') as file:
        pdf = PdfReader(file)
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

async def analyze_resume_with_ai(text: str) -> dict:
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""Analyze this resume and provide feedback in JSON format with the following structure:
    {{
        \"missing_sections\": [\"list of missing important sections\"],
        \"formatting_issues\": [\"list of formatting issues\"],
        \"content_suggestions\": [\"list of suggestions to improve content\"],
        \"strengths\": [\"list of resume strengths\"],
        \"weaknesses\": [\"list of resume weaknesses\"]
    }}
    
    Resume text:
    {text}
    """
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return json.loads(response.choices[0].message.content)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Extract text
    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    else:
        text = extract_text_from_docx(file_path)
    
    # Analyze with AI
    ai_feedback = await analyze_resume_with_ai(text)
    
    # Create resume record
    resume = Resume(
        user_id=current_user.id,
        file_path=file_path,
        file_name=file.filename,
        parsed_data={"text": text},
        ai_feedback=ai_feedback
    )
    
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "ai_feedback": resume.ai_feedback
    }

@router.get("/")
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return [
        {
            "id": resume.id,
            "file_name": resume.file_name,
            "created_at": resume.created_at,
            "ai_feedback": resume.ai_feedback
        }
        for resume in resumes
    ]

@router.get("/{resume_id}")
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {
        "id": resume.id,
        "file_name": resume.file_name,
        "created_at": resume.created_at,
        "parsed_data": resume.parsed_data,
        "ai_feedback": resume.ai_feedback
    }

@router.post("/{resume_id}/analyze-job")
async def analyze_resume_for_job(
    resume_id: int,
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""Compare this resume with the job description and provide a matching score and feedback in JSON format:
    {{
        \"match_score\": \"percentage match\",
        \"missing_skills\": [\"list of missing required skills\"],
        \"matching_skills\": [\"list of matching skills\"],
        \"suggestions\": [\"list of suggestions to improve match\"]
    }}
    
    Resume text:
    {resume.parsed_data['text']}
    
    Job Description:
    {job_description}
    """
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return json.loads(response.choices[0].message.content) 