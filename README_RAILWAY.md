/hr-backend/
  requirements.txt
  /src/ (main.py, routes/...)
/hr-system/
Dockerfile
Procfile
.env.example

1) Railway → New Project → MySQL → Import: hr_portal_full_schema_v8.sql
2) Add Service → Deploy from GitHub → اختر الريبو
3) Variables:
   - DATABASE_URL = mysql+pymysql://USER:PASSWORD@HOST:PORT/DBNAME
   - JWT_SECRET_KEY = قيمة قوية
   - PUBLIC_BASE_URL = https://hr.helolaldyar.com
4) لو ما استخدمت Dockerfile: 
   cd hr-backend/src && gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
5) استخدم رابط الخدمة في hr-system/src/api.js:
   const API_BASE = 'https://YOUR-SERVICE.up.railway.app/api';
ثم npm run build وارفع build إلى public_html مع .htaccess لإعادة التوجيه.
