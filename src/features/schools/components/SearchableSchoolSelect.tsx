import { useState, useEffect } from "react";
import type { School } from "../types/type";
import { schoolService } from "../services/school.service";
import { SearchableSelect } from "@/components/ui/Inputs/SearchableSelect";

interface SearchableSchoolSelectProps {
  value: string | null;
  onChange: (idSchool: string | null) => void;
  className?: string;
}

export function SearchableSchoolSelect({ value, onChange, className }: SearchableSchoolSelectProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const data = await schoolService.getAll();
      setSchools(data);
    } catch (err) {
      console.error("Failed to load schools", err);
    } finally {
      setLoading(false);
    }
  };

  const options = schools.map(s => ({
    value: s.idSchool,
    label: s.name,
  }));

  const handleCreate = async (name: string) => {
    try {
      const newSchool = await schoolService.create({ name });
      setSchools((prev) => [...prev, newSchool]);
      onChange(newSchool.idSchool);
    } catch (err) {
      console.error("Failed to create school", err);
      alert("Erreur lors de la création de l'école");
    }
  };

  if (loading) {
    return <div className="p-2 text-sm text-muted-foreground border rounded-md">Chargement des écoles...</div>;
  }

  return (
    <SearchableSelect
      options={options}
      value={value || ""}
      onChange={(v) => onChange(v as string)}
      placeholder="Rechercher ou créer une école..."
      className={className}
      onCreate={handleCreate}
    />
  );
}
