import React, { useState, useRef, useEffect } from "react";
import type { EmployeeListItem } from "../../types/type";
import { SearchInput } from "@/components/ui/Inputs/search-input";
import Pagination from "@/components/ui/Pagination/pagination";
import { Button } from "@/components/ui/Button/button";
import { MoreVertical, Edit, Trash2, Eye, Plus, Briefcase, ArrowUp, ArrowDown, ArrowUpDown, CalendarDays, UserX } from "lucide-react";

interface EmployeesTableProps {
  employees: EmployeeListItem[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onEdit: (employee: EmployeeListItem) => void;
  onViewDetails: (employee: EmployeeListItem) => void;
  onDelete: (employee: EmployeeListItem) => void;
  onChangeJob: (employee: EmployeeListItem) => void;
  onEditPlanning: (employee: EmployeeListItem) => void;
  onTerminateContract: (employee: EmployeeListItem) => void;
  onRenewContract: (employee: EmployeeListItem) => void;
  
  // Filters & Sorting
  jobTitles: Array<{ idJobTitle: string; title: string }>;
  selectedJobTitleId: string;
  onJobTitleChange: (id: string) => void;
  selectedInternship: "all" | "yes" | "no";
  onInternshipChange: (val: "all" | "yes" | "no") => void;
  selectedUserAccount: "all" | "yes" | "no";
  onUserAccountChange: (val: "all" | "yes" | "no") => void;
  sortBy: "name" | "lastname" | "employeeCode";
  onSortByChange: (val: "name" | "lastname" | "employeeCode") => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (val: "ASC" | "DESC") => void;
  selectedStatus: "active" | "former";
  onStatusChange: (val: "active" | "former") => void;
}

export function EmployeesTable({
  employees,
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  onCreate,
  onEdit,
  onViewDetails,
  onDelete,
  onChangeJob,
  onEditPlanning,
  onTerminateContract,
  onRenewContract,
  jobTitles,
  selectedJobTitleId,
  onJobTitleChange,
  selectedInternship,
  onInternshipChange,
  selectedUserAccount,
  onUserAccountChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  selectedStatus,
  onStatusChange,
}: EmployeesTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleHeaderSort = (field: "name" | "employeeCode") => {
    if (sortBy === field) {
      onSortOrderChange(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      onSortByChange(field);
      onSortOrderChange("ASC");
    }
  };

  const renderSortIcon = (field: "name" | "employeeCode") => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/40 ml-1 inline-block" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="size-3.5 text-primary ml-1 inline-block" />
    ) : (
      <ArrowDown className="size-3.5 text-primary ml-1 inline-block" />
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <SearchInput
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          wrapperClassName="max-w-md"
        />
        <Button onClick={onCreate} className="gap-2 px-6 rounded-xl">
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {/* Discreet Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedJobTitleId}
          onChange={(e) => onJobTitleChange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <option value="">Tous les postes</option>
          {jobTitles.map((title) => (
            <option key={title.idJobTitle} value={title.idJobTitle}>
              {title.title}
            </option>
          ))}
        </select>

        <select
          value={selectedInternship}
          onChange={(e) => onInternshipChange(e.target.value as "all" | "yes" | "no")}
          className="h-8 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <option value="all">Tous les types (Stagiaires/Employés)</option>
          <option value="yes">Stagiaires uniquement</option>
          <option value="no">Employés uniquement</option>
        </select>

        <select
          value={selectedUserAccount}
          onChange={(e) => onUserAccountChange(e.target.value as "all" | "yes" | "no")}
          className="h-8 rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <option value="all">Tous les statuts de compte</option>
          <option value="yes">Avec compte</option>
          <option value="no">Sans compte</option>
        </select>

        <button
          onClick={() => onStatusChange(selectedStatus === "active" ? "former" : "active")}
          className={`h-8 px-3 py-1 text-xs font-semibold rounded-lg shadow-sm border transition-colors ${
            selectedStatus === "former" 
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
              : "bg-background text-muted-foreground border-input hover:text-foreground"
          }`}
        >
          {selectedStatus === "active" ? "Afficher les anciens employés" : "Afficher les employés actifs"}
        </button>
      </div>

      <div className="bg-background border rounded-xl shadow-sm md:overflow-visible overflow-x-auto" ref={dropdownRef}>
        <div className="min-w-max md:min-w-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th
                  onClick={() => handleHeaderSort("employeeCode")}
                  className="px-6 py-4 font-medium text-muted-foreground cursor-pointer select-none group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Code
                    {renderSortIcon("employeeCode")}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSort("name")}
                  className="px-6 py-4 font-medium text-muted-foreground cursor-pointer select-none group hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Employé
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Poste</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Stagiaire</th>
                <th className="px-6 py-4 font-medium text-muted-foreground">Compte</th>
                <th className="px-6 py-4 font-medium text-center text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Aucun employé trouvé.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => {
                  const isNearBottom = index >= employees.length - 3 && employees.length > 3;
                  return (
                    <tr key={emp.idEmployee} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{emp.employeeCode || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{emp.name} {emp.lastname}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {emp.jobTitle || "Aucun poste assigné"}
                      </td>
                      <td className="px-6 py-4">
                        {emp.isInternship ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700">
                            <span className="size-1.5 rounded-full bg-blue-500"></span>
                            Stagiaire
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Employé</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {emp.hasAccount ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700">
                            <span className="size-1.5 rounded-full bg-green-500"></span>
                            Avec
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-muted-foreground/40"></span>
                            Sans
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => toggleDropdown(emp.idEmployee!, e)}
                          className="p-2 rounded-full hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </button>

                        {openDropdownId === emp.idEmployee && (
                          <div className={`absolute right-8 z-50 w-48 bg-card border rounded-xl shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto ${isNearBottom ? "bottom-10" : "top-10"}`}>
                            <button
                              onClick={() => { setOpenDropdownId(null); onViewDetails(emp); }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <Eye className="size-4" /> Détails
                            </button>
                            {selectedStatus === "active" ? (
                              <>
                                <button
                                  onClick={() => { setOpenDropdownId(null); onEdit(emp); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Edit className="size-4" /> Modifier
                                </button>
                                <button
                                  onClick={() => { setOpenDropdownId(null); onChangeJob(emp); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <Briefcase className="size-4" /> Changer de poste
                                </button>
                                <button
                                  onClick={() => { setOpenDropdownId(null); onTerminateContract(emp); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors text-orange-600"
                                >
                                  <UserX className="size-4" /> Terminer le contrat
                                </button>
                                <button
                                  onClick={() => { setOpenDropdownId(null); onEditPlanning(emp); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                  <CalendarDays className="size-4 text-primary" /> Disponibilités
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => { setOpenDropdownId(null); onRenewContract(emp); }}
                                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted rounded-lg transition-colors text-green-600"
                              >
                                <Briefcase className="size-4" /> Renouveler le contrat
                              </button>
                            )}
                            <div className="h-px bg-border my-1 mx-2" />
                            <button
                              onClick={() => { setOpenDropdownId(null); onDelete(emp); }}
                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                            >
                              <Trash2 className="size-4" /> Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
