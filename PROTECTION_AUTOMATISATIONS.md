# Protection des Automatisations par Plan

## Vue d'ensemble

Les fonctionnalités d'automatisation sont maintenant protégées et accessibles uniquement aux utilisateurs ayant un plan **Premium** ou **Entreprise**. Cette protection s'applique à la fois à l'accès à la page et aux API.

## Fonctionnalités protégées

### 🔒 Page des Automatisations (`/automatisations`)

- **Accès restreint** : Seuls les utilisateurs avec un plan Premium ou Entreprise peuvent accéder à cette page
- **Redirection automatique** : Les utilisateurs avec un plan gratuit sont redirigés vers la page `upgrade-required`
- **Message personnalisé** : "Les automatisations sont disponibles uniquement avec le plan Entreprise."

### 🔒 API des Automatisations

Toutes les routes API sont protégées :

1. **`POST /automatisations/api/toggle/:automationId`**
   - Activer/désactiver une automatisation
   - Retourne une erreur 403 si le plan est insuffisant

2. **`POST /automatisations/api/settings/:automationId`**
   - Modifier les paramètres d'une automatisation
   - Retourne une erreur 403 si le plan est insuffisant

3. **`POST /automatisations/api/check-unpaid-rent`**
   - Exécution manuelle de la vérification des retards de paiement
   - Retourne une erreur 403 si le plan est insuffisant

4. **`POST /automatisations/api/check-lease-expiry`**
   - Exécution manuelle de la vérification des expirations de bail
   - Retourne une erreur 403 si le plan est insuffisant

## Logique de vérification

### Structure des données utilisateur

```javascript
// Structure attendue dans la base de données
{
  "id": "user123",
  "billing": {
    "plan": "enterprise" // ou "premium", "free"
  }
}
```

### Code de vérification

```javascript
// Vérifier le plan de l'utilisateur
const user = await dataService.getUserById(req.session.user.id);
const userPlan = user.billing?.plan || 'free';

if (userPlan !== 'premium' && userPlan !== 'enterprise') {
    // Accès refusé
    return res.render('upgrade-required', {
        message: 'Les automatisations sont disponibles uniquement avec le plan Entreprise.',
        requiredPlan: 'enterprise'
    });
}
```

## Plans autorisés

| Plan | Accès aux Automatisations |
|------|---------------------------|
| **Free** | ❌ Accès refusé |
| **Premium** | ✅ Accès autorisé |
| **Enterprise** | ✅ Accès autorisé |

## Messages d'erreur

### Page Web
- **Template** : `upgrade-required.ejs`
- **Message** : "Les automatisations sont disponibles uniquement avec le plan Entreprise."
- **Action** : Bouton pour passer au plan Entreprise

### API
- **Code HTTP** : 403 Forbidden
- **Réponse JSON** :
```json
{
  "success": false,
  "message": "Les automatisations sont disponibles uniquement avec le plan Entreprise.",
  "requiredPlan": "enterprise"
}
```

## Logs de sécurité

Le système enregistre les tentatives d'accès non autorisées :

```
🔍 Plan utilisateur: free
❌ Accès refusé - Plan insuffisant
```

## Avantages

1. **Sécurité** : Protection contre l'accès non autorisé
2. **Monétisation** : Incitation à passer au plan payant
3. **Cohérence** : Même logique pour toutes les routes
4. **Traçabilité** : Logs détaillés des tentatives d'accès

## Notes techniques

- La vérification se fait à chaque requête (pas de cache)
- Les utilisateurs non trouvés sont redirigés vers la connexion
- Les erreurs sont gérées gracieusement avec des messages clairs
- Compatible avec la structure existante de la base de données

## Tests recommandés

1. **Test avec plan Free** : Vérifier la redirection vers `upgrade-required`
2. **Test avec plan Premium** : Vérifier l'accès autorisé
3. **Test avec plan Enterprise** : Vérifier l'accès autorisé
4. **Test API** : Vérifier les codes de retour 403 pour les plans insuffisants
5. **Test utilisateur inexistant** : Vérifier la redirection vers `/auth/login`
