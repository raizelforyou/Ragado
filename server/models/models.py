from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import (
    String, Integer, Text, Boolean, Float,
    DateTime, ForeignKey, JSON
)
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now()
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admin_users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now()
    )


class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    legal_entity_name: Mapped[str] = mapped_column(String(300))
    company_number: Mapped[str] = mapped_column(String(100), unique=True)
    entity_type: Mapped[str] = mapped_column(String(50), default="broker")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now()
    )


class BrokerApplication(Base):
    __tablename__ = "broker_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    entity_id: Mapped[int] = mapped_column(
        ForeignKey("entities.id")
    )

    trading_name: Mapped[str] = mapped_column(String(300))
    registered_address: Mapped[str] = mapped_column(Text)

    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200))
    telephone: Mapped[str] = mapped_column(String(50))

    frn: Mapped[str] = mapped_column(String(100))
    firm_status: Mapped[str] = mapped_column(String(100))
    classes_of_business: Mapped[str] = mapped_column(Text)
    estimated_gwp: Mapped[str] = mapped_column(String(100))
    additional_info: Mapped[str] = mapped_column(Text)

    handle_client_money: Mapped[bool] = mapped_column(Boolean)
    confirmations: Mapped[dict] = mapped_column(JSON)
    consent: Mapped[dict] = mapped_column(JSON)

    is_submitted: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_evaluated: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    risk_score: Mapped[float] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now()
    )

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")


class EntityRiskEvaluation(Base):
    __tablename__ = "entity_risk_evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    application_id: Mapped[int] = mapped_column(
        ForeignKey("broker_applications.id")
    )

    risk_score: Mapped[float] = mapped_column(Float)
    risk_level: Mapped[str] = mapped_column(String(50))
    model_version: Mapped[str] = mapped_column(String(20))
    evaluation_notes: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now()
    )