from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required

documents_bp = Blueprint("documents", __name__)

@documents_bp.get("/")
@jwt_required()
def list_docs():
    rows = db.session.execute(text("""
      SELECT d.id, d.employee_id, e.full_name, d.doc_type, d.file_url, d.issue_date, d.expiry_date, d.status
      FROM employee_documents d
      LEFT JOIN employees e ON e.id=d.employee_id
      ORDER BY d.id DESC
    """)).mappings().all()
    return jsonify(documents=list(rows))

from .utils import role_required

@documents_bp.post("/")
@role_required('admin','hr_manager')
def create_doc():
    d = request.get_json() or {}
    if not d.get("employee_id") or not d.get("doc_type"):
        return jsonify(message="employee_id و doc_type مطلوبة"), 400
    db.session.execute(text("""
        INSERT INTO employee_documents(employee_id, doc_type, file_url, issue_date, expiry_date, status)
        VALUES(:eid,:dt,:url,:idate,:edate,:st)
    """), {"eid": d["employee_id"], "dt": d["doc_type"], "url": d.get("file_url"), "idate": d.get("issue_date"),
           "edate": d.get("expiry_date"), "st": d.get("status","valid")})
    db.session.commit()
    return jsonify(message="تمت الإضافة"), 201

@documents_bp.post("/upload")
@role_required('admin','hr_manager')
def upload():
    from flask import current_app, request
    from werkzeug.utils import secure_filename
    import os
    f = request.files.get("file")
    employee_id = request.form.get("employee_id")
    doc_type = request.form.get("doc_type","مستند")
    if not f or not employee_id:
        return jsonify(message="الملف و employee_id مطلوبة"), 400
    filename = secure_filename(f.filename)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    f.save(save_path)
    db.session.execute(text("""
        INSERT INTO employee_documents(employee_id, doc_type, file_url, status)
        VALUES(:eid,:dt,:url,'valid')
    """), {"eid": employee_id, "dt": doc_type, "url": f"/api/documents/file/{filename}"})
    db.session.commit()
    return jsonify(message="تم الرفع", file_url=f"/api/documents/file/{filename}"), 201

@documents_bp.get("/file/<path:filename>")
@jwt_required()
def serve_file(filename):
    from flask import current_app, send_from_directory
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename, as_attachment=True)
