from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required

payroll_bp = Blueprint("payroll", __name__)

@payroll_bp.get("/")
@jwt_required()
def list_payroll():
    rows = db.session.execute(text("""
      SELECT p.id, e.full_name, p.month, p.basic, p.allowances, p.deductions, p.net, p.notes
      FROM payroll p LEFT JOIN employees e ON e.id=p.employee_id
      ORDER BY p.id DESC
    """)).mappings().all()
    return jsonify(payroll=list(rows))

from .utils import role_required

@payroll_bp.post("/")
@role_required('admin','hr_manager')
def create_payroll():
    d = request.get_json() or {}
    required = ("employee_id","month","basic")
    if any(k not in d for k in required):
        return jsonify(message="حقول مطلوبة: employee_id, month, basic"), 400
    db.session.execute(text("""
      INSERT INTO payroll(employee_id, month, basic, allowances, deductions, notes)
      VALUES(:eid,:m,:b,:al,:dd,:notes)
    """), {"eid": d["employee_id"], "m": d["month"], "b": d["basic"], "al": d.get("allowances",0),
           "dd": d.get("deductions",0), "notes": d.get("notes")})
    db.session.commit()
    return jsonify(message="تم إنشاء كشف"), 201

@payroll_bp.get("/export/csv")
@jwt_required()
def export_csv():
    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","employee","month","basic","allowances","deductions","net"])
    rows = db.session.execute(text("""
      SELECT p.id, e.full_name AS employee, p.month, p.basic, p.allowances, p.deductions, p.net
      FROM payroll p LEFT JOIN employees e ON e.id=p.employee_id ORDER BY p.id
    """)).mappings().all()
    for r in rows:
        writer.writerow([r["id"], r["employee"], r["month"], r["basic"], r["allowances"], r["deductions"], r["net"]])
    from flask import Response
    return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=payroll.csv"})
