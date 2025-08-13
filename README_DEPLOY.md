
# HR Portal (Helol AlDyar) — نشر وتشغيل

## 1) المتطلبات
- Python 3.10+
- Node 18+
- MySQL

## 2) إعداد الباك-إند
```bash
cd hr-backend
pip install -r requirements.txt
cd src
# للإنتاج غيّر متغيرات البيئة:
# export DATABASE_URL="mysql+pymysql://USER:PASS@HOST/DBNAME"
# export JWT_SECRET_KEY="قيمة_قوية_عشوائية"
python main.py
```

## 3) بناء الواجهة الأمامية
```bash
cd ../../hr-system
npm install
npm run build
# انسخ ناتج البناء إلى: ../hr-backend/src/static/
```

## 4) Hostinger (www.hr.helolaldyar.com)
- عطّل/احذف `public_html/default.php`
- فعّل Flask عبر Passenger/WSGI (نقطة التشغيل: `hr-backend/src/main.py`)
- اضبط متغير `DATABASE_URL` ليطابق بيانات MySQL لديك.
- ادخل على النطاق وتأكد من عمل البوابة.


## V7 — مزايا جديدة
- QR الحضور: توليد ومسح، صلاحية الرمز 10 دقائق. اضبط متغير `PUBLIC_BASE_URL` (مثال: `https://www.hr.helolaldyar.com`).
- سجل التدقيق: حفظ أي تغييرات مهمة (تغيير دور، إعادة كلمة مرور...).
- إدارة المستخدمين: تغيير الأدوار وإعادة تعيين كلمة المرور (admin فقط).
- تقارير PDF بعلامة الشركة: استخدم `COMPANY_NAME` و `COMPANY_LOGO_PATH` في البيئة.

### ترقية قاعدة البيانات
نفّذ:
```sql
SOURCE hr_portal_v6_update.sql;
SOURCE hr_portal_v7_update.sql;
```


## V8 — تحضير المشرف
- صفحة "تحضير المشرف" لتسجيل حضور فريق المشرف يوميًا (تحديد وقت دخول/خروج وحالة الموظف).
- واجهات برمجية: `/api/attendance/my-team?date=YYYY-MM-DD`, `/api/attendance/bulk_upsert`.
- اربط الموظفين بمشرف عبر `employees.supervisor_user_id` ثم أعطِ حساب المشرف دور `supervisor`.

### تهيئة سريعة
1) نفّذ ترقية قاعدة البيانات: `SOURCE hr_portal_v8_update.sql;`
2) حدّد المشرف في جدول الموظفين:  
   `UPDATE employees SET supervisor_user_id = <USER_ID> WHERE department='...' ;`
3) امنح الحساب دور "supervisor" من صفحة **المستخدمون**.
