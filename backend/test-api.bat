@echo off
cd /d "c:\Users\rishi tripathi\OneDrive\Desktop\acadportal\backend"
timeout /t 3 /nobreak >nul
echo Testing API...
curl.exe "http://localhost:5000/api/submission/pending/FAC001"
echo.
