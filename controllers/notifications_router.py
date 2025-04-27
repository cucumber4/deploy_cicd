from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from schemas.notification_scheme import Notification
from utils.dependencies import get_current_user
from schemas.user_scheme import User

router = APIRouter()

# Получить все уведомления
@router.get("/notifications")
def get_notifications(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    notifications = db.query(Notification).filter_by(user_id=user_db.id).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at
        } for n in notifications
    ]

# Отметить одно уведомление как прочитанное
@router.post("/notifications/mark-read/{notification_id}")
def mark_notification_read(notification_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    notification = db.query(Notification).filter_by(id=notification_id, user_id=user_db.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

# Отметить все уведомления как прочитанные
@router.post("/notifications/mark-all-read")
def mark_all_notifications_as_read(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(Notification).filter(Notification.user_id == user_db.id).delete()
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    notification = db.query(Notification).filter_by(id=notification_id, user_id=user_db.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}

