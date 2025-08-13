from flask import Blueprint, jsonify
from sqlalchemy import text
from flask_jwt_extended import jwt_required
from .utils import role_required
from ..main import db  # type: ignore

audit_bp = Blueprint("audit", __name__)

@audit_bp.get("/")
@role_required('admin','hr_manager')
def list_logs():
    rows = db.session.execute(text("SELECT id, user_id, action, entity, entity_id, details, created_at FROM audit_logs ORDER BY id DESC LIMIT 500")).mappings().all()
    return jsonify(logs=list(rows))