-- HR Portal Full Schema (V8 baseline) — 2025-08-11
-- Charset/Collation
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- --------------------
-- Tables
-- --------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(190) UNIQUE,
  role ENUM('admin','hr_manager','supervisor','employee') NOT NULL DEFAULT 'admin',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_titles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(190) NULL,
  phone VARCHAR(50) NULL,
  department VARCHAR(150) NULL,
  job_title VARCHAR(150) NULL,
  hire_date DATE NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  basic_salary DECIMAL(10,2) DEFAULT 0,
  supervisor_user_id INT NULL,
  FOREIGN KEY (supervisor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  work_days_mask INT DEFAULT 62
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(50) UNIQUE,
  annual_quota INT DEFAULT 0,
  requires_approval TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  day_date DATE NOT NULL,
  check_in VARCHAR(5) NULL,
  check_out VARCHAR(5) NULL,
  status ENUM('present','late','absent','leave') DEFAULT 'present',
  notes VARCHAR(255) NULL,
  UNIQUE KEY uniq_emp_day (employee_id, day_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month CHAR(7) NOT NULL, -- YYYY-MM
  basic DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net DECIMAL(10,2) GENERATED ALWAYS AS (basic + allowances - deductions) VIRTUAL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employment_contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  contract_number VARCHAR(100) NOT NULL,
  contract_type VARCHAR(100) DEFAULT 'دوام كامل',
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status VARCHAR(50) DEFAULT 'active',
  basic_salary DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  doc_type VARCHAR(120) NOT NULL,
  file_url VARCHAR(255) NULL,
  issue_date DATE NULL,
  expiry_date DATE NULL,
  status VARCHAR(50) DEFAULT 'valid',
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by INT NULL,
  publish_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INT NULL,
  details TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------
-- Seeds
-- --------------------
INSERT INTO users (username, email, role, password_hash) VALUES
('admin', 'admin@helolaldyar.com', 'admin', '$2b$12$xnXbX9p3lx9oBG4VNXe1i.Q/IfQWLed6uRJZ2QOu4J3sWIatAhURa')
ON DUPLICATE KEY UPDATE role=VALUES(role), email=VALUES(email);

INSERT INTO departments (name, code) VALUES
('الموارد البشرية','HR'), ('الشؤون الإدارية','ADM'), ('المبيعات','SAL')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO job_titles (name, code) VALUES
('أخصائي موارد بشرية','HR-SPEC'), ('محاسب رواتب','PAY-ACC'), ('مندوب مبيعات','SAL-REP')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO leave_types (name, code, annual_quota, requires_approval) VALUES
('سنوية','ANL', 21, 1), ('عارضة','CAS', 7, 1), ('مرضية','SCK', 10, 1)
ON DUPLICATE KEY UPDATE annual_quota=VALUES(annual_quota), requires_approval=VALUES(requires_approval);

INSERT INTO shifts (name, start_time, end_time, work_days_mask) VALUES
('افتراضي','08:00','17:00',62)
ON DUPLICATE KEY UPDATE start_time=VALUES(start_time), end_time=VALUES(end_time);

-- ملاحظات:
-- 1) لو ظهر <REPLACE_WITH_BCRYPT_HASH> فوق، شغّل bootstrap_admin.py لتوليد الهاش وتحديث المستخدم.
-- 2) عدّل البريد الإلكتروني للحساب الإداري إذا رغبت.