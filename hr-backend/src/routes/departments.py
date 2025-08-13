from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

departments_bp = Blueprint("departments", __name__)

@departments_bp.get("/")
@jwt_required()
def list_departments():
    rows = db.session.execute(text("SELECT id, name, code FROM departments ORDER BY id DESC")).mappings().all()
    return jsonify(departments=list(rows))

@departments_bp.post("/")
@role_required('admin','hr_manager')
def create_department():
    d = request.get_json() or {}
    if not d.get("name"):
        return jsonify(message="الاسم مطلوب"), 400
    db.session.execute(text("INSERT INTO departments(name, code) VALUES(:n,:c)"), {"n": d["name"], "c": d.get("code")})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201