# EcoTrack - Guide de Dépannage (Users & Zones List)

## Problème : Les listes d'utilisateurs et zones n'apparaissent pas

### Symptômes
- La page Users affiche "Chargement..." ou rien
- La page Zones affiche "Chargement..." ou rien
- Pas d'erreur évidente dans l'interface

### Causes Potentielles et Solutions

## 1. **Le serveur API n'est pas en cours d'exécution** ❌

### Vérification
```powershell
# Vérifiez que le serveur FastAPI écoute sur le port 8000
netstat -ano | findstr :8000
```

### Solution
Démarrez le serveur API :
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack

# Activez l'environnement virtuel
.\.venv\Scripts\Activate.ps1

# Démarrez Uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Vous devriez voir :
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 2. **Vous n'êtes pas connecté en tant qu'administrateur** 🔐

### Vérification dans le navigateur
Ouvrez la **Console du navigateur** (F12 > Console) et cherchez :
```
[useUsers] Error: Forbidden - insufficient permissions
```

### Cause
L'endpoint `/users` requiert le rôle `admin`. Les utilisateurs normaux reçoivent une erreur 403.

### Solution
1. **Assurez-vous que le compte est admin** :
   ```powershell
   cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
   .\.venv\Scripts\Activate.ps1
   python scripts/create_admin.py
   ```

2. **Déconnectez-vous et reconnectez-vous** avec ce compte admin

3. **Vérifiez le token JWT** dans localStorage :
   ```javascript
   // Dans la console du navigateur
   JSON.parse(localStorage.getItem("ecotrack_auth"))
   ```
   Vérifiez que `user.role === "admin"`

---

## 3. **Token JWT invalide ou expiré** ⏰

### Vérification
Dans la console du navigateur (F12 > Console), vérifiez :
```javascript
JSON.parse(localStorage.getItem("ecotrack_auth"))
```

### Solution
1. **Réinitialiser le token** : Déconnectez-vous et reconnectez-vous
2. **Augmenter la durée d'expiration** si nécessaire :
   ```bash
   # Dans .env
   ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 heures
   ```

---

## 4. **URL de l'API incorrecte** 🌐

### Vérification
Dans la console du navigateur :
```javascript
// Vérifiez l'URL de base utilisée
console.log(document.location.origin + "/api/v1")
```

### Solution
**Si vous accédez depuis une autre machine** :
1. Assurez-vous que le serveur écoute sur `0.0.0.0` :
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. Configurez l'URL de l'API dans le frontend :
   ```bash
   # Dans frontend-app/.env ou lors du démarrage
   VITE_API_URL=http://<IP_DU_SERVEUR>:8000/api/v1
   npm run dev
   ```

---

## 5. **CORS non configuré** 🚫

### Vérification
Ouvrez les **DevTools** (F12 > Réseau > Filtre "users") et vérifiez :
- Si vous voyez un header `Access-Control-Allow-Origin`
- Si vous voyez un erreur CORS

### Solution
Le CORS est déjà configuré dans `app/main.py` pour accepter toutes les origines :
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Accepte toutes les origines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 6. **Pas de données dans la base de données** 📭

### Vérification
```powershell
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
python -c "
from app.db.session import SessionLocal
from app.models.zone import Zone
db = SessionLocal()
zones = db.query(Zone).all()
print(f'Total zones: {len(zones)}')
for zone in zones:
    print(f'  - {zone.name}')
db.close()
"
```

### Solution
Créez une zone manuellement :
1. Allez à la page **Zones** dans le frontend
2. Remplissez le formulaire "Créer une zone"
3. Cliquez sur "Ajouter"
4. La zone devrait apparaître dans la liste

---

## 7. **Erreur de décodage du token JWT** 🔓

### Vérification
Dans la console du navigateur :
```
[useUsers] Error: Unauthorized - token may be invalid or expired
```

### Cause
La `SECRET_KEY` dans la base de données a peut-être changé.

### Solution
1. Supprimez la base de données et recréez-la :
   ```powershell
   cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
   rm ecotrack.db  # Supprime la DB existante
   .\.venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload  # Recréera les tables
   ```

2. Créez un nouvel admin :
   ```powershell
   python scripts/create_admin.py
   ```

---

## Checklist de Dépannage Complet

- [ ] Serveur API en cours d'exécution sur `http://0.0.0.0:8000`
- [ ] Accès à `http://localhost:8000/api/v1/docs` dans le navigateur (Swagger UI)
- [ ] Connecté en tant qu'administrateur (vérifiez `user.role === "admin"`)
- [ ] Token JWT valide dans `localStorage` (`ecotrack_auth`)
- [ ] Au moins une zone créée dans la base de données
- [ ] Console du navigateur (F12) sans erreurs réseau
- [ ] CORS activé (voir DevTools > Réseau > Headers)

---

## Logs Utiles pour le Dépannage

### 1. Logs du Frontend (Console du Navigateur - F12)
```javascript
[useZones] Fetching zones...
[useZones] Success: [...]  // Si succès
[useZones] Error: ...      // Si erreur
```

### 2. Logs du Backend
```
INFO: POST /api/v1/auth/login
INFO: GET /api/v1/users
ERROR: 403 Forbidden - insufficient permissions
```

### 3. API Health Check
```bash
# Dans PowerShell
curl http://127.0.0.1:8000/health
```

Réponse attendue :
```json
{"status": "ok"}
```

---

## Commandes Rapides

```powershell
# 1. Démarrer le serveur
cd c:\Users\ilias\OneDrive\Bureau\EcoTrack
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# 2. Créer un admin
python scripts/create_admin.py

# 3. Vérifier les données
python -c "from app.db.session import SessionLocal; from app.models.user import User; db = SessionLocal(); print(f'Users: {len(db.query(User).all())}'); db.close()"

# 4. Démarrer le frontend (dans un autre terminal)
cd frontend-app
npm run dev
```

---

## Support Supplémentaire

Si le problème persiste :
1. **Vérifiez les DevTools** (F12 > Console et Réseau)
2. **Consultez les logs du serveur** (terminal où vous exécutez `uvicorn`)
3. **Videz le cache** : `Ctrl+Shift+Delete` dans le navigateur
4. **Testez l'API directement** :
   ```bash
   # Récupérez un token
   curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@ecotrack.local&password=ChangeMe123!"
   
   # Utilisez le token pour accéder à /users
   curl -H "Authorization: Bearer <TOKEN>" \
     http://127.0.0.1:8000/api/v1/users
   ```

