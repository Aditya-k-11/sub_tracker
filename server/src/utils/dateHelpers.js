export const daysSince = (date) => {
  if (!date) return null;
  const diffTime = Math.abs(new Date() - new Date(date));
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
