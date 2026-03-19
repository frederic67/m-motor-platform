# Guide de Déploiement M-Motor

Ce guide explique comment déployer l'application M-Motor en production.

## Architecture de Déploiement

- **Backend (FastAPI)** : Render ou Railway
- **Base de données** : PostgreSQL (Render/Railway/Supabase)
- **Frontend (React)** : Vercel
- **Stockage fichiers** : Volumes persistants (Render/Railway) ou S3/Cloudinary

---

## Option 1 : Déploiement Backend sur Render

### 1.1 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte gratuit ou connectez-vous
3. Connectez votre compte GitHub

### 1.2 Provisionner PostgreSQL

1. Dans le dashboard Render, cliquez sur **"New +"** → **"PostgreSQL"**
2. Configurez la base de données :
   - **Name** : `m-motor-db`
   - **Database** : `mmotor_db`
   - **User** : `mmotor`
   - **Region** : Choisissez la région la plus proche
   - **Plan** : Free (pour commencer)
3. Cliquez sur **"Create Database"**
4. Une fois créée, copiez l'**Internal Database URL** (format : `postgresql://...`)

### 1.3 Déployer le Backend

1. Dans le dashboard, cliquez sur **"New +"** → **"Web Service"**
2. Sélectionnez votre repository GitHub `M-Motor`
3. Configurez le service :
   - **Name** : `m-motor-backend`
   - **Region** : Même région que la base de données
   - **Branch** : `main` ou `develop`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : 
     ```bash
     alembic upgrade head && python scripts/init_db.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
     ```
   - **Plan** : Free (pour commencer)

4. Ajoutez les **Environment Variables** :
   ```
   ENV=production
   DEBUG=false
   
   DB_URL=<Coller l'Internal Database URL de PostgreSQL>
   
   JWT_SECRET=<Générer une clé secrète forte de 32+ caractères>
   JWT_ALGORITHM=HS256
   JWT_EXPIRES_MIN=30
   
   CORS_ORIGINS=["https://votre-frontend.vercel.app"]
   
   APP_NAME=M-Motor API
   APP_VERSION=1.0.0
   
   UPLOAD_DIR=/opt/render/project/src/uploads
   MAX_UPLOAD_MB=5
   ALLOWED_UPLOAD_EXTENSIONS=pdf,jpg,jpeg,png
   ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png
   ```

5. Ajoutez un **Disk** pour les uploads (onglet "Disks") :
   - **Name** : `uploads`
   - **Mount Path** : `/opt/render/project/src/uploads`
   - **Size** : 1GB (gratuit)

6. Cliquez sur **"Create Web Service"**

7. Attendez que le déploiement se termine (5-10 minutes)

8. Testez l'API : `https://m-motor-backend.onrender.com/health`

### 1.4 Notes importantes Render

- Le plan gratuit met le service en veille après 15 minutes d'inactivité
- Le premier démarrage après la veille prend ~30 secondes
- Les logs sont disponibles dans l'onglet "Logs"
- Les déploiements automatiques se déclenchent à chaque push sur la branche configurée

---

## Option 2 : Déploiement Backend sur Railway

### 2.1 Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte avec GitHub
3. Créez un nouveau projet : **"New Project"**

### 2.2 Provisionner PostgreSQL

1. Dans votre projet, cliquez sur **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway créera automatiquement la base de données
3. Cliquez sur le service PostgreSQL → onglet **"Variables"**
4. Copiez la variable `DATABASE_URL` (sera utilisée comme `DB_URL`)

### 2.3 Déployer le Backend

1. Dans le projet, cliquez sur **"+ New"** → **"GitHub Repo"**
2. Sélectionnez votre repository `M-Motor`
3. Configurez le service :
   - Cliquez sur le service créé → **"Settings"**
   - **Root Directory** : `backend`
   - **Start Command** : 
     ```bash
     alembic upgrade head && python scripts/init_db.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4
     ```

4. Ajoutez les **Variables** (onglet "Variables") :
   ```
   ENV=production
   DEBUG=false
   
   DB_URL=${{Postgres.DATABASE_URL}}
   
   JWT_SECRET=<Générer une clé secrète forte>
   JWT_ALGORITHM=HS256
   JWT_EXPIRES_MIN=30
   
   CORS_ORIGINS=["https://votre-frontend.vercel.app"]
   
   APP_NAME=M-Motor API
   APP_VERSION=1.0.0
   
   UPLOAD_DIR=/app/uploads
   MAX_UPLOAD_MB=5
   ```

5. Ajoutez un **Volume** pour les uploads :
   - Onglet **"Settings"** → **"Volumes"**
   - **Mount Path** : `/app/uploads`

6. Générez un domaine public :
   - Onglet **"Settings"** → **"Networking"**
   - Cliquez sur **"Generate Domain"**
   - Copiez l'URL générée (ex: `m-motor-backend.up.railway.app`)

7. Railway déploiera automatiquement

8. Testez l'API : `https://m-motor-backend.up.railway.app/health`

### 2.4 Notes importantes Railway

- Le plan gratuit offre $5 de crédits par mois
- Pas de mise en veille automatique
- Excellente performance
- Logs en temps réel dans l'onglet "Logs"

---

## Générer une clé JWT secrète

```bash
# Méthode 1 : Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Méthode 2 : OpenSSL
openssl rand -base64 32

# Méthode 3 : En ligne
# https://randomkeygen.com/ (Fort (256-bit))
```

---

## Déploiement Frontend sur Vercel

### 3.1 Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte avec GitHub
3. Cliquez sur **"Add New..."** → **"Project"**

### 3.2 Importer le projet

1. Sélectionnez votre repository `M-Motor`
2. Configurez le projet :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build` (détecté automatiquement)
   - **Output Directory** : `dist` (détecté automatiquement)

### 3.3 Configurer les variables d'environnement

1. Dans **"Environment Variables"**, ajoutez :
   ```
   VITE_API_BASE_URL=https://m-motor-backend.onrender.com
   ```
   ou
   ```
   VITE_API_BASE_URL=https://m-motor-backend.up.railway.app
   ```

2. Cliquez sur **"Deploy"**

3. Attendez la fin du déploiement (2-3 minutes)

4. Vercel vous donnera une URL de production (ex: `m-motor.vercel.app`)

### 3.4 Mettre à jour l'API dans le frontend

Modifiez `frontend/src/services/api.js` :

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3.5 Mettre à jour CORS_ORIGINS backend

Retournez dans Render ou Railway et mettez à jour la variable :

```
CORS_ORIGINS=["https://m-motor.vercel.app","https://m-motor-*.vercel.app"]
```

Le wildcard `*` permet de supporter les preview deployments de Vercel.

### 3.6 Redéployer

1. Commitez et pushez les changements
2. Vercel redéploiera automatiquement le frontend
3. Railway/Render redéploiera automatiquement le backend

---

## Configuration du Domaine Personnalisé (Optionnel)

### Backend (Render/Railway)

1. Dans les settings, allez dans **"Custom Domain"**
2. Ajoutez votre domaine (ex: `api.mmotor.com`)
3. Configurez les enregistrements DNS chez votre registrar :
   - **Type** : `CNAME`
   - **Name** : `api`
   - **Value** : `m-motor-backend.onrender.com` (ou Railway)

### Frontend (Vercel)

1. Dans les settings du projet, allez dans **"Domains"**
2. Ajoutez votre domaine (ex: `mmotor.com`)
3. Configurez les enregistrements DNS :
   - **Type** : `A`
   - **Name** : `@`
   - **Value** : `76.76.21.21` (IP Vercel)
   
   - **Type** : `CNAME`
   - **Name** : `www`
   - **Value** : `cname.vercel-dns.com`

---

## Checklist de Pré-déploiement

- [ ] Tous les tests passent (`pytest --cov=app`)
- [ ] Les migrations Alembic sont à jour
- [ ] Le fichier `.env.example` est complet
- [ ] Les credentials par défaut sont changés
- [ ] `DEBUG=false` en production
- [ ] `JWT_SECRET` est une clé forte et unique
- [ ] CORS configuré avec les bonnes origines
- [ ] Le `.gitignore` ne commit pas les secrets
- [ ] Les logs sont configurés
- [ ] Les healthchecks fonctionnent

---

## Post-déploiement

### Vérifications

1. **Backend** :
   ```bash
   curl https://votre-backend.onrender.com/health
   curl https://votre-backend.onrender.com/docs
   ```

2. **Frontend** :
   - Ouvrez `https://votre-frontend.vercel.app`
   - Testez l'inscription et la connexion
   - Testez la recherche de véhicules
   - Testez la création d'une demande

3. **Base de données** :
   ```bash
   # Render
   Allez dans le dashboard PostgreSQL → "Connect" → Copiez le psql command
   
   # Railway
   railway connect postgres
   ```

### Monitoring

1. **Render** :
   - Logs : Dashboard → Service → "Logs"
   - Métriques : Dashboard → Service → "Metrics"

2. **Railway** :
   - Logs : Dashboard → Service → "Logs"
   - Métriques : Dashboard → Service → "Metrics"

3. **Vercel** :
   - Analytics : Dashboard → Project → "Analytics"
   - Logs : Dashboard → Project → "Deployments" → Cliquez sur un déploiement

### Alertes (Optionnel)

Configurez des alertes via :
- **Sentry** pour les erreurs applicatives
- **UptimeRobot** pour le monitoring de disponibilité
- **LogDNA** ou **Papertrail** pour l'agrégation de logs

---

## Dépannage

### Backend ne démarre pas

1. Vérifiez les logs dans Render/Railway
2. Vérifiez que `DB_URL` est correctement configuré
3. Vérifiez que toutes les variables d'environnement sont présentes
4. Testez les migrations en local : `alembic upgrade head`

### Erreur CORS

1. Vérifiez que `CORS_ORIGINS` contient l'URL exacte du frontend
2. N'oubliez pas les protocoles (`https://`)
3. Redéployez le backend après modification

### Frontend ne se connecte pas au backend

1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que `VITE_API_BASE_URL` est correctement configuré
3. Vérifiez que le backend est accessible : `curl https://backend-url/health`
4. Vérifiez les CORS

### Base de données non accessible

1. Vérifiez que le service PostgreSQL est en cours d'exécution
2. Vérifiez que `DB_URL` correspond à l'URL interne (Render) ou `DATABASE_URL` (Railway)
3. Testez la connexion avec un client PostgreSQL

### Uploads ne fonctionnent pas

1. Vérifiez que le volume/disk est monté correctement
2. Vérifiez les permissions d'écriture
3. Vérifiez que `UPLOAD_DIR` pointe vers le bon chemin
4. En production, considérez AWS S3 ou Cloudinary pour le stockage de fichiers

---

## Alternatives de Déploiement

### Backend

- **Fly.io** : Excellent pour Docker, global edge network
- **Heroku** : Simple mais plus cher
- **DigitalOcean App Platform** : Bon équilibre prix/performance
- **AWS Elastic Beanstalk** : Pour les grandes applications
- **Google Cloud Run** : Serverless, paiement à l'usage

### Base de données

- **Supabase** : PostgreSQL avec dashboard, gratuit jusqu'à 500MB
- **Neon** : PostgreSQL serverless avec branche par PR
- **ElephantSQL** : PostgreSQL managé, plan gratuit 20MB
- **AWS RDS** : Pour la production à grande échelle

### Frontend

- **Netlify** : Alternative à Vercel, très similaire
- **Cloudflare Pages** : Gratuit, CDN global inclus
- **AWS Amplify** : Intégration avec AWS
- **GitHub Pages** : Gratuit mais pas de serverless functions

---

## Coûts Estimés

### Configuration Gratuite (Idéale pour démarrage/POC)

- **Backend (Render Free)** : $0/mois
- **PostgreSQL (Render Free)** : $0/mois
- **Frontend (Vercel Hobby)** : $0/mois
- **Total** : **$0/mois**

Limitations : Backend en veille après 15min d'inactivité, 512MB RAM

### Configuration Starter (Recommandée pour production)

- **Backend (Render Starter)** : $7/mois
- **PostgreSQL (Render Standard)** : $7/mois
- **Frontend (Vercel Pro)** : $20/mois
- **Total** : **$34/mois**

### Configuration Railway (Alternative)

- **Backend + PostgreSQL (Railway)** : ~$10-15/mois
- **Frontend (Vercel Hobby)** : $0/mois
- **Total** : **$10-15/mois**

---

## CI/CD (Intégration Continue)

Les déploiements automatiques sont configurés par défaut :

1. **Push sur `main`** → Déploiement en production
2. **Push sur `develop`** → Preview deployment (Vercel)
3. **Pull Request** → Preview deployment

Pour désactiver les déploiements automatiques :
- **Render** : Settings → "Auto-Deploy" → Off
- **Railway** : Settings → "Deploys" → Manual
- **Vercel** : Settings → "Git" → Décochez "Production Branch"

---

## Sécurité en Production

- [ ] Utilisez HTTPS partout (activé par défaut sur Render/Railway/Vercel)
- [ ] Ne committez JAMAIS les secrets dans Git
- [ ] Changez tous les mots de passe par défaut
- [ ] Utilisez des clés JWT fortes (32+ caractères)
- [ ] Activez la rotation des secrets régulièrement
- [ ] Limitez CORS aux domaines autorisés uniquement
- [ ] Configurez un rate limiting (ex: via Cloudflare)
- [ ] Activez les logs d'audit
- [ ] Configurez les backups PostgreSQL (automatiques sur Render/Railway)

---

## Support

Pour toute question ou problème :
1. Consultez les logs du service concerné
2. Vérifiez la documentation officielle :
   - [Render Docs](https://render.com/docs)
   - [Railway Docs](https://docs.railway.app)
   - [Vercel Docs](https://vercel.com/docs)
3. Créez une issue sur le repository GitHub
