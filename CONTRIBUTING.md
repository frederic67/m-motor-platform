# Guide de Contribution

## Workflow GitFlow

### Branches principales

- **main** : branche de production, contient le code stable
- **develop** : branche de développement, intègre les nouvelles fonctionnalités

### Branches de travail

- **feature/*** : nouvelles fonctionnalités
  - Créée depuis `develop`
  - Fusionnée dans `develop`
  - Exemple : `feature/user-authentication`, `feature/payment-integration`

- **hotfix/*** : corrections urgentes en production
  - Créée depuis `main`
  - Fusionnée dans `main` et `develop`
  - Exemple : `hotfix/security-patch`, `hotfix/critical-bug`

## Nommage des branches

Format : `type/description-courte-en-kebab-case`

**Exemples :**
```
feature/add-login-page
feature/implement-cart-logic
hotfix/fix-payment-error
hotfix/security-vulnerability
```

**Règles :**
- Utiliser des tirets pour séparer les mots
- Tout en minuscules
- Description claire et concise
- Pas de caractères spéciaux

## Format des commits (Conventional Commits)

Format : `type(scope): description`

### Types de commits

- **feat:** nouvelle fonctionnalité
- **fix:** correction de bug
- **chore:** tâches de maintenance (dépendances, config)
- **test:** ajout ou modification de tests
- **docs:** modification de documentation
- **style:** formatage, points-virgules manquants (pas de changement de code)
- **refactor:** refactorisation sans changement de fonctionnalité
- **perf:** amélioration des performances
- **ci:** changements dans la configuration CI/CD

### Exemples

```
feat(auth): add JWT authentication
fix(api): resolve null pointer in user service
chore(deps): update dependencies to latest versions
test(user): add unit tests for user creation
docs(readme): update installation instructions
```

### Règles

- Description en minuscule
- Pas de point à la fin
- Utiliser l'impératif ("add" pas "added")
- Scope optionnel mais recommandé
- Corps du message optionnel pour plus de détails

## Pull Request Checklist

Avant de soumettre une PR, vérifier :

### Code
- [ ] Le code compile sans erreurs
- [ ] Le code suit les conventions du projet
- [ ] Pas de code commenté inutile
- [ ] Pas de console.log() ou print() de debug

### Tests
- [ ] Les tests unitaires passent
- [ ] De nouveaux tests ont été ajoutés si nécessaire
- [ ] La couverture de code est maintenue ou améliorée
- [ ] Les tests d'intégration passent

### Linting & Formatting
- [ ] Le linter ne remonte aucune erreur
- [ ] Le code est correctement formaté
- [ ] Pas d'imports inutilisés
- [ ] Les types sont correctement définis (TypeScript/Python)

### Documentation
- [ ] Le README est mis à jour si nécessaire
- [ ] Les commentaires de code sont clairs et utiles
- [ ] La documentation API est à jour
- [ ] Les changements breaking sont documentés

### Git
- [ ] La branche est à jour avec develop/main
- [ ] Les commits suivent le format conventional commits
- [ ] Pas de commits de merge inutiles
- [ ] L'historique est propre (squash si nécessaire)

### Revue
- [ ] La PR a une description claire
- [ ] Les changements sont liés à un seul objectif
- [ ] Les reviewers sont assignés
- [ ] Les labels appropriés sont ajoutés

## Commandes utiles

### Backend (Python)
```bash
# Linter
flake8 .
pylint src/

# Formatter
black .

# Tests
pytest
pytest --cov
```

### Frontend (Node)
```bash
# Linter
npm run lint
# ou
yarn lint

# Formatter
npm run format
# ou
yarn format

# Tests
npm test
# ou
yarn test
```

## Process de revue

1. Créer une branche depuis `develop`
2. Développer la fonctionnalité
3. Commits réguliers avec messages conventionnels
4. Push et création de la PR vers `develop`
5. Vérifier la checklist
6. Demander une revue
7. Corriger les retours
8. Merge après approbation
