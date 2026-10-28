const test = require("node:test");
const assert = require("node:assert/strict");
const { createEventRegistry } = require("../src/store");
const { registerParticipant } = require("../src/registration");

const event = { id: "hack-2026", title: "Хакатон КПЕФК", capacity: 2, registrationClosesAt: "2026-10-20T18:00:00Z" };
const before = new Date("2026-10-10T12:00:00Z");
const p = (email, fullName = "Петренко Андрій", group) => ({ email, fullName, group });

test("реєструє учасника, поки є місця", () => {
  const r = createEventRegistry(event);
  assert.deepEqual(registerParticipant(r, p("a@kpefk.ua"), before), { status: "registered" });
  assert.equal(r.registered.length, 1);
});
test("коли місця закінчилися, додає до листа очікування з номером", () => {
  const r = createEventRegistry(event);
  registerParticipant(r, p("a@kpefk.ua"), before);
  registerParticipant(r, p("b@kpefk.ua"), before);
  assert.deepEqual(registerParticipant(r, p("c@kpefk.ua"), before), { status: "waitlisted", position: 1 });
  assert.deepEqual(registerParticipant(r, p("d@kpefk.ua"), before), { status: "waitlisted", position: 2 });
});
test("зберігає пошту в нижньому регістрі без пробілів, ПІБ – без пробілів по краях", () => {
  const r = createEventRegistry(event);
  registerParticipant(r, p("  A.Petrenko@KPEFK.ua ", "  Петренко Андрій  "), before);
  assert.equal(r.registered[0].email, "a.petrenko@kpefk.ua");
  assert.equal(r.registered[0].fullName, "Петренко Андрій");
});
test("група необов’язкова", () => {
  const r = createEventRegistry(event);
  assert.equal(registerParticipant(r, { email: "a@kpefk.ua", fullName: "Коваль Марія" }, before).status, "registered");
});
test("повторна реєстрація тієї самої пошти заборонена (з урахуванням регістру і черги)", () => {
  const r = createEventRegistry(event);
  registerParticipant(r, p("a@kpefk.ua"), before);
  assert.throws(() => registerParticipant(r, p(" A@KPEFK.UA"), before), { message: "Учасник уже зареєстрований" });
  registerParticipant(r, p("b@kpefk.ua"), before);
  registerParticipant(r, p("c@kpefk.ua"), before);
  assert.throws(() => registerParticipant(r, p("c@kpefk.ua"), before), { message: "Учасник уже зареєстрований" });
});
test("після закриття реєстрації (включно з моментом закриття) – помилка", () => {
  const r = createEventRegistry(event);
  assert.throws(() => registerParticipant(r, p("a@kpefk.ua"), new Date("2026-10-20T18:00:00Z")), { message: "Реєстрацію закрито" });
  assert.throws(() => registerParticipant(r, p("a@kpefk.ua"), new Date("2026-10-21T08:00:00Z")), { message: "Реєстрацію закрито" });
});
test("некоректна пошта – TypeError", () => {
  const r = createEventRegistry(event);
  for (const email of ["petrenko", "petrenko@kpefk", "", "@kpefk.ua"]) {
    assert.throws(() => registerParticipant(r, p(email), before), { name: "TypeError", message: "Некоректна електронна пошта" }, email);
  }
});
test("порожнє ПІБ – TypeError", () => {
  const r = createEventRegistry(event);
  assert.throws(() => registerParticipant(r, p("a@kpefk.ua", "   "), before), { name: "TypeError", message: "Вкажіть ПІБ" });
});
test("за замовчуванням використовується поточний час", () => {
  const future = { ...event, registrationClosesAt: "2999-01-01T00:00:00Z" };
  assert.equal(registerParticipant(createEventRegistry(future), p("a@kpefk.ua")).status, "registered");
});
