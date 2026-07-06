/**
 * @typedef {'available' | 'noSlots' | 'moderation' | 'documents' | 'unavailable'} BookingObjectCatalogStatus
 */

/**
 * @typedef {'available' | 'booked' | 'requested' | 'unavailable'} BookingSlotStatus
 */

/**
 * @typedef {Object} BookingSlot
 * @property {string | undefined} id
 * @property {string} date
 * @property {string} start
 * @property {string} end
 * @property {boolean} available
 * @property {BookingSlotStatus | undefined} status
 */

/**
 * @typedef {Object} BookingService
 * @property {string} id
 * @property {string} title
 * @property {number} durationHours
 */

/**
 * @typedef {Object} BookingCharacteristic
 * @property {string} label
 * @property {string} value
 */

/**
 * @typedef {Object} BookingDocument
 * @property {string} id
 * @property {string} title
 * @property {string | undefined} url
 * @property {string} content
 * @property {boolean} required
 * @property {boolean} viewed
 */

/**
 * @typedef {Object} BookingRequirement
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'manual' | 'document'} kind
 * @property {boolean | undefined} complete
 * @property {string | undefined} documentId
 */

/**
 * @typedef {Object} BookingObject
 * @property {string} id
 * @property {string} equipmentId
 * @property {string} title
 * @property {string} type
 * @property {string} category
 * @property {string} laboratory
 * @property {string} imageUrl
 * @property {string} description
 * @property {string} location
 * @property {string} room
 * @property {string} department
 * @property {BookingService[]} services
 * @property {BookingCharacteristic[]} characteristics
 * @property {string[]} assets
 * @property {BookingDocument[]} documents
 * @property {BookingRequirement[]} requirements
 * @property {BookingSlot[]} slots
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
 * @typedef {Object} BookingRequest
 * @property {string} id
 * @property {string} objectId
 * @property {string} objectTitle
 * @property {string} equipmentId
 * @property {string} serviceTitle
 * @property {string} slotLabel
 * @property {string} purpose
 * @property {'moderation'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} BookingObjectsFilters
 * @property {string} search
 * @property {string | undefined} type
 * @property {string | undefined} laboratory
 * @property {string | undefined} availability
 */

export const bookingObjectCatalogStatuses = [
  'available',
  'noSlots',
  'moderation',
  'documents',
  'unavailable',
];
