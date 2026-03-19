# M-Motor Frontend

Frontend React pour la plateforme M-Motor.

## Stack Technique

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Routing
- **Material UI** - Composants UI
- **Axios** - Client HTTP
- **React Hook Form** - Gestion des formulaires
- **React Toastify** - Notifications toast

## Installation

```bash
cd frontend

# Installer les dépendances
npm install

# Copier et configurer .env
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Structure

```
src/
  pages/            - Pages de l'application
  components/       - Composants réutilisables
  services/         - Services API
  context/          - Context providers (Auth, etc.)
  hooks/            - Custom hooks
  main.jsx          - Point d'entrée
  App.jsx           - Composant racine avec routing
```

## Features

### Authentification
- ✅ Registration et login avec validation
- ✅ JWT stocké dans localStorage
- ✅ AuthContext avec state global
- ✅ Routes protégées (ProtectedRoute)
- ✅ Routes admin (AdminRoute)

### Navigation
- ✅ Navbar responsive avec Material UI
- ✅ Menu mobile avec Drawer
- ✅ Menu utilisateur avec dropdown
- ✅ Liens conditionnels selon rôle
- ✅ Icons Material pour chaque section

### Véhicules
- ✅ Recherche avec filtres (type, marque, prix)
- ✅ Liste paginée
- ✅ Détails avec possibilité de demande
- ✅ Dialog de confirmation

### Applications
- ✅ Création demande purchase/rental
- ✅ Liste mes applications
- ✅ Détails application avec documents
- ✅ Upload documents (PDF/JPG/PNG)
- ✅ Validation fichiers

### Admin
- ✅ CRUD véhicules
- ✅ Toggle sale/rent
- ✅ Liste toutes applications
- ✅ Approve/Reject applications

### UI/UX
- ✅ Layout responsive
- ✅ Notifications toast (success/error)
- ✅ Loading states
- ✅ Error handling
- ✅ Confirmations pour actions critiques

## Routes

### Publiques
- `/` - Accueil avec recherche
- `/login` - Connexion
- `/register` - Inscription
- `/vehicles` - Liste véhicules
- `/vehicles/:id` - Détail véhicule

### Protégées (authentification requise)
- `/dashboard` - Dashboard utilisateur
- `/my-applications` - Mes demandes
- `/applications/:id` - Détails application

### Admin (rôle admin requis)
- `/admin` - Dashboard administrateur

## Notifications

Utilisation du hook `useNotification`:

```jsx
import { useNotification } from '../hooks/useNotification'

const Component = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification()
  
  const handleAction = async () => {
    try {
      // ... action
      showSuccess('Opération réussie !')
    } catch (err) {
      showError('Erreur lors de l\'opération')
    }
  }
}
```

## Configuration

### Variables d'environnement

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Credentials Test

### Admin
- Email: `admin@mmotors.com`
- Password: `Admin123!`

### Client
- Créer un compte via `/register`

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linter
npm run lint
```
