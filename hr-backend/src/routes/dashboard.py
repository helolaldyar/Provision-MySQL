from flask import Blueprint, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.get("/stats")
@jwt_required()
def stats():
    total_emp = db.session.execute(text("SELECT COUNT(*) AS c FROM employees")).mappings().first()["c"]
    pending_leaves = db.session.execute(text("SELECT COUNT(*) AS c FROM leave_requests WHERE status='pending'")).mappings().first()["c"] if total_emp else 0
    present_today = db.session.execute(text("SELECT COUNT(*) AS c FROM attendance WHERE day_date=CURDATE() AND status IN ('present','late')")).mappings().first()["c"] if total_emp else 0
    total_basic = db.session.execute(text("SELECT COALESCE(SUM(basic_salary),0) AS s FROM employees")).mappings().first()["s"]
    return jsonify({
        "employees": total_emp,
        "present_today": present_today,
        "pending_leaves": pending_leaves,
        "total_basic_salary": float(total_basic or 0)
    })