const express = require('express');
const path = require('path');

// Configuration de test
const app = express();
const PORT = 3001; // Port différent pour éviter les conflits

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route de test pour les rapports
app.get('/test-rapports', (req, res) => {
    // Données de test
    const rapportsData = {
        proprietaire: {
            proprietes: [
                {
                    nom: "Appartement T3 - Rue de la Paix",
                    type: "appartement",
                    loyer: 600,
                    locataire: "Marie Dubois",
                    paiements: {
                        "Jan 2024": { paye: true, montant: 600 },
                        "Fév 2024": { paye: false, montant: 600 },
                        "Mar 2024": { paye: false, montant: 600 },
                        "Avr 2024": { paye: false, montant: 600 },
                        "Mai 2024": { paye: true, montant: 600 },
                        "Juin 2024": { paye: true, montant: 600 },
                        "Juil 2024": { paye: true, montant: 600 },
                        "Août 2024": { paye: true, montant: 600 },
                        "Sep 2024": { paye: true, montant: 600 },
                        "Oct 2024": { paye: true, montant: 600 },
                        "Nov 2024": { paye: true, montant: 600 },
                        "Déc 2024": { paye: true, montant: 600 }
                    }
                },
                {
                    nom: "Studio - Avenue Victor Hugo",
                    type: "studio",
                    loyer: 650,
                    locataire: "Jean Martin",
                    paiements: {
                        "Jan 2024": { paye: true, montant: 650 },
                        "Fév 2024": { paye: true, montant: 650 },
                        "Mar 2024": { paye: true, montant: 650 },
                        "Avr 2024": { paye: false, montant: 650 },
                        "Mai 2024": { paye: true, montant: 650 },
                        "Juin 2024": { paye: true, montant: 650 },
                        "Juil 2024": { paye: true, montant: 650 },
                        "Août 2024": { paye: true, montant: 650 },
                        "Sep 2024": { paye: true, montant: 650 },
                        "Oct 2024": { paye: true, montant: 650 },
                        "Nov 2024": { paye: true, montant: 650 },
                        "Déc 2024": { paye: true, montant: 650 }
                    }
                }
            ],
            stats: {
                revenusTotaux: 12500,
                tauxOccupation: 100,
                proprietesActives: 2,
                croissance: 15
            }
        },
        locataire: {
            proprietes: [
                {
                    nom: "Appartement T3 - Rue de la Paix",
                    loyer: 600,
                    paiements: {
                        "Jan 2024": { paye: true, montant: 600 },
                        "Fév 2024": { paye: true, montant: 600 },
                        "Mar 2024": { paye: false, montant: 600 },
                        "Avr 2024": { paye: false, montant: 600 },
                        "Mai 2024": { paye: true, montant: 600 },
                        "Juin 2024": { paye: true, montant: 600 },
                        "Juil 2024": { paye: true, montant: 600 },
                        "Août 2024": { paye: true, montant: 600 },
                        "Sep 2024": { paye: true, montant: 600 },
                        "Oct 2024": { paye: true, montant: 600 },
                        "Nov 2024": { paye: true, montant: 600 },
                        "Déc 2024": { paye: true, montant: 600 }
                    }
                }
            ],
            stats: {
                depensesTotales: 6000,
                proprietesLouees: 1,
                paiementsAJour: 1,
                economies: 500
            }
        }
    };

    console.log('📊 Données de test préparées:', JSON.stringify(rapportsData, null, 2));

    res.render('rapports', {
        title: 'Test Rapports - BikoRent',
        pageTitle: 'Test Rapports',
        currentPage: 'rapports',
        user: {
            name: 'Test User',
            role: 'Propriétaire'
        },
        rapportsData: rapportsData
    });
});

// Route pour servir le fichier de test HTML
app.get('/test-html', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-rapports.html'));
});

// Route racine
app.get('/', (req, res) => {
    res.send(`
        <h1>🧪 Serveur de Test BikoRent</h1>
        <p>Ce serveur est configuré pour tester les rapports.</p>
        <ul>
            <li><a href="/test-rapports">Test des rapports avec données</a></li>
            <li><a href="/test-html">Page de test HTML</a></li>
        </ul>
    `);
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log(`📊 Test des rapports: http://localhost:${PORT}/test-rapports`);
    console.log(`🧪 Page de test HTML: http://localhost:${PORT}/test-html`);
});
