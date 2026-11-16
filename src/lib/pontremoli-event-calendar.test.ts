import { test } from "node:test";
import assert from "node:assert/strict";
import { pontremoliEventCalendar as calendar } from "./pontremoli-event-calendar";

test("the events calendar covers 2027", () => {
  assert.equal(calendar.year, 2027);
});
test("bonfire dates are recurring January dates, not a confirmed programme", () => {
  assert.deepEqual(calendar.bonfires.customaryDates, ["2027-01-13", "2027-01-17", "2027-01-31"]);
  assert.equal(calendar.bonfires.programmeConfirmed, false);
});
test("Bancarella has no confirmed 2027 dates", () => {
  assert.equal(calendar.bancarella.confirmedDates, null);
});
test("Medievalis has no confirmed 2027 dates", () => {
  assert.equal(calendar.medievalis.confirmedDates, null);
});