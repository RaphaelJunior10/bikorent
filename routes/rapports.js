const express = require('express');
const router = express.Router();
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');
const billingService = require('../services/billingService');
const { checkPagePermissions, checkAdvancedReportsAccess } = require('../middleware/billingMiddleware');

// Données des rapports (structure JSON facilement modifiable - fallback)
const rapportsDataFallback = {
    proprietaire: {
        proprietes: [
            {
                nom: "Appartement T3 - Rue de la Paix",
                type: "appartement",
                loyer: 600,
                locataire: "Marie Dubois",
                paiements: {
                    "janvier 2019": { paye: true, montant: 600 },
                    "février 2019": { paye: true, montant: 600 },
                    "mars 2019": { paye: true, montant: 600 },
                    "avril 2019": { paye: true, montant: 600 },
                    "mai 2019": { paye: true, montant: 600 },
                    "juin 2019": { paye: true, montant: 600 },
                    "juillet 2019": { paye: true, montant: 600 },
                    "août 2019": { paye: true, montant: 600 },
                    "septembre 2019": { paye: true, montant: 600 },
                    "octobre 2019": { paye: true, montant: 600 },
                    "novembre 2019": { paye: true, montant: 600 },
                    "décembre 2019": { paye: true, montant: 600 },
                    "janvier 2020": { paye: true, montant: 600 },
                    "février 2020": { paye: true, montant: 600 },
                    "mars 2020": { paye: true, montant: 600 },
                    "avril 2020": { paye: true, montant: 600 },
                    "mai 2020": { paye: true, montant: 600 },
                    "juin 2020": { paye: true, montant: 600 },
                    "juillet 2020": { paye: true, montant: 600 },
                    "août 2020": { paye: true, montant: 600 },
                    "septembre 2020": { paye: true, montant: 600 },
                    "octobre 2020": { paye: true, montant: 600 },
                    "novembre 2020": { paye: true, montant: 600 },
                    "décembre 2020": { paye: true, montant: 600 },
                    "janvier 2021": { paye: true, montant: 600 },
                    "février 2021": { paye: true, montant: 600 },
                    "mars 2021": { paye: true, montant: 600 },
                    "avril 2021": { paye: true, montant: 600 },
                    "mai 2021": { paye: true, montant: 600 },
                    "juin 2021": { paye: true, montant: 600 },
                    "juillet 2021": { paye: true, montant: 600 },
                    "août 2021": { paye: true, montant: 600 },
                    "septembre 2021": { paye: true, montant: 600 },
                    "octobre 2021": { paye: true, montant: 600 },
                    "novembre 2021": { paye: true, montant: 600 },
                    "décembre 2021": { paye: true, montant: 600 },
                    "janvier 2022": { paye: true, montant: 600 },
                    "février 2022": { paye: true, montant: 600 },
                    "mars 2022": { paye: true, montant: 600 },
                    "avril 2022": { paye: true, montant: 600 },
                    "mai 2022": { paye: true, montant: 600 },
                    "juin 2022": { paye: true, montant: 600 },
                    "juillet 2022": { paye: true, montant: 600 },
                    "août 2022": { paye: true, montant: 600 },
                    "septembre 2022": { paye: true, montant: 600 },
                    "octobre 2022": { paye: true, montant: 600 },
                    "novembre 2022": { paye: true, montant: 600 },
                    "décembre 2022": { paye: true, montant: 600 },
                    "janvier 2023": { paye: true, montant: 600 },
                    "février 2023": { paye: true, montant: 600 },
                    "mars 2023": { paye: true, montant: 600 },
                    "avril 2023": { paye: false, montant: 600 },
                    "mai 2023": { paye: true, montant: 600 },
                    "juin 2023": { paye: true, montant: 600 },
                    "juillet 2023": { paye: true, montant: 600 },
                    "août 2023": { paye: true, montant: 600 },
                    "septembre 2023": { paye: true, montant: 600 },
                    "octobre 2023": { paye: true, montant: 600 },
                    "novembre 2023": { paye: true, montant: 600 },
                    "décembre 2023": { paye: true, montant: 600 },
                    "janvier 2024": { paye: true, montant: 600 },
                    "février 2024": { paye: false, montant: 600 },
                    "mars 2024": { paye: false, montant: 600 },
                    "avril 2024": { paye: false, montant: 600 },
                    "mai 2024": { paye: true, montant: 600 },
                    "juin 2024": { paye: true, montant: 600 },
                    "juillet 2024": { paye: true, montant: 600 },
                    "août 2024": { paye: true, montant: 600 },
                    "septembre 2024": { paye: true, montant: 600 },
                    "octobre 2024": { paye: true, montant: 600 },
                    "novembre 2024": { paye: true, montant: 600 },
                    "décembre 2024": { paye: true, montant: 600 },
                    "janvier 2025": { paye: true, montant: 600 },
                    "février 2025": { paye: true, montant: 600 },
                    "mars 2025": { paye: true, montant: 600 },
                    "avril 2025": { paye: true, montant: 600 },
                    "mai 2025": { paye: true, montant: 600 },
                    "juin 2025": { paye: true, montant: 600 },
                    "juillet 2025": { paye: true, montant: 600 },
                    "août 2025": { paye: true, montant: 600 },
                    "septembre 2025": { paye: true, montant: 600 },
                    "octobre 2025": { paye: true, montant: 600 },
                    "novembre 2025": { paye: true, montant: 600 },
                    "décembre 2025": { paye: true, montant: 600 },
                    "janvier 2026": { paye: true, montant: 600 },
                    "février 2026": { paye: true, montant: 600 },
                    "mars 2026": { paye: true, montant: 600 },
                    "avril 2026": { paye: true, montant: 600 },
                    "mai 2026": { paye: true, montant: 600 },
                    "juin 2026": { paye: true, montant: 600 },
                    "juillet 2026": { paye: true, montant: 600 },
                    "août 2026": { paye: true, montant: 600 },
                    "septembre 2026": { paye: true, montant: 600 },
                    "octobre 2026": { paye: true, montant: 600 },
                    "novembre 2026": { paye: true, montant: 600 },
                    "décembre 2026": { paye: true, montant: 600 }
                }
            },
            {
                nom: "Studio - Avenue Victor Hugo",
                type: "studio",
                loyer: 650,
                locataire: "Jean Martin",
                paiements: {
                    "janvier 2019": { paye: true, montant: 650 },
                    "février 2019": { paye: true, montant: 650 },
                    "mars 2019": { paye: true, montant: 650 },
                    "avril 2019": { paye: true, montant: 650 },
                    "mai 2019": { paye: true, montant: 650 },
                    "juin 2019": { paye: true, montant: 650 },
                    "juillet 2019": { paye: true, montant: 650 },
                    "août 2019": { paye: true, montant: 650 },
                    "septembre 2019": { paye: true, montant: 650 },
                    "octobre 2019": { paye: true, montant: 650 },
                    "novembre 2019": { paye: true, montant: 650 },
                    "décembre 2019": { paye: true, montant: 650 },
                    "janvier 2020": { paye: true, montant: 650 },
                    "février 2020": { paye: true, montant: 650 },
                    "mars 2020": { paye: true, montant: 650 },
                    "avril 2020": { paye: true, montant: 650 },
                    "mai 2020": { paye: true, montant: 650 },
                    "juin 2020": { paye: true, montant: 650 },
                    "juillet 2020": { paye: true, montant: 650 },
                    "août 2020": { paye: true, montant: 650 },
                    "septembre 2020": { paye: true, montant: 650 },
                    "octobre 2020": { paye: true, montant: 650 },
                    "novembre 2020": { paye: true, montant: 650 },
                    "décembre 2020": { paye: true, montant: 650 },
                    "janvier 2021": { paye: true, montant: 650 },
                    "février 2021": { paye: true, montant: 650 },
                    "mars 2021": { paye: true, montant: 650 },
                    "avril 2021": { paye: true, montant: 650 },
                    "mai 2021": { paye: true, montant: 650 },
                    "juin 2021": { paye: true, montant: 650 },
                    "juillet 2021": { paye: true, montant: 650 },
                    "août 2021": { paye: true, montant: 650 },
                    "septembre 2021": { paye: true, montant: 650 },
                    "octobre 2021": { paye: true, montant: 650 },
                    "novembre 2021": { paye: true, montant: 650 },
                    "décembre 2021": { paye: true, montant: 650 },
                    "janvier 2022": { paye: true, montant: 650 },
                    "février 2022": { paye: true, montant: 650 },
                    "mars 2022": { paye: true, montant: 650 },
                    "avril 2022": { paye: true, montant: 650 },
                    "mai 2022": { paye: true, montant: 650 },
                    "juin 2022": { paye: true, montant: 650 },
                    "juillet 2022": { paye: true, montant: 650 },
                    "août 2022": { paye: true, montant: 650 },
                    "septembre 2022": { paye: true, montant: 650 },
                    "octobre 2022": { paye: true, montant: 650 },
                    "novembre 2022": { paye: true, montant: 650 },
                    "décembre 2022": { paye: true, montant: 650 },
                    "janvier 2023": { paye: true, montant: 650 },
                    "février 2023": { paye: true, montant: 650 },
                    "mars 2023": { paye: true, montant: 650 },
                    "avril 2023": { paye: true, montant: 650 },
                    "mai 2023": { paye: true, montant: 650 },
                    "juin 2023": { paye: true, montant: 650 },
                    "juillet 2023": { paye: true, montant: 650 },
                    "août 2023": { paye: true, montant: 650 },
                    "septembre 2023": { paye: true, montant: 650 },
                    "octobre 2023": { paye: true, montant: 650 },
                    "novembre 2023": { paye: true, montant: 650 },
                    "décembre 2023": { paye: true, montant: 650 },
                    "janvier 2024": { paye: true, montant: 650 },
                    "février 2024": { paye: true, montant: 650 },
                    "mars 2024": { paye: true, montant: 650 },
                    "avril 2024": { paye: true, montant: 650 },
                    "mai 2024": { paye: true, montant: 650 },
                    "juin 2024": { paye: true, montant: 650 },
                    "juillet 2024": { paye: true, montant: 650 },
                    "août 2024": { paye: true, montant: 650 },
                    "septembre 2024": { paye: true, montant: 650 },
                    "octobre 2024": { paye: true, montant: 650 },
                    "novembre 2024": { paye: true, montant: 650 },
                    "décembre 2024": { paye: true, montant: 650 },
                    "janvier 2025": { paye: true, montant: 650 },
                    "février 2025": { paye: true, montant: 650 },
                    "mars 2025": { paye: true, montant: 650 },
                    "avril 2025": { paye: true, montant: 650 },
                    "mai 2025": { paye: true, montant: 650 },
                    "juin 2025": { paye: true, montant: 650 },
                    "juillet 2025": { paye: true, montant: 650 },
                    "août 2025": { paye: true, montant: 650 },
                    "septembre 2025": { paye: true, montant: 650 },
                    "octobre 2025": { paye: true, montant: 650 },
                    "novembre 2025": { paye: true, montant: 650 },
                    "décembre 2025": { paye: true, montant: 650 },
                    "janvier 2026": { paye: true, montant: 650 },
                    "février 2026": { paye: true, montant: 650 },
                    "mars 2026": { paye: true, montant: 650 },
                    "avril 2026": { paye: true, montant: 650 },
                    "mai 2026": { paye: true, montant: 650 },
                    "juin 2026": { paye: true, montant: 650 },
                    "juillet 2026": { paye: true, montant: 650 },
                    "août 2026": { paye: true, montant: 650 },
                    "septembre 2026": { paye: true, montant: 650 },
                    "octobre 2026": { paye: true, montant: 650 },
                    "novembre 2026": { paye: true, montant: 650 },
                    "décembre 2026": { paye: true, montant: 650 }
                }
            },
            {
                nom: "Maison T4 - Boulevard Central",
                type: "maison",
                loyer: 900,
                locataire: "Sophie Bernard",
                paiements: {
                    "janvier 2019": { paye: true, montant: 900 },
                    "février 2019": { paye: true, montant: 900 },
                    "mars 2019": { paye: true, montant: 900 },
                    "avril 2019": { paye: true, montant: 900 },
                    "mai 2019": { paye: true, montant: 900 },
                    "juin 2019": { paye: true, montant: 900 },
                    "juillet 2019": { paye: true, montant: 900 },
                    "août 2019": { paye: true, montant: 900 },
                    "septembre 2019": { paye: true, montant: 900 },
                    "octobre 2019": { paye: true, montant: 900 },
                    "novembre 2019": { paye: true, montant: 900 },
                    "décembre 2019": { paye: true, montant: 900 },
                    "janvier 2020": { paye: true, montant: 900 },
                    "février 2020": { paye: true, montant: 900 },
                    "mars 2020": { paye: true, montant: 900 },
                    "avril 2020": { paye: true, montant: 900 },
                    "mai 2020": { paye: true, montant: 900 },
                    "juin 2020": { paye: true, montant: 900 },
                    "juillet 2020": { paye: true, montant: 900 },
                    "août 2020": { paye: true, montant: 900 },
                    "septembre 2020": { paye: true, montant: 900 },
                    "octobre 2020": { paye: true, montant: 900 },
                    "novembre 2020": { paye: true, montant: 900 },
                    "décembre 2020": { paye: true, montant: 900 },
                    "janvier 2021": { paye: true, montant: 900 },
                    "février 2021": { paye: true, montant: 900 },
                    "mars 2021": { paye: true, montant: 900 },
                    "avril 2021": { paye: true, montant: 900 },
                    "mai 2021": { paye: true, montant: 900 },
                    "juin 2021": { paye: true, montant: 900 },
                    "juillet 2021": { paye: true, montant: 900 },
                    "août 2021": { paye: true, montant: 900 },
                    "septembre 2021": { paye: true, montant: 900 },
                    "octobre 2021": { paye: true, montant: 900 },
                    "novembre 2021": { paye: true, montant: 900 },
                    "décembre 2021": { paye: true, montant: 900 },
                    "janvier 2022": { paye: true, montant: 900 },
                    "février 2022": { paye: true, montant: 900 },
                    "mars 2022": { paye: true, montant: 900 },
                    "avril 2022": { paye: true, montant: 900 },
                    "mai 2022": { paye: true, montant: 900 },
                    "juin 2022": { paye: true, montant: 900 },
                    "juillet 2022": { paye: true, montant: 900 },
                    "août 2022": { paye: true, montant: 900 },
                    "septembre 2022": { paye: true, montant: 900 },
                    "octobre 2022": { paye: true, montant: 900 },
                    "novembre 2022": { paye: true, montant: 900 },
                    "décembre 2022": { paye: true, montant: 900 },
                    "janvier 2023": { paye: true, montant: 900 },
                    "février 2023": { paye: true, montant: 900 },
                    "mars 2023": { paye: false, montant: 900 },
                    "avril 2023": { paye: false, montant: 900 },
                    "mai 2023": { paye: false, montant: 900 },
                    "juin 2023": { paye: true, montant: 900 },
                    "juillet 2023": { paye: true, montant: 900 },
                    "août 2023": { paye: true, montant: 900 },
                    "septembre 2023": { paye: true, montant: 900 },
                    "octobre 2023": { paye: true, montant: 900 },
                    "novembre 2023": { paye: true, montant: 900 },
                    "décembre 2023": { paye: true, montant: 900 },
                    "janvier 2024": { paye: true, montant: 900 },
                    "février 2024": { paye: true, montant: 900 },
                    "mars 2024": { paye: false, montant: 900 },
                    "avril 2024": { paye: false, montant: 900 },
                    "mai 2024": { paye: false, montant: 900 },
                    "juin 2024": { paye: true, montant: 900 },
                    "juillet 2024": { paye: true, montant: 900 },
                    "août 2024": { paye: true, montant: 900 },
                    "septembre 2024": { paye: true, montant: 900 },
                    "octobre 2024": { paye: true, montant: 900 },
                    "novembre 2024": { paye: true, montant: 900 },
                    "décembre 2024": { paye: true, montant: 900 },
                    "janvier 2025": { paye: true, montant: 900 },
                    "février 2025": { paye: true, montant: 900 },
                    "mars 2025": { paye: true, montant: 900 },
                    "avril 2025": { paye: true, montant: 900 },
                    "mai 2025": { paye: true, montant: 900 },
                    "juin 2025": { paye: true, montant: 900 },
                    "juillet 2025": { paye: true, montant: 900 },
                    "août 2025": { paye: true, montant: 900 },
                    "septembre 2025": { paye: true, montant: 900 },
                    "octobre 2025": { paye: true, montant: 900 },
                    "novembre 2025": { paye: true, montant: 900 },
                    "décembre 2025": { paye: true, montant: 900 },
                    "janvier 2026": { paye: true, montant: 900 },
                    "février 2026": { paye: true, montant: 900 },
                    "mars 2026": { paye: true, montant: 900 },
                    "avril 2026": { paye: true, montant: 900 },
                    "mai 2026": { paye: true, montant: 900 },
                    "juin 2026": { paye: true, montant: 900 },
                    "juillet 2026": { paye: true, montant: 900 },
                    "août 2026": { paye: true, montant: 900 },
                    "septembre 2026": { paye: true, montant: 900 },
                    "octobre 2026": { paye: true, montant: 900 },
                    "novembre 2026": { paye: true, montant: 900 },
                    "décembre 2026": { paye: true, montant: 900 }
                }
            },
            {
                nom: "Appartement T2 - Rue des Fleurs",
                type: "appartement",
                loyer: 550,
                locataire: "Pierre Durand",
                paiements: {
                    "janvier 2019": { paye: true, montant: 550 },
                    "février 2019": { paye: true, montant: 550 },
                    "mars 2019": { paye: true, montant: 550 },
                    "avril 2019": { paye: true, montant: 550 },
                    "mai 2019": { paye: true, montant: 550 },
                    "juin 2019": { paye: true, montant: 550 },
                    "juillet 2019": { paye: true, montant: 550 },
                    "août 2019": { paye: true, montant: 550 },
                    "septembre 2019": { paye: true, montant: 550 },
                    "octobre 2019": { paye: true, montant: 550 },
                    "novembre 2019": { paye: true, montant: 550 },
                    "décembre 2019": { paye: true, montant: 550 },
                    "janvier 2020": { paye: true, montant: 550 },
                    "février 2020": { paye: true, montant: 550 },
                    "mars 2020": { paye: true, montant: 550 },
                    "avril 2020": { paye: true, montant: 550 },
                    "mai 2020": { paye: true, montant: 550 },
                    "juin 2020": { paye: true, montant: 550 },
                    "juillet 2020": { paye: true, montant: 550 },
                    "août 2020": { paye: true, montant: 550 },
                    "septembre 2020": { paye: true, montant: 550 },
                    "octobre 2020": { paye: true, montant: 550 },
                    "novembre 2020": { paye: true, montant: 550 },
                    "décembre 2020": { paye: true, montant: 550 },
                    "janvier 2021": { paye: true, montant: 550 },
                    "février 2021": { paye: true, montant: 550 },
                    "mars 2021": { paye: true, montant: 550 },
                    "avril 2021": { paye: true, montant: 550 },
                    "mai 2021": { paye: true, montant: 550 },
                    "juin 2021": { paye: true, montant: 550 },
                    "juillet 2021": { paye: true, montant: 550 },
                    "août 2021": { paye: true, montant: 550 },
                    "septembre 2021": { paye: true, montant: 550 },
                    "octobre 2021": { paye: true, montant: 550 },
                    "novembre 2021": { paye: true, montant: 550 },
                    "décembre 2021": { paye: true, montant: 550 },
                    "janvier 2022": { paye: true, montant: 550 },
                    "février 2022": { paye: true, montant: 550 },
                    "mars 2022": { paye: true, montant: 550 },
                    "avril 2022": { paye: true, montant: 550 },
                    "mai 2022": { paye: true, montant: 550 },
                    "juin 2022": { paye: true, montant: 550 },
                    "juillet 2022": { paye: true, montant: 550 },
                    "août 2022": { paye: true, montant: 550 },
                    "septembre 2022": { paye: true, montant: 550 },
                    "octobre 2022": { paye: true, montant: 550 },
                    "novembre 2022": { paye: true, montant: 550 },
                    "décembre 2022": { paye: true, montant: 550 },
                    "janvier 2023": { paye: true, montant: 550 },
                    "février 2023": { paye: true, montant: 550 },
                    "mars 2023": { paye: true, montant: 550 },
                    "avril 2023": { paye: true, montant: 550 },
                    "mai 2023": { paye: true, montant: 550 },
                    "juin 2023": { paye: true, montant: 550 },
                    "juillet 2023": { paye: true, montant: 550 },
                    "août 2023": { paye: true, montant: 550 },
                    "septembre 2023": { paye: true, montant: 550 },
                    "octobre 2023": { paye: true, montant: 550 },
                    "novembre 2023": { paye: true, montant: 550 },
                    "décembre 2023": { paye: true, montant: 550 },
                    "janvier 2024": { paye: true, montant: 550 },
                    "février 2024": { paye: true, montant: 550 },
                    "mars 2024": { paye: true, montant: 550 },
                    "avril 2024": { paye: true, montant: 550 },
                    "mai 2024": { paye: true, montant: 550 },
                    "juin 2024": { paye: true, montant: 550 },
                    "juillet 2024": { paye: true, montant: 550 },
                    "août 2024": { paye: true, montant: 550 },
                    "septembre 2024": { paye: true, montant: 550 },
                    "octobre 2024": { paye: true, montant: 550 },
                    "novembre 2024": { paye: true, montant: 550 },
                    "décembre 2024": { paye: true, montant: 550 },
                    "janvier 2025": { paye: true, montant: 550 },
                    "février 2025": { paye: true, montant: 550 },
                    "mars 2025": { paye: true, montant: 550 },
                    "avril 2025": { paye: true, montant: 550 },
                    "mai 2025": { paye: true, montant: 550 },
                    "juin 2025": { paye: true, montant: 550 },
                    "juillet 2025": { paye: true, montant: 550 },
                    "août 2025": { paye: true, montant: 550 },
                    "septembre 2025": { paye: true, montant: 550 },
                    "octobre 2025": { paye: true, montant: 550 },
                    "novembre 2025": { paye: true, montant: 550 },
                    "décembre 2025": { paye: true, montant: 550 },
                    "janvier 2026": { paye: true, montant: 550 },
                    "février 2026": { paye: true, montant: 550 },
                    "mars 2026": { paye: true, montant: 550 },
                    "avril 2026": { paye: true, montant: 550 },
                    "mai 2026": { paye: true, montant: 550 },
                    "juin 2026": { paye: true, montant: 550 },
                    "juillet 2026": { paye: true, montant: 550 },
                    "août 2026": { paye: true, montant: 550 },
                    "septembre 2026": { paye: true, montant: 550 },
                    "octobre 2026": { paye: true, montant: 550 },
                    "novembre 2026": { paye: true, montant: 550 },
                    "décembre 2026": { paye: true, montant: 550 }
                }
            }
        ],
        stats: {
            revenusTotaux: 27000,
            tauxOccupation: 100,
            proprietesActives: 4,
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
            },
            {
                nom: "Studio - Avenue Victor Hugo",
                loyer: 650,
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
            depensesTotales: 15000,
            proprietesLouees: 2,
            paiementsAJour: 1,
            economies: 500
        }
    }
};

// Page des rapports
router.get('/', checkPagePermissions, async (req, res) => {
    let ownerId = req.session.user.id; // ID du propriétaire connecté
    
    // Initialiser les données par défaut
    let rapportsData = rapportsDataFallback;
    
    console.log('🔧 Configuration Firebase:', {
        isFirebaseEnabled: isFirebaseEnabled(),
        isInitialized: firestoreUtils.isInitialized()
    });
    
    // Récupération des données depuis Firebase si activé
    if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
        try {
            // Récupérer toutes les propriétés du propriétaire
            /*const firebaseProperties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                { type: 'where', field: 'ownerId', operator: '==', value: ownerId }
            ]);*/

            const firebasePropertiesAll = await firestoreUtils.query(COLLECTIONS.PROPERTIES);
            const firebaseProperties = firebasePropertiesAll.filter(p => {
                const isOwner = p.ownerId === ownerId;
                const isTenant = p.tenant && p.tenant.userId === ownerId;
                return isOwner || isTenant;
            });
            
            // Récupérer tous les utilisateurs (locataires)
            const firebaseUsers = await firestoreUtils.getAll(COLLECTIONS.USERS);
            
            // Récupérer tous les paiements
            const firebasePayments = await firestoreUtils.getAll(COLLECTIONS.PAYMENTS);
            
            console.log(`📊 Données récupérées pour les rapports: ${firebaseProperties.length} propriétés, ${firebaseUsers.length} utilisateurs, ${firebasePayments.length} paiements`);
            
            // Transformer les données Firebase en format attendu par l'interface
            const proprietes = [];
            const locataireProprietes = [];
            let revenusTotaux = 0;
            let proprietesActives = 0;
            
            // Traiter chaque propriété pour construire les données de rapport
            firebaseProperties.forEach(property => {
                if (property.tenant && property.tenant.userId) {
                    // Trouver l'utilisateur correspondant
                    const user = firebaseUsers.find(u => u.id === property.tenant.userId);
                    if (user) {
                        console.log(`📈 Traitement des rapports pour: ${user.profile.firstName} ${user.profile.lastName}`);
                        
                        // Trouver les paiements de ce locataire
                        const userPayments = firebasePayments.filter(p => p.userId === user.id && p.propertyId === property.id && new Date(p.date) >= new Date(property.tenant.entryDate));
                        
                        
                        // Générer les données de paiement pour cette propriété
                        const paiements = generatePaiementsRapport(userPayments, property.monthlyRent);
                        
                        // Calculer les revenus totaux
                        const revenusPropriete = userPayments
                            .filter(p => p.status === 'paid' && p.propertyId === property.id && p.userId !== ownerId)
                            .reduce((sum, p) => sum + p.amount, 0);
                        revenusTotaux += revenusPropriete;
                        
                        
                        // Ajouter aux propriétés du propriétaire
                        if (user.id !== ownerId) { 
                            proprietesActives++;
                            proprietes.push({
                                nom: property.name,
                                type: property.type || 'appartement',
                                loyer: property.monthlyRent,
                                locataire: `${user.profile.firstName} ${user.profile.lastName}`,
                                paiements: paiements
                            });
                        }else{
                            // Ajouter aux propriétés du locataire (si c'est le locataire connecté)
                            // À adapter selon la logique d'authentification
                            locataireProprietes.push({
                                nom: property.name,
                                loyer: property.monthlyRent,
                                paiements: paiements
                            });
                            
                        }
                    }
                }
            });

            console.log('locataireProprietes', locataireProprietes);
            
            
            // Calculer les statistiques
            const firebaseUserProperties = firebaseProperties.filter(p => p.ownerId === ownerId);
            const tauxOccupation = proprietesActives > 0 ? Math.round((proprietesActives / firebaseUserProperties.length) * 100) : 0;
            const croissance = 15; // À calculer selon la logique métier
            
            const statsProprietaire = {
                revenusTotaux: revenusTotaux,
                tauxOccupation: tauxOccupation,
                proprietesActives: proprietesActives,
                croissance: croissance
            };
            
            // Calculer les statistiques locataire
            //const depensesTotales = locataireProprietes.reduce((sum, p) => sum + p.loyer, 0);
            let depensesTotales = 0;
            locataireProprietes.forEach(p => {
                //console.log('p', p);
                for(const month in p.paiements) {
                    console.log('paiement ' + month, p.paiements[month]);
                    depensesTotales += p.paiements[month].montant;
                }
            });
            const proprietesLouees = locataireProprietes.length;
            const paiementsAJour = locataireProprietes.filter(p => 
                Object.values(p.paiements).some(paiement => paiement.paye)
            ).length;
            const economies = 500; // À calculer selon la logique métier
            
            const statsLocataire = {
                depensesTotales: depensesTotales,
                proprietesLouees: proprietesLouees,
                paiementsAJour: paiementsAJour,
                economies: economies
            };
            
            // Mettre à jour les données
            rapportsData = {
                proprietaire: {
                    proprietes: proprietes,
                    stats: statsProprietaire
                },
                locataire: {
                    proprietes: locataireProprietes,
                    stats: statsLocataire
                }
            };
            
            console.log(`✅ ${proprietes.length} propriétés traitées pour les rapports du propriétaire ${ownerId}`);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des rapports depuis Firebase:', error);
            console.log('🔄 Utilisation des données statiques par défaut');
            // En cas d'erreur, on garde les données statiques par défaut
        }
    } else {
        console.log('🔄 Firebase désactivé ou non initialisé - utilisation des données statiques');
    }
    
    // S'assurer que les données sont bien structurées
    console.log('📊 Données finales des rapports:', JSON.stringify(rapportsData['locataire'], null, 2));
    
    // Récupérer les permissions de facturation
    const userBillingPlan = await billingService.getUserBillingPlan(req.session.user.id);
    const pagePermissions = req.pagePermissions || {};
    
    res.render('rapports', {
        title: 'Rapports - BikoRent',
        pageTitle: 'Rapports',
        currentPage: 'rapports',
        user: {
            name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Admin',
            role: req.session.user ? req.session.user.role : 'Propriétaire'
        },
        rapportsData: rapportsData,
        userBillingPlan: userBillingPlan,
        pagePermissions: pagePermissions
    });
});

// Route pour les rapports avancés (nécessite un plan supérieur)
router.get('/advanced', checkAdvancedReportsAccess, async (req, res) => {
    try {
        // Récupérer les données avancées
        const userBillingPlan = await billingService.getUserBillingPlan(req.session.user.id);
        const pagePermissions = req.pagePermissions || {};
        
        res.render('rapports-advanced', {
            title: 'Rapports Avancés - BikoRent',
            pageTitle: 'Rapports Avancés',
            currentPage: 'rapports',
            user: {
                name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Admin',
                role: req.session.user ? req.session.user.role : 'Propriétaire'
            },
            userBillingPlan: userBillingPlan,
            pagePermissions: pagePermissions
        });
    } catch (error) {
        console.error('❌ Erreur lors du rendu des rapports avancés:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Fonctions utilitaires pour la génération des données
function generatePaiementsRapport(payments, monthlyRent) {
    const paiements = {};
    
    if (!payments || payments.length === 0) {
        // Si aucun paiement, retourner des données vides
        return paiements;
    }
    
    // Trier les paiements par date
    const sortedPayments = payments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Récupérer le premier et le dernier paiement
    const premierPaiement = sortedPayments[0];
    const dernierPaiement = sortedPayments[sortedPayments.length - 1];
    
    const datePremierPaiement = new Date(premierPaiement.date);
    const dateDernierPaiement = new Date(dernierPaiement.date);
    const today = new Date();
    
    // Utiliser la date la plus récente entre le dernier paiement et aujourd'hui
    const dateFin = dateDernierPaiement > today ? dateDernierPaiement : today;
    
    console.log('📅 Période de paiements:', {
        premier: formatMonthYear(datePremierPaiement),
        dernier: formatMonthYear(dateDernierPaiement),
        fin: formatMonthYear(dateFin)
    });
    
    // Générer tous les mois entre le premier paiement et la date de fin
    let currentDate = new Date(datePremierPaiement.getFullYear(), datePremierPaiement.getMonth(), 1);
    
    while (currentDate <= dateFin) {
        const moisStr = formatMonthYear(currentDate);
        const paiementExistant = payments.filter(p => 
            formatMonthYear(new Date(p.date)) === moisStr
        );
        
        let paye = false;
        let montant = 0;
        
        if (paiementExistant.length > 0) {
            paiementExistant.forEach(p => {
                if(p.status === 'completed' || p.status === 'payé' || p.status === 'paid'){
                    paye = true;
                    montant += p.amount;
                }
            });
        }
        if(paiements[moisStr]) {
            paiements[moisStr].paye = paye == true ? paye : paiements[moisStr].paye;
            paiements[moisStr].montant += montant;
        }else{
            paiements[moisStr] = {
                paye: paye,
                montant: montant
            };
        }
        
        // Passer au mois suivant
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    console.log(`📊 ${Object.keys(paiements).length} mois générés pour les rapports`);
    return paiements;
}

function formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

module.exports = router; 