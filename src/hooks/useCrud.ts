import { useState, useEffect, useCallback, useRef } from "react";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function useCrud<T, C = any, U = any>(
  fetchFn: () => Promise<T[]>,
  createFn: (data: C) => Promise<T>,
  updateFn: (id: string, data: U) => Promise<T>,
  deleteFn: (id: string) => Promise<void>,
  idKey: keyof T,
) {
  const [data, setData] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchFnRef.current();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (
    newData: C,
    showSnackbar: (message: string, type: SnackbarType) => void,
  ) => {
    try {
      const created = await createFn(newData);
      setData((prev) => [...prev, created]);
      showSnackbar("Ajout réussi.", "success");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de l'ajout.";
      showSnackbar(msg, "error");
    }
  };

  const handleEdit = async (
    id: string,
    updatedData: U,
    showSnackbar: (message: string, type: SnackbarType) => void,
  ) => {
    try {
      const updated = await updateFn(id, updatedData);
      setData((prev) =>
        prev.map((item) =>
          (item[idKey] as unknown as string) === id
            ? { ...item, ...updatedData, ...(updated || {}) }
            : item,
        ),
      );
      showSnackbar("Modification réussie.", "success");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de la modification.";
      showSnackbar(msg, "error");
    }
  };

  const promptDelete = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async (
    showSnackbar: (message: string, type: SnackbarType) => void,
  ) => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFn(itemToDelete);
      setData((prev) =>
        prev.filter(
          (item) => (item[idKey] as unknown as string) !== itemToDelete,
        ),
      );
      showSnackbar("Suppression réussie.", "success");
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de la suppression.";
      showSnackbar(msg, "error");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return {
    data,
    isOpen,
    setIsOpen,
    confirmOpen,
    setConfirmOpen,
    isDeleting,
    handleAdd,
    handleEdit,
    promptDelete,
    executeDelete,
  };
}
