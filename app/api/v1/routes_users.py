from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user, get_current_admin
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/", response_model=list[UserPublic])
def list_users(
    *,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(get_current_admin),
):
    return db.query(User).offset(skip).limit(limit).all()


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(get_db),
    payload: UserCreate,
    _: User = Depends(get_current_admin),
):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé par un autre utilisateur",
        )
    
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserPublic)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    payload: UserUpdate,
    _: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    data = payload.model_dump(exclude_unset=True)
    
    if "email" in data and data["email"] != user.email:
        existing_user = db.query(User).filter(User.email == data["email"]).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Cet email est déjà utilisé par un autre utilisateur"
            )

    if "password" in data:
        user.hashed_password = get_password_hash(data.pop("password"))
    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    _: User = Depends(get_current_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    db.delete(user)
    db.commit()
    return None
