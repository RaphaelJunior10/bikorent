const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Configuration des sessions
app.use(session({
    secret: 'bikorent-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/bikorent-sessions',
        touchAfter: 24 * 3600
    }),
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware pour parser les données
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/test-session', (req, res) => {
    res.json({
        sessionId: req.sessionID,
        session: req.session,
        hasUser: !!req.session.user
    });
});

// Route pour créer une session
app.post('/test-session', (req, res) => {
    req.session.user = {
        id: 'test123',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User'
    };
    
    res.json({
        success: true,
        message: 'Session créée',
        sessionId: req.sessionID
    });
});

// Route pour détruire une session
app.delete('/test-session', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la destruction de la session' });
        }
        res.json({ success: true, message: 'Session détruite' });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🧪 Serveur de test des sessions démarré sur http://localhost:${PORT}`);
    console.log('📋 Endpoints disponibles:');
    console.log(`   GET  http://localhost:${PORT}/test-session - Vérifier la session`);
    console.log(`   POST http://localhost:${PORT}/test-session - Créer une session`);
    console.log(`   DELETE http://localhost:${PORT}/test-session - Détruire une session`);
});
