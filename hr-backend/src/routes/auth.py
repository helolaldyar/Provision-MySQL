from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from sqlalchemy import text
from ..main import db  # type: ignore
import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").encode()
    if not username or not password:
        return jsonify(message="بيانات دخول ناقصة"), 400

    row = db.session.execute(
        text("SELECT id, username, email, role, password_hash FROM users WHERE username=:u OR email=:u LIMIT 1"),
        {"u": username}
    ).mappings().first()
    if not row or not bcrypt.checkpw(password, row["password_hash"].encode()):
        return jsonify(message="بيانات الدخول غير صحيحة"), 401

    identity = {"id": row["id"], "username": row["username"], "role": row["role"]}
    token = create_access_token(identity=identity, expires_delta=timedelta(hours=12))
    return jsonify(token=token, user=identity)

@auth_bp.get("/profile")
@jwt_required()
def profile():
    user = get_jwt_identity()
    return jsonify(user=user)

@auth_bp.post("/change_password")
@jwt_required()
def change_password():
    user = get_jwt_identity()
    data = request.get_json() or {}
    current = (data.get("current_password") or "").encode()
    new = (data.get("new_password") or "").encode()
    if not current or not new or len(new) < 6:
        return jsonify(message="تحقق من المدخلات (طول كلمة المرور الجديدة على الأقل 6)"), 400

    row = db.session.execute(text("SELECT id, password_hash FROM users WHERE id=:id LIMIT 1"), {"id": user["id"]}).mappings().first()
    if not row or not bcrypt.checkpw(current, row["password_hash"].encode()):
        return jsonify(message="كلمة المرور الحالية غير صحيحة"), 400

    new_hash = bcrypt.hashpw(new, bcrypt.gensalt()).decode()
    db.session.execute(text("UPDATE users SET password_hash=:h WHERE id=:id"), {"h": new_hash, "id": user["id"]})
    db.session.commit()
    return jsonify(message="تم تغيير كلمة المرور بنجاح")
