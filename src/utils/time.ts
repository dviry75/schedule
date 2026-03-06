export const nowUtc = (): Date => new Date();

export const addMinutesUtc = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60_000);
};

export const isPastByMinutes = (target: Date, minutes: number, from: Date): boolean => {
  return from.getTime() - target.getTime() > minutes * 60_000;
};
