from flask import Blueprint, request, jsonify
from sqlalchemy import text
from flask_jwt_extended import jwt_required, get_jwt_identity
from .utils import role_required, log_action
from ..main import db  # type: ignore
import bcrypt

users_bp = Blueprint("users", __name__)

@users_bp.get("/")
@role_required('admin','hr_manager')
def list_users():
    rows = db.session.execute(text("SELECT id, username, email, role, created_at FROM users ORDER BY id")).mappings().all()
    return jsonify(users=list(rows))

@users_bp.put("/<int:uid>/role")
@role_required('admin')
def update_role(uid):
    d = request.get_json() or {}
    role = d.get("role")
    if role not in ("admin","hr_manager","employee"):
        return jsonify(message="دور غير مدعوم"), 400
    db.session.execute(text("UPDATE users SET role=:r WHERE id=:id"), {"r": role, "id": uid})
    db.session.commit()
    actor = get_jwt_identity()
    log_action(actor["id"], "update_role", "users", uid, f"role={role}")
    return jsonify(message="تم التحديث")

@users_bp.put("/<int:uid>/reset_password")
@role_required('admin')
def reset_password(uid):
    d = request.get_json() or {}
    new_password = (d.get("new_password") or "").encode()
    if len(new_password) < 6:
        return jsonify(message="كلمة المرور قصيرة"), 400
    new_hash = bcrypt.hashpw(new_password, bcrypt.gensalt()).decode()
    db.session.execute(text("UPDATE users SET password_hash=:h WHERE id=:id"), {"h": new_hash, "id": uid})
    db.session.commit()
    actor = get_jwt_identity()
    log_action(actor["id"], "reset_password", "users", uid, None)
    return jsonify(message="تمت إعادة التعيين")