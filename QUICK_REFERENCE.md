# 🚀 Quick Reference - EcoTrack Commands

## Startup

### Start Everything (Recommended)
```powershell
# Terminal 1: API Server
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\start-api.ps1

# Terminal 2: Frontend (in another terminal)
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack\frontend-app
.\start.ps1
```

### Manual Startup
```powershell
# Terminal 1: API
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack\frontend-app
npm run dev
```

---

## Admin & Users

### Create Admin
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
python scripts/create_admin.py
```

### List All Users
```powershell
.\.venv\Scripts\Activate.ps1
python -c "
from app.db.session import SessionLocal
from app.models.user import User
db = SessionLocal()
users = db.query(User).all()
print(f'Total: {len(users)}')
for u in users:
    print(f'  - {u.email} ({u.role})')
db.close()
"
```

---

## Zones & Data

### List All Zones
```powershell
.\.venv\Scripts\Activate.ps1
python -c "
from app.db.session import SessionLocal
from app.models.zone import Zone
db = SessionLocal()
zones = db.query(Zone).all()
print(f'Total: {len(zones)}')
for z in zones:
    print(f'  - {z.name} ({z.postal_code})')
db.close()
"
```

### Create Test Zone
```powershell
.\.venv\Scripts\Activate.ps1
python -c "
from app.db.session import SessionLocal
from app.models.zone import Zone
db = SessionLocal()
zone = Zone(name='Paris', postal_code='75001', description='Capital')
db.add(zone)
db.commit()
print('Zone created')
db.close()
"
```

### Ingest External Data
```powershell
.\.venv\Scripts\Activate.ps1
python scripts/ingest_external_data.py --limit 50 --country FR
```

---

## Testing & Verification

### Health Check
```powershell
curl http://127.0.0.1:8000/health
# Should return: {"status":"ok"}
```

### Check Port Usage
```powershell
netstat -ano | findstr :8000    # API port
netstat -ano | findstr :5173    # Frontend port
```

### API Documentation
```
http://127.0.0.1:8000/docs        # Swagger UI
http://127.0.0.1:8000/redoc       # ReDoc
```

### Debug Panel
```
http://localhost:5173/debug       # Diagnostics
```

---

## Database

### Reset Database
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
rm ecotrack.db
.\start-api.ps1  # Will recreate and create admin
```

### Reset Test Database
```powershell
rm test.db
```

---

## Testing & Development

### Run Tests
```powershell
.\.venv\Scripts\Activate.ps1
pytest app/tests/
# or specific test:
pytest app/tests/test_auth.py -v
```

### Run Frontend Tests
```powershell
cd frontend-app
npm test
```

### Frontend Build
```powershell
cd frontend-app
npm run build
# Output: frontend-app/dist/
```

### Frontend Preview
```powershell
cd frontend-app
npm run preview
```

---

## Debugging

### View API Logs (Real-time)
```
# Terminal with uvicorn running shows all requests and errors
# Look for lines like:
# INFO:     POST /api/v1/auth/login 200 OK
# ERROR:    Exception in request handler
```

### View Frontend Console
```
F12 > Console tab > Look for [useZones], [useUsers] logs
```

### Check Stored Auth Token
```javascript
// In browser console (F12 > Console)
JSON.parse(localStorage.getItem("ecotrack_auth"))
```

### Clear Frontend Cache
```javascript
// In browser console
localStorage.clear()
location.reload()
```

---

## Environment Configuration

### Create .env for Backend
```
DATABASE_URL=sqlite:///./ecotrack.db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
FIRST_SUPERUSER_EMAIL=admin@ecotrack.local
FIRST_SUPERUSER_PASSWORD=ChangeMe123!
OPENAQ_API_KEY=your-openaq-key
```

### Create .env for Frontend
```
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

---

## Common Issues & Quick Fixes

### "Connection refused on port 8000"
```powershell
# API not running
.\start-api.ps1
```

### "Forbidden - insufficient permissions"
```powershell
# Not admin user
python scripts/create_admin.py
# Then log out and log back in with new account
```

### "Network error - API server may not be running"
```powershell
# Frontend can't reach API
curl http://127.0.0.1:8000/health
# If no response, check API terminal for errors
```

### "Cannot find module 'node_modules'"
```powershell
cd frontend-app
npm install
npm run dev
```

### "Port 5173 already in use"
```powershell
# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
# Then restart
npm run dev
```

---

## Useful Curl Commands

### Login and Get Token
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@ecotrack.local&password=ChangeMe123!"
```

### Get Users (with token)
```bash
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v1/users
```

### Get Zones
```bash
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/v1/zones
```

### Get Indicators with Filter
```bash
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:8000/api/v1/indicators?skip=0&limit=10&zone_id=1"
```

---

## File Locations

```
Project Root:
  .venv/                    # Virtual environment
  app/                      # Backend code
  frontend-app/             # React frontend
  scripts/                  # Utility scripts
  ecotrack.db              # SQLite database
  .env                     # Environment config

Frontend:
  frontend-app/src/
    pages/                 # Page components
    components/            # Reusable components
    hooks/                 # React hooks
    services/              # API client
    context/               # React context
    types/                 # TypeScript types

Backend:
  app/
    api/v1/               # API routes
    models/               # SQLAlchemy models
    schemas/              # Pydantic schemas
    services/             # Business logic
    db/                   # Database config
    core/                 # Security, config
    tests/                # Test suite
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `COMPLETE_SETUP_GUIDE.md` | Full setup instructions |
| `QUICK_FIX.md` | 5-minute quick start |
| `DEBUGGING_GUIDE.md` | Comprehensive troubleshooting |
| `FIXES_SUMMARY.md` | What was changed and why |
| `CHANGES_MADE.md` | Detailed list of modifications |
| `QUICK_REFERENCE.md` | This file! |

---

## Emergency Commands

### Kill Everything and Start Fresh
```powershell
# Stop all processes (Ctrl+C in each terminal)
# Delete database
rm ecotrack.db

# Start fresh
.\start-api.ps1
# Terminal 2:
.\frontend-app\start.ps1
```

### Force Kill Port
```powershell
# Kill port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Kill port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Complete Reset
```powershell
# Delete all generated files
rm ecotrack.db
rm test.db
rm -r frontend-app\node_modules
rm -r frontend-app\dist

# Reinstall and restart
cd frontend-app
npm install
cd ..
.\start-api.ps1
```

---

## 🎯 Most Common Workflow

```powershell
# 1. Terminal 1: Start API
.\start-api.ps1

# Wait 5 seconds for startup

# 2. Terminal 2: Start Frontend
cd frontend-app && .\start.ps1

# 3. Browser: Open and verify
http://localhost:5173/debug         # Check everything is green
http://localhost:5173/login         # Login with admin

# 4. Browser: Test features
http://localhost:5173/              # Dashboard
http://localhost:5173/zones         # Create a zone
http://localhost:5173/users         # View users
http://localhost:5173/indicators    # View indicators

# Done! 🎉
```

---

## Need Help?

1. Check `DEBUGGING_GUIDE.md` for detailed troubleshooting
2. Look at browser console (F12 > Console) for error logs
3. Use `/debug` panel at http://localhost:5173/debug
4. Check terminal where `uvicorn` is running for backend errors
5. See `COMPLETE_SETUP_GUIDE.md` for comprehensive help

---

## Contact

For issues, consult:
- DEBUGGING_GUIDE.md (for troubleshooting)
- COMPLETE_SETUP_GUIDE.md (for setup help)
- Browser console (F12 > Console tab)
- `/debug` panel at http://localhost:5173/debug
