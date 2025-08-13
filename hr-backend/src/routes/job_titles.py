from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

job_titles_bp = Blueprint("job_titles", __name__)

@job_titles_bp.get("/")
@jwt_required()
def list_job_titles():
    rows = db.session.execute(text("SELECT id, name, code FROM job_titles ORDER BY id DESC")).mappings().all()
    return jsonify(job_titles=list(rows))

@job_titles_bp.post("/")
@role_required('admin','hr_manager')
def create_job_title():
    d = request.get_json() or {}
    if not d.get("name"):
        return jsonify(message="الاسم مطلوب"), 400
    db.session.execute(text("INSERT INTO job_titles(name, code) VALUES(:n,:c)"), {"n": d["name"], "c": d.get("code")})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201