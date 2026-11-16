// Recurring feast dates are not confirmation of the edition's programme.
export const pontremoliEventCalendar = {
  year: 2027,
  checkedOn: "2026-11-16",
  bonfires: {
    customaryDates: ["2027-01-13", "2027-01-17", "2027-01-31"],
    programmeConfirmed: false,
  },
  bancarella: { customaryMonth: 7, confirmedDates: null },
  medievalis: { customaryMonth: 8, confirmedDates: null },
} as const;

export const bonfireDateLabel = pontremoliEventCalendar.bonfires.customaryDates
  .map((date) => Number(date.slice(-2)))
  .join(", ") + ` gennaio ${pontremoliEventCalendar.year}`;