from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Session
from db import GlobalBase, get_db
from schemas.user_scheme import User
from utils.dependencies import get_current_user
from schemas.proposed_poll_scheme import ProposedPoll

router = APIRouter()

# --- SQLAlchemy models ---

class Group(GlobalBase):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    members = relationship("GroupMember", back_populates="group")
    join_requests = relationship("GroupJoinRequest", back_populates="group")


class GroupMember(GlobalBase):
    __tablename__ = "group_members"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="member")

    group = relationship("Group", back_populates="members")


class GroupJoinRequest(GlobalBase):
    __tablename__ = "group_join_requests"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    accepted = Column(Boolean, default=False)

    group = relationship("Group", back_populates="join_requests")


# --- Pydantic Schemas ---
from pydantic import BaseModel

class GroupCreate(BaseModel):
    name: str
    description: str | None = None

class PollWithGroupCreate(BaseModel):
    name: str
    description: str
    candidates: list[str]
    group_id: int


# --- Endpoints ---

@router.post("/create")
def create_group(group: GroupCreate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    new_group = Group(
        name=group.name,
        description=group.description,
        owner_id=user_in_db.id
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    admin_member = GroupMember(group_id=new_group.id, user_id=user_in_db.id, role="admin")
    db.add(admin_member)
    db.commit()

    return {"message": "Группа создана", "group_id": new_group.id}


@router.post("/{group_id}/request-join")
def request_to_join(group_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(GroupJoinRequest).filter_by(group_id=group_id, user_id=user_in_db.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже отправили запрос")

    request = GroupJoinRequest(group_id=group_id, user_id=user_in_db.id)
    db.add(request)
    db.commit()
    return {"message": "Запрос на вступление отправлен"}


@router.get("/{group_id}/join-requests")
def get_join_requests(group_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(Group).filter_by(id=group_id).first()
    if not group or group.owner_id != user_in_db.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    requests = db.query(GroupJoinRequest).filter_by(group_id=group_id, accepted=False).all()
    return [{"request_id": r.id, "user_id": r.user_id} for r in requests]


@router.post("/{group_id}/accept/{request_id}")
def accept_join_request(group_id: int, request_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(Group).filter_by(id=group_id).first()
    if not group or group.owner_id != user_in_db.id:
        raise HTTPException(status_code=403, detail="Нет доступа")

    request = db.query(GroupJoinRequest).filter_by(id=request_id, group_id=group_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Запрос не найден")

    request.accepted = True
    db.commit()

    new_member = GroupMember(group_id=group_id, user_id=request.user_id)
    db.add(new_member)
    db.commit()
    return {"message": "Участник добавлен в группу"}


@router.get("/my")
def my_groups(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    groups = db.query(Group).join(GroupMember).filter(GroupMember.user_id == user_in_db.id).all()
    return [{"id": g.id, "name": g.name, "description": g.description} for g in groups]


@router.get("/members")
def group_members(group_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    members = db.query(GroupMember).filter_by(group_id=group_id).all()
    return [
        {"user_id": m.user_id, "role": m.role} for m in members
    ]


@router.post("/group/created")
def create_group_poll(data: PollWithGroupCreate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    membership = db.query(GroupMember).filter_by(group_id=data.group_id, user_id=user_in_db.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Вы не состоите в группе")

    new_proposal = ProposedPoll(
        name=data.name,
        candidates=data.candidates,
        description=data.description,
        approved_by_admin=False,
        approved=False,
        group_id=data.group_id,
        creator_id=user_in_db.id
    )

    db.add(new_proposal)
    db.commit()
    db.refresh(new_proposal)

    return {"message": "Групповое голосование предложено", "proposal_id": new_proposal.id}


@router.get("/all")
def all_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).all()
    return [{"id": g.id, "name": g.name, "description": g.description} for g in groups]


@router.get("/my-requests")
def my_join_requests(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    requests = db.query(GroupJoinRequest).filter_by(user_id=user_in_db.id, accepted=False).all()
    return [{"request_id": r.id, "group_id": r.group_id} for r in requests]


@router.delete("/{group_id}/kick/{user_id}")
def kick_member(group_id: int, user_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    group = db.query(Group).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Только админ группы может кикать
    if group.owner_id != user_in_db.id:
        raise HTTPException(status_code=403, detail="Only group owner can kick members")

    # Находим участника, которого кикаем
    member = db.query(GroupMember).filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="User is not a member of the group")

    db.delete(member)
    db.commit()

    return {"message": "Member kicked from group"}


@router.delete("/{group_id}/leave")
def leave_group(group_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_in_db = db.query(User).filter_by(wallet_address=user["wallet_address"]).first()
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    membership = db.query(GroupMember).filter_by(group_id=group_id, user_id=user_in_db.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="You are not a member of this group")

    db.delete(membership)
    db.commit()
    return {"message": "Left the group successfully"}


@router.get("/info/{group_id}")
def get_group_info(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    admin = db.query(User).filter(User.id == group.owner_id).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Администратор группы не найден")

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "admin_nickname": admin.nickname,
        "admin_first_name": admin.first_name,
        "admin_last_name": admin.last_name
    }



from schemas.user_scheme import User  # ✅ убедись, что импортирован User

@router.get("/{group_id}/members")
def group_members(group_id: int, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    members = db.query(GroupMember, User).join(User, GroupMember.user_id == User.id).filter(GroupMember.group_id == group_id).all()

    return [
        {
            "user_id": m.user_id,
            "nickname": u.nickname,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": m.role
        }
        for m, u in members
    ]


