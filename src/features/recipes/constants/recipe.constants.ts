export const getActivationConfirmationMessage = (
  requiresConfirmation: boolean,
  currentCost?: number,
  siblingVersion?: number
): string => {
  if (!requiresConfirmation) {
    return "Êtes-vous sûr de vouloir activer cette version ? La version actuellement active ne le sera plus.";
  }

  const formattedCost = currentCost?.toLocaleString("fr-FR") ?? 0;
  const suffix = siblingVersion
    ? ` Une version identique avec ce prix (Version ${siblingVersion}) existe déjà.`
    : " Une nouvelle version sera créée avec ce nouveau coût pour refléter cette modification de prix.";

  return `Le coût actuel de cette recette a changé et s'élève maintenant à ${formattedCost} MGA.${suffix} Voulez-vous quand même l'activer à la place de la version actuelle?`;
};
