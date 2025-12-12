# Documentation des Sources de Données EcoTrack

## Vue d'ensemble

EcoTrack intègre des données environnementales provenant de sources publiques fiables pour suivre les indicateurs clés de qualité environnementale : qualité de l'air, émissions CO₂, consommation énergétique et gestion des déchets.

---

## 1. OpenAQ - Qualité de l'Air (Primaire)

### Source
**API OpenAQ v3** - https://www.openaq.org/

### Justification
- **Couverture mondiale** : Données de qualité de l'air de + 130 pays
- **Mises à jour temps réel** : Actualisations toutes les heures pour les zones urbaines
- **Fiabilité** : Agrégation de données d'agences gouvernementales officielles (EPA US, ADEME France, etc.)
- **Polluants clés** : PM2.5, PM10, O₃, NO₂, CO, SO₂
- **Accès gratuit** : API libre avec authentification optionnelle (clé personnelle)

### Polluants suivis
| Polluant | Unité | Seuil Alarme | Justification |
|----------|-------|--------------|---------------|
| PM2.5 | µg/m³ | > 35 | Particules fines, impact santé respiratoire majeur |
| PM10 | µg/m³ | > 50 | Particules grossières, enjeu urbain |
| O₃ (Ozone) | ppb | > 100 | Pollution secondaire, pic estivaux |
| NO₂ | ppb | > 200 | Émissions routières, enjeu métropolitain |
| CO | ppm | > 10 | Trafic routier, zones denses |
| SO₂ | ppb | > 350 | Activités industrielles, chauffage |

### Endpoints utilisés
- `GET /v3/measurements` : Récupère les mesures brutes filtrées par localité/période
- `GET /v3/cities` : Liste des villes disponibles
- `GET /v3/locations` : Localisation des stations de mesure

### Exemple de réponse
```json
{
  "results": [
    {
      "location": "Paris 15",
      "parameter": "pm25",
      "value": 28.5,
      "unit": "µg/m³",
      "date": {
        "utc": "2024-11-21T10:00:00+00:00"
      }
    }
  ]
}
```

### Limitations
- Rate limiting : 5 requêtes/seconde (gratuit)
- Récurrence minimale : 1h pour production
- Données historiques : Disponibles sur 3-6 mois selon les stations

---

## 2. Données Synthétiques Générées

### Justification
Pour les indicateurs non disponibles en temps réel (CO₂, énergie, déchets), nous générons des données cohérentes et réalistes :

#### a) Émissions CO₂ (par zone)
**Source** : Calcul basé sur population + activité économique

```python
# Formule de base
co2_daily = (population * 0.12) + (industrial_activity * 0.45) + random_variation
# Unité: tonnes CO₂ eq/jour
# Justification: 
#   - Moyenne EU = 8 tonnes CO₂/personne/an ≈ 0.022 tonnes/jour
#   - Secteur industriel : coefficient x2 si présent
#   - Variation météo : ±10%
```

**Sources de référence**
- ADEME (Agence de l'Environnement et Maîtrise Énergie) : Facteurs d'émission
- Eurostat : Données nationales par secteur
- Données INSEE : Population par commune

#### b) Consommation Énergétique (par zone)
**Source** : Modèle basé sur chauffage + transport + industrie

```python
# Formule simplifiée
energy_kwh = (population * seasonal_heating) + (vehicles * 8.5) + industrial_bonus
# Unité: MWh/jour
# Justification:
#   - Chauffage: saisonnier (plus élevé hiver)
#   - Transport: 8.5 kWh par véhicule/jour moyen
#   - Industrie: x1.5 si zone industrielle
```

**Données d'entrée calibrées**
- Consommation moyenne France : ~43 MWh/1000 hab/jour
- Pic saisonnier hiver : +35% vs été

#### c) Gestion des Déchets (par zone)
**Source** : Calcul par capita + type de zone

```python
# Formule
waste_tonnes = (population * 0.0015) + (commercial_density * 0.3)
# Unité: tonnes/jour
# Justification:
#   - Générale : ~1.5 kg/habitant/jour (France = 1.6 kg)
#   - Zones commerciales : surconsommation +30%
#   - Recyclage : estimé à 65% (données ADEME 2023)
```

**Calibrage**
- Production France : ~570 kg/habitant/an ≈ 1.56 kg/jour
- Taux recyclage : 65% moyen (25% emballages, 40% autres)

---

## 3. Format des Données en Base

### Table `sources`
```sql
CREATE TABLE sources (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE,           -- "OpenAQ", "Modèle CO₂", etc.
    description TEXT,
    data_type VARCHAR(50),              -- "real-time", "synthetic", "historical"
    last_update DATETIME,
    api_endpoint VARCHAR(500)           -- URL ou NULL si synthétique
);
```

### Table `indicators`
```sql
CREATE TABLE indicators (
    id INTEGER PRIMARY KEY,
    zone_id INTEGER FOREIGN KEY,
    source_id INTEGER FOREIGN KEY,
    indicator_type VARCHAR(50),         -- "air_quality", "co2", "energy", "waste"
    parameter VARCHAR(50),              -- "pm25", "o3", etc.
    value FLOAT,
    unit VARCHAR(20),
    measured_at DATETIME,
    created_at DATETIME DEFAULT NOW()
);
```

---

## 4. Pipeline d'Ingestion

### Flux global
```
┌─────────────────────┐
│  API OpenAQ (v3)    │
└──────────┬──────────┘
           │ GET /measurements
           ▼
┌─────────────────────┐
│ Validation & Cache  │
│ (dernière récupé)   │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌──────────┐  ┌────────────────────┐
│ BDD      │  │ Modèles synthétiq. │
│ Indicators│  │ (CO₂, énergie,     │
└──────────┘  │  déchets)          │
              └──────────┬─────────┘
                        │
                   Tous les jours
```

### Fréquence de mise à jour
- **OpenAQ** : Toutes les heures (production), via cron
- **Données synthétiques** : Générées quotidiennement à minuit UTC
- **Historique** : Conservé 24 mois en base

### Script de synchronisation
```bash
# Exécution programmée (cron job ou scheduler)
0 */1 * * * python scripts/ingest_external_data.py --limit 100 --country FR
0 0 * * * python scripts/generate_synthetic_data.py
```

---

## 5. Qualité & Fiabilité des Données

### Validation en entrée
```python
# Checks appliqués
- Plage de valeurs (outlier detection)
- Timestamp cohérent (pas > 6h dans le passé pour temps réel)
- Source identifiée et traçabilité
- Unicité : 1 mesure par station/paramètre/timestamp
```

### Gestion des lacunes
```python
# Stratégie de fallback
if openaq_status == "down":
    use_cached_data(last_24h)
elif cache_empty:
    use_synthetic_model()
else:
    trigger_alert("data_unavailable")
```

### Tracabilité
Chaque indicateur est stocké avec :
- `source_id` : Origine (OpenAQ, modèle synthétique)
- `measured_at` : Timestamp original
- `created_at` : Date d'insertion en BDD
- `metadata.api_response_time` : Latence (optionnel)

---

**Dernière mise à jour** : 21 nov 2024
**Version doc** : 1.0
