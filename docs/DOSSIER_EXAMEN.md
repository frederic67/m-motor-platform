# Dossier d'examen – M-Motor
**Bloc 3 : Développer une solution digitale (spé Python)**

---

## Tableau des liens et accès

| Description | Valeur |
|-------------|--------|
| Lien Git frontend | À REMPLIR *(ex: `https://github.com/VOTRE_USER/M-Motor` – dossier `frontend`)* |
| Lien Git backend | À REMPLIR *(ex: même dépôt – dossier `backend`)* |
| Lien application | À REMPLIR *(ex: `https://m-motor.vercel.app`)* |
| Login Admin | `admin@mmotors.com` |
| Mot de passe Admin | `Admin123!` |
| Login Client | `client@mmotors.com` |
| Mot de passe Client | `Client123!` |

> ⚠️ **Important** : Renseignez vos liens Git réels et l’URL de l’application déployée avant de rendre le dossier. Les dépôts doivent être publics.

---

## 1. Préparation Git et gestion des branches

### 1.1 Structure des dépôts

- **Option monorepo** : Un dépôt unique avec dossiers `backend/`, `frontend/`, `docs/`
- **Option multi-repos** : Deux dépôts séparés (frontend et backend)

### 1.2 Stratégie de branches (GitFlow)

- **main** : Code stable, prêt pour la production
- **develop** : Branche d’intégration pour les évolutions
- **feature/** : Nouvelles fonctionnalités (ex. `feature/auth-jwt`, `feature/admin-dashboard`)
- **hotfix/** : Corrections urgentes en production

### 1.3 Nommage des branches

Format : `type/description-courte`

Exemples : `feature/user-registration`, `fix/vehicle-filter`, `hotfix/security-token`

### 1.4 Commits conventionnels

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `test:` ajout ou mise à jour de tests
- `docs:` documentation
- `chore:` maintenance, config

Exemple : `feat(auth): add JWT authentication and /me endpoint`

---

## 2. Démarche pour développer une User Story

- Analyser le besoin et les critères d’acceptation
- Découper en tâches techniques (API, modèle, schémas, UI)
- Créer une branche `feature/xxx` depuis `develop`
- Implémenter côté backend puis frontend
- Rédiger les tests unitaires et les exécuter
- Vérifier la couverture (objectif 80 %)
- Valider manuellement les parcours
- Ouvrir une Pull Request vers `develop`
- Faire une relecture et merger après validation

---

## 3. Outils et technologies utilisés

| Catégorie | Outil |
|-----------|-------|
| **Backend** | FastAPI, Python 3.11 |
| **ORM / BDD** | SQLAlchemy 2.0, Alembic, PostgreSQL (prod) / SQLite (dev) |
| **Validation** | Pydantic v2 |
| **Authentification** | JWT (python-jose), bcrypt (passlib) |
| **Tests** | pytest, pytest-cov |
| **Frontend** | React 18, Vite, Material UI |
| **HTTP Client** | Axios |
| **Routing** | React Router DOM |
| **Déploiement** | Docker, Render/Railway (backend), Vercel (frontend) |

---

## 4. User Stories réalisées (statut DONE)

| User Story | Description | Statut |
|------------|-------------|--------|
| US1 | Recherche de véhicules (achat / location) | ✅ DONE |
| US2 | Inscription client et dépôt de dossier (achat ou location) | ✅ DONE |
| US3 | Upload de documents pour le dossier (100 % dématérialisé) | ✅ DONE |
| US4 | Suivi de l’avancement du dossier depuis l’espace client | ✅ DONE |
| US5 | Back-office : ajout de véhicules à la vente | ✅ DONE |
| US6 | Back-office : ajout de véhicules à la location | ✅ DONE |
| US7 | Back-office : bascule véhicule vente ↔ location | ✅ DONE |
| US8 | Back-office : visualisation des dossiers | ✅ DONE |
| US9 | Back-office : validation ou rejet des dossiers | ✅ DONE |
| US10 | Dashboard admin avec statistiques | ✅ DONE |
| US11 | Détail d’une demande admin (pièces jointes, actions) | ✅ DONE |

---

## 5. Mesures de sécurité mises en place

### 5.1 Authentification et autorisation

- **JWT** : Tokens signés avec `JWT_SECRET` et expiration configurable
- **bcrypt** : Hashage des mots de passe (aucun stockage en clair)
- **RBAC** : Rôles `ADMIN` et `CUSTOMER` avec endpoints protégés
- **Dépendances FastAPI** : `get_current_user`, `require_admin` pour restreindre l’accès
- **Endpoint `/api/auth/me`** : Rôle récupéré côté serveur pour éviter toute usurpation côté client

### 5.2 Protection des données et des entrées

- **Pydantic** : Validation des entrées (email, année, prix, etc.)
- **Sanitisation des noms de fichiers** pour les uploads
- **Validation des types de fichiers** (PDF, JPEG, PNG)
- **Limite de taille** (ex. 5 Mo) pour les uploads

### 5.3 CORS et exposition des services

- **CORS** : Origines autorisées configurées via variables d’environnement
- **Secrets** : `JWT_SECRET` et variables sensibles dans `.env`, non versionnés

---

## 6. Surveillance : logs, gestion d’erreur, alerting

### 6.1 Logs structurés

- Fichier : `app/core/logging.py`
- **Fichier** : `logs/app.log`
- **Format** : JSON avec timestamp, niveau, message, module, exception
- **Middleware** : Logging des requêtes (méthode, path, status, durée, user_id) — `app/core/middleware.py`

### 6.2 Gestion d’erreur

- **Exception globale** : Handler FastAPI pour les erreurs non gérées
- **HTTPException** : Codes 400, 401, 403, 404 selon les cas
- **Messages d’erreur** : Pas de fuite d’informations sensibles en production (`DEBUG=false`)

### 6.3 Alerting

- Fichier : `app/core/alerting.py`
- **Fichier dédié** : `logs/alerts.log`
- **Déclencheurs** : Exceptions non gérées, réponses HTTP ≥ 500
- **Placeholder email** : Méthode prête pour intégration d’envoi d’emails (ex. SendGrid, SES)

---

## 7. Stratégie de tests et preuve de couverture

### 7.1 Configuration pytest

- Fichier : `backend/pytest.ini`
- Seuil de couverture : **80 %** (`--cov-fail-under=80`)

### 7.2 Commande pour lancer les tests et la couverture

```bash
cd backend
.venv\Scripts\activate   # ou : source venv/bin/activate
pytest --cov=app --cov-report=term --cov-report=html --cov-fail-under=80
```

### 7.3 Preuve de couverture (attendu)

- **Couverture totale** : ≥ 80 %
- **Nombre de tests** : 53 (à adapter selon évolution du projet)
- **Modules couverts** : auth, vehicles, applications, documents, RBAC, services

### 7.4 Tests exécutés

- `test_auth.py` : inscription, login, flux complets
- `test_vehicles.py` : CRUD, filtres, pagination, switch disponibilité
- `test_applications.py` : création achat/location, admin approve/reject, statut
- `test_documents.py` : upload, liste, suppression (admin)
- `test_rbac.py` : client n’accède pas aux endpoints admin
- `test_services.py` : couverture des services (auth, vehicle, application)

### 7.5 Rapport HTML de couverture

Après exécution :

```bash
pytest --cov=app --cov-report=html
```

Ouvrir : `backend/htmlcov/index.html`

---

## 8. Déploiement (Move to Cloud)

### 8.1 Architecture déployée

- **Backend** : Render ou Railway
- **Base de données** : PostgreSQL (Render/Railway/Supabase)
- **Frontend** : Vercel
- **Stockage fichiers** : Volume persistant ou stockage cloud (S3, Cloudinary)

### 8.2 Variables d’environnement

- Backend : `ENV`, `DB_URL`, `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRES_MIN`, `CORS_ORIGINS`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`
- Frontend : `VITE_API_BASE_URL` (URL du backend déployé)

### 8.3 Référence déploiement

Voir le guide détaillé : `docs/DEPLOYMENT.md`

---

## 9. Livrables et avertissements

- [ ] Les liens Git sont **publics** et indiqués dans le tableau du début
- [ ] L’URL de l’application déployée est visible et fonctionnelle
- [ ] Les logins admin et client sont indiqués clairement
- [ ] Le déploiement est effectué et testé
- [ ] Les tests unitaires sont exécutables et atteignent ≥ 80 % de couverture

---

*Document généré pour le dossier d’examen M-Motor – Bloc 3.*
