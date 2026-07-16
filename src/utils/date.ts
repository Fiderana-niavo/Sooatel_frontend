export const getCoveredDays = (id: number): number[] => {
  if (id === -1) return [0, 1, 2, 3, 4, 5, 6]; // Every day
  if (id === -2) return [1, 2, 3, 4, 5];       // Monday to Friday
  if (id === -3) return [1, 2, 3, 4, 5, 6];    // Monday to Saturday
  return [id];
};
