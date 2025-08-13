from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required

employee_bp = Blueprint("employee", __name__)

@employee_bp.get("/")
@jwt_required()
def list_employees():
    q = (request.args.get("q") or "").strip()
    sql = "SELECT id, employee_code, full_name, email, phone, department, job_title, status, basic_salary FROM employees"
    params = {}
    if q:
        sql += " WHERE full_name LIKE :q OR employee_code LIKE :q"
        params["q"] = f"%{q}%"
    sql += " ORDER BY id DESC LIMIT 200"
    rows = db.session.execute(text(sql), params).mappings().all()
    return jsonify(employees=list(rows))

from .utils import role_required

@employee_bp.post("/")
@role_required('admin','hr_manager')
def create_employee():
    d = request.get_json() or {}
    required = ("employee_code", "full_name")
    if any(k not in d or not d[k] for k in required):
        return jsonify(message="employee_code و full_name مطلوبة"), 400
    db.session.execute(text("""
      INSERT INTO employees(employee_code, full_name, email, phone, department, job_title, hire_date, status, basic_salary)
      VALUES(:code,:name,:email,:phone,:dept,:title,:hire,:status,:basic)
    """), {
        "code": d["employee_code"], "name": d["full_name"], "email": d.get("email"), "phone": d.get("phone"),
        "dept": d.get("department"), "title": d.get("job_title"), "hire": d.get("hire_date"),
        "status": d.get("status","active"), "basic": d.get("basic_salary", 0)
    })
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201

@employee_bp.get("/export/csv")
@jwt_required()
def export_csv():
    import csv, io
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","employee_code","full_name","email","phone","department","job_title","status","basic_salary"])
    rows = db.session.execute(text("SELECT id, employee_code, full_name, email, phone, department, job_title, status, basic_salary FROM employees ORDER BY id")).mappings().all()
    for r in rows:
        writer.writerow([r["id"], r["employee_code"], r["full_name"], r["email"], r["phone"], r["department"], r["job_title"], r["status"], r["basic_salary"]])
    from flask import Response
    return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=employees.csv"})

@employee_bp.get("/export/pdf")
@jwt_required()
def export_pdf():
    import os
    company = os.getenv('COMPANY_NAME', 'Helol AlDyar')
    logo = os.getenv('COMPANY_LOGO_PATH')
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import cm
    import io
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 14)
    y = height - 2*cm
    if logo and os.path.exists(logo):
        try:
            c.drawImage(logo, 2*cm, y-1.5*cm, width=3*cm, height=1.5*cm, preserveAspectRatio=True, mask='auto')
        except Exception:
            pass
    c.drawString(6*cm, y, f"{company} - قائمة الموظفين")
    y -= 1*cm
    c.setFont("Helvetica", 12)
    y -= 1*cm
    rows = db.session.execute(text("SELECT employee_code, full_name, department, job_title FROM employees ORDER BY id")).mappings().all()
    for r in rows:
        line = f"{r['employee_code']} - {r['full_name']} - {r['department'] or '-'} - {r['job_title'] or '-'}"
        c.drawString(2*cm, y, line)
        y -= 0.7*cm
        if y < 2*cm:
            c.showPage(); y = height - 2*cm; c.setFont("Helvetica", 12)
    c.save()
    buffer.seek(0)
    from flask import send_file
    return send_file(buffer, as_attachment=True, download_name="employees.pdf", mimetype="application/pdf")
