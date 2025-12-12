
# EcoTrack API & Dashboard

Projet FastAPI complet répondant au cahier des charges « Projet API ». L'application expose :

- Une API REST sécurisée (FastAPI + SQLAlchemy + JWT) pour suivre des indicateurs environnementaux (qualité de l'air, CO₂, énergie, déchets) par zone géographique.
- Un nouveau front-end moderne (React + Vite + Tailwind) avec plusieurs vues (dashboard, statistiques, gestion des entités, administration).

## Fonctionnalités clés

- Authentification JWT avec rôles `user` (lecture) et `admin` (gestion complète).
- CRUD complets pour utilisateurs, zones, sources et indicateurs avec filtres, pagination et recherche par période.
- Endpoints statistiques : moyennes de qualité de l'air et tendances agrégées (daily/weekly/monthly).
- Script d'ingestion externe basé sur l'API OpenAQ (avec fallback v3 + clé API).
- Script CLI pour créer un administrateur initial.
- Nouveau front-end « dashboard » (`frontend-app/`) pour piloter l'API : login, filtres avancés, graphiques, CRUD zones/sources/utilisateurs.
- Suite de tests Pytest couvrant les principaux parcours (authentification, indicateurs, statistiques).

---

## 🚀 Démarrage Rapide (5 min)

### Pré-requis
- Python 3.10+
- Node.js 18+
- SQLite (inclus)

### 1️⃣ Setup Backend

```bash
# Cloner/naviguer au dépôt
cd EcoTrack

# Créer l'environnement virtuel
python -m venv .venv
.venv\Scripts\activate  # PowerShell

# Installer les dépendances
pip install -r requirements.txt
```

### 2️⃣ Initialiser la BDD

```powershell
# Créer et remplir la BDD avec données de test
python scripts/init_testdata.py

# Réinitialiser complètement (attention: destructif)
python scripts/init_testdata.py --reset
```

Output attendu:
```
[DB] Creation des tableaux...
[OK] Tableaux crees

[USERS] Creation des utilisateurs...
  [ADMIN] admin@ecotrack.local
  [USER] alice@ecotrack.local
  [USER] bob@ecotrack.local
  [USER] eve@ecotrack.local

[ZONES] Creation des zones...
  [LOC] Paris 15e (75015)
  [LOC] Lyon Centre (69000)
  [LOC] Marseille Vieux Port (13001)
  [LOC] Toulouse Centre (31000)
  [LOC] Bordeaux Chartrons (33000)

[SOURCES] Creation des sources de donnees...
  [LIVE] OpenAQ
  [SYNTH] Modele CO2 Synthetique
  [SYNTH] Modele Energie Synthetique
  [SYNTH] Modele Dechets Synthetique

[INDICATORS] Generation des indicateurs...
  [OK] 700 indicateurs generes

[VERIFY] Verification des donnees...
  Users: 4
  Zones: 5
  Sources: 4
  Indicators: 700
  [OK] Intégrité référentielle OK

[SUCCESS] Initialisation terminee avec succes!
```

**Données de test créées:**
| Email | Rôle | Mot de passe |
|-------|------|--------------|
| admin@ecotrack.local | Admin | ChangeMe123! |
| alice@ecotrack.local | User | SecurePass123! |
| bob@ecotrack.local | User | SecurePass123! |

### 3️⃣ Démarrer l'API

```powershell
.venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Accès :
- 🌐 **API REST**: http://localhost:8000/api/v1
- 📚 **Docs Swagger**: http://localhost:8000/docs
- 📋 **ReDoc**: http://localhost:8000/redoc

### 4️⃣ Démarrer le Dashboard

```powershell
cd frontend-app
npm install
npm run dev
```

Accès : 🎨 **Dashboard**: http://localhost:5173

---

## 📊 Architecture

```
EcoTrack/
├── app/                          # Backend FastAPI
│   ├── api/v1/                   # Routes API
│   │   ├── routes_auth.py        # Authentication (login, register)
│   │   ├── routes_users.py       # Gestion utilisateurs
│   │   ├── routes_zones.py       # Gestion zones géographiques
│   │   ├── routes_indicators.py  # Requête indicateurs
│   │   ├── routes_sources.py     # Gestion sources données
│   │   └── routes_stats.py       # Stats agrégées
│   ├── models/                   # SQLAlchemy ORM
│   ├── schemas/                  # Pydantic validation
│   ├── services/                 # Business logic
│   ├── core/                     # Config, security, dependencies
│   ├── db/                       # Database setup
│   └── main.py                   # Application entry point
│
├── frontend-app/                 # React + Vite Dashboard
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── services/api.ts       # Axios configuration
│   │   ├── context/              # Auth state management
│   │   └── hooks/                # Custom hooks (useApi, etc.)
│   └── vite.config.ts
│
├── scripts/                      # Utilitaires CLI
│   ├── init_testdata.py          # ⭐ Initialisation BDD (NOUVEAU)
│   ├── create_admin.py           # Créer admin initial
│   ├── ingest_external_data.py   # Import OpenAQ
│   └── check_db.py               # Diagnostic BD
│
├── alembic/                      # Migrations BD
├── app/tests/                    # Suite de tests Pytest
├── DATA_SOURCES.md               # ⭐ Documentation sources (NOUVEAU)
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Authentification
```
POST   /api/v1/auth/register/     # Créer compte
POST   /api/v1/auth/login/        # Login (JWT)
GET    /api/v1/auth/me            # Profil courant
```

### Utilisateurs (Admin)
```
GET    /api/v1/users              # Liste (paginated)
GET    /api/v1/users/{id}         # Détail
POST   /api/v1/users              # Créer
PATCH  /api/v1/users/{id}         # Modifier
DELETE /api/v1/users/{id}         # Supprimer
```

### Zones
```
GET    /api/v1/zones              # Liste
POST   /api/v1/zones              # Créer (admin)
GET    /api/v1/zones/{id}         # Détail
PATCH  /api/v1/zones/{id}         # Modifier (admin)
DELETE /api/v1/zones/{id}         # Supprimer (admin)
```

### Indicateurs
```
GET    /api/v1/indicators         # Requête flexible avec filtres
GET    /api/v1/indicators/{id}    # Détail
```

**Filtres disponibles:**
```
GET /api/v1/indicators?zone_id=1&indicator_type=air_quality&limit=100&offset=0
GET /api/v1/indicators?source_id=1&measured_from=2024-11-20&measured_to=2024-11-21
```

### Statistiques
```
GET    /api/v1/stats/air-quality  # Moyennes qualité air
GET    /api/v1/stats/trends       # Tendances (daily/weekly/monthly)
```

---

## 🔐 Configuration

### Variables d'environnement (.env)

```env
# Base de données
DATABASE_URL=sqlite:///./ecotrack.db

# Sécurité JWT
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Admin initial
FIRST_SUPERUSER_EMAIL=admin@ecotrack.local
FIRST_SUPERUSER_PASSWORD=ChangeMe123!

# OpenAQ API (optionnel mais recommandé)
OPENAQ_API_KEY=your_api_key_from_openaq.org

# API CORS (développement)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### Base de données

La base utilise **SQLite** (production-ready pour un projet solo):

```sql
-- Structure (automatique via SQLAlchemy)
Users       → Authentification + permissions
Zones       → Zones géographiques (lat/long)
Sources     → Sources données (OpenAQ, modèles synthétiques)
Indicators  → Mesures (valeur, timestamp, zone, source)
```

---

## 🧪 Tests

```bash
# Exécuter la suite complète
pytest

# Avec couverture
pytest --cov=app

# Tests spécifiques
pytest app/tests/test_auth.py -v
pytest app/tests/test_indicators.py::test_list_indicators -v
```

**Couverture actuelle:**
- ✅ Authentification (login, register, JWT)
- ✅ CRUD Users, Zones, Indicators
- ✅ Statistiques et agrégations
- ✅ Permissions et autorisations (user vs admin)

---

## 📡 Sources de Données

Voir **[DATA_SOURCES.md](./DATA_SOURCES.md)** pour :
- Liste détaillée des sources
- Justification des choix
- Format des données
- Pipeline d'ingestion
- Qualité & fiabilité

**Sources principales:**
1. **OpenAQ** (temps réel) - Qualité de l'air
2. **Modèles synthétiques** - CO₂, énergie, déchets

---

## 📜 Scripts Utilitaires

### Initialiser la BDD avec données de test

```powershell
python scripts/init_testdata.py

# Options:
python scripts/init_testdata.py --reset           # Réinitialiser complètement
python scripts/init_testdata.py --seed 123 --verbose  # Seed aléatoire custom
```

### Créer un administrateur

```powershell
python scripts/create_admin.py
# → Email et mot de passe interactifs
```

### Importer données OpenAQ

```powershell
# Prérequis: OPENAQ_API_KEY dans .env

python scripts/ingest_external_data.py --city "Paris" --limit 50
python scripts/ingest_external_data.py --country FR --limit 100
```

### Vérifier la BD

```powershell
python scripts/check_db.py
# → Vérifie tables, contraintes, intégrité
```

---

## 🌐 Frontend - Dashboard React

### Pages disponibles
- **Login** - Authentification JWT
- **Dashboard** - Vue d'ensemble KPIs
- **Indicateurs** - Table complète avec filtres
- **Statistiques** - Tendances et moyennes
- **Zones** - CRUD zones géographiques
- **Sources** - Gestion des sources données
- **Utilisateurs** (Admin) - Gestion complète
- **Debug** - Diagnostics en développement

### Fonctionnalités frontend
- ✅ Authentification persistante (localStorage)
- ✅ Protection de routes (RequireAuth, RequireAdmin)
- ✅ Error handling avec logs détaillés
- ✅ Forms validés côté client
- ✅ Graphiques interactifs (Recharts)
- ✅ Pagination et recherche
- ✅ Responsive design (Tailwind CSS)

### Build & déploiement

```bash
cd frontend-app

# Développement avec HMR
npm run dev

# Build production
npm run build

# Prévisualiser build
npm run preview
```

---

## 🐛 Débogage

### API (FastAPI)

Vérifier les logs lors du démarrage:
```
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Problèmes courants:
- **Port 8000 déjà utilisé** → `lsof -i :8000` puis `kill -9 <PID>`
- **Module non trouvé** → Vérifier `PYTHONPATH` et activation venv
- **BD verrouillée** → Supprimer `ecotrack.db` et réinitialiser

### Frontend

Ouvrir DevTools (F12) pour:
- Console JS → Logs d'erreur
- Network → Requêtes API
- Storage → Tokens JWT

Vérifier la connectivité API:
```javascript
// Console browser
fetch('http://localhost:8000/api/v1/zones')
  .then(r => r.json())
  .then(d => console.log(d))
```

### BD

```powershell
# Inspecter la BD SQLite
sqlite3 ecotrack.db

sqlite> .tables
sqlite> SELECT COUNT(*) FROM users;
sqlite> SELECT * FROM zones LIMIT 5;
```

---

## 📋 Livrables Fournis

1. ✅ **Code API** (app/) - FastAPI complet avec tests
2. ✅ **Frontend** (frontend-app/) - Dashboard React + Vite
3. ✅ **Documentation sources** (DATA_SOURCES.md) - Justification et détails
4. ✅ **Script initialisation** (scripts/init_testdata.py) - Jeu de test complet
5. ✅ **README** (ce fichier) - Setup et usage

---

## 📚 Documentation Complète

Fichiers de documentation:
- **[README.md](./README.md)** - Ce fichier (setup et usage)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Schémas, stack, design patterns
- **[DATA_SOURCES.md](./DATA_SOURCES.md)** - Sources de données détaillées
- **[CHANGELOG.md](./CHANGELOG.md)** - Historique des versions
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Guide de débogage


### Documentation Interactive
- **API Swagger** : http://localhost:8000/docs (quand API lancée)
- **API ReDoc** : http://localhost:8000/redoc
- **Frontend** : http://localhost:5173

### Fichiers de Configuration
- `.env` - Variables d'environnement (secrets, API keys)
- `.env.example` - Template des variables
- `app/core/config.py` - Configuration backend
- `frontend-app/vite.config.ts` - Configuration Vite/build

### Commandes Utiles
```bash
# Tests
pytest                          # Tous les tests
pytest --cov=app               # Avec couverture
pytest app/tests/test_auth.py -v  # Tests spécifiques

# Linting (optionnel)
flake8 app/
black app/

# Database
python scripts/check_db.py     # Diagnostic BD
```

### Contacts & Escalade
- **Issues** : Vérifier les logs (console/browser DevTools/terminal)
- **API down** : Vérifier http://status.openaq.org (si données OpenAQ utilisées)
- **Port conflict** : Voir TROUBLESHOOTING.md section "Address already in use"


=======
# EcoTrack
>>>>>>> 4f80ee60fd10f50d1b88efa1b114def08e2917bb
