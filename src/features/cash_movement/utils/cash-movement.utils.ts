export const getDirectionLabel = (dir: number) => {
  if (dir === -5) return "Sortie";
  if (dir === 5) return "Entrée";
  return "Les deux";
};
