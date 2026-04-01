@echo off
cd /d "%~dp0backend"
echo Starting PitchIQ Django backend...
python manage.py runserver 0.0.0.0:8000
pause
