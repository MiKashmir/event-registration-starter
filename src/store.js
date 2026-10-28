/**
 * Сховище реєстрацій на подію коледжу (олімпіада, хакатон, семінар).
 * Дані зберігаються в пам’яті процесу.
 */

/**
 * @typedef {Object} CollegeEvent
 * @property {string} id
 * @property {string} title
 * @property {number} capacity                кількість місць
 * @property {string} registrationClosesAt    дата й час закриття реєстрації, ISO 8601
 */

/**
 * @typedef {Object} Participant
 * @property {string} email
 * @property {string} fullName
 * @property {string} [group]                 шифр групи, необов’язковий
 */

/**
 * @typedef {Object} EventRegistry
 * @property {CollegeEvent} event
 * @property {Participant[]} registered       зареєстровані, у порядку реєстрації
 * @property {Participant[]} waitlist         лист очікування, у порядку надходження
 */

/**
 * Створює порожнє сховище реєстрацій для події.
 * @param {CollegeEvent} event
 * @returns {EventRegistry}
 */
function createEventRegistry(event) {
  return { event, registered: [], waitlist: [] };
}

module.exports = { createEventRegistry };
