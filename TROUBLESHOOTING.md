# 🔧 TROUBLESHOOTING - Guide de Débogage

## Problèmes Courants et Solutions

### 1. ❌ "Address already in use" (Port 8000/5173)

**Symptôme:**
```
ERROR: [Errno 48] error while attempting to bind on address ('0.0.0.0', 8000)
```

**Solutions:**
```powershell
# Trouver le processus utilisant le port
netstat -ano | findstr :8000

# Tuer le processus (remplacer PID)
taskkill /PID 12345 /F

# Ou simplement utiliser un autre port
python -m uvicorn app.main:app --port 8001
```

---

### 2. ❌ "ModuleNotFoundError: No module named 'app'"

**Symptôme:**
```
ModuleNotFoundError: No module named 'app'
```

**Solutions:**
```powershell
# Vérifier que vous êtes dans le bon répertoire
cd C:\Users\ilias\OneDrive\Bureau\EcoTrack

# Vérifier l'activation du venv
.venv\Scripts\Activate.ps1
(devrait afficher (.venv) au début du prompt)

# Vérifier PYTHONPATH
$env:PYTHONPATH
# Si vide, le définir:
$env:PYTHONPATH="C:\Users\ilias\OneDrive\Bureau\EcoTrack"

# Réinstaller les dépendances
pip install -r requirements.txt
```

---

### 3. ❌ "UNIQUE constraint failed: users.email"

**Symptôme:**
```
sqlite3.IntegrityError: UNIQUE constraint failed: users.email
```

**Solutions:**
```powershell
# L'email existe déjà dans la BDD
# Option 1: Utiliser un email différent
POST /api/v1/auth/register/
{
  "email": "new_email@ecotrack.local",  # ← Changer ici
  "password": "SecurePass123!"
}

# Option 2: Réinitialiser la BDD
python scripts/init_testdata.py --reset
# Répondre "oui" à la confirmation

# Option 3: Supprimer l'utilisateur manuellement
sqlite3 ecotrack.db "DELETE FROM users WHERE email='admin@ecotrack.local';"
```

---

### 4. ❌ "Frontend ne peut pas se connecter à l'API"

**Symptôme:**
```
GET http://127.0.0.1:8000/api/v1/zones 
→ Connection refused
```

**Solutions:**
```powershell
# 1. Vérifier que l'API est lancée
# Terminal 1 devrait montrer:
# INFO:     Uvicorn running on http://0.0.0.0:8000

# 2. Vérifier le port correct
# Frontend envoie à http://127.0.0.1:8000 (localhost)
# API doit écouter sur 0.0.0.0 (toutes les interfaces)

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Vérifier CORS
# Voir app/main.py pour configuration CORS_ORIGINS

# 4. Vérifier firewall
# Windows Defender > Paramètres firewall
# Autoriser Python si nécessaire
```

---

### 5. ❌ "422 Unprocessable Entity" avec POST

**Symptôme:**
```
POST /api/v1/users
422: {
  "detail": [
    {
      "field": "email",
      "message": "value is not a valid email address"
    }
  ]
}
```

**Solutions:**
```
# Vérifier le format des données:

✅ Valide:
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePass123!",  // 8+ caractères
  "role": "user"
}

❌ Invalide:
{
  "email": "invalid-email",      // Pas de @
  "full_name": "John",
  "password": "short",            // < 8 chars
  "role": "unknown"               // Doit être 'user' ou 'admin'
}

# Vérifier le Content-Type header:
# Headers: {'Content-Type': 'application/json'}
```

**En frontend (Axios):**
```typescript
// ✅ Correct
const response = await api.post('/users', {
  email: "user@example.com",
  full_name: "John Doe",
  password: "SecurePass123!",
  role: "user"
});

// ❌ Erreur: Passer une string au lieu d'objet
const response = await api.post('/users', 
  JSON.stringify({...})  // Ne pas stringifier, axios le fait
);
```

---

### 6. ❌ "401 Unauthorized" - Token invalide

**Symptôme:**
```
GET /api/v1/users
401: {"detail": "Not authenticated"}
```

**Solutions:**
```powershell
# 1. Login d'abord pour obtenir un token
POST /api/v1/auth/login/
{
  "email": "admin@ecotrack.local",
  "password": "ChangeMe123!"
}

# Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}

# 2. Utiliser le token dans les requêtes suivantes
GET /api/v1/users
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}

# Frontend: Vérifier que le token est en localStorage
# Ouvrir DevTools (F12) > Application > Local Storage
# Devrait avoir: access_token avec valeur longue
```

---

### 7. ❌ "403 Forbidden" - Permission insuffisante

**Symptôme:**
```
POST /api/v1/users
403: {"detail": "Not enough permissions"}
```

**Solutions:**
```
# Endpoint réservé aux admins
# Login avec un compte admin:

POST /api/v1/auth/login/
{
  "email": "admin@ecotrack.local",
  "password": "ChangeMe123!"
}

# Vérifier le rôle en frontend:
const auth = useContext(AuthContext);
console.log(auth.user.role);  // Devrait être "admin"

# Si "user", n'a pas les permissions
```

---

### 8. ❌ Base de données "locked"

**Symptôme:**
```
sqlite3.OperationalError: database is locked
```

**Solutions:**
```powershell
# SQLite est limité en concurrence
# Solutions:
# 1. Attendre quelques secondes et réessayer
# 2. Fermer les connexions ouvertes (jupyter, autre terminal)
# 3. Supprimer les fichiers lock
Remove-Item ecotrack.db-shm, ecotrack.db-wal -ErrorAction SilentlyContinue

# 4. Pour production: migrer vers PostgreSQL
```

---

### 9. ❌ Frontend: "Cannot find module 'api'"

**Symptôme:**
```
Failed to compile
Cannot find module 'src/services/api' from 'src/pages/Users.tsx'
```

**Solutions:**
```powershell
cd frontend-app

# 1. Vérifier que le fichier existe
Test-Path src/services/api.ts

# 2. Vérifier l'import
# ✅ Correct: import { api } from '../services/api';
# ❌ Incorrect: import { api } from '../services/api.ts';

# 3. Réinstaller node_modules
Remove-Item node_modules -Recurse -Force
npm install

# 4. Nettoyer le cache Vite
npm run dev -- --force
```

---

### 10. ❌ Password hashing: argon2 non trouvé

**Symptôme:**
```
ModuleNotFoundError: No module named 'argon2'
```

**Solutions:**
```powershell
# Installer passlib avec support argon2
pip install passlib[argon2]

# Vérifier l'installation
python -c "from passlib.context import CryptContext; print('OK')"
```

---

## 🧪 Vérification Diagnostic

### Script de diagnostic complet

```bash
# Lancer le diagnostic
python scripts/check_db.py

# Doit afficher:
# - Tables créées
# - Nombre de users/zones/sources/indicators
# - Intégrité référentielle (pas d'orphelins)
# - Version Python et SQLAlchemy
```

### Vérifications manuelles

```powershell
# 1. Vérifier l'API
curl http://localhost:8000/docs
# Devrait ouvrir Swagger UI

# 2. Vérifier la BDD
sqlite3 ecotrack.db "SELECT COUNT(*) as user_count FROM users;"

# 3. Vérifier le frontend
curl http://localhost:5173
# Devrait retourner HTML

# 4. Tester une requête API simple
curl -X GET http://localhost:8000/api/v1/zones
# Devrait retourner une liste vide ou les zones existantes
```

---

## 📝 Logs & Debugging

### Backend - Logs détaillés

```powershell
# Démarrer avec logs DEBUG
python -m uvicorn app.main:app --reload --log-level debug

# Ou dans le code:
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug("Message de debug")
```

### Frontend - Console logs

```typescript
// Ajouter dans src/services/api.ts
const api = axios.create({...});

api.interceptors.response.use(
  response => {
    console.log('[API] Success:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('[API] Error:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);
```

### Ouvrir les DevTools du navigateur

```
F12 (Windows/Linux)
Cmd+Option+I (Mac)

Onglets utiles:
- Console: Voir les logs JavaScript
- Network: Voir les requêtes HTTP (méthode, statut, payload)
- Storage: Voir les tokens JWT
- Application: Déboguer l'application
```

---

## 🆘 Quand tout échoue

```powershell
# "Nuclear option" - tout réinitialiser

# 1. Arrêter les processus
Get-Process python | Where-Object {$_.ProcessName -like "*uvicorn*"} | Stop-Process -Force
Get-Process npm | Stop-Process -Force

# 2. Nettoyer les caches
Remove-Item .pytest_cache -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item frontend-app/node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item ecotrack.db, ecotrack.db-shm, ecotrack.db-wal -Force -ErrorAction SilentlyContinue

# 3. Réinstaller
pip install -r requirements.txt
cd frontend-app && npm install && cd ..

# 4. Réinitialiser BD
python scripts/init_testdata.py

# 5. Redémarrer les services
# Terminal 1:
python -m uvicorn app.main:app --reload

# Terminal 2:
cd frontend-app && npm run dev
```

---

**Besoin d'aide? Vérifier les logs console en premier!** 🔍
