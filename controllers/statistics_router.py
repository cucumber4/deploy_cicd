from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db
from schemas.user_scheme import User
from schemas.poll_scheme import Poll
from schemas.vote_history import VoteHistory
from sqlalchemy import func

router = APIRouter()

@router.get("/ballots-by-date")
def ballots_by_date(db: Session = Depends(get_db)):
    results = (
        db.query(func.date(VoteHistory.timestamp), func.count(VoteHistory.id))
        .group_by(func.date(VoteHistory.timestamp))
        .order_by(func.date(VoteHistory.timestamp))
        .all()
    )
    return [{"date": str(r[0]), "count": r[1]} for r in results]

@router.get("/participation")
def participation(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    voted_users = db.query(VoteHistory.user_id).distinct().count()
    return {"total_users": total_users, "voted_users": voted_users}

@router.get("/total-users")
def total_users(db: Session = Depends(get_db)):
    count = db.query(User).count()
    return {"total_users": count}

@router.get("/total-polls")
def total_polls(db: Session = Depends(get_db)):
    count = db.query(Poll).count()
    return {"total_polls": count}

@router.get("/most-voted-poll")
def most_voted_poll(db: Session = Depends(get_db)):
    result = (
        db.query(VoteHistory.poll_id, func.count(VoteHistory.id).label("vote_count"))
        .group_by(VoteHistory.poll_id)
        .order_by(func.count(VoteHistory.id).desc())
        .first()
    )
    if result:
        poll = db.query(Poll).filter(Poll.id == result.poll_id).first()
        return {"poll_id": poll.id, "poll_name": poll.name, "vote_count": result.vote_count}
    return {}
