from sqlalchemy import Column, Integer, String, Boolean, ARRAY, Text, ForeignKey
from db import GlobalBase

class ProposedPoll(GlobalBase):
    __tablename__ = "proposed_polls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="", nullable=True)
    candidates = Column(ARRAY(Text), nullable=False)
    approved = Column(Boolean, default=False, nullable=False)
    approved_by_admin = Column(Boolean, default=False, nullable=False)
    group_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # 👈 добавили связь с таблицей users
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # ✅ НОВОЕ ПОЛЕ