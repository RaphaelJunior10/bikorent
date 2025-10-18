// Utilitaire pour ajouter automatiquement des événements de calendrier
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Ajouter un événement automatique au calendrier
 */
async function addAutomaticEvent(userId, eventType, propertyId, title, description, eventDate = null) {
    try {
        console.log('📅 Ajout d\'événement automatique:', { userId, eventType, propertyId, title });
        
        const eventData = {
            userId: userId,
            eventType: eventType,
            propertyId: propertyId,
            title: title,
            description: description || '',
            eventDate: eventDate || new Date().toISOString()
        };

        // Appeler l'API interne pour ajouter l'événement
        const response = await axios.post(`${BASE_URL}/calendrier/api/add-automatic-event`, eventData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        if (response.data.success) {
            console.log('✅ Événement automatique ajouté:', response.data.event.id);
            return response.data.event;
        } else {
            console.error('❌ Erreur lors de l\'ajout de l\'événement:', response.data.message);
            return null;
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de l\'événement automatique:', error.message);
        return null;
    }
}

/**
 * Ajouter un événement lors de la création d'une propriété
 */
async function addPropertyCreatedEvent(userId, property) {
    return await addAutomaticEvent(
        userId,
        'custom',
        property.id,
        `Nouvelle propriété ajoutée - ${property.title || property.name}`,
        `Propriété ajoutée: ${property.address || 'Adresse non spécifiée'}. ${property.rent ? `Loyer: ${property.rent} xaf` : ''}`,
        new Date().toISOString()
    );
}

/**
 * Ajouter un événement lors de la suppression d'une propriété
 */
async function addPropertyDeletedEvent(userId, property) {
    return await addAutomaticEvent(
        userId,
        'custom',
        null,
        `Propriété supprimée - ${property.title || property.name}`,
        `Propriété supprimée: ${property.address || 'Adresse non spécifiée'}`,
        new Date().toISOString()
    );
}

/**
 * Ajouter un événement lors de l'ajout d'un locataire
 */
async function addTenantAddedEvent(userId, property, tenant) {
    return await addAutomaticEvent(
        userId,
        'custom',
        property.id,
        `Nouveau locataire - ${property.title || property.name}`,
        `Locataire ajouté: ${tenant.firstName || ''} ${tenant.lastName || ''}. Loyer: ${property.rent || 0} xaf/mois`,
        new Date().toISOString()
    );
}

/**
 * Ajouter un événement lors de la suppression d'un locataire
 */
async function addTenantRemovedEvent(userId, property, tenant) {
    return await addAutomaticEvent(
        userId,
        'custom',
        property.id,
        `Locataire retiré - ${property.title || property.name}`,
        `Locataire retiré: ${tenant.firstName || ''} ${tenant.lastName || ''}. Propriété maintenant vacante.`,
        new Date().toISOString()
    );
}

/**
 * Ajouter un événement lors d'un paiement reçu
 */
async function addPaymentReceivedEvent(userId, property, payment) {
    return await addAutomaticEvent(
        userId,
        'paiement',
        property.id,
        `Paiement reçu - ${property.title || property.name}`,
        `Paiement de ${payment.amount || 0} xaf reçu pour ${property.title || property.name}`,
        new Date().toISOString()
    );
}

/**
 * Ajouter un événement de visite planifiée
 */
async function addScheduledVisitEvent(userId, property, visitDate, visitorInfo) {
    return await addAutomaticEvent(
        userId,
        'visite_planifie',
        property.id,
        `Visite planifiée - ${property.title || property.name}`,
        `Visite prévue par: ${visitorInfo.name || 'Visiteur'}. ${visitorInfo.phone ? `Tél: ${visitorInfo.phone}` : ''}`,
        visitDate
    );
}

/**
 * Ajouter un événement de maintenance
 */
async function addMaintenanceEvent(userId, property, maintenanceDate, description) {
    return await addAutomaticEvent(
        userId,
        'maintenance',
        property.id,
        `Maintenance - ${property.title || property.name}`,
        description || 'Maintenance préventive de la propriété',
        maintenanceDate
    );
}

/**
 * Ajouter un événement d'expiration de bail
 */
async function addLeaseExpirationEvent(userId, property, expirationDate) {
    return await addAutomaticEvent(
        userId,
        'expiration',
        property.id,
        `Expiration de bail - ${property.title || property.name}`,
        `Le bail expire le ${new Date(expirationDate).toLocaleDateString()}. Renouvellement ou départ prévu.`,
        expirationDate
    );
}

module.exports = {
    addAutomaticEvent,
    addPropertyCreatedEvent,
    addPropertyDeletedEvent,
    addTenantAddedEvent,
    addTenantRemovedEvent,
    addPaymentReceivedEvent,
    addScheduledVisitEvent,
    addMaintenanceEvent,
    addLeaseExpirationEvent
};
