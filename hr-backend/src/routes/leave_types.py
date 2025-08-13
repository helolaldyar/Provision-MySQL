from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

leave_types_bp = Blueprint("leave_types", __name__)

@leave_types_bp.get("/")
@jwt_required()
def list_leave_types():
    rows = db.session.execute(text("SELECT id, name, code, annual_quota, requires_approval FROM leave_types ORDER BY id DESC")).mappings().all()
    return jsonify(leave_types=list(rows))

@leave_types_bp.post("/")
@role_required('admin','hr_manager')
def create_leave_type():
    d = request.get_json() or {}
    if not d.get("name"):
        return jsonify(message="الاسم مطلوب"), 400
    db.session.execute(text("""
        INSERT INTO leave_types(name, code, annual_quota, requires_approval)
        VALUES(:n,:c,:q,:ra)
    """), {"n": d["name"], "c": d.get("code"), "q": d.get("annual_quota", 0), "ra": 1 if d.get("requires_approval",1) else 0})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201