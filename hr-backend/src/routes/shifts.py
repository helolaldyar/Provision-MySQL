from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

shifts_bp = Blueprint("shifts", __name__)

@shifts_bp.get("/")
@jwt_required()
def list_shifts():
    rows = db.session.execute(text("SELECT id, name, start_time, end_time, work_days_mask FROM shifts ORDER BY id DESC")).mappings().all()
    return jsonify(shifts=list(rows))

@shifts_bp.post("/")
@role_required('admin','hr_manager')
def create_shift():
    d = request.get_json() or {}
    if not d.get("name"):
        return jsonify(message="الاسم مطلوب"), 400
    db.session.execute(text("""
        INSERT INTO shifts(name, start_time, end_time, work_days_mask)
        VALUES(:n,:st,:et,:m)
    """), {"n": d["name"], "st": d.get("start_time","08:00"), "et": d.get("end_time","17:00"), "m": d.get("work_days_mask", 62)})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201