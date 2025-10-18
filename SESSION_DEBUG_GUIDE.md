# 🔧 Guide de Debug des Sessions

## 🚨 **Problème identifié**

Les sessions sont créées mais ne persistent pas, rendant les pages internes inaccessibles.

## 🔍 **Diagnostic**

### **1. Vérifier la configuration des sessions**

```bash
# Tester les sessions MongoDB
npm run test:sessions
```

### **2. Logs de debug**

Le serveur affiche maintenant des logs détaillés :

```
🔍 Session Debug: {
  url: '/login',
  method: 'POST',
  sessionID: 'abc123...',
  user: { id: 'user123', email: 'user@example.com' },
  isAuthenticated: true,
  sessionStore: 'Store configuré',
  cookie: 'Cookie présent'
}
```

### **3. Vérifier MongoDB**

```bash
# Connexion MongoDB
mongo bikorent-sessions

# Vérifier les sessions
db.sessions.find().pretty()
db.sessions.countDocuments()
```

## 🛠️ **Solutions**

### **Solution 1 : Vérifier la configuration MongoDB**

```javascript
// Dans server.js - Configuration actuelle
sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bikorent-sessions',
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60 * 1000,
    autoIndex: false,
    collectionName: 'sessions'
});
```

### **Solution 2 : Variables d'environnement**

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/bikorent-sessions
SESSION_SECRET=your-very-strong-secret-key
NODE_ENV=development
```

### **Solution 3 : Configuration des cookies**

```javascript
// Vérifier que les cookies sont correctement configurés
cookie: {
    secure: false, // true seulement en HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    httpOnly: true, // Sécurité
    sameSite: 'lax' // Protection CSRF
}
```

## 🔧 **Debug étape par étape**

### **Étape 1 : Vérifier la connexion MongoDB**

```bash
# Démarrer MongoDB
sudo systemctl start mongod

# Tester la connexion
mongo --eval "db.adminCommand('ping')"
```

### **Étape 2 : Tester les sessions**

```bash
# Exécuter le test des sessions
npm run test:sessions
```

### **Étape 3 : Vérifier les logs du serveur**

```bash
# Démarrer le serveur et observer les logs
npm start
```

### **Étape 4 : Tester la connexion**

1. **Se connecter** sur `/login`
2. **Observer les logs** de debug
3. **Naviguer** vers `/dashboard`
4. **Vérifier** que la session persiste

## 📊 **Logs attendus**

### **Connexion réussie :**

```
🔧 Configuration des sessions avec connect-mongo et MongoDB
🔍 Session Debug: {
  url: '/login',
  method: 'POST',
  sessionID: 'abc123...',
  user: { id: 'user123', email: 'user@example.com' },
  isAuthenticated: true,
  sessionStore: 'Store configuré',
  cookie: 'Cookie présent'
}
```

### **Problème de session :**

```
⚠️ Erreur MongoDB, utilisation du store en mémoire
🔍 Session Debug: {
  url: '/dashboard',
  method: 'GET',
  sessionID: 'abc123...',
  user: null,
  isAuthenticated: false,
  sessionStore: 'Pas de store',
  cookie: 'Cookie présent'
}
```

## 🎯 **Solutions spécifiques**

### **Si MongoDB n'est pas accessible :**

```bash
# Installer MongoDB
sudo apt-get install mongodb

# Démarrer MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **Si les sessions ne persistent pas :**

1. **Vérifier les cookies** dans le navigateur
2. **Vérifier la configuration** des cookies
3. **Tester avec un autre navigateur**
4. **Vérifier les logs** de debug

### **Si les sessions sont créées mais perdues :**

1. **Vérifier MongoDB** : `db.sessions.find()`
2. **Vérifier les index** : `db.sessions.getIndexes()`
3. **Vérifier le TTL** : Les sessions expirent automatiquement

## 🔒 **Sécurité des sessions**

### **Configuration recommandée :**

```javascript
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'bikorent-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
};
```

## 📋 **Checklist de résolution**

- [ ] MongoDB installé et démarré
- [ ] Variables d'environnement configurées
- [ ] Connexion MongoDB testée
- [ ] Sessions MongoDB vérifiées
- [ ] Logs de debug activés
- [ ] Cookies correctement configurés
- [ ] Test de connexion effectué
- [ ] Navigation entre pages testée

## 🚀 **Test final**

1. **Démarrer le serveur** : `npm start`
2. **Se connecter** : Aller sur `/login`
3. **Vérifier les logs** : Session créée
4. **Naviguer** : Aller sur `/dashboard`
5. **Vérifier** : Page accessible sans reconnexion

Si tout fonctionne, vous devriez voir :

```
🔧 Configuration des sessions avec connect-mongo et MongoDB
🔍 Session Debug: { user: 'Connecté', sessionStore: 'MongoDB' }
```
