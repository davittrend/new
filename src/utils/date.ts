import { format as fnsFormat, isBefore, addMinutes } from 'date-fns';

export const formatDateTime = (date: string | Date) => {
  return fnsFormat(new Date(date), 'MMM d, yyyy h:mm a');
};

export const isValidScheduleTime = (scheduledTime: Date) => {
  const minScheduleTime = addMinutes(new Date(), 5);
  return !isBefore(scheduledTime, minScheduleTime);
};