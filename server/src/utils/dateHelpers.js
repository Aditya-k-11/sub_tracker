export const daysSince = (date) => {
  if (!date) return null;
  const diffTime = Math.abs(new Date() - new Date(date));
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
export const getDayLabel = (dateObj, todayObj) => {
  const diffTime = Math.round((dateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
  if (diffTime === 0) return 'Today';
  if (diffTime === 1) return 'Tomorrow';
  return dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
