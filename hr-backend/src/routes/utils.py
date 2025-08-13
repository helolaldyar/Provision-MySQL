from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user = get_jwt_identity() or {}
            if user.get("role") not in roles:
                return jsonify(message="غير مصرح"), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

from sqlalchemy import text
from ..main import db  # type: ignore

def log_action(user_id, action, entity, entity_id=None, details=None):
    try:
        db.session.execute(text("""
            INSERT INTO audit_logs(user_id, action, entity, entity_id, details)
            VALUES(:uid,:act,:ent,:eid,:det)
        """), {"uid": user_id, "act": action, "ent": entity, "eid": entity_id, "det": details})
        db.session.commit()
    except Exception:
        db.session.rollback()
