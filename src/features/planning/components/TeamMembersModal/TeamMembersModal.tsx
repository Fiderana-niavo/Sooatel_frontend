import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, UserMinus, Plus, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Input } from "@/components/ui/Inputs/input";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import { TeamService } from "../../services/team.service";
import type { Team } from "../../types/type";

interface TeamMembersModalProps {
  team: Team;
  onClose: () => void;
}

export function TeamMembersModal({ team, onClose }: TeamMembersModalProps) {
  const queryClient = useQueryClient();
  const [searchMember, setSearchMember] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ message, type });
  };

  const membersQuery = useQuery({
    queryKey: ["team-members", team.idTeam],
    queryFn: () => TeamService.getMembers(team.idTeam),
  });

  const availableQuery = useQuery({
    queryKey: ["available-employees"],
    queryFn: () => TeamService.getAvailableEmployees(),
  });

  const addMutation = useMutation({
    mutationFn: (employeeIds: string[]) => TeamService.addMembers(team.idTeam, employeeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", team.idTeam] });
      queryClient.invalidateQueries({ queryKey: ["available-employees"] });
      setSelectedAvailableIds([]);
      showSnackbar("Membre(s) ajouté(s) avec succès", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.message || "Erreur lors de l'ajout des membres", "error");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (idEmployee: string) => TeamService.removeMember(team.idTeam, idEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", team.idTeam] });
      queryClient.invalidateQueries({ queryKey: ["available-employees"] });
      showSnackbar("Membre retiré avec succès", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.message || "Erreur lors du retrait du membre", "error");
    },
  });

  const members = membersQuery.data ?? [];
  const available = availableQuery.data ?? [];

  const filteredMembers = members.filter((m) =>
    `${m.name} ${m.lastname}`.toLowerCase().includes(searchMember.toLowerCase())
  );

  const filteredAvailable = available.filter((a) =>
    `${a.name} ${a.lastname}`.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedAvailableIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-3xl rounded-2xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Membres de {team.teamName}</h2>
              <p className="text-xs text-muted-foreground">{members.length} membre(s) dans cette équipe</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          
          {/* LEFT: Current Members */}
          <div className="p-6 flex flex-col overflow-hidden">
            <h3 className="font-semibold text-sm mb-4">Membres actuels</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {membersQuery.isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Chargement...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Aucun membre trouvé.</p>
              ) : (
                filteredMembers.map((m) => (
                  <div key={m.idEmployee} className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{m.name} {m.lastname}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.jobTitle || "Aucun poste"} • {m.employeeCode}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeMutation.mutate(m.idEmployee)}
                      disabled={removeMutation.isPending}
                    >
                      <UserMinus className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Available Employees */}
          <div className="p-6 flex flex-col overflow-hidden bg-muted/10">
            <h3 className="font-semibold text-sm mb-4">Ajouter un nouveau membre</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une personne sans équipe..."
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4">
              {availableQuery.isLoading ? (
                <p className="text-xs text-muted-foreground text-center py-4">Chargement...</p>
              ) : filteredAvailable.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Toutes les personnes ont déjà une équipe.</p>
              ) : (
                filteredAvailable.map((a) => {
                  const isSelected = selectedAvailableIds.includes(a.idEmployee);
                  return (
                    <div 
                      key={a.idEmployee} 
                      onClick={() => toggleSelection(a.idEmployee)}
                      className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary/50" : "bg-card hover:border-primary/30"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{a.name} {a.lastname}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.jobTitle || "Aucun poste"} • {a.employeeCode}</p>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <Button 
              className="w-full gap-2" 
              disabled={selectedAvailableIds.length === 0 || addMutation.isPending}
              onClick={() => addMutation.mutate(selectedAvailableIds)}
            >
              <Plus className="size-4" />
              {addMutation.isPending ? "Ajout..." : `Ajouter à l'équipe (${selectedAvailableIds.length})`}
            </Button>
          </div>
        </div>
      </div>

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}
