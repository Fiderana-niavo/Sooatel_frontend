import React, { useState } from "react";
import { EmployeesTable } from "../EmployeesTable/EmployeesTable";
import { EmployeeForm } from "../EmployeeForm/EmployeeForm";
import { EmployeePlanningModal } from "../EmployeePlanningModal/EmployeePlanningModal";
import type { EmployeeListItem, EmployeeDetail } from "../../types/type";
import type { Role, Permission } from "@/features/roles/types";
import { Button } from "@/components/ui/Button/button";
import { ArrowLeft, Briefcase, Trash2, Edit, CalendarDays, Key, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog/dialog";
import { Input } from "@/components/ui/Inputs/input";
import { Switch } from "@/components/ui/Switch/switch";

// Mock Data
const MOCK_JOB_TITLES = [
  { idJobTitle: "j1", title: "Manager" },
  { idJobTitle: "j2", title: "Serveur" },
  { idJobTitle: "j3", title: "Cuisinier" },
  { idJobTitle: "j4", title: "Réceptionniste" },
];

const MOCK_EMPLOYMENT_TYPES = [
  { idEmploymentType: "et1", label: "CDI" },
  { idEmploymentType: "et2", label: "CDD" },
  { idEmploymentType: "et3", label: "Freelance" },
  { idEmploymentType: "et4", label: "Stage" },
];

const MOCK_ROLES: Role[] = [
  { idRole: "1", label: "Serveur", description: "Prend les commandes" },
  { idRole: "2", label: "Manager", description: "Supervise l'équipe" },
  { idRole: "3", label: "Cuisinier", description: "Prépare les plats" },
];

const MOCK_PERMISSIONS: Permission[] = [
  { idPermission: "p1", permissionName: "Créer Commande", category: "Ventes" },
  { idPermission: "p2", permissionName: "Supprimer Commande", category: "Ventes" },
  { idPermission: "p3", permissionName: "Voir Inventaire", category: "Stock" },
  { idPermission: "p4", permissionName: "Modifier Inventaire", category: "Stock" },
  { idPermission: "p5", permissionName: "Gérer Employés", category: "RH" },
];

const MOCK_ROLE_PERMS: Record<string, string[]> = {
  "1": ["p1"],
  "2": ["p1", "p2", "p3", "p4", "p5"],
  "3": ["p3"],
};

const MOCK_TEAMS = [
  { idTeam: "t1", teamName: "Équipe Cuisine", description: "" },
  { idTeam: "t2", teamName: "Équipe Salle", description: "" },
];

const MOCK_SHIFT_TYPES = [
  { idShiftType: "s1", label: "Matin", customStartTime: "08:00", customEndTime: "16:00", description: "" },
  { idShiftType: "s2", label: "Soir", customStartTime: "16:00", customEndTime: "00:00", description: "" },
];

const MOCK_EMPLOYEES_LIST: EmployeeListItem[] = [
  {
    idEmployee: "demo-1",
    employeeCode: "EMP-001",
    name: "Jean",
    lastname: "Dupont",
    jobTitle: "Manager",
    isInternship: false,
    hasAccount: true,
  },
  {
    idEmployee: "demo-2",
    employeeCode: "EMP-002",
    name: "Marie",
    lastname: "Curie",
    jobTitle: "Serveur",
    isInternship: true,
    hasAccount: false,
  },
];

const MOCK_EMPLOYEES_DETAILS: Record<string, EmployeeDetail> = {
  "demo-1": {
    idEmployee: "demo-1",
    employeeCode: "EMP-001",
    name: "Jean",
    lastname: "Dupont",
    birthdate: "1990-05-15",
    address: "123 Rue de la Paix, Paris",
    emailContact: "jean.dupont@example.com",
    phoneNumber: "0345678901",
    notes: "Employé modèle avec d'excellents retours clients.",
    job: {
      idEmpJob: "job-1",
      assignmentDate: "2025-01-10",
      endDate: null,
      hasFixedSchedule: true,
      jobTitle: "Manager",
    },
    internship: null,
    hasUserAccount: true,
    userAccount: {
      username: "jdupont",
      roles: [{ idRole: "2", label: "Manager", description: "Supervise l'équipe" }],
      permissionsOverrides: [{ idPermission: "p5", overrideType: "grant" }],
    },
  },
  "demo-2": {
    idEmployee: "demo-2",
    employeeCode: "EMP-002",
    name: "Marie",
    lastname: "Curie",
    birthdate: "1998-11-20",
    address: "45 Avenue des Sciences, Lyon",
    emailContact: "marie.curie@example.com",
    phoneNumber: "0321234567",
    notes: "Stagiaire en fin d'études, très rigoureuse.",
    job: {
      idEmpJob: "job-2",
      assignmentDate: "2026-06-01",
      endDate: "2026-09-01",
      hasFixedSchedule: false,
      jobTitle: "Serveur",
    },
    internship: {
      idInternship: "intern-2",
      schoolName: "Sorbonne Université",
      academicSupervisorName: "M. Albert Einstein",
      professionnalSupervisorName: "Jean Dupont",
    },
    hasUserAccount: false,
  },
};

export function EmployeesPage({ setPageTitle }: { setPageTitle: (title: string) => void }) {
  const [view, setView] = useState<"list" | "create" | "edit" | "details">("list");
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<EmployeeDetail | null>(null);
  
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>(MOCK_EMPLOYEES_LIST);
  const [employeesDetails, setEmployeesDetails] = useState<Record<string, EmployeeDetail>>(MOCK_EMPLOYEES_DETAILS);

  // Planning State
  const [planningEmployee, setPlanningEmployee] = useState<EmployeeListItem | null>(null);

  const handleEditPlanning = (employee: EmployeeListItem) => {
    setPlanningEmployee(employee);
  };

  // Key Generation State
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateKey = () => {
    // Simulation of API key generation
    const mockKey = "AK-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGeneratedKey(mockKey);
  };

  // Change Job State
  const [changeJobEmployee, setChangeJobEmployee] = useState<EmployeeListItem | null>(null);
  const [newJobId, setNewJobId] = useState("");
  const [newEmpTypeId, setNewEmpTypeId] = useState("");
  const [newAssignmentDate, setNewAssignmentDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newHasFixedSchedule, setNewHasFixedSchedule] = useState(false);

  const openChangeJobModal = (employeeListItem: EmployeeListItem) => {
    const detail = employeesDetails[employeeListItem.idEmployee];
    setChangeJobEmployee(employeeListItem);
    if (detail && detail.job) {
      const jobTitleId = MOCK_JOB_TITLES.find(j => j.title === detail.job?.jobTitle)?.idJobTitle || "";
      setNewJobId(jobTitleId);
      setNewEmpTypeId("et1");
      setNewAssignmentDate(detail.job.assignmentDate || new Date().toISOString().split("T")[0]);
      setNewEndDate(detail.job.endDate || "");
      setNewHasFixedSchedule(detail.job.hasFixedSchedule || false);
    } else {
      setNewJobId("");
      setNewEmpTypeId("et1");
      setNewAssignmentDate(new Date().toISOString().split("T")[0]);
      setNewEndDate("");
      setNewHasFixedSchedule(false);
    }
  };

  const saveChangeJob = () => {
    if (!changeJobEmployee) return;
    const employeeId = changeJobEmployee.idEmployee;
    const selectedJobTitle = MOCK_JOB_TITLES.find(j => j.idJobTitle === newJobId)?.title || "";

    setEmployeesDetails(prev => {
      const current = prev[employeeId];
      if (!current) return prev;
      return {
        ...prev,
        [employeeId]: {
          ...current,
          job: {
            idEmpJob: current.job?.idEmpJob || `job-${employeeId}`,
            assignmentDate: newAssignmentDate || null,
            endDate: newEndDate || null,
            hasFixedSchedule: newHasFixedSchedule,
            jobTitle: selectedJobTitle || null,
          }
        }
      };
    });

    setEmployeesList(prev => prev.map(emp => {
      if (emp.idEmployee === employeeId) {
        return {
          ...emp,
          jobTitle: selectedJobTitle || null,
        };
      }
      return emp;
    }));

    if (selectedEmployeeDetail && selectedEmployeeDetail.idEmployee === employeeId) {
      setSelectedEmployeeDetail(prev => {
        if (!prev) return null;
        return {
          ...prev,
          job: {
            idEmpJob: prev.job?.idEmpJob || `job-${employeeId}`,
            assignmentDate: newAssignmentDate || null,
            endDate: newEndDate || null,
            hasFixedSchedule: newHasFixedSchedule,
            jobTitle: selectedJobTitle || null,
          }
        };
      });
    }

    setChangeJobEmployee(null);
  };

  // Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter & Sort States
  const [selectedJobTitleId, setSelectedJobTitleId] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<"all" | "yes" | "no">("all");
  const [selectedUserAccount, setSelectedUserAccount] = useState<"all" | "yes" | "no">("all");
  const [sortBy, setSortBy] = useState<"name" | "lastname" | "employeeCode">("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  React.useEffect(() => {
    switch (view) {
      case "list":
        setPageTitle("Gestion des Employés");
        break;
      case "create":
        setPageTitle("Ajouter un Employé");
        break;
      case "edit":
        setPageTitle(`Modifier : ${selectedEmployeeDetail?.name} ${selectedEmployeeDetail?.lastname}`);
        break;
      case "details":
        setPageTitle(`Détails : ${selectedEmployeeDetail?.name} ${selectedEmployeeDetail?.lastname}`);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedEmployeeDetail]);

  // Handle Search, Filter, Sort and Pagination
  const filteredEmployees = employeesList.filter((emp) => {
    const searchStr = `${emp.name} ${emp.lastname} ${emp.employeeCode}`.toLowerCase();
    if (!searchStr.includes(searchTerm.toLowerCase())) return false;

    if (selectedJobTitleId) {
      const targetTitle = MOCK_JOB_TITLES.find(j => j.idJobTitle === selectedJobTitleId)?.title;
      if (emp.jobTitle !== targetTitle) return false;
    }

    if (selectedInternship === "yes" && !emp.isInternship) return false;
    if (selectedInternship === "no" && emp.isInternship) return false;

    if (selectedUserAccount === "yes" && !emp.hasAccount) return false;
    if (selectedUserAccount === "no" && emp.hasAccount) return false;

    return true;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valA = (a[sortBy] || "").toString().toLowerCase();
    const valB = (b[sortBy] || "").toString().toLowerCase();

    if (valA < valB) return sortOrder === "ASC" ? -1 : 1;
    if (valA > valB) return sortOrder === "ASC" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreate = () => {
    setSelectedEmployeeDetail(null);
    setView("create");
  };

  const handleEdit = (employeeListItem: EmployeeListItem) => {
    const detail = employeesDetails[employeeListItem.idEmployee] || {
      idEmployee: employeeListItem.idEmployee,
      employeeCode: employeeListItem.employeeCode,
      name: employeeListItem.name,
      lastname: employeeListItem.lastname,
      birthdate: null,
      address: null,
      emailContact: null,
      phoneNumber: null,
      notes: null,
      job: null,
      internship: null,
    };
    setSelectedEmployeeDetail(detail);
    setView("edit");
  };

  const handleViewDetails = (employeeListItem: EmployeeListItem) => {
    const detail = employeesDetails[employeeListItem.idEmployee] || {
      idEmployee: employeeListItem.idEmployee,
      employeeCode: employeeListItem.employeeCode,
      name: employeeListItem.name,
      lastname: employeeListItem.lastname,
      birthdate: null,
      address: null,
      emailContact: null,
      phoneNumber: null,
      notes: null,
      job: null,
      internship: null,
    };
    setSelectedEmployeeDetail(detail);
    setView("details");
  };

  const handleDelete = (employeeListItem: EmployeeListItem) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employeeListItem.name} ${employeeListItem.lastname} ?`)) {
      setEmployeesList(prev => prev.filter(emp => emp.idEmployee !== employeeListItem.idEmployee));
      setEmployeesDetails(prev => {
        const copy = { ...prev };
        delete copy[employeeListItem.idEmployee];
        return copy;
      });
    }
  };

  const handleSaveForm = (savedData: any) => {
    const { formData, username, password, selectedRoles, overrides } = savedData;
    
    // Map UserAccount overrides back to structure
    const permissionsOverrides = Object.entries(overrides)
      .filter(([_, value]) => value !== "default")
      .map(([idPermission, value]) => ({
        idPermission,
        overrideType: value as "grant" | "deny" | "default"
      }));

    const userAccount = formData.hasUserAccount ? {
      username,
      ...(password ? { password } : (selectedEmployeeDetail?.userAccount?.password ? { password: selectedEmployeeDetail.userAccount.password } : {})),
      roles: selectedRoles,
      permissionsOverrides,
    } : undefined;

    const idEmployee = selectedEmployeeDetail?.idEmployee || `demo-${Date.now()}`;
    const employeeCode = formData.employeeCode || selectedEmployeeDetail?.employeeCode || `EMP-00${employeesList.length + 1}`;

    const newDetail: EmployeeDetail = {
      idEmployee,
      employeeCode,
      name: formData.name,
      lastname: formData.lastname,
      birthdate: formData.birthdate || null,
      address: formData.address || null,
      emailContact: formData.emailContact || null,
      phoneNumber: formData.phoneNumber || null,
      notes: formData.notes || null,
      job: formData.idJobTitle ? {
        idEmpJob: `job-${idEmployee}`,
        assignmentDate: formData.assignmentDate || null,
        endDate: formData.endDate || null,
        hasFixedSchedule: formData.hasFixedSchedule || false,
        jobTitle: MOCK_JOB_TITLES.find(j => j.idJobTitle === formData.idJobTitle)?.title || formData.idJobTitle,
      } : null,
      internship: formData.isInternship ? {
        idInternship: `intern-${idEmployee}`,
        schoolName: "Université de Test",
        academicSupervisorName: "M. Tuteur Académique",
        professionnalSupervisorName: "Jean Dupont",
      } : null,
      hasUserAccount: formData.hasUserAccount,
      userAccount,
    };

    const newListItem: EmployeeListItem = {
      idEmployee,
      employeeCode,
      name: formData.name,
      lastname: formData.lastname,
      jobTitle: newDetail.job?.jobTitle || null,
      isInternship: !!formData.isInternship,
      hasAccount: !!formData.hasUserAccount,
    };

    if (view === "create") {
      setEmployeesList(prev => [...prev, newListItem]);
      setEmployeesDetails(prev => ({ ...prev, [idEmployee]: newDetail }));
    } else {
      setEmployeesList(prev => prev.map(emp => emp.idEmployee === idEmployee ? newListItem : emp));
      setEmployeesDetails(prev => ({ ...prev, [idEmployee]: newDetail }));
    }

    setView("list");
    setSelectedEmployeeDetail(null);
  };

  const handleBack = () => {
    setView("list");
    setSelectedEmployeeDetail(null);
  };

  return (
    <div className="w-full">
      {view !== "list" && (
        <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-4 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Retour à la liste
        </Button>
      )}

      {view === "list" && (
        <EmployeesTable
          employees={paginatedEmployees}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
          onChangeJob={openChangeJobModal}
          onEditPlanning={handleEditPlanning}
          jobTitles={MOCK_JOB_TITLES}
          selectedJobTitleId={selectedJobTitleId}
          onJobTitleChange={(id) => {
            setSelectedJobTitleId(id);
            setCurrentPage(1);
          }}
          selectedInternship={selectedInternship}
          onInternshipChange={(val) => {
            setSelectedInternship(val);
            setCurrentPage(1);
          }}
          selectedUserAccount={selectedUserAccount}
          onUserAccountChange={(val) => {
            setSelectedUserAccount(val);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={(val) => {
            setSortBy(val);
            setCurrentPage(1);
          }}
          sortOrder={sortOrder}
          onSortOrderChange={(val) => {
            setSortOrder(val);
            setCurrentPage(1);
          }}
        />
      )}

      {(view === "create" || view === "edit") && (
        <EmployeeForm
          initialData={selectedEmployeeDetail ? {
            idEmployee: selectedEmployeeDetail.idEmployee,
            employeeCode: selectedEmployeeDetail.employeeCode,
            name: selectedEmployeeDetail.name || "",
            lastname: selectedEmployeeDetail.lastname || "",
            birthdate: selectedEmployeeDetail.birthdate || undefined,
            address: selectedEmployeeDetail.address || undefined,
            emailContact: selectedEmployeeDetail.emailContact || undefined,
            phoneNumber: selectedEmployeeDetail.phoneNumber || undefined,
            notes: selectedEmployeeDetail.notes || undefined,
            idJobTitle: selectedEmployeeDetail.job ? (MOCK_JOB_TITLES.find(j => j.title === selectedEmployeeDetail.job?.jobTitle)?.idJobTitle || selectedEmployeeDetail.job.jobTitle || undefined) : undefined,
            assignmentDate: selectedEmployeeDetail.job?.assignmentDate || undefined,
            endDate: selectedEmployeeDetail.job?.endDate || undefined,
            hasFixedSchedule: selectedEmployeeDetail.job?.hasFixedSchedule || undefined,
            idEmploymentType: selectedEmployeeDetail.job ? "et1" : undefined,
            isInternship: !!selectedEmployeeDetail.internship,
            hasUserAccount: !!selectedEmployeeDetail.userAccount,
            userAccount: selectedEmployeeDetail.userAccount,
          } : undefined}
          availableJobTitles={MOCK_JOB_TITLES}
          availableEmploymentTypes={MOCK_EMPLOYMENT_TYPES}
          availableRoles={MOCK_ROLES}
          availablePermissions={MOCK_PERMISSIONS}
          rolePermissionsMapping={MOCK_ROLE_PERMS}
          availableTeams={MOCK_TEAMS}
          availableShiftTypes={MOCK_SHIFT_TYPES}
          onSave={handleSaveForm}
          onCancel={handleBack}
        />
      )}

      {view === "details" && selectedEmployeeDetail && (
        <div className="max-w-4xl mx-auto bg-card border rounded-[2rem] p-8 md:p-10 shadow-lg shadow-black/5 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-extrabold tracking-tight text-secondary">
                  {selectedEmployeeDetail.name} {selectedEmployeeDetail.lastname}
                </h3>
                {selectedEmployeeDetail.internship && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Stagiaire
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
                <span className="font-bold text-primary">{selectedEmployeeDetail.employeeCode || "CODE-NON-DEFINI"}</span>
                {selectedEmployeeDetail.job?.jobTitle && (
                  <>
                    <span>•</span>
                    <span>{selectedEmployeeDetail.job.jobTitle}</span>
                  </>
                )}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  const item: EmployeeListItem = {
                    idEmployee: selectedEmployeeDetail.idEmployee,
                    employeeCode: selectedEmployeeDetail.employeeCode,
                    name: selectedEmployeeDetail.name,
                    lastname: selectedEmployeeDetail.lastname,
                    jobTitle: selectedEmployeeDetail.job?.jobTitle || null,
                    isInternship: !!selectedEmployeeDetail.internship,
                    hasAccount: !!selectedEmployeeDetail.userAccount,
                  };
                  handleEdit(item);
                }} 
                className="rounded-xl px-4 gap-2 font-medium border-border hover:bg-muted"
              >
                <Edit className="size-4 text-muted-foreground" />
                Modifier le profil
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const item: EmployeeListItem = {
                    idEmployee: selectedEmployeeDetail.idEmployee,
                    employeeCode: selectedEmployeeDetail.employeeCode,
                    name: selectedEmployeeDetail.name,
                    lastname: selectedEmployeeDetail.lastname,
                    jobTitle: selectedEmployeeDetail.job?.jobTitle || null,
                    isInternship: !!selectedEmployeeDetail.internship,
                    hasAccount: !!selectedEmployeeDetail.userAccount,
                  };
                  handleEditPlanning(item);
                }} 
                className="rounded-xl px-4 gap-2 font-medium border-border hover:bg-muted text-primary"
              >
                <CalendarDays className="size-4" />
                Disponibilités
              </Button>
              <Button 
                onClick={() => {
                  const item: EmployeeListItem = {
                    idEmployee: selectedEmployeeDetail.idEmployee,
                    employeeCode: selectedEmployeeDetail.employeeCode,
                    name: selectedEmployeeDetail.name,
                    lastname: selectedEmployeeDetail.lastname,
                    jobTitle: selectedEmployeeDetail.job?.jobTitle || null,
                    isInternship: !!selectedEmployeeDetail.internship,
                    hasAccount: !!selectedEmployeeDetail.userAccount,
                  };
                  openChangeJobModal(item);
                }} 
                className="rounded-xl px-4 gap-2 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                <Briefcase className="size-4" />
                Changer de poste
              </Button>
              <Button 
                onClick={() => {
                  const item: EmployeeListItem = {
                    idEmployee: selectedEmployeeDetail.idEmployee,
                    employeeCode: selectedEmployeeDetail.employeeCode,
                    name: selectedEmployeeDetail.name,
                    lastname: selectedEmployeeDetail.lastname,
                    jobTitle: selectedEmployeeDetail.job?.jobTitle || null,
                    isInternship: !!selectedEmployeeDetail.internship,
                    hasAccount: !!selectedEmployeeDetail.userAccount,
                  };
                  handleDelete(item);
                  setView("list");
                }} 
                className="rounded-xl px-4 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Informations Personnelles</h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Nom Complet</span>
                    <span className="font-semibold text-foreground text-base">{selectedEmployeeDetail.name} {selectedEmployeeDetail.lastname}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Date de naissance</span>
                    <span className="font-medium text-foreground">{selectedEmployeeDetail.birthdate ? new Date(selectedEmployeeDetail.birthdate).toLocaleDateString("fr-FR") : "-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Adresse</span>
                    <span className="font-medium text-foreground">{selectedEmployeeDetail.address || "-"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Informations de Contact</h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">E-mail de contact</span>
                    <span className="font-medium text-foreground">{selectedEmployeeDetail.emailContact || "-"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Numéro de téléphone</span>
                    <span className="font-medium text-foreground">{selectedEmployeeDetail.phoneNumber || "-"}</span>
                  </div>
                </div>
              </div>

              {selectedEmployeeDetail.internship && (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Détails du Stage</h4>
                  <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">École d'origine</span>
                      <span className="font-semibold text-foreground">{selectedEmployeeDetail.internship.schoolName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Tuteur Académique</span>
                        <span className="font-medium text-foreground">{selectedEmployeeDetail.internship.academicSupervisorName || "-"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Tuteur Professionnel</span>
                        <span className="font-medium text-foreground">{selectedEmployeeDetail.internship.professionnalSupervisorName || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Informations du Poste</h4>
                {selectedEmployeeDetail.job ? (
                  <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground block">Poste actuel</span>
                        <span className="font-semibold text-foreground">{selectedEmployeeDetail.job.jobTitle || "Non assigné"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Type de contrat</span>
                        <span className="font-semibold text-foreground">
                          {selectedEmployeeDetail.internship ? "Stage" : "CDI / CDD"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Date d'assignation</span>
                        <span className="font-medium text-foreground">{selectedEmployeeDetail.job.assignmentDate ? new Date(selectedEmployeeDetail.job.assignmentDate).toLocaleDateString("fr-FR") : "-"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Date de fin</span>
                        <span className="font-medium text-foreground">{selectedEmployeeDetail.job.endDate ? new Date(selectedEmployeeDetail.job.endDate).toLocaleDateString("fr-FR") : "Indéterminée"}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground block">Gestion des horaires</span>
                        <span className="font-medium text-foreground">{selectedEmployeeDetail.job.hasFixedSchedule ? "Horaires de travail fixes" : "Horaires de travail flexibles"}</span>
                      </div>
                      <span className={`size-3 rounded-full ${selectedEmployeeDetail.job.hasFixedSchedule ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"}`} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/15 border rounded-2xl p-5 text-center text-muted-foreground text-sm py-8">
                    Aucun poste assigné
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">Sécurité & Compte Utilisateur</h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">Statut du compte</span>
                      <span className={`font-semibold ${selectedEmployeeDetail.userAccount ? "text-green-600" : "text-muted-foreground"}`}>
                        {selectedEmployeeDetail.userAccount ? "Compte actif" : "Pas de compte utilisateur"}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${selectedEmployeeDetail.userAccount ? "bg-green-500/10 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {selectedEmployeeDetail.userAccount ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {selectedEmployeeDetail.userAccount && (
                    <div className="border-t pt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Nom d'utilisateur</span>
                        <span className="font-semibold text-foreground">{selectedEmployeeDetail.userAccount.username}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Rôles système attribués</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selectedEmployeeDetail.userAccount.roles.map(r => (
                            <span key={r.idRole} className="px-2 py-0.5 text-xs font-semibold rounded-md bg-secondary/10 text-secondary border border-secondary/15">
                              {r.label}
                            </span>
                          ))}
                          {selectedEmployeeDetail.userAccount.roles.length === 0 && (
                            <span className="text-xs italic text-muted-foreground">Aucun rôle attribué</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleGenerateKey}
                          className="w-full text-xs font-semibold gap-2 border-primary/20 text-primary hover:bg-primary/10 rounded-xl"
                        >
                          <Key className="size-3.5" />
                          Générer une clé d'accès
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedEmployeeDetail.notes && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Notes Additionnelles</h4>
              <p className="text-sm bg-muted/10 border border-border/30 rounded-xl p-4 text-muted-foreground italic leading-relaxed">
                "{selectedEmployeeDetail.notes}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Change Job Dialog */}
      <Dialog open={!!changeJobEmployee} onOpenChange={(open) => !open && setChangeJobEmployee(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="size-5 text-primary" />
              Changer de poste
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Affectez {changeJobEmployee?.name} {changeJobEmployee?.lastname} à un nouveau poste de travail. L'ancien poste sera automatiquement historisé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intitulé du poste</label>
              <select
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionnez un poste</option>
                {MOCK_JOB_TITLES.map((j) => (
                  <option key={j.idJobTitle} value={j.idJobTitle}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type de contrat</label>
              <select
                value={newEmpTypeId}
                onChange={(e) => setNewEmpTypeId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {MOCK_EMPLOYMENT_TYPES.map((et) => (
                  <option key={et.idEmploymentType} value={et.idEmploymentType}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date d'affectation</label>
              <Input
                type="date"
                value={newAssignmentDate}
                onChange={(e) => setNewAssignmentDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date de fin (Optionnelle)</label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>

            {/* Fixed Schedule Switch */}
            <div className="flex items-center justify-between bg-muted/20 border p-3.5 rounded-xl">
              <div>
                <span className="text-sm font-semibold block">Horaires de travail fixes</span>
                <span className="text-xs text-muted-foreground block">Cet employé a-t-il des horaires fixes ou variables ?</span>
              </div>
              <Switch checked={newHasFixedSchedule} onCheckedChange={setNewHasFixedSchedule} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setChangeJobEmployee(null)} className="rounded-xl">
              Annuler
            </Button>
            <Button
              onClick={saveChangeJob}
              disabled={!newJobId || !newAssignmentDate}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-medium"
            >
              Confirmer le changement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmployeePlanningModal
        isOpen={!!planningEmployee}
        onClose={() => setPlanningEmployee(null)}
        employeeName={planningEmployee ? `${planningEmployee.name} ${planningEmployee.lastname}` : undefined}
        availableTeams={MOCK_TEAMS}
        availableShiftTypes={MOCK_SHIFT_TYPES}
        onSaveTeam={(teamId) => {
          console.log("Team saved for employee:", planningEmployee?.idEmployee, teamId);
          // Don't close immediately here if you want them to keep modal open, but we handle onClose inside modal.
        }}
        onSaveAvailabilities={(availabilities) => {
          console.log("Availabilities saved for employee:", planningEmployee?.idEmployee, availabilities);
        }}
      />

      {/* Generated Key Modal */}
      <Dialog open={!!generatedKey} onOpenChange={(open) => !open && setGeneratedKey(null)}>
        <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden bg-card border">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 border-b">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-primary/20 text-primary rounded-xl">
                  <Key className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-secondary">
                    Clé d'accès générée
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 text-sm rounded-xl">
              <span className="font-bold block mb-1">Attention :</span>
              Veuillez copier cette clé immédiatement. Pour des raisons de sécurité, elle ne sera plus affichée après la fermeture de cette fenêtre.
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Clé générée (Mock)</label>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={generatedKey || ""} 
                  className="font-mono text-center font-bold tracking-wider bg-muted/30 border-dashed border-2 py-6 text-lg rounded-xl"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="size-12 rounded-xl shrink-0"
                  onClick={() => {
                    if (generatedKey) navigator.clipboard.writeText(generatedKey);
                  }}
                  title="Copier"
                >
                  <Copy className="size-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 bg-muted/10 border-t">
            <Button onClick={() => setGeneratedKey(null)} className="w-full rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white">
              <Check className="size-4 mr-2" />
              J'ai copié la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
