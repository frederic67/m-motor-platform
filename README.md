# M-Motor

Projet monorepo pour M-Motor.

## Structure

```
/backend   - API et services backend
/frontend  - Application frontend
/docs      - Documentation du projet
```

## Lancer le projet en local

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Développement

Voir la documentation dans `/docs` pour plus d'informations.