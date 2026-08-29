export const addDays = (days: number) => {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date;
};

export function addMinutes(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}