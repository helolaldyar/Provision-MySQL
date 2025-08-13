from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required, get_jwt_identity

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.get("/")
@jwt_required()
def list_notif():
    user = get_jwt_identity()
    rows = db.session.execute(
        text("SELECT id, title, body, read_at, created_at FROM notifications WHERE user_id=:u ORDER BY id DESC"),
        {"u": user["id"]}
    ).mappings().all()
    return jsonify(notifications=list(rows))

@notifications_bp.post("/")
@role_required('admin','hr_manager')
def create_notif():
    d = request.get_json() or {}
    if not d.get("user_id") or not d.get("title") or not d.get("body"):
        return jsonify(message="user_id و title و body مطلوبة"), 400
    db.session.execute(text("INSERT INTO notifications(user_id, title, body) VALUES(:u,:t,:b)"),
                       {"u": d["user_id"], "t": d["title"], "b": d["body"]})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201

@notifications_bp.put("/<int:nid>/read")
@jwt_required()
def mark_read(nid):
    db.session.execute(text("UPDATE notifications SET read_at=NOW() WHERE id=:id"), {"id": nid})
    db.session.commit()
    return jsonify(message="ok")