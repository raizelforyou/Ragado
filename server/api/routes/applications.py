import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_db
from models import BrokerApplication, Entity
from schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationUpdate,
    ApplicationWithEntityResponse,
)

router = APIRouter()


@router.post(
    "/",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new broker application",
)
async def create_application(
    application: ApplicationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationResponse:
    """
    Submit a new broker application.

    This endpoint receives the complete form data from the frontend
    and creates both the Entity and BrokerApplication records.
    """
    # Check if entity with this company number already exists
    existing_entity = await db.execute(
        select(Entity).where(Entity.company_number == application.company_number)
    )
    entity = existing_entity.scalar_one_or_none()

    if entity:
        # Check if there's already a non-deleted application for this entity
        existing_app = await db.execute(
            select(BrokerApplication).where(
                BrokerApplication.entity_id == entity.id,
                BrokerApplication.is_deleted == False,  # noqa: E712
            )
        )
        if existing_app.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An application already exists for this company",
            )
    else:
        # Create new entity
        entity = Entity(
            legal_entity_name=application.legal_entity_name,
            company_number=application.company_number,
            entity_type="broker",
        )
        db.add(entity)
        await db.flush()

    # Create broker application
    broker_app = BrokerApplication(
        entity_id=entity.id,
        trading_name=application.trading_name,
        registered_address=application.registered_address,
        full_name=application.compliance_full_name,
        email=application.compliance_email,
        telephone=application.compliance_telephone,
        frn=application.fca_firm_reference_number,
        firm_status=application.firm_status,
        classes_of_business=json.dumps(application.classes_of_business),
        estimated_gwp=application.estimated_gwp,
        additional_info=application.additional_information,
        handle_client_money=application.handles_client_money,
        confirmations={"items": application.confirmations},
        consent=application.consents.model_dump(),
        is_submitted=True,
    )
    db.add(broker_app)
    await db.flush()
    await db.refresh(broker_app)

    return broker_app


@router.get(
    "/",
    response_model=ApplicationListResponse,
    summary="List all broker applications",
)
async def list_applications(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    include_deleted: bool = Query(False, description="Include deleted applications"),
) -> ApplicationListResponse:
    """
    List all broker applications with pagination.
    """
    # Build query with Entity join
    query = select(BrokerApplication, Entity).join(
        Entity, BrokerApplication.entity_id == Entity.id
    )
    count_query = select(func.count(BrokerApplication.id))

    if not include_deleted:
        query = query.where(BrokerApplication.is_deleted == False)  # noqa: E712
        count_query = count_query.where(BrokerApplication.is_deleted == False)  # noqa: E712

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated results
    offset = (page - 1) * page_size
    query = query.order_by(BrokerApplication.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    rows = result.all()

    # Transform results to include entity data
    applications_with_entity = []
    for app, entity in rows:
        applications_with_entity.append(
            ApplicationWithEntityResponse(
                id=app.id,
                entity_id=app.entity_id,
                trading_name=app.trading_name,
                registered_address=app.registered_address,
                full_name=app.full_name,
                email=app.email,
                telephone=app.telephone,
                frn=app.frn,
                firm_status=app.firm_status,
                classes_of_business=app.classes_of_business,
                estimated_gwp=app.estimated_gwp,
                additional_info=app.additional_info,
                handle_client_money=app.handle_client_money,
                confirmations=app.confirmations,
                consent=app.consent,
                is_submitted=app.is_submitted,
                is_approved=app.is_approved,
                is_evaluated=app.is_evaluated,
                risk_score=app.risk_score,
                created_at=app.created_at,
                is_deleted=app.is_deleted,
                legal_entity_name=entity.legal_entity_name,
                company_number=entity.company_number,
            )
        )

    return ApplicationListResponse(
        applications=applications_with_entity,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Get a specific application",
)
async def get_application(
    application_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationResponse:
    """
    Get a specific broker application by ID.
    """
    result = await db.execute(
        select(BrokerApplication).where(
            BrokerApplication.id == application_id,
            BrokerApplication.is_deleted == False,  # noqa: E712
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return application


@router.patch(
    "/{application_id}",
    response_model=ApplicationResponse,
    summary="Update an application",
)
async def update_application(
    application_id: int,
    update_data: ApplicationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationResponse:
    """
    Update a broker application.
    Only non-submitted or returned applications can be updated.
    """
    result = await db.execute(
        select(BrokerApplication).where(
            BrokerApplication.id == application_id,
            BrokerApplication.is_deleted == False,  # noqa: E712
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True, by_alias=False)

    for field, value in update_dict.items():
        if field == "classes_of_business" and value is not None:
            value = json.dumps(value)
        if field == "consents" and value is not None:
            value = value if isinstance(value, dict) else value.model_dump()
            setattr(application, "consent", value)
            continue
        if field == "handles_client_money":
            setattr(application, "handle_client_money", value)
            continue
        if field == "compliance_full_name":
            setattr(application, "full_name", value)
            continue
        if field == "compliance_email":
            setattr(application, "email", value)
            continue
        if field == "compliance_telephone":
            setattr(application, "telephone", value)
            continue
        if field == "additional_information":
            setattr(application, "additional_info", value)
            continue

        if hasattr(application, field):
            setattr(application, field, value)

    await db.flush()
    await db.refresh(application)

    return application


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an application",
)
async def delete_application(
    application_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """
    Soft delete a broker application.
    """
    result = await db.execute(
        select(BrokerApplication).where(
            BrokerApplication.id == application_id,
            BrokerApplication.is_deleted == False,  # noqa: E712
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    application.is_deleted = True
    await db.flush()


@router.post(
    "/{application_id}/approve",
    response_model=ApplicationResponse,
    summary="Approve an application",
)
async def approve_application(
    application_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationResponse:
    """
    Approve a broker application.
    """
    result = await db.execute(
        select(BrokerApplication).where(
            BrokerApplication.id == application_id,
            BrokerApplication.is_deleted == False,  # noqa: E712
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if not application.is_submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application must be submitted before approval",
        )

    application.is_approved = True
    await db.flush()
    await db.refresh(application)

    return application


@router.get(
    "/company/{company_number}",
    response_model=ApplicationResponse,
    summary="Get application by company number",
)
async def get_application_by_company(
    company_number: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationResponse:
    """
    Get a broker application by company number.
    """
    # First find the entity
    entity_result = await db.execute(
        select(Entity).where(Entity.company_number == company_number)
    )
    entity = entity_result.scalar_one_or_none()

    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No application found for this company",
        )

    # Get the application
    result = await db.execute(
        select(BrokerApplication).where(
            BrokerApplication.entity_id == entity.id,
            BrokerApplication.is_deleted == False,  # noqa: E712
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No application found for this company",
        )

    return application
