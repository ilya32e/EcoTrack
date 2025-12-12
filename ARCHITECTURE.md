# 🏗️ ARCHITECTURE - EcoTrack

## Vue d'ensemble

EcoTrack est une application full-stack pour suivre les indicateurs environnementaux (qualité air, CO₂, énergie, déchets) par zone géographique.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend React + Vite                        │
│         (http://localhost:5173)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Pages: Login, Dashboard, Indicators, Stats, Zones, Users │  │
│  │ - JWT Authentication (localStorage)                       │  │
│  │ - React Query for data fetching                           │  │
│  │ - Recharts for visualizations                            │  │
│  │ - Tailwind CSS styling                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                   Backend FastAPI                                │
│         (http://localhost:8000)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes API (v1)                                           │  │
│  │ - POST /auth/register/  - Création compte                 │  │
│  │ - POST /auth/login/     - Authentification JWT            │  │
│  │ - GET  /users           - Liste utilisateurs (admin)      │  │
│  │ - POST /users           - Créer utilisateur (admin)       │  │
│  │ - GET  /zones           - Liste zones                     │  │
│  │ - GET  /indicators      - Requête flexible                │  │
│  │ - GET  /stats/          - Statistiques                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Core Modules                                              │  │
│  │ - Security: JWT token generation/validation              │  │
│  │ - Config: Environment variables                          │  │
│  │ - Dependencies: Database session, current user           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  SQLAlchemy
┌─────────────────────────────────────────────────────────────────┐
│                   SQLite Database                                │
│         (ecotrack.db)                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tables:                                                   │  │
│  │ - users (email, hashed_password, role, is_active)        │  │
│  │ - zones (name, latitude, longitude, postal_code)         │  │
│  │ - sources (name, description, data_type, api_endpoint)   │  │
│  │ - indicators (value, unit, measured_at, zone_id, ...)    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Backend Stack

### Framework & ORM
- **FastAPI 0.110.2** - API REST moderne avec docs auto (Swagger/ReDoc)
- **SQLAlchemy 2.0.31** - ORM pour requêtes BD
- **Pydantic 2.4.2** - Validation données avec type hints

### Authentification & Sécurité
- **python-jose** - JWT token generation/validation
- **passlib + argon2** - Hashing sécurisé des mots de passe
- **CORS middleware** - Cross-origin requests gérées

### Base de Données
- **SQLite** - Embarquée, pas de serveur externe
- **Alembic** - Migrations BD (setup optionnel)

### Testing
- **pytest** - Framework de test
- **pytest-asyncio** - Support async tests
- **Couverture**: Auth, CRUD, Stats, Permissions

---

## 💻 Frontend Stack

### Framework & Build
- **React 18.3.1** - UI library moderne
- **Vite 5.4.21** - Build tool ultrarapide + HMR
- **TypeScript** - Type-safe code

### HTTP Client
- **Axios** - Requêtes HTTP avec interceptors
- **React Query** - State management pour données distantes

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Graphiques interactifs
- **lucide-react** - Icons

### State Management
- **React Context** - Auth state (user, token)
- **localStorage** - Persistance JWT

---

## 🔐 Architecture de Sécurité

### Authentication Flow
```
User Input (email, password)
    ↓
POST /auth/login/
    ↓
Backend validates credentials
    ↓
Generate JWT (access_token + refresh?)
    ↓
Return token to frontend
    ↓
Frontend stores in localStorage
    ↓
All subsequent requests include Authorization: Bearer <token>
    ↓
Backend validates token + extracts user info
    ↓
Check permissions (role-based)
    ↓
Execute endpoint logic or return 403 Forbidden
```

### Role-Based Access Control (RBAC)

| Endpoint | User | Admin | Comment |
|----------|------|-------|---------|
| GET /zones | ✅ | ✅ | Lecture pour tous |
| POST /zones | ❌ | ✅ | Création admin only |
| DELETE /zones | ❌ | ✅ | Suppression admin only |
| GET /users | ❌ | ✅ | Admin uniquement |
| GET /indicators | ✅ | ✅ | Lecture pour tous |

---

## 📊 Data Flow

### Scénario 1: Afficher les zones

```
Frontend Component
    ↓
useZones() hook calls useQuery()
    ↓
GET /api/v1/zones (avec Authorization header)
    ↓
Backend: get_current_user() extracts user from JWT
    ↓
Backend: query Zone table
    ↓
Return JSON list
    ↓
React Query caches result (5 min staleTime)
    ↓
Component re-renders with data
```

### Scénario 2: Créer un utilisateur (Admin)

```
Frontend Form Submit
    ↓
Validate inputs (email, password, role)
    ↓
POST /api/v1/users with data + JWT token
    ↓
Backend: verify token valid
    ↓
Backend: check role == "admin"
    ↓
Backend: validate email unique
    ↓
Backend: hash password with argon2
    ↓
Backend: INSERT into users table
    ↓
Return created user (id, email, role, created_at)
    ↓
Frontend: React Query invalidates /users cache
    ↓
Users list refreshes automatically
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user',           -- 'user' or 'admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

### Zones Table
```sql
CREATE TABLE zones (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    postal_code VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW()
);
```

### Sources Table
```sql
CREATE TABLE sources (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    data_type VARCHAR(50),                     -- 'real-time' or 'synthetic'
    api_endpoint VARCHAR(500),
    last_update DATETIME,
    created_at DATETIME DEFAULT NOW()
);
```

### Indicators Table
```sql
CREATE TABLE indicators (
    id INTEGER PRIMARY KEY,
    zone_id INTEGER FOREIGN KEY REFERENCES zones(id),
    source_id INTEGER FOREIGN KEY REFERENCES sources(id),
    indicator_type VARCHAR(50),                -- 'air_quality', 'co2', etc.
    parameter VARCHAR(50),                     -- 'pm25', 'o3', etc.
    value FLOAT NOT NULL,
    unit VARCHAR(20),                          -- 'µg/m³', 'tonnes', etc.
    measured_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT NOW()
);
```

---

## 🔌 API Contract Examples

### Login
```
POST /api/v1/auth/login/

Request:
{
  "email": "admin@ecotrack.local",
  "password": "ChangeMe123!"
}

Response (200):
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@ecotrack.local",
    "role": "admin",
    "is_active": true
  }
}
```

### Get Zones
```
GET /api/v1/zones?limit=10&offset=0

Headers:
Authorization: Bearer <token>

Response (200):
{
  "items": [
    {
      "id": 1,
      "name": "Paris 15e",
      "latitude": 48.8355,
      "longitude": 2.2847,
      "postal_code": "75015"
    }
  ],
  "total": 5
}
```

### Get Indicators (Complex Query)
```
GET /api/v1/indicators?
  zone_id=1&
  indicator_type=air_quality&
  measured_from=2024-11-20&
  measured_to=2024-11-21&
  limit=100

Response (200):
{
  "items": [
    {
      "id": 123,
      "zone_id": 1,
      "parameter": "pm25",
      "value": 28.5,
      "unit": "µg/m³",
      "measured_at": "2024-11-21T10:00:00Z"
    }
  ],
  "total": 245
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Backend)
```python
# test_auth.py
- test_user_registration_success
- test_user_registration_duplicate_email
- test_login_success
- test_login_invalid_password
- test_get_current_user_from_token

# test_indicators.py
- test_list_indicators
- test_list_indicators_with_filters
- test_create_indicator_as_admin
- test_create_indicator_as_user_forbidden

# test_stats.py
- test_air_quality_averages
- test_trends_daily

# test_users.py
- test_list_users_admin_only
- test_create_user_duplicate
```

### Integration Tests
- API endpoints end-to-end
- Database transactions
- JWT token flow

---

## 🚀 Deployment Checklist

- [ ] Set strong SECRET_KEY in production
- [ ] Enable HTTPS only (CORS origins with https://)
- [ ] Use PostgreSQL instead of SQLite (scalability)
- [ ] Setup environment variables (.env file)
- [ ] Configure logging (structured logs with timestamps)
- [ ] Setup monitoring (error tracking, performance)
- [ ] Run migrations (Alembic)
- [ ] Setup backups (database)
- [ ] Frontend build (npm run build)
- [ ] Use Docker (containerization)

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app setup + routes mounting |
| `app/core/security.py` | JWT + password hashing |
| `app/core/config.py` | Environment configuration |
| `app/db/session.py` | Database session factory |
| `app/models/` | SQLAlchemy ORM models |
| `app/schemas/` | Pydantic validation schemas |
| `app/api/v1/routes_*.py` | Route handlers |
| `frontend-app/src/services/api.ts` | Axios client setup |
| `frontend-app/src/context/AuthProvider.tsx` | Auth state management |
| `frontend-app/src/hooks/useApi.ts` | Custom React Query hooks |

---

**Architecture stable et production-ready** ✨
