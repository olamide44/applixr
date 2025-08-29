from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Dict, List
from datetime import datetime, timedelta

from database import get_db
from models import User, Application
from auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access admin features")
    
    # Get total users count
    total_users = db.query(func.count(User.id)).scalar()
    
    # Get total applications count
    total_applications = db.query(func.count(Application.id)).scalar()
    
    # Get unique companies count
    total_companies = db.query(func.count(distinct(Application.company_name))).scalar()
    
    # Get applications by status
    applications_by_status = db.query(
        Application.status,
        func.count(Application.id)
    ).group_by(Application.status).all()
    
    # Get recent activity (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_applications = db.query(func.count(Application.id))\
        .filter(Application.created_at >= seven_days_ago).scalar()
    
    recent_users = db.query(func.count(User.id))\
        .filter(User.created_at >= seven_days_ago).scalar()
    
    return {
        "total_users": total_users,
        "total_applications": total_applications,
        "total_companies": total_companies,
        "applications_by_status": dict(applications_by_status),
        "recent_activity": {
            "new_applications": recent_applications,
            "new_users": recent_users
        }
    }

@router.get("/user-stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access admin features")
    
    # Get users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id)
    ).group_by(User.role).all()
    
    # Get active users (users who have applied in the last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(func.count(distinct(Application.user_id)))\
        .filter(Application.created_at >= thirty_days_ago).scalar()
    
    return {
        "users_by_role": dict(users_by_role),
        "active_users": active_users
    }

@router.get("/application-stats")
async def get_application_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access admin features")
    
    # Get applications by month
    applications_by_month = db.query(
        func.strftime('%Y-%m', Application.created_at),
        func.count(Application.id)
    ).group_by(func.strftime('%Y-%m', Application.created_at)).all()
    
    # Get average applications per user
    avg_applications = db.query(
        func.avg(subquery)
    ).select_from(
        db.query(Application.user_id, func.count(Application.id).label('app_count'))
        .group_by(Application.user_id)
        .subquery()
    ).scalar()
    
    return {
        "applications_by_month": dict(applications_by_month),
        "average_applications_per_user": round(avg_applications or 0, 2)
    } 