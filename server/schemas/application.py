from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class ConsentsSchema(BaseModel):
    fca_register_check: bool = Field(alias="fcaRegisterCheck", default=False)
    accurate_information: bool = Field(alias="accurateInformation", default=False)
    material_change: bool = Field(alias="materialChange", default=False)
    preliminary_access: bool = Field(alias="preliminaryAccess", default=False)

    class Config:
        populate_by_name = True


class EntityCreate(BaseModel):
    legal_entity_name: str = Field(alias="legalEntityName", min_length=1, max_length=300)
    company_number: str = Field(alias="companyNumber", min_length=1, max_length=100)

    class Config:
        populate_by_name = True


class EntityResponse(BaseModel):
    id: int
    legal_entity_name: str
    company_number: str
    entity_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    """Schema for creating a new broker application - matches frontend FormData"""

    # Firm Details
    legal_entity_name: str = Field(alias="legalEntityName", min_length=1, max_length=300)
    trading_name: str = Field(alias="tradingName", min_length=1, max_length=300)
    company_number: str = Field(alias="companyNumber", min_length=1, max_length=100)
    registered_address: str = Field(alias="registeredAddress", min_length=1)

    # Compliance Officer
    compliance_full_name: str = Field(alias="complianceFullName", min_length=1, max_length=200)
    compliance_email: EmailStr = Field(alias="complianceEmail")
    compliance_telephone: str = Field(alias="complianceTelephone", min_length=1, max_length=50)

    # Regulatory
    fca_firm_reference_number: str = Field(alias="fcaFirmReferenceNumber", min_length=1, max_length=100)
    firm_status: Literal["directly-authorised", "appointed-representative", "introducer-only"] = Field(
        alias="firmStatus"
    )

    # Classes of Business
    classes_of_business: list[str] = Field(alias="classesOfBusiness", min_length=1)
    estimated_gwp: str = Field(alias="estimatedGWP", min_length=1, max_length=100)
    additional_information: str = Field(alias="additionalInformation", default="")

    # Client Money
    handles_client_money: bool = Field(alias="handlesClientMoney")
    confirmations: list[str] = Field(default_factory=list)

    # Consents
    consents: ConsentsSchema

    class Config:
        populate_by_name = True


class ApplicationUpdate(BaseModel):
    """Schema for updating an existing application"""

    trading_name: str | None = Field(None, alias="tradingName", max_length=300)
    registered_address: str | None = Field(None, alias="registeredAddress")
    compliance_full_name: str | None = Field(None, alias="complianceFullName", max_length=200)
    compliance_email: EmailStr | None = Field(None, alias="complianceEmail")
    compliance_telephone: str | None = Field(None, alias="complianceTelephone", max_length=50)
    firm_status: Literal["directly-authorised", "appointed-representative", "introducer-only"] | None = Field(
        None, alias="firmStatus"
    )
    classes_of_business: list[str] | None = Field(None, alias="classesOfBusiness")
    estimated_gwp: str | None = Field(None, alias="estimatedGWP", max_length=100)
    additional_information: str | None = Field(None, alias="additionalInformation")
    handles_client_money: bool | None = Field(None, alias="handlesClientMoney")
    confirmations: list[str] | None = None
    consents: ConsentsSchema | None = None

    class Config:
        populate_by_name = True


class ApplicationResponse(BaseModel):
    """Response schema for broker application"""

    id: int
    entity_id: int
    trading_name: str
    registered_address: str
    full_name: str
    email: str
    telephone: str
    frn: str
    firm_status: str
    classes_of_business: str
    estimated_gwp: str
    additional_info: str
    handle_client_money: bool
    confirmations: dict
    consent: dict
    is_submitted: bool
    is_approved: bool
    is_evaluated: bool
    risk_score: float | None
    created_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class ApplicationWithEntityResponse(BaseModel):
    """Response schema for broker application with entity details"""

    # Application fields
    id: int
    entity_id: int
    trading_name: str
    registered_address: str
    full_name: str
    email: str
    telephone: str
    frn: str
    firm_status: str
    classes_of_business: str
    estimated_gwp: str
    additional_info: str
    handle_client_money: bool
    confirmations: dict
    consent: dict
    is_submitted: bool
    is_approved: bool
    is_evaluated: bool
    risk_score: float | None
    created_at: datetime
    is_deleted: bool

    # Entity fields
    legal_entity_name: str
    company_number: str


class ApplicationListResponse(BaseModel):
    """Response schema for listing applications"""

    applications: list[ApplicationWithEntityResponse]
    total: int
    page: int
    page_size: int
