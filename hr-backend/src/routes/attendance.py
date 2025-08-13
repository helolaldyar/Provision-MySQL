from flask import Blueprint, request, jsonify
from sqlalchemy import text
from ..main import db  # type: ignore
from flask_jwt_extended import jwt_required
from .utils import role_required

attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.get("/")
@jwt_required()
def list_attendance():
    rows = db.session.execute(text("""
      SELECT a.id, e.employee_code, e.full_name, a.day_date, a.check_in, a.check_out, a.status, a.notes
      FROM attendance a LEFT JOIN employees e ON e.id=a.employee_id
      WHERE a.day_date=CURDATE()
      ORDER BY a.id DESC
    """)).mappings().all()
    return jsonify(attendance=list(rows))

@attendance_bp.post("/")
@role_required('admin','hr_manager')
def add_attendance():
    d = request.get_json() or {}
    if not d.get("employee_id") or not d.get("day_date"):
        return jsonify(message="employee_id و day_date مطلوبة"), 400
    db.session.execute(text("""
      INSERT INTO attendance(employee_id, day_date, check_in, check_out, status, notes)
      VALUES(:eid,:day,:cin,:cout,:st,:notes)
    """), {"eid": d["employee_id"], "day": d["day_date"], "cin": d.get("check_in"),
           "cout": d.get("check_out"), "st": d.get("status","present"), "notes": d.get("notes")})
    db.session.commit()
    return jsonify(message="تم التسجيل"), 201

@attendance_bp.get("/qr")
@jwt_required()
def qr():
    from itsdangerous import TimestampSigner
    from flask import current_app, request, send_file
    import io, qrcode, os
    employee_id = request.args.get("employee_id", type=int)
    action = request.args.get("action","checkin")
    if not employee_id or action not in ("checkin","checkout"):
        return jsonify(message="employee_id و action مطلوبة"), 400
    signer = TimestampSigner(current_app.config["JWT_SECRET_KEY"])
    token = signer.sign(f"{employee_id}:{action}".encode()).decode()
    base = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
    url = f"{base}/api/attendance/scan?token={token}" if base else f"/api/attendance/scan?token={token}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG"); buf.seek(0)
    return send_file(buf, mimetype="image/png")

@attendance_bp.get("/scan")
def scan():
    from itsdangerous import TimestampSigner, BadSignature, SignatureExpired
    from flask import current_app, request
    import datetime as dt
    token = request.args.get("token")
    if not token:
        return jsonify(message="token مفقود"), 400
    signer = TimestampSigner(current_app.config["JWT_SECRET_KEY"])
    try:
        data = signer.unsign(token, max_age=60*10).decode()  # 10 دقائق صلاحية
        employee_id, action = data.split(":",1)
        employee_id = int(employee_id)
        today = dt.date.today().isoformat()
        if action == "checkin":
            db.session.execute(text("""
                INSERT INTO attendance(employee_id, day_date, check_in, status)
                VALUES(:eid, :d, DATE_FORMAT(NOW(), '%H:%i'), 'present')
                ON DUPLICATE KEY UPDATE check_in = COALESCE(check_in, VALUES(check_in)), status='present'
            """), {"eid": employee_id, "d": today})
        else:
            db.session.execute(text("""
                INSERT INTO attendance(employee_id, day_date, check_out, status)
                VALUES(:eid, :d, DATE_FORMAT(NOW(), '%H:%i'), 'present')
                ON DUPLICATE KEY UPDATE check_out = VALUES(check_out), status='present'
            """), {"eid": employee_id, "d": today})
        db.session.commit()
        return jsonify(message="تم التسجيل بنجاح", employee_id=employee_id, action=action)
    except SignatureExpired:
        return jsonify(message="انتهت صلاحية الرمز"), 400
    except BadSignature:
        return jsonify(message="رمز غير صالح"), 400


@attendance_bp.get("/my-team")
@jwt_required()
def my_team():
    from flask_jwt_extended import get_jwt_identity
    import datetime as dt
    d = request.args.get("date") or dt.date.today().isoformat()
    user = get_jwt_identity()
    # قائمة الموظفين المرتبطين بالمشرف الحالي
    rows = db.session.execute(text("""
      SELECT e.id AS employee_id, e.employee_code, e.full_name,
             a.id, a.day_date, a.check_in, a.check_out, a.status, a.notes
      FROM employees e
      LEFT JOIN attendance a ON a.employee_id=e.id AND a.day_date=:d
      WHERE e.supervisor_user_id=:uid AND (e.status IS NULL OR e.status='active')
      ORDER BY e.full_name
    """), {"uid": user["id"], "d": d}).mappings().all()
    return jsonify(date=d, team=list(rows))

@attendance_bp.get("/by_date")
@jwt_required()
def by_date():
    import datetime as dt
    d = request.args.get("date") or dt.date.today().isoformat()
    rows = db.session.execute(text("""
      SELECT a.id, a.employee_id, e.employee_code, e.full_name, a.day_date, a.check_in, a.check_out, a.status, a.notes
      FROM attendance a LEFT JOIN employees e ON e.id=a.employee_id
      WHERE a.day_date=:d
      ORDER BY a.id DESC
    """), {"d": d}).mappings().all()
    return jsonify(date=d, attendance=list(rows))

@attendance_bp.post("/bulk_upsert")
@role_required('admin','hr_manager','supervisor')
def bulk_upsert():
    payload = request.get_json() or {}
    day = payload.get("date")
    items = payload.get("items") or []
    if not day or not isinstance(items, list):
        return jsonify(message="date و items مطلوبة"), 400
    # upsert لكل موظف/يوم
    for it in items:
        eid = it.get("employee_id")
        if not eid: 
            continue
        db.session.execute(text("""
          INSERT INTO attendance(employee_id, day_date, check_in, check_out, status, notes)
          VALUES(:eid,:d,:cin,:cout,:st,:notes)
          ON DUPLICATE KEY UPDATE
            check_in=VALUES(check_in),
            check_out=VALUES(check_out),
            status=VALUES(status),
            notes=VALUES(notes)
        """), {
            "eid": eid, "d": day, "cin": it.get("check_in"), "cout": it.get("check_out"),
            "st": it.get("status","present"), "notes": it.get("notes")
        })
    db.session.commit()
    return jsonify(message="تم الحفظ")
