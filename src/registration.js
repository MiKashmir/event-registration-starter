/**
 * Реєструє учасника на подію
 * @param {import('./store').EventRegistry} registry 
 * @param {import('./store').Participant} participant 
 * @param {Date|number|string} currentTime 
 */
function registerParticipant(registry, participant, currentTime = Date.now()) {
  // Нормалізація та валідація пошти
  const email = participant.email ? String(participant.email).replace(/\s/g, '').toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new TypeError("Некоректна електронна пошта");
  }

  // Нормалізація та валідація ПІБ
  const fullName = participant.fullName ? String(participant.fullName).trim() : "";
  if (!fullName) {
    throw new TypeError("Вкажіть ПІБ");
  }

  // Перевірка дедлайну
  const now = new Date(currentTime);
  const deadline = new Date(registry.event.registrationClosesAt);
  if (now >= deadline) {
    throw new Error("Реєстрацію закрито");
  }

  // Перевірка на дублікати
  const isDuplicate = registry.registered.some(p => p.email === email) ||
                      registry.waitlist.some(p => p.email === email);
  if (isDuplicate) {
    throw new Error("Учасник уже зареєстрований");
  }

  // Формуємо об'єкт нового учасника
  const newParticipant = { email, fullName };
  if (participant.group) {
    newParticipant.group = participant.group;
  }

  // Розподіл місць
  if (registry.registered.length < registry.event.capacity) {
    registry.registered.push(newParticipant);
    return { status: "registered" };
  } else {
    registry.waitlist.push(newParticipant);
    return { status: "waitlisted", position: registry.waitlist.length };
  }
}

/**
 * Скасовує реєстрацію учасника за email
 * @param {import('./store').EventRegistry} registry 
 * @param {string} email 
 */
function cancelRegistration(registry, email) {
  const targetEmail = String(email).replace(/\s/g, '').toLowerCase();

  // Пошук в основному списку
  const regIndex = registry.registered.findIndex(p => p.email === targetEmail);
  if (regIndex !== -1) {
    registry.registered.splice(regIndex, 1);
    
    let promoted = null;
    // Якщо є хтось у списку очікування, переводимо його в основний список
    if (registry.waitlist.length > 0) {
      promoted = registry.waitlist.shift(); // беремо об'єкт учасника
      registry.registered.push(promoted);
    }
    
    return { promoted };
  }

  // Пошук у списку очікування
  const waitIndex = registry.waitlist.findIndex(p => p.email === targetEmail);
  if (waitIndex !== -1) {
    registry.waitlist.splice(waitIndex, 1);
    return { promoted: null };
  }

  // Якщо не знайдено
  throw new Error("Учасника не знайдено");
}

module.exports = { registerParticipant, cancelRegistration };