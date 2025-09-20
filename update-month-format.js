const fs = require('fs');
const path = require('path');

// Fonction pour convertir les mois en format français
function convertMonthFormat(text) {
    const monthMap = {
        'Jan': 'janvier',
        'Fév': 'février', 
        'Mar': 'mars',
        'Avr': 'avril',
        'Mai': 'mai',
        'Juin': 'juin',
        'Juil': 'juillet',
        'Août': 'août',
        'Sep': 'septembre',
        'Oct': 'octobre',
        'Nov': 'novembre',
        'Déc': 'décembre'
    };
    
    let result = text;
    Object.keys(monthMap).forEach(shortMonth => {
        const regex = new RegExp(`"${shortMonth} 2024"`, 'g');
        result = result.replace(regex, `"${monthMap[shortMonth]} 2024"`);
    });
    
    return result;
}

// Lire le fichier de route
const routePath = path.join(__dirname, 'routes', 'rapports.js');
let content = fs.readFileSync(routePath, 'utf8');

// Convertir le format des mois
content = convertMonthFormat(content);

// Écrire le fichier mis à jour
fs.writeFileSync(routePath, content, 'utf8');

console.log('✅ Format des mois mis à jour dans routes/rapports.js');
console.log('📅 Tous les mois sont maintenant au format "mois année" en français');
