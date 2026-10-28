const test = require("node:test");
const assert = require("node:assert/strict");
const { createEventRegistry } = require("../src/store");
const { registerParticipant, cancelRegistration } = require("../src/registration");

const event = { id: "olymp", title: "Олімпіада з програмування", capacity: 1, registrationClosesAt: "2026-10-20T18:00:00Z" };
const now = new Date("2026-10-10T12:00:00Z");
function filled() {
  const r = createEventRegistry(event);
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  registerParticipant(r, { email: "b@kpefk.ua", fullName: "Б Б" }, now);
  registerParticipant(r, { email: "c@kpefk.ua", fullName: "В В" }, now);
  return r;
}

test("скасування з основного списку переводить першого з черги", () => {
  const r = filled();
  const res = cancelRegistration(r, "A@kpefk.ua ");
  assert.equal(res.promoted.email, "b@kpefk.ua");
  assert.deepEqual(r.registered.map((x) => x.email), ["b@kpefk.ua"]);
  assert.deepEqual(r.waitlist.map((x) => x.email), ["c@kpefk.ua"]);
});
test("скасування з черги нікого не переводить", () => {
  const r = filled();
  assert.deepEqual(cancelRegistration(r, "c@kpefk.ua"), { promoted: null });
  assert.equal(r.waitlist.length, 1);
});
test("скасування за порожньої черги повертає promoted: null", () => {
  const r = createEventRegistry(event);
  registerParticipant(r, { email: "a@kpefk.ua", fullName: "А А" }, now);
  assert.deepEqual(cancelRegistration(r, "a@kpefk.ua"), { promoted: null });
  assert.equal(r.registered.length, 0);
});
test("скасування неіснуючої реєстрації – помилка", () => {
  assert.throws(() => cancelRegistration(filled(), "x@kpefk.ua"), { message: "Учасника не знайдено" });
});
