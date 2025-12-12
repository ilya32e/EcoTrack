# 🎯 Complete Setup Guide - Users & Zones Lists Fix

## Problem Summary
Users and Zones lists were not showing in the frontend interface. The issue has been **FIXED** with:
- Better error handling and logging
- Error display in the UI
- A comprehensive debug panel
- Detailed troubleshooting guides

---

## ⚡ Quick Start (5 minutes)

### Method 1: Automatic Scripts (Recommended)

**Terminal 1 - Start API:**
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\start-api.ps1
```
- This will auto-create admin if needed
- Server runs on `http://0.0.0.0:8000`

**Terminal 2 - Start Frontend:**
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack\frontend-app
.\start.ps1
```
- Frontend runs on `http://localhost:5173`

### Method 2: Manual Commands

**Terminal 1 - API:**
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
python scripts/create_admin.py  # If admin doesn't exist
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack\frontend-app
npm run dev
```

---

## 🔍 Verify Everything is Working

### Step 1: Access the Debug Panel
Open browser to: **http://localhost:5173/debug**

You should see:
```
✅ Token présent: Oui
✅ Utilisateur: admin@ecotrack.local (admin)
✅ URL de base: http://127.0.0.1:8000/api/v1
✅ Authorization Header: Configuré
✅ Serveur API accessible
✅ GET /users: OK
✅ GET /zones: OK
```

If any ❌ appears, see "Troubleshooting" section below.

### Step 2: Try Users Page
Click **Users** in sidebar → Should show list of users

### Step 3: Try Zones Page
Click **Zones** in sidebar
1. Fill the form with:
   - **Nom**: "Paris"
   - **Code postal**: "75001"
   - **Description**: "Test zone"
2. Click **Ajouter**
3. Zone should appear in list below

---

## 🆘 Troubleshooting

### Issue: "Chargement..." appears but data never loads

**Check 1: Is the API server running?**
```powershell
netstat -ano | findstr :8000
# Should show port 8000 in use
```

**Fix:** Start API
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\start-api.ps1
```

---

### Issue: Red error "Forbidden - insufficient permissions"

**Cause:** Not logged in as admin

**Fix:**
1. Check your user role in Debug Panel (`/debug`)
2. If not admin, create new admin:
   ```powershell
   cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
   .\.venv\Scripts\Activate.ps1
   python scripts/create_admin.py
   ```
3. Log out: Click profile → Logout
4. Log in with new admin account

---

### Issue: Red error "Network error - API server may not be running"

**Cause:** Frontend can't reach API

**Check:** Open browser console (F12 > Console)
```
Error: Network Error
[useZones] Error: Network Error - API server may not be running
```

**Fix:**
1. Verify API is running on `http://0.0.0.0:8000`
   - See "Verify Everything" section above
2. If on different machine, check IP:
   ```powershell
   ipconfig
   # Copy your IPv4 Address (e.g., 192.168.1.5)
   ```
3. Set API URL in frontend:
   - Create file `frontend-app/.env`:
     ```
     VITE_API_URL=http://192.168.1.5:8000/api/v1
     ```
   - Restart frontend with `npm run dev`

---

### Issue: "Aucun utilisateur trouvé" (No users found)

**Cause:** No admin created yet

**Fix:**
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
python scripts/create_admin.py
```

---

### Issue: Debug panel shows ❌ for tests

**Step 1:** Go to `/debug` page again
**Step 2:** Check each failed test:

| Test | Issue | Fix |
|------|-------|-----|
| `health` | API not responding | Check if `uvicorn` is running |
| `me` | Can't get current user | Check token is valid |
| `users` | Can't list users | Make sure you're logged in as admin |
| `zones` | Can't list zones | API issue or permission issue |

---

## 🛠️ Development Mode (Console Debugging)

### Open Browser Console
Press **F12** → **Console** tab

### You'll see helpful logs:

**When data loads successfully:**
```
[useZones] Fetching zones...
[useZones] Success: [{id: 1, name: "Paris", postal_code: "75001"}]
```

**When there's an error:**
```
[useUsers] Fetching users...
[useUsers] Error: Forbidden - insufficient permissions
```

### Use these logs to understand what's happening!

---

## 📚 Additional Documentation

1. **QUICK_FIX.md** - Quick setup guide
2. **DEBUGGING_GUIDE.md** - Comprehensive troubleshooting
3. **FIXES_SUMMARY.md** - What was changed and why

---

## 🔧 Database Management

### View all users
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
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

### View all zones
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
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

### Reset everything (WARNING: Deletes all data!)
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
rm ecotrack.db
.\start-api.ps1  # Will recreate DB and admin
```

---

## ✅ Success Checklist

- [ ] API runs on `http://0.0.0.0:8000` without errors
- [ ] Frontend runs on `http://localhost:5173` without errors
- [ ] Debug panel (`/debug`) shows all ✅
- [ ] Can log in with admin account
- [ ] Users page shows at least the admin user
- [ ] Can create a zone and see it in the list
- [ ] No red errors in browser console (F12)
- [ ] Can view all created zones

---

## 🎓 Understanding the Fix

### What Changed:

1. **Error Handling** - API calls now show meaningful error messages
2. **Logging** - Browser console shows what's happening
3. **Retry Logic** - Failed requests are retried once
4. **Debug Panel** - New `/debug` page for diagnostics
5. **UI Feedback** - Error messages appear in the interface

### Why It Matters:

- ✅ **Debugging** - You can now see what's wrong
- ✅ **Resilience** - Network hiccups don't permanently break things
- ✅ **User Experience** - Users see helpful error messages instead of blank pages
- ✅ **Development** - Developers can quickly diagnose issues

---

## 🚀 Next Steps

Once everything works:

1. **Create test data:**
   - Create 3-5 zones
   - Create 2-3 users with different roles

2. **Ingest external data:**
   ```powershell
   cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
   .\.venv\Scripts\Activate.ps1
   python scripts/ingest_external_data.py --limit 50 --country FR
   ```

3. **View on Dashboard:**
   - Go to Dashboard page
   - See statistics and trends
   - View indicators filtered by zone

4. **Test all features:**
   - Edit/delete zones
   - Edit/delete users
   - Create indicators
   - View statistics

---

## 📞 Still Need Help?

1. Check the **DEBUGGING_GUIDE.md** - Covers 90% of issues
2. Look at browser console (F12 > Console) - Shows error messages
3. Use Debug Panel (`/debug`) - Diagnoses most problems
4. Review server logs - Terminal where `uvicorn` runs shows detailed errors

---

## 🎉 That's It!

You now have a fully working EcoTrack application with:
- ✅ Users and Zones lists displaying correctly
- ✅ Full error handling and debugging tools
- ✅ Comprehensive guides for troubleshooting
- ✅ Easy startup scripts

**Enjoy your EcoTrack dashboard!** 🌍📊
