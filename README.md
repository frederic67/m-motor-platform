# M-Motor Platform

Plateforme de gestion de concessionnaire automobile permettant aux clients de consulter des véhicules, soumettre des dossiers d'achat ou de location, et suivre leur avancement. Les administrateurs disposent d'un back-office complet pour gérer le catalogue et valider les demandes.

**Application déployée** : https://m-motor-platform.vercel.app  
**Dépôt** : https://github.com/frederic67/m-motor-platform

---

## Stack technique

| Couche | Technologies |
|---|---|
| Backend | FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL · Pydantic v2 |
| Auth | JWT (python-jose) · bcrypt (passlib) · RBAC (ADMIN / CUSTOMER) |
| Frontend | React 18 · Vite · Material UI · Axios · React Hook Form |
| Tests | pytest · pytest-cov (86% de couverture) |
| Déploiement | Railway (backend) · Vercel (frontend) |

---

## Structure du monorepo
```
/backend   - API REST FastAPI + PostgreSQL
/frontend  - Application React + Vite
/docs      - Documentation du projet
```

## Lancer le projet en local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Configurer DATABASE_URL, SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env         # Configurer VITE_API_BASE_URL
npm run dev
```

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@mmotors.com | Admin123! |
| Client | client@mmotors.com | Client123! |

> Ces comptes sont créés automatiquement au démarrage de l'application.

---

## Tests
```bash
cd backend
pytest --cov=app --cov-report=html --cov-fail-under=80
```

---

## Documentation API

Une fois le backend lancé :
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc