# Protection du Calendrier par Plan

## Vue d'ensemble

La page calendrier et toutes ses API sont maintenant protégées et accessibles uniquement aux utilisateurs ayant un plan **Entreprise**. Cette protection s'applique à la fois à l'accès à la page et aux API.

## Fonctionnalités protégées

### 🔒 Page du Calendrier (`/calendrier`)

- **Accès restreint** : Seuls les utilisateurs avec un plan Entreprise peuvent accéder à cette page
- **Redirection automatique** : Les utilisateurs avec un plan insuffisant sont redirigés vers la page `upgrade-required`
- **Message personnalisé** : "Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder."

### 🔒 API du Calendrier

Toutes les routes API sont protégées avec le middleware `checkUserPlan` :

1. **`POST /calendrier/api/events`**
   - Créer un nouvel événement
   - Retourne une erreur 403 si le plan est insuffisant

2. **`GET /calendrier/api/events`**
   - Récupérer les événements d'une période
   - Retourne une erreur 403 si le plan est insuffisant

3. **`PUT /calendrier/api/events/:id`**
   - Mettre à jour un événement
   - Retourne une erreur 403 si le plan est insuffisant

4. **`DELETE /calendrier/api/events/:id`**
   - Supprimer un événement
   - Retourne une erreur 403 si le plan est insuffisant

5. **`GET /calendrier/api/check-google-auth`**
   - Vérifier l'authentification Google
   - Retourne une erreur 403 si le plan est insuffisant

6. **`POST /calendrier/api/sync-google`**
   - Synchroniser avec Google Calendar
   - Retourne une erreur 403 si le plan est insuffisant

### 🔓 Routes non protégées

Certaines routes restent accessibles pour des raisons fonctionnelles :

1. **`POST /calendrier/api/setup-enterprise`**
   - Configuration du plan entreprise
   - Accessible pour permettre l'activation du plan

2. **`POST /calendrier/api/add-automatic-event`**
   - Ajout d'événements automatiques
   - Appelée depuis d'autres routes du système

## Logique de vérification

### Structure des données utilisateur

```javascript
// Structure attendue dans la base de données
{
  "id": "user123",
  "facturation": {
    "planId": "enterprise" // ou "basique", "premium"
  }
}
```

### Middleware de vérification

```javascript
async function checkUserPlan(req, res, next) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.facturation?.planId || 'basique';
        if (userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        next();
    } catch (error) {
        console.error('❌ Erreur vérification plan:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}
```

## Plans autorisés

| Plan | Accès au Calendrier |
|------|---------------------|
| **Basique** | ❌ Accès refusé |
| **Premium** | ❌ Accès refusé |
| **Enterprise** | ✅ Accès autorisé |

## Messages d'erreur

### Page Web
- **Template** : `upgrade-required.ejs`
- **Message** : "Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder."
- **Action** : Bouton pour passer au plan Entreprise

### API
- **Code HTTP** : 403 Forbidden
- **Réponse JSON** :
```json
{
  "success": false,
  "message": "Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.",
  "requiredPlan": "enterprise"
}
```

## Logs de sécurité

Le système enregistre les tentatives d'accès non autorisées :

```
🔍 Plan utilisateur: basique
❌ Accès refusé - Plan insuffisant
```

## Avantages

1. **Sécurité** : Protection contre l'accès non autorisé au calendrier
2. **Monétisation** : Incitation à passer au plan Entreprise
3. **Cohérence** : Même logique que les automatisations
4. **Performance** : Middleware réutilisable pour toutes les routes
5. **Traçabilité** : Logs détaillés des tentatives d'accès

## Notes techniques

- La vérification se fait à chaque requête (pas de cache)
- Les utilisateurs non trouvés sont redirigés vers la connexion
- Les erreurs sont gérées gracieusement avec des messages clairs
- Compatible avec la structure existante de la base de données
- Middleware réutilisable pour d'autres routes si nécessaire

## Tests recommandés

1. **Test avec plan Basique** : Vérifier la redirection vers `upgrade-required`
2. **Test avec plan Premium** : Vérifier la redirection vers `upgrade-required`
3. **Test avec plan Enterprise** : Vérifier l'accès autorisé
4. **Test API** : Vérifier les codes de retour 403 pour les plans insuffisants
5. **Test utilisateur inexistant** : Vérifier la redirection vers `/auth/login`
6. **Test route setup-enterprise** : Vérifier qu'elle reste accessible
