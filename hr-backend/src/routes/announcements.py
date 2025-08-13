from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required, get_jwt_identity

announcements_bp = Blueprint("announcements", __name__)

@announcements_bp.get("/")
@jwt_required()
def list_ann():
    rows = db.session.execute(text("SELECT id, title, body, publish_at FROM announcements ORDER BY id DESC")).mappings().all()
    return jsonify(announcements=list(rows))

@announcements_bp.post("/")
@role_required('admin','hr_manager')
def create_ann():
    d = request.get_json() or {}
    if not d.get("title") or not d.get("body"):
        return jsonify(message="title و body مطلوبة"), 400
    user = get_jwt_identity()
    db.session.execute(text("INSERT INTO announcements(title, body, created_by) VALUES(:t,:b,:u)"),
                       {"t": d["title"], "b": d["body"], "u": user["id"] if user else None})
    db.session.commit()
    return jsonify(message="تم النشر"), 201