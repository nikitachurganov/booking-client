/**
 * @typedef {'available' | 'noSlots' | 'moderation' | 'restricted' | 'documents' | 'unavailable'} BookingObjectCatalogStatus
 */

/**
 * @typedef {Object} BookingSlot
 * @property {string} date
 * @property {string} start
 * @property {string} end
 * @property {boolean} available
 */

/**
 * @typedef {Object} BookingObject
 * @property {string} id
 * @property {string} title
 * @property {string} type
 * @property {string} category
 * @property {string} imageUrl
 * @property {string} description
 * @property {string} location
 * @property {string} room
 * @property {string} department
 * @property {string[]} services
 * @property {string[]} assets
 * @property {string[]} documents
 * @property {BookingSlot[]} slots
 * @property {boolean} requiresDocuments
 * @property {boolean} requiresInstruction
 * @property {boolean} moderationRequired
 * @property {boolean} restrictedAccess
 * @property {boolean} requiresCheckIn
 * @property {boolean} requiresCheckOut
 * @property {boolean} collectiveBooking
 * @property {string} contactPerson
 * @property {string} moderator
 * @property {number} subAssetsCount
 */

/**
 * @typedef {Object} BookingObjectsFilters
 * @property {string} search
 * @property {string | undefined} date
 * @property {string | undefined} time
 * @property {number} duration
 * @property {string | undefined} category
 * @property {string | undefined} type
 * @property {string | undefined} location
 * @property {string | undefined} service
 * @property {BookingObjectCatalogStatus | undefined} availability
 * @property {boolean} onlyAvailable
 * @property {boolean} hasRequiredDocuments
 * @property {boolean} requiresInstruction
 * @property {boolean} requiresModeration
 * @property {boolean} requiresCheckIn
 * @property {boolean} requiresCheckOut
 * @property {boolean} collectiveBooking
 * @property {boolean} withSubAssets
 * @property {'availableFirst' | 'nearestSlot' | 'title'} sort
 */

export const bookingObjectCatalogStatuses = [
  'available',
  'noSlots',
  'moderation',
  'restricted',
  'documents',
  'unavailable',
];
