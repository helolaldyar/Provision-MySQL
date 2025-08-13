
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy import text
import os

app = Flask(__name__, static_folder="static", static_url_path="/")

# Uploads
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'uploads'))
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://u507068723_hr_admin:Saleh000987@localhost/u507068723_hr_system"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "CHANGE_ME_BEFORE_PROD")

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

from routes.auth import auth_bp
from routes.employee import employee_bp
from routes.dashboard import dashboard_bp
from routes.attendance import attendance_bp
from routes.leave import leave_bp
from routes.payroll import payroll_bp
from routes.departments import departments_bp
from routes.job_titles import job_titles_bp
from routes.leave_types import leave_types_bp
from routes.shifts import shifts_bp
from routes.contracts import contracts_bp
from routes.documents import documents_bp
from routes.announcements import announcements_bp
from routes.notifications import notifications_bp
from routes.users import users_bp
from routes.audit import audit_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(employee_bp, url_prefix="/api/employees")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
app.register_blueprint(leave_bp, url_prefix="/api/leaves")
app.register_blueprint(payroll_bp, url_prefix="/api/payroll")
app.register_blueprint(departments_bp, url_prefix="/api/departments")
app.register_blueprint(job_titles_bp, url_prefix="/api/job_titles")
app.register_blueprint(leave_types_bp, url_prefix="/api/leave_types")
app.register_blueprint(shifts_bp, url_prefix="/api/shifts")
app.register_blueprint(contracts_bp, url_prefix="/api/contracts")
app.register_blueprint(documents_bp, url_prefix="/api/documents")
app.register_blueprint(announcements_bp, url_prefix="/api/announcements")
app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(audit_bp, url_prefix="/api/audit")

@app.get("/api/health")
def health():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    index = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index):
        return send_from_directory(app.static_folder, "index.html")
    return "Static build not found. Please run the frontend build.", 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
