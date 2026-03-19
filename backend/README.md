# M-Motor Backend

Backend FastAPI pour la plateforme de concessionnaire automobile M-Motor.

## Architecture

```
app/
  main.py              - Point d'entrée FastAPI
  core/                - Configuration, logging, sécurité
  db/                  - Session et base SQLAlchemy
  models/              - Modèles SQLAlchemy
  schemas/             - Schémas Pydantic v2
  routers/             - Routes API
  services/            - Logique métier
  tests/               - Tests unitaires
```

## Stack Technique

- **FastAPI** - Framework web moderne
- **SQLAlchemy 2.0** - ORM
- **Alembic** - Migrations de base de données
- **PostgreSQL** - Base de données
- **Pydantic v2** - Validation des données
- **JWT** - Authentification
- **bcrypt** - Hashage des mots de passe
- **pytest** - Tests unitaires (80% coverage)

## Installation

### Avec Docker (recommandé)

```bash
cd backend
docker-compose up --build
```

L'API sera disponible sur `http://localhost:8000`

### Installation locale

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer .env
cp .env.example .env

# Lancer PostgreSQL localement ou via Docker
docker-compose up -d postgres

# Exécuter les migrations
alembic upgrade head

# Lancer le serveur
uvicorn app.main:app --reload

# Initialiser la base de données (première fois)
alembic upgrade head
python scripts/init_db.py  # Crée admin + véhicules démo en dev
```

### Commandes utiles

```bash
# Seeding
python scripts/seed.py seed              # Tout créer
python scripts/seed.py seed-admin        # Admin uniquement
python scripts/seed.py seed-vehicles     # Véhicules uniquement

# Base de données
alembic upgrade head                     # Appliquer migrations
alembic revision --autogenerate -m "msg" # Créer migration

# Tests
pytest --cov=app                         # Tests avec couverture
```

## Migrations Alembic

### Configuration
Les migrations Alembic sont configurées pour utiliser `settings.DB_URL` depuis `app/core/config.py`.

### Commandes

```bash
# Créer la première migration (initial schema)
alembic revision --autogenerate -m "initial migration"

# Appliquer toutes les migrations
alembic upgrade head

# Créer une nouvelle migration après modification des modèles
alembic revision --autogenerate -m "add column to users"

# Voir l'historique des migrations
alembic history

# Revenir à la migration précédente
alembic downgrade -1

# Revenir à une migration spécifique
alembic downgrade <revision_id>

# Voir le SQL qui sera exécuté (sans l'exécuter)
alembic upgrade head --sql

# Voir la migration actuelle
alembic current
```

### Initialisation de la base de données

```bash
# 1. Créer les tables avec Alembic
alembic upgrade head

# 2. Créer l'utilisateur admin et les données de démo (development uniquement)
python scripts/init_db.py

# Alternative : CLI de seeding
python scripts/seed.py seed           # Tout créer
python scripts/seed.py seed-admin     # Admin uniquement
python scripts/seed.py seed-vehicles  # Véhicules uniquement
python scripts/seed.py seed --force   # Forcer les véhicules de démo
```

**Credentials admin par défaut (development):**
- Email: `admin@mmotors.com`
- Password: `Admin123!`

**⚠️ En mode development, l'admin est auto-créé au démarrage de l'application.**

**⚠️ Changez ces credentials en production !**

### Données de démo

En mode `ENV=development`, 5 véhicules de démo sont créés:
- 2 véhicules à vendre (Toyota Camry, Honda Civic)
- 2 véhicules à louer (Tesla Model 3, BMW X5)
- 1 véhicule disponible pour vente et location (Mercedes-Benz C-Class)

Le seeding est idempotent: il ne créera pas de doublons.

## Tests

### Exécuter les tests

```bash
# Exécuter tous les tests
pytest

# Exécuter avec rapport de couverture
pytest --cov=app --cov-report=html --cov-report=term

# Exécuter tests spécifiques
pytest app/tests/test_auth.py
pytest app/tests/test_vehicles.py -v

# Exécuter tests avec marqueurs
pytest -m "not slow"
```

### Couverture de code

Le projet vise une couverture de code de 80% minimum.

```bash
# Générer rapport de couverture HTML
pytest --cov=app --cov-report=html

# Ouvrir le rapport
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### CI/CD

Script pour intégration continue:

```bash
# Installation des dépendances
pip install -r requirements.txt

# Linter
flake8 app --max-line-length=120 --exclude=__pycache__,migrations

# Tests avec couverture
pytest --cov=app --cov-report=xml --cov-fail-under=80

# Vérifier les types (optionnel)
mypy app --ignore-missing-imports
```

### Tests disponibles

- **test_auth.py** : Authentification (register, login)
- **test_rbac.py** : Contrôle d'accès basé sur les rôles
- **test_vehicles.py** : CRUD véhicules et filtres
- **test_applications.py** : Création et gestion des demandes
- **test_documents.py** : Upload et gestion des documents

## Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Véhicules
- `GET /api/vehicles/` - Liste des véhicules (avec filtres)
- `GET /api/vehicles/{id}` - Détails d'un véhicule

### Applications
- `POST /api/applications/` - Créer une demande
- `GET /api/applications/my-applications` - Mes demandes
- `GET /api/applications/{id}` - Détails d'une demande
- `POST /api/applications/{id}/documents` - Upload de document

### Admin
- `POST /api/admin/vehicles` - Créer un véhicule
- `PUT /api/admin/vehicles/{id}` - Modifier un véhicule
- `DELETE /api/admin/vehicles/{id}` - Supprimer un véhicule
- `GET /api/admin/applications` - Liste toutes les demandes
- `PUT /api/admin/applications/{id}/status` - Modifier le statut

## Documentation API

Une fois le serveur lancé :
- Swagger UI : `http://localhost:8000/docs`
- ReDoc : `http://localhost:8000/redoc`

## Fonctionnalités

### Utilisateurs
- Inscription et connexion
- Authentification JWT
- Rôles utilisateur/admin

### Véhicules
- Recherche avec filtres (marque, modèle, prix, année, etc.)
- Type vente ou location
- Basculer entre vente et location (admin)
- Gestion CRUD complète (admin)

### Demandes d'achat/location
- Création de demandes
- Upload de documents
- Suivi du statut
- Validation par admin

### Back-office Admin
- Gestion des véhicules
- Validation des demandes
- Notes administratives

## Logging

Logs structurés en JSON avec :
- Timestamp
- Niveau
- Message
- Module/fonction/ligne
- Exceptions

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Protection des endpoints admin
- Validation des entrées avec Pydantic

## Variables d'environnement

```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
