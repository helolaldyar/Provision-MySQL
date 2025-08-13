from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

leave_bp = Blueprint("leave", __name__)

@leave_bp.get("/")
@jwt_required()
def list_leaves():
    rows = db.session.execute(text("""
      SELECT lr.id, e.full_name, lt.name AS leave_type, lr.start_date, lr.end_date, lr.status, lr.reason
      FROM leave_requests lr
      LEFT JOIN employees e ON e.id=lr.employee_id
      LEFT JOIN leave_types lt ON lt.id=lr.leave_type_id
      ORDER BY lr.id DESC
    """)).mappings().all()
    return jsonify(leaves=list(rows))

@leave_bp.post("/")
@role_required('admin','hr_manager')
def create_leave():
    d = request.get_json() or {}
    required = ("employee_id","leave_type_id","start_date","end_date")
    if any(k not in d for k in required):
        return jsonify(message="حقول مطلوبة: employee_id, leave_type_id, start_date, end_date"), 400
    db.session.execute(text("""
      INSERT INTO leave_requests(employee_id, leave_type_id, start_date, end_date, status, reason)
      VALUES(:eid,:ltid,:sd,:ed,:st,:rsn)
    """), {"eid": d["employee_id"], "ltid": d["leave_type_id"], "sd": d["start_date"], "ed": d["end_date"],
           "st": d.get("status","pending"), "rsn": d.get("reason")})
    db.session.commit()
    return jsonify(message="تم تقديم الطلب"), 201

@leave_bp.put("/<int:req_id>/approve")
@role_required('admin','hr_manager')
def approve(req_id):
    db.session.execute(text("UPDATE leave_requests SET status='approved' WHERE id=:id"), {"id": req_id})
    # notify employee
    row = db.session.execute(text("SELECT employee_id FROM leave_requests WHERE id=:id"), {"id": req_id}).mappings().first()
    if row and row.get("employee_id"):
        db.session.execute(text("INSERT INTO notifications(user_id, title, body) SELECT u.id, :t, :b FROM users u JOIN employees e ON e.email=u.email WHERE e.id=:eid"),
                           {"t":"تمت الموافقة على طلب الإجازة","b":"تمت الموافقة على طلبك.","eid": row["employee_id"]})
    db.session.commit()
    return jsonify(message="تمت الموافقة")

@leave_bp.put("/<int:req_id>/reject")
@role_required('admin','hr_manager')
def reject(req_id):
    db.session.execute(text("UPDATE leave_requests SET status='rejected' WHERE id=:id"), {"id": req_id})
    row = db.session.execute(text("SELECT employee_id FROM leave_requests WHERE id=:id"), {"id": req_id}).mappings().first()
    if row and row.get("employee_id"):
        db.session.execute(text("INSERT INTO notifications(user_id, title, body) SELECT u.id, :t, :b FROM users u JOIN employees e ON e.email=u.email WHERE e.id=:eid"),
                           {"t":"تم رفض طلب الإجازة","b":"نأسف، تم رفض الطلب.","eid": row["employee_id"]})
    db.session.commit()
    return jsonify(message="تم الرفض")
