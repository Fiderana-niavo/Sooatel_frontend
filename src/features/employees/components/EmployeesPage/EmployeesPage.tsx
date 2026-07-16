import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { EmployeesTable } from "../EmployeesTable/EmployeesTable";
import { EmployeeForm } from "../EmployeeForm/EmployeeForm";
import { EmployeePlanningModal } from "../EmployeePlanningModal/EmployeePlanningModal";
import type { EmployeeListItem, EmployeeDetail } from "../../types/type";
import type { Role, Permission } from "@/features/roles/types";
import { Button } from "@/components/ui/Button/button";
import {
  ArrowLeft,
  Briefcase,
  Trash2,
  Edit,
  CalendarDays,
  Key,
  Copy,
  Check,
  UserX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog/dialog";
import { Input } from "@/components/ui/Inputs/input";
import { Switch } from "@/components/ui/Switch/switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { EmployeeService } from "../../services/employee.service";
import { EmploymentTypeService } from "@/features/employment-types/services/employment-type.service";
import { JobTitleService, type JobTitle } from "@/features/job-titles";
import type { EmploymentType } from "@/features/employment-types/types/type";
import { TeamService } from "@/features/planning/services/team.service";
import { ShiftTypeService } from "@/features/planning/services/shift-type.service";
import type { Team, ShiftType } from "@/features/planning/types/type";
import { RoleService } from "@/features/roles/services/role.service";
import { PermissionService } from "@/features/roles/services/permission.service";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function EmployeesPage({
  setPageTitle,
}: {
  setPageTitle: (title: string) => void;
}) {
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
    isOpen: boolean;
  }>({ message: "", type: "info", isOpen: false });
  const showSnackbar = (message: string, type: SnackbarType = "info") => {
    setSnackbar({ message, type, isOpen: true });
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const view =
    (searchParams.get("action") as "list" | "create" | "edit" | "details") ||
    "list";
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] =
    useState<EmployeeDetail | null>(null);

  const setView = useCallback(
    (newView: "list" | "create" | "edit" | "details", id?: string) => {
      if (newView === "list") {
        setSearchParams({});
      } else {
        setSearchParams({ action: newView, ...(id ? { id } : {}) });
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");
    if (
      (action === "edit" || action === "details") &&
      id &&
      !selectedEmployeeDetail
    ) {
      EmployeeService.getById(id)
        .then((detail) => {
          setSelectedEmployeeDetail(detail);
        })
        .catch((err) => {
          console.error(err);
          setSearchParams({});
        });
    } else if (!action || action === "list") {
      if (selectedEmployeeDetail) setSelectedEmployeeDetail(null);
    }
  }, [searchParams, selectedEmployeeDetail, setSearchParams]);

  // Reference data from API
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [rolePermissionsMapping, setRolePermissionsMapping] = useState<
    Record<string, string[]>
  >({});

  // List state (server-side)
  const [employeesList, setEmployeesList] = useState<EmployeeListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm((prev) => {
        if (prev !== searchTerm) {
          setCurrentPage(1);
          return searchTerm;
        }
        return prev;
      });
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const [selectedJobTitleId, setSelectedJobTitleId] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<
    "all" | "yes" | "no"
  >("all");
  const [selectedUserAccount, setSelectedUserAccount] = useState<
    "all" | "yes" | "no"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "lastname" | "employeeCode">(
    "name",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [selectedStatus, setSelectedStatus] = useState<"active" | "former">(
    "active",
  );

  // Load reference data once
  useEffect(() => {
    Promise.all([
      JobTitleService.getAll(),
      EmploymentTypeService.getAll(),
      TeamService.getAll(),
      ShiftTypeService.getAll(),
      RoleService.getAll({ limit: 100 }).then((r) => r.records),
    ])
      .then(([jt, et, tm, st, roles]) => {
        setJobTitles(jt);
        setEmploymentTypes(et);
        setTeams(tm);
        setShiftTypes(st);
        setAvailableRoles(roles);
        // Build rolePermissionsMapping
        const mapping: Record<string, string[]> = {};
        roles.forEach((r) => {
          mapping[r.idRole] = (r.permissions || []).map((p) => p.idPermission);
        });
        setRolePermissionsMapping(mapping);
      })
      .catch(console.error);

    // Load permissions for the form
    PermissionService.getAll({ limit: 1000 })
      .then((res) => {
        const perms: Permission[] = res.records.map((p: any) => ({
          idPermission: p.idPermission,
          permissionName: p.permissionName,
          category: p.category?.name || "Autres",
        }));
        setAvailablePermissions(perms);
      })
      .catch(console.error);
  }, []);

  // Load employees list (server-side search/filter/sort/pagination)
  const loadEmployees = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm || undefined,
        idJobTitle: selectedJobTitleId || undefined,
        hasUserAccount:
          selectedUserAccount !== "all" ? selectedUserAccount : undefined,
        isInternship:
          selectedInternship !== "all" ? selectedInternship : undefined,
        status: selectedStatus,
        sortBy,
        sortOrder,
      };
      const result = await EmployeeService.getAll(params);
      setEmployeesList(result.records);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors du chargement des employés.",
        "error"
      );
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedJobTitleId,
    selectedUserAccount,
    selectedInternship,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (view === "list") loadEmployees();
  }, [loadEmployees, view]);

  useEffect(() => {
    switch (view) {
      case "list":
        setPageTitle("Gestion des Employés");
        break;
      case "create":
        setPageTitle("Ajouter un Employé");
        break;
      case "edit":
        setPageTitle(
          `Modifier : ${selectedEmployeeDetail?.name} ${selectedEmployeeDetail?.lastname}`,
        );
        break;
      case "details":
        setPageTitle(
          `Détails : ${selectedEmployeeDetail?.name} ${selectedEmployeeDetail?.lastname}`,
        );
        break;
    }
  }, [view, selectedEmployeeDetail]);

  // Planning State
  const [planningEmployee, setPlanningEmployee] =
    useState<EmployeeDetail | null>(null);

  const handleEditPlanning = async (employee: EmployeeListItem) => {
    try {
      const detail = await EmployeeService.getById(employee.idEmployee);
      setPlanningEmployee(detail);
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la récupération de la planification.",
        "error"
      );
    }
  };

  // Key Generation State
  const [generatedKey, setGeneratedKey] = useState<{
    token: string;
    expiresAt: string;
  } | null>(null);

  const handleGenerateKey = async () => {
    if (!selectedEmployeeDetail?.userAccount) return;
    try {
      const result = await EmployeeService.generateAccessToken(
        selectedEmployeeDetail.userAccount.idUser,
      );
      setGeneratedKey(result);
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la génération de la clé.",
        "error"
      );
    }
  };

  // Change Job State
  const [changeJobEmployee, setChangeJobEmployee] =
    useState<EmployeeListItem | null>(null);
  const [isRenewal, setIsRenewal] = useState(false);
  const [newJobId, setNewJobId] = useState("");
  const [newEmpTypeId, setNewEmpTypeId] = useState("");
  const [newAssignmentDate, setNewAssignmentDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newHasFixedSchedule, setNewHasFixedSchedule] = useState(false);

  const openChangeJobModal = (item: EmployeeListItem) => {
    setIsRenewal(false);
    setChangeJobEmployee(item);

    // Try to get job title ID from item
    const jt = item.jobTitle
      ? jobTitles.find((j) => j.title === item.jobTitle)
      : undefined;
    const initialJobId = jt?.idJobTitle || "";

    if (
      selectedEmployeeDetail?.idEmployee === item.idEmployee &&
      selectedEmployeeDetail.job
    ) {
      setNewJobId(initialJobId);
      setNewEmpTypeId(
        selectedEmployeeDetail.job.idEmploymentType ||
          employmentTypes[0]?.idEmploymentType ||
          "",
      );
      setNewAssignmentDate(
        selectedEmployeeDetail.job.assignmentDate ||
          new Date().toISOString().split("T")[0],
      );
      setNewEndDate(selectedEmployeeDetail.job.endDate || "");
      setNewHasFixedSchedule(
        selectedEmployeeDetail.job.hasFixedSchedule || false,
      );
    } else {
      setNewJobId(initialJobId);
      setNewEmpTypeId(employmentTypes[0]?.idEmploymentType || "");
      setNewAssignmentDate(new Date().toISOString().split("T")[0]);
      setNewEndDate("");
      setNewHasFixedSchedule(false);
    }
  };

  const openRenewContractModal = (item: EmployeeListItem) => {
    setIsRenewal(true);
    setChangeJobEmployee(item);

    const jt = item.jobTitle
      ? jobTitles.find((j) => j.title === item.jobTitle)
      : undefined;
    const initialJobId = jt?.idJobTitle || "";

    if (
      selectedEmployeeDetail?.idEmployee === item.idEmployee &&
      selectedEmployeeDetail.job
    ) {
      setNewJobId(initialJobId);
      setNewEmpTypeId(
        selectedEmployeeDetail.job.idEmploymentType ||
          employmentTypes[0]?.idEmploymentType ||
          "",
      );
      setNewAssignmentDate(new Date().toISOString().split("T")[0]);
      setNewEndDate("");
      setNewHasFixedSchedule(
        selectedEmployeeDetail.job.hasFixedSchedule || false,
      );
    } else {
      setNewJobId(initialJobId);
      setNewEmpTypeId(employmentTypes[0]?.idEmploymentType || "");
      setNewAssignmentDate(new Date().toISOString().split("T")[0]);
      setNewEndDate("");
      setNewHasFixedSchedule(false);
    }
  };

  const getSelectedEmployeeListItem = (): EmployeeListItem | null => {
    if (!selectedEmployeeDetail) return null;
    return {
      idEmployee: selectedEmployeeDetail.idEmployee,
      employeeCode: selectedEmployeeDetail.employeeCode,
      name: selectedEmployeeDetail.name,
      lastname: selectedEmployeeDetail.lastname,
      jobTitle: selectedEmployeeDetail.job?.jobTitle || null,
      isInternship: !!selectedEmployeeDetail.internship,
      hasAccount: !!selectedEmployeeDetail.userAccount,
    };
  };

  const handleChangeJobClick = () => {
    const item = getSelectedEmployeeListItem();
    if (item) openChangeJobModal(item);
  };

  const handleEditClick = () => {
    const item = getSelectedEmployeeListItem();
    if (item) handleEdit(item);
  };

  const handleEditPlanningClick = () => {
    const item = getSelectedEmployeeListItem();
    if (item) handleEditPlanning(item);
  };

  const handleTerminateContractClick = () => {
    const item = getSelectedEmployeeListItem();
    if (item) openTerminateContractModal(item);
  };

  const handleDeleteClick = () => {
    const item = getSelectedEmployeeListItem();
    if (item) promptDelete(item);
  };

  const handleStatusChange = (val: "active" | "former") => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const saveChangeJob = async () => {
    if (!changeJobEmployee || !newJobId || !newAssignmentDate) return;
    try {
      const dto = {
        idJobTitle: newJobId,
        idEmploymentType: newEmpTypeId,
        assignmentDate: newAssignmentDate,
        endDate: newEndDate || null,
        hasFixedSchedule: newHasFixedSchedule,
      };
      if (isRenewal) {
        await EmployeeService.renewContract(changeJobEmployee.idEmployee, dto);
      } else {
        await EmployeeService.changeJob(changeJobEmployee.idEmployee, dto);
      }
      setChangeJobEmployee(null);
      loadEmployees();
      if (selectedEmployeeDetail?.idEmployee === changeJobEmployee.idEmployee) {
        const updated = await EmployeeService.getById(
          changeJobEmployee.idEmployee,
        );
        setSelectedEmployeeDetail(updated);
      }
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors du changement de poste.",
        "error"
      );
    }
  };

  // Terminate Contract State
  const [terminateContractEmployee, setTerminateContractEmployee] =
    useState<EmployeeListItem | null>(null);
  const [contractEndDate, setContractEndDate] = useState("");

  const openTerminateContractModal = (item: EmployeeListItem) => {
    setTerminateContractEmployee(item);
    setContractEndDate(new Date().toISOString().split("T")[0]);
  };

  const saveTerminateContract = async () => {
    if (!terminateContractEmployee) return;
    try {
      await EmployeeService.endJob(
        terminateContractEmployee.idEmployee,
        contractEndDate,
      );
      setTerminateContractEmployee(null);
      loadEmployees();
      if (
        view === "details" &&
        selectedEmployeeDetail?.idEmployee ===
          terminateContractEmployee.idEmployee
      ) {
        setView("list");
      }
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la clôture du contrat.",
        "error"
      );
    }
  };

  const savePlanning = async (data: {
    teamId: string;
    availabilities: any[];
  }) => {
    if (!planningEmployee) return;
    try {
      if (data.teamId !== undefined) {
        await EmployeeService.setTeam(planningEmployee.idEmployee, data.teamId);
      }
      if (data.availabilities) {
        await EmployeeService.setAvailabilities(
          planningEmployee.idEmployee,
          data.availabilities.map((a) => ({
            dayOfWeek: a.dayOfWeek as number,
            customStartTime: a.customStartTime ?? null,
            customEndTime: a.customEndTime ?? null,
            idShiftType: a.idShiftType ?? null,
          })),
        );
      }
      loadEmployees();
      if (selectedEmployeeDetail?.idEmployee === planningEmployee.idEmployee) {
        const updated = await EmployeeService.getById(
          planningEmployee.idEmployee,
        );
        setSelectedEmployeeDetail(updated);
      }
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la sauvegarde de la planification.",
        "error"
      );
    }
  };

  const handleCreate = () => {
    setSelectedEmployeeDetail(null);
    setView("create");
  };

  const handleEdit = async (item: EmployeeListItem) => {
    try {
      const detail = await EmployeeService.getById(item.idEmployee);
      setSelectedEmployeeDetail(detail);
      setView("edit", item.idEmployee);
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la récupération de l'employé.",
        "error"
      );
    }
  };

  const handleViewDetails = async (item: EmployeeListItem) => {
    try {
      const detail = await EmployeeService.getById(item.idEmployee);
      setSelectedEmployeeDetail(detail);
      setView("details", item.idEmployee);
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la récupération des détails.",
        "error"
      );
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const promptDelete = (item: EmployeeListItem) => {
    setEmployeeToDelete(item);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await EmployeeService.delete(employeeToDelete.idEmployee);
      setConfirmOpen(false);
      setEmployeeToDelete(null);
      if (view === "details") setView("list");
      else loadEmployees();
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || err.message || "Erreur lors de la suppression de l'employé.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveForm = async (savedData: any) => {
    const { formData, username, selectedRoles, overrides, planningData } =
      savedData;

    const permissionsOverrides = Object.entries(overrides)
      .filter(([, value]) => value !== "default")
      .map(([idPermission, value]) => ({
        idPermission,
        overrideType: value as "grant" | "deny" | "default",
      }));

    const userAccount = formData.hasUserAccount
      ? {
          username,
          roles: (selectedRoles as Role[]).map((r) => r.idRole),
          permissionsOverrides,
        }
      : null;

    const dto = {
      name: formData.name,
      lastname: formData.lastname,
      birthdate: formData.birthdate || undefined,
      address: formData.address || undefined,
      emailContact: formData.emailContact || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      notes: formData.notes || undefined,
      job: formData.idJobTitle
        ? {
            idJobTitle: formData.idJobTitle,
            idEmploymentType: formData.idEmploymentType,
            assignmentDate: formData.assignmentDate,
            endDate: formData.endDate || null,
            hasFixedSchedule: formData.hasFixedSchedule || false,
          }
        : null,
      internship: formData.internship
        ? {
            schoolName: formData.internship.schoolName || null,
            academicSupervisorName:
              formData.internship.academicSupervisorName || null,
            professionnalSupervisorName:
              formData.internship.professionnalSupervisorName || null,
          }
        : null,
      userAccount,
    };

    try {
      let employeeId = selectedEmployeeDetail?.idEmployee;

      if (view === "create") {
        const newEmployee = await EmployeeService.create(dto);
        employeeId = newEmployee.idEmployee;
      } else if (employeeId) {
        await EmployeeService.update(employeeId, dto);
      }

      // Save planning data if we have an employeeId and planningData is provided
      if (employeeId && planningData) {
        if (planningData.teamId !== undefined) {
          await EmployeeService.setTeam(employeeId, planningData.teamId);
        }
        if (planningData.availabilities) {
          const formattedAvailabilities = planningData.availabilities.map(
            (a: any) => ({
              dayOfWeek: a.dayOfWeek as number,
              customStartTime: a.customStartTime ?? null,
              customEndTime: a.customEndTime ?? null,
              idShiftType: a.idShiftType ?? null,
            }),
          );
          await EmployeeService.setAvailabilities(
            employeeId,
            formattedAvailabilities,
          );
        }
      }

      setView("list");
      setSelectedEmployeeDetail(null);
      // Let the useEffect handle loadEmployees to avoid duplicate requests
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error ||
          err.message ||
          "Erreur lors de l'enregistrement de l'employé.",
        "error",
      );
    }
  };

  const handleBack = () => {
    setView("list");
    setSelectedEmployeeDetail(null);
  };

  return (
    <div className="w-full">
      {view !== "list" && (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 -ml-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour à la liste
        </Button>
      )}

      {view === "list" && (
        <EmployeesTable
          employees={employeesList}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={promptDelete}
          onChangeJob={openChangeJobModal}
          onEditPlanning={handleEditPlanning}
          onTerminateContract={openTerminateContractModal}
          onRenewContract={openRenewContractModal}
          jobTitles={jobTitles}
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
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      )}

      {(view === "create" || (view === "edit" && selectedEmployeeDetail)) && (
        <EmployeeForm
          initialData={
            selectedEmployeeDetail
              ? {
                  idEmployee: selectedEmployeeDetail.idEmployee,
                  employeeCode: selectedEmployeeDetail.employeeCode,
                  name: selectedEmployeeDetail.name || "",
                  lastname: selectedEmployeeDetail.lastname || "",
                  birthdate: selectedEmployeeDetail.birthdate || undefined,
                  address: selectedEmployeeDetail.address || undefined,
                  emailContact:
                    selectedEmployeeDetail.emailContact || undefined,
                  phoneNumber: selectedEmployeeDetail.phoneNumber || undefined,
                  notes: selectedEmployeeDetail.notes || undefined,
                  idJobTitle:
                    selectedEmployeeDetail.job?.idJobTitle || undefined,
                  assignmentDate: selectedEmployeeDetail.job?.assignmentDate
                    ? new Date(selectedEmployeeDetail.job.assignmentDate)
                        .toISOString()
                        .split("T")[0]
                    : undefined,
                  endDate: selectedEmployeeDetail.job?.endDate
                    ? new Date(selectedEmployeeDetail.job.endDate)
                        .toISOString()
                        .split("T")[0]
                    : undefined,
                  hasFixedSchedule:
                    selectedEmployeeDetail.job?.hasFixedSchedule || undefined,
                  idEmploymentType:
                    selectedEmployeeDetail.job?.idEmploymentType || undefined,
                  isInternship: !!selectedEmployeeDetail.internship,
                  internship: selectedEmployeeDetail.internship,
                  hasUserAccount: !!selectedEmployeeDetail.userAccount,
                  userAccount: selectedEmployeeDetail.userAccount,
                  team: selectedEmployeeDetail.team,
                  availabilities: selectedEmployeeDetail.availabilities,
                }
              : undefined
          }
          availableJobTitles={jobTitles}
          availableEmploymentTypes={employmentTypes}
          availableRoles={availableRoles}
          availablePermissions={availablePermissions}
          rolePermissionsMapping={rolePermissionsMapping}
          availableTeams={teams}
          availableShiftTypes={shiftTypes}
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
                  {selectedEmployeeDetail.name}{" "}
                  {selectedEmployeeDetail.lastname}
                </h3>
                {selectedEmployeeDetail.internship && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Stagiaire
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5 flex items-center gap-2">
                <span className="font-bold text-primary">
                  {selectedEmployeeDetail.employeeCode || "CODE-NON-DEFINI"}
                </span>
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
                onClick={handleEditClick}
                className="rounded-xl px-4 gap-2 font-medium border-border hover:bg-muted"
              >
                <Edit className="size-4 text-muted-foreground" />
                Modifier le profil
              </Button>
              {selectedStatus === "active" && (
                <Button
                  variant="outline"
                  onClick={handleEditPlanningClick}
                  className="rounded-xl px-4 gap-2 font-medium border-border hover:bg-muted text-primary"
                >
                  <CalendarDays className="size-4" />
                  Disponibilités
                </Button>
              )}
              {selectedStatus === "active" ? (
                <Button
                  onClick={handleChangeJobClick}
                  className="rounded-xl px-4 gap-2 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  <Briefcase className="size-4" />
                  Changer de poste
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    const item = getSelectedEmployeeListItem();
                    if (item) openRenewContractModal(item);
                  }}
                  className="rounded-xl px-4 gap-2 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Briefcase className="size-4" />
                  Renouveler le contrat
                </Button>
              )}
              <Button
                onClick={handleDeleteClick}
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
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                  Informations Personnelles
                </h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Nom Complet
                    </span>
                    <span className="font-semibold text-foreground text-base">
                      {selectedEmployeeDetail.name}{" "}
                      {selectedEmployeeDetail.lastname}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Date de naissance
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedEmployeeDetail.birthdate
                        ? new Date(
                            selectedEmployeeDetail.birthdate,
                          ).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Adresse
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedEmployeeDetail.address || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                  Informations de Contact
                </h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      E-mail de contact
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedEmployeeDetail.emailContact || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Numéro de téléphone
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedEmployeeDetail.phoneNumber || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedEmployeeDetail.internship && (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                    Détails du Stage
                  </h4>
                  <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        École d'origine
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedEmployeeDetail.internship.schoolName || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Tuteur Académique
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedEmployeeDetail.internship
                            .academicSupervisorName || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Tuteur Professionnel
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedEmployeeDetail.internship
                            .professionnalSupervisorName || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                  Informations du Poste
                </h4>
                {selectedEmployeeDetail.job ? (
                  <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Poste actuel
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedEmployeeDetail.job.jobTitle || "Non assigné"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Type de contrat
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedEmployeeDetail.internship
                            ? "Stage"
                            : "CDI / CDD"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Date d'assignation
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedEmployeeDetail.job.assignmentDate
                            ? new Date(
                                selectedEmployeeDetail.job.assignmentDate,
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Date de fin
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedEmployeeDetail.job.endDate
                            ? new Date(
                                selectedEmployeeDetail.job.endDate,
                              ).toLocaleDateString("fr-FR")
                            : "Indéterminée"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Gestion des horaires
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedEmployeeDetail.job.hasFixedSchedule
                            ? "Horaires de travail fixes"
                            : "Horaires de travail flexibles"}
                        </span>
                      </div>
                      <span
                        className={`size-3 rounded-full ${selectedEmployeeDetail.job.hasFixedSchedule ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"}`}
                      />
                    </div>
                    {selectedStatus === "active" ? (
                      <div className="border-t pt-3 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTerminateContractClick}
                          className="w-full text-xs font-semibold gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl"
                        >
                          <UserX className="size-3.5" />
                          Terminer le contrat
                        </Button>
                      </div>
                    ) : (
                      <div className="border-t pt-3 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const item = getSelectedEmployeeListItem();
                            if (item) openRenewContractModal(item);
                          }}
                          className="w-full text-xs font-semibold gap-2 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 rounded-xl"
                        >
                          <Briefcase className="size-3.5" />
                          Renouveler le contrat
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/15 border rounded-2xl p-5 text-center text-muted-foreground text-sm py-8">
                    Aucun poste assigné
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                  Équipe & Planification
                </h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Équipe Assignée
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedEmployeeDetail.team?.teamName || "Aucune équipe"}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <span className="text-xs text-muted-foreground block mb-2">
                      Disponibilités / Horaires Spécifiques
                    </span>
                    {selectedEmployeeDetail.availabilities &&
                    selectedEmployeeDetail.availabilities.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedEmployeeDetail.availabilities.map(
                          (avail, index) => {
                            const days = [
                              "Dimanche",
                              "Lundi",
                              "Mardi",
                              "Mercredi",
                              "Jeudi",
                              "Vendredi",
                              "Samedi",
                            ];
                            const dayName =
                              avail.dayOfWeek !== null
                                ? days[avail.dayOfWeek]
                                : "Tous les jours";
                            return (
                              <li
                                key={index}
                                className="text-sm text-foreground flex justify-between items-center bg-background px-3 py-1.5 rounded-lg border"
                              >
                                <span className="font-medium">{dayName}</span>
                                <span className="text-muted-foreground">
                                  {avail.idShiftType
                                    ? avail.shiftLabel
                                    : `${avail.customStartTime} - ${avail.customEndTime}`}
                                </span>
                              </li>
                            );
                          },
                        )}
                      </ul>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Aucune disponibilité spécifique
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">
                  Sécurité & Compte Utilisateur
                </h4>
                <div className="bg-muted/15 border rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Statut du compte
                      </span>
                      <span
                        className={`font-semibold ${selectedEmployeeDetail.userAccount ? "text-green-600" : "text-muted-foreground"}`}
                      >
                        {selectedEmployeeDetail.userAccount
                          ? "Compte actif"
                          : "Pas de compte utilisateur"}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${selectedEmployeeDetail.userAccount ? "bg-green-500/10 text-green-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {selectedEmployeeDetail.userAccount ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  {selectedEmployeeDetail.userAccount && (
                    <div className="border-t pt-3 space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Nom d'utilisateur
                        </span>
                        <span className="font-semibold text-foreground">
                          {selectedEmployeeDetail.userAccount.username}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Rôles système attribués
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selectedEmployeeDetail.userAccount.roles.map((r) => (
                            <span
                              key={r.idRole}
                              className="px-2 py-0.5 text-xs font-semibold rounded-md bg-secondary/10 text-secondary border border-secondary/15"
                            >
                              {r.label}
                            </span>
                          ))}
                          {selectedEmployeeDetail.userAccount.roles.length ===
                            0 && (
                            <span className="text-xs italic text-muted-foreground">
                              Aucun rôle attribué
                            </span>
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
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                Notes Additionnelles
              </h4>
              <p className="text-sm bg-muted/10 border border-border/30 rounded-xl p-4 text-muted-foreground italic leading-relaxed">
                "{selectedEmployeeDetail.notes}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Change Job Dialog */}
      <Dialog
        open={!!changeJobEmployee}
        onOpenChange={(open) => !open && setChangeJobEmployee(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Briefcase className="size-5 text-primary" />
              {isRenewal ? "Renouvellement de contrat" : "Changer de poste"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {isRenewal
                ? `Renouveler le contrat de ${changeJobEmployee?.name} ${changeJobEmployee?.lastname}. Une nouvelle ligne de poste sera créée et l'employé redeviendra actif.`
                : `Affectez ${changeJobEmployee?.name} ${changeJobEmployee?.lastname} à un nouveau poste de travail. L'ancien poste sera automatiquement historisé.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Intitulé du poste
              </label>
              <select
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionnez un poste</option>
                {jobTitles.map((j) => (
                  <option key={j.idJobTitle} value={j.idJobTitle}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type de contrat
              </label>
              <select
                value={newEmpTypeId}
                onChange={(e) => setNewEmpTypeId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {employmentTypes.map((et) => (
                  <option key={et.idEmploymentType} value={et.idEmploymentType}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date d'affectation
              </label>
              <Input
                type="date"
                value={newAssignmentDate}
                onChange={(e) => setNewAssignmentDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date de fin (Optionnelle)
              </label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>

            {/* Fixed Schedule Switch */}
            <div className="flex items-center justify-between bg-muted/10 border border-border p-3.5 rounded-xl shadow-sm">
              <div>
                <span className="text-sm font-semibold block text-foreground">
                  Horaires de travail fixes
                </span>
                <span className="text-xs text-muted-foreground block">
                  Cet employé a-t-il des horaires fixes ou variables ?
                </span>
              </div>
              <Switch
                checked={newHasFixedSchedule}
                onCheckedChange={setNewHasFixedSchedule}
                className="border border-input/50 shadow-sm data-[state=checked]:border-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setChangeJobEmployee(null)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={saveChangeJob}
              disabled={!newJobId || !newAssignmentDate}
              className={`rounded-xl font-medium text-white ${isRenewal ? "bg-green-600 hover:bg-green-700 disabled:bg-green-600/50" : "bg-primary hover:bg-primary/90"}`}
            >
              {isRenewal
                ? "Enregistrer le renouvellement"
                : "Confirmer le changement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmployeePlanningModal
        isOpen={!!planningEmployee}
        onClose={() => setPlanningEmployee(null)}
        employeeName={
          planningEmployee
            ? `${planningEmployee.name} ${planningEmployee.lastname}`
            : undefined
        }
        availableTeams={teams}
        availableShiftTypes={shiftTypes}
        initialTeamId={planningEmployee?.team?.idTeam}
        initialAvailabilities={planningEmployee?.availabilities || []}
        onSave={savePlanning}
      />

      {/* Terminate Contract Dialog */}
      <Dialog
        open={!!terminateContractEmployee}
        onOpenChange={(open) => !open && setTerminateContractEmployee(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserX className="size-5 text-orange-600" />
              Terminer le contrat
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Veuillez définir la date de fin de contrat pour{" "}
              {terminateContractEmployee?.name}{" "}
              {terminateContractEmployee?.lastname}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date de fin
              </label>
              <Input
                type="date"
                value={contractEndDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setContractEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="ghost"
              onClick={() => setTerminateContractEmployee(null)}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={saveTerminateContract}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirmer la fin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Key Modal */}
      <Dialog
        open={!!generatedKey}
        onOpenChange={(open) => !open && setGeneratedKey(null)}
      >
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
              Veuillez copier cette clé immédiatement. Pour des raisons de
              sécurité, elle ne sera plus affichée après la fermeture de cette
              fenêtre.
            </div>

            <div className="flex flex-col space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Clé d'accès générée
                </label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    readOnly
                    value={generatedKey?.token || ""}
                    className="font-mono text-center font-bold tracking-wider bg-muted/30 border-dashed border-2 py-6 text-sm rounded-xl"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-12 rounded-xl shrink-0"
                    onClick={() => {
                      if (generatedKey)
                        navigator.clipboard.writeText(generatedKey.token);
                    }}
                    title="Copier"
                  >
                    <Copy className="size-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {generatedKey && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">
                    Date d'expiration
                  </label>
                  <p className="text-sm font-medium mt-1 text-orange-600 bg-orange-50 border border-orange-100 p-2 rounded-lg inline-block">
                    {new Date(generatedKey.expiresAt).toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="p-4 bg-muted/10 border-t">
            <Button
              onClick={() => setGeneratedKey(null)}
              className="w-full rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white"
            >
              <Check className="size-4 mr-2" />
              J'ai copié la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmation de suppression"
        description={`Êtes-vous sûr de vouloir supprimer l'employé ${employeeToDelete?.name} ${employeeToDelete?.lastname} ?`}
        onConfirm={executeDelete}
        loading={isDeleting}
      />

      {snackbar.isOpen && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        />
      )}
    </div>
  );
}
