from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

contracts_bp = Blueprint("contracts", __name__)

@contracts_bp.get("/")
@jwt_required()
def list_contracts():
    rows = db.session.execute(text("""
      SELECT c.id, c.employee_id, e.full_name, c.contract_number, c.contract_type,
             c.start_date, c.end_date, c.status, c.basic_salary
      FROM employment_contracts c
      LEFT JOIN employees e ON e.id=c.employee_id
      ORDER BY c.id DESC
    """)).mappings().all()
    return jsonify(contracts=list(rows))

@contracts_bp.post("/")
@role_required('admin','hr_manager')
def create_contract():
    d = request.get_json() or {}
    required = ("employee_id","contract_number","start_date")
    if any(k not in d for k in required):
        return jsonify(message="حقول مطلوبة: employee_id, contract_number, start_date"), 400
    db.session.execute(text("""
        INSERT INTO employment_contracts(employee_id, contract_number, contract_type, start_date, end_date, status, basic_salary)
        VALUES(:eid,:num,:ctype,:sd,:ed,:st,:salary)
    """), {"eid": d["employee_id"], "num": d["contract_number"], "ctype": d.get("contract_type","دوام كامل"),
           "sd": d["start_date"], "ed": d.get("end_date"), "st": d.get("status","active"), "salary": d.get("basic_salary",0)})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201