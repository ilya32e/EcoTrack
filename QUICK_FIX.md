# 🔧 Quick Fix - Users & Zones List Not Displaying

## Step 1: Start the API Server
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

✅ You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 2: Create Admin User
In a **new PowerShell terminal**:
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
python scripts/create_admin.py
```

Follow the prompts to create an admin account.

## Step 3: Start Frontend
In **another new PowerShell terminal**:
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack\frontend-app
npm run dev
```

✅ You should see:
```
Local: http://localhost:5173/
```

## Step 4: Test & Debug

### 4a. Login with Admin
1. Open `http://localhost:5173/` in your browser
2. Go to **Login** page
3. Enter admin email and password
4. Click **Login**

### 4b. Create a Zone (Test Data)
1. Click **Zones** in sidebar
2. Fill the form:
   - **Nom**: "Paris"
   - **Code postal**: "75001"
   - **Description**: "Capital of France"
3. Click **Ajouter**
4. Zone should appear in the list below

### 4c. Debug Issues
If Users/Zones still don't show:

**Check the Debug Panel:**
- Open `http://localhost:5173/debug`
- Check if:
  - ✅ Token présent
  - ✅ API URL is correct
  - ✅ Authorization Header is set
  - ✅ Server is accessible

**Check Browser Console (F12 > Console)**
Look for messages like:
```
[useZones] Fetching zones...
[useZones] Success: [...]
```

## Expected Results

### If Everything Works ✅
- Users page shows: List of users with email, name, role
- Zones page shows: List of zones with name and postal code
- You can create, edit, delete users and zones

### If It Doesn't ❌

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "Chargement..." stays forever | Server not running | Start API with `uvicorn` |
| Red error "Forbidden" | Not admin user | Run `create_admin.py` again |
| Red error "Network error" | API URL wrong | Check debug panel at `/debug` |
| "Aucun utilisateur trouvé" | No admin created | Run `create_admin.py` |
| Zone list empty but Users works | No zones in DB | Create one manually in Zones page |

## Key Improvements Made

✨ **Enhanced Error Handling**:
- Better error messages in UI
- Console logs for debugging
- Retry logic for failed requests

✨ **Debug Panel**:
- Access at `http://localhost:5173/debug`
- Shows auth status, API config, endpoint tests
- Quick actions to clear cache and reload

✨ **Detailed Logging**:
- Check browser console for `[useZones]`, `[useUsers]` logs
- Backend logs appear in terminal where `uvicorn` is running

## Terminal Setup (Recommended)

Open **4 terminals** for easier monitoring:

```
Terminal 1: API Server (uvicorn)
Terminal 2: Admin Creation (python scripts)
Terminal 3: Frontend (npm run dev)
Terminal 4: Command line (for quick checks)
```

---

## Common Commands

```powershell
# Check if server is running on port 8000
netstat -ano | findstr :8000

# Check if port 5173 (frontend) is running
netstat -ano | findstr :5173

# See database users
python -c "from app.db.session import SessionLocal; from app.models.user import User; db = SessionLocal(); users = db.query(User).all(); print(f'Total users: {len(users)}'); [print(f'  - {u.email} ({u.role})') for u in users]; db.close()"

# See database zones
python -c "from app.db.session import SessionLocal; from app.models.zone import Zone; db = SessionLocal(); zones = db.query(Zone).all(); print(f'Total zones: {len(zones)}'); [print(f'  - {z.name}') for z in zones]; db.close()"

# Reset everything (WARNING: Deletes all data!)
rm ecotrack.db
python scripts/create_admin.py
```

---

## Files Modified to Fix Issues

✅ `frontend-app/src/services/api.ts` - Added error interceptor and logging
✅ `frontend-app/src/hooks/useApi.ts` - Added console logs and retry logic
✅ `frontend-app/src/pages/Users.tsx` - Added error display in UI
✅ `frontend-app/src/pages/Zones.tsx` - Added error display in UI
✅ `frontend-app/src/pages/Debug.tsx` - New debug panel
✅ `frontend-app/src/router.tsx` - Added debug route
✅ `DEBUGGING_GUIDE.md` - Comprehensive troubleshooting guide

---

## Next Steps

After everything works:
1. ✅ Create multiple zones
2. ✅ Create multiple users (admin + regular)
3. ✅ Ingest data with: `python scripts/ingest_external_data.py --limit 25 --country FR`
4. ✅ View statistics and trends on Dashboard
5. ✅ All features should now work! 🎉

