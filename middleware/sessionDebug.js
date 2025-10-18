/**
 * Middleware de debug pour les sessions
 */

function sessionDebug(req, res, next) {
    // Debug des sessions pour les routes importantes
    if (req.url.includes('/login') || 
        req.url.includes('/dashboard') || 
        req.url.includes('/logout') ||
        req.url.includes('/auth')) {
        
        console.log('🔍 Session Debug:', {
            url: req.url,
            method: req.method,
            sessionID: req.sessionID,
            user: req.session.user ? {
                id: req.session.user.id,
                email: req.session.user.email
            } : null,
            isAuthenticated: !!req.session.user,
            sessionStore: req.sessionStore ? 'Store configuré' : 'Pas de store',
            cookie: req.headers.cookie ? 'Cookie présent' : 'Pas de cookie'
        });
    }
    
    next();
}

module.exports = sessionDebug;
