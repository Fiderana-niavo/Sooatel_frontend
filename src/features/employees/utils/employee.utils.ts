export const generateUsername = (name: string, lastname: string): string => {
  if (!name && !lastname) return "";

  const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nom = removeAccents(lastname).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const prenomPart = removeAccents(name).trim().toLowerCase().split(/[ \-]/)[0];
  const prenom = prenomPart ? prenomPart.replace(/[^a-z0-9]/g, '') : '';
  
  if (nom && prenom) return `${nom}.${prenom}`;
  if (nom) return nom;
  if (prenom) return prenom;
  
  return "";
};
