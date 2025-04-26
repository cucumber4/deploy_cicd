from sqlalchemy import Column, Integer, String, Boolean, ARRAY, Text, ForeignKey
from sqlalchemy.orm import relationship

from db import GlobalBase


class Poll(GlobalBase):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    candidates = Column(ARRAY(Text), nullable=False)
    description = Column(Text, default="", nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)  # ✅ связь с группой

    vote_history = relationship("VoteHistory", back_populates="poll")
