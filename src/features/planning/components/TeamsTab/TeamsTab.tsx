import { useState } from "react";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import type { Team } from "../../types/type";

interface TeamsTabProps {
  teams: Team[];
  isEditing: string | null;
  editForm: Partial<Team>;
  setEditForm: (form: Partial<Team>) => void;
  setIsEditing: (id: string | null) => void;
  onCreate: () => void;
  onEdit: (team: Team) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
}

export function TeamsTab({ 
  teams, 
  isEditing, 
  editForm, 
  setEditForm, 
  setIsEditing,
  onCreate,
  onEdit,
  onSave,
  onDelete 
}: TeamsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = teams.filter(t => t.teamName.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une équipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-background border-border/50"
          />
        </div>
        <Button onClick={onCreate} className="gap-2 px-6 rounded-xl">
          <Plus className="size-4" />
          Nouvelle Équipe
        </Button>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-muted-foreground">Nom de l'équipe</th>
              <th className="px-6 py-4 font-medium text-muted-foreground">Description</th>
              <th className="px-6 py-4 font-medium text-center text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isEditing && !teams.find(t => t.idTeam === isEditing) && (
              <tr className="border-b bg-muted/10">
                <td className="px-6 py-3">
                  <Input 
                    autoFocus
                    placeholder="Nom"
                    value={editForm.teamName || ""}
                    onChange={(e) => setEditForm({...editForm, teamName: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3">
                  <Input 
                    placeholder="Description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="h-8"
                  />
                </td>
                <td className="px-6 py-3 text-center space-x-2">
                  <Button size="sm" onClick={onSave} disabled={!editForm.teamName?.trim()}>Enregistrer</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Annuler</Button>
                </td>
              </tr>
            )}

            {filteredTeams.map((team) => (
              <tr key={team.idTeam} className="border-b hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  {isEditing === team.idTeam ? (
                    <Input 
                      autoFocus
                      value={editForm.teamName || ""}
                      onChange={(e) => setEditForm({...editForm, teamName: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Users className="size-4 text-primary" />
                      {team.teamName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {isEditing === team.idTeam ? (
                    <Input 
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="h-8"
                    />
                  ) : (
                    team.description || "-"
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {isEditing === team.idTeam ? (
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={onSave} disabled={!editForm.teamName?.trim()}>Enregistrer</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(team)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(team.idTeam)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredTeams.length === 0 && !isEditing && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                  Aucune équipe trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
