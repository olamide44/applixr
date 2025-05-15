from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Application, Resume, CoverLetter
from ..config import settings
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
import jwt
from ..routers.auth import get_current_user
from datetime import date

router = APIRouter(prefix="/applications", tags=["Applications"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/")
async def create_application(
    company_name: str = Form(...),
    position: str = Form(...),
    resume_id: int = Form(...),
    cover_letter_id: int = Form(None),
    job_url: str = Form(None),
    application_deadline: datetime = Form(None),
    notes: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Validate cover letter if provided
    if cover_letter_id:
        cover_letter = db.query(CoverLetter).filter(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id
        ).first()
        
        if not cover_letter:
            raise HTTPException(status_code=404, detail="Cover letter not found")
    
    # Create application
    application = Application(
        user_id=current_user.id,
        resume_id=resume_id,
        cover_letter_id=cover_letter_id,
        company_name=company_name,
        position=position,
        job_url=job_url,
        application_deadline=application_deadline,
        status="applied",
        notes=notes
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return {
        "id": application.id,
        "company_name": application.company_name,
        "position": application.position,
        "status": application.status,
        "created_at": application.created_at
    }

@router.get("/")
async def list_applications(
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Application).filter(Application.user_id == current_user.id)
    
    if status:
        query = query.filter(Application.status == status)
    
    applications = query.all()
    
    return [
        {
            "id": app.id,
            "company_name": app.company_name,
            "position": app.position,
            "status": app.status,
            "application_deadline": app.application_deadline,
            "created_at": app.created_at
        }
        for app in applications
    ]

@router.get("/{application_id}")
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "id": application.id,
        "company_name": application.company_name,
        "position": application.position,
        "status": application.status,
        "job_url": application.job_url,
        "application_deadline": application.application_deadline,
        "notes": application.notes,
        "resume_id": application.resume_id,
        "cover_letter_id": application.cover_letter_id,
        "created_at": application.created_at,
        "updated_at": application.updated_at
    }

@router.patch("/{application_id}")
async def update_application(
    application_id: int,
    status: str = Form(None),
    notes: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if status:
        valid_statuses = ["draft", "applied", "interview", "offer", "rejected", "accepted"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
        application.status = status
    
    if notes is not None:
        application.notes = notes
    
    db.commit()
    db.refresh(application)
    
    return {
        "id": application.id,
        "status": application.status,
        "notes": application.notes,
        "updated_at": application.updated_at
    } 