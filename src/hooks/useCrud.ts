import { useState, useEffect, useCallback } from "react";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function useCrud<T, C = Partial<T>, U = Partial<T>>(
  fetchFn: () => Promise<T[]>,
  createFn: (data: C) => Promise<T>,
  updateFn: (id: string, data: U) => Promise<T>,
  deleteFn: (id: string) => Promise<void>,
  idKey: keyof T
) {
  const [data, setData] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchFn();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (
    newData: C,
    showSnackbar: (message: string, type: SnackbarType) => void
  ) => {
    try {
      const created = await createFn(newData);
      setData((prev) => [...prev, created]);
      showSnackbar("Ajout réussi.", "success");
    } catch (error) {
      showSnackbar("Erreur lors de l'ajout.", "error");
    }
  };

  const handleEdit = async (
    id: string,
    updatedData: U,
    showSnackbar: (message: string, type: SnackbarType) => void
  ) => {
    try {
      const updated = await updateFn(id, updatedData);
      setData((prev) =>
        prev.map((item) =>
          (item[idKey] as unknown as string) === id ? { ...item, ...updatedData, ...(updated || {}) } : item
        )
      );
      showSnackbar("Modification réussie.", "success");
    } catch (error) {
      showSnackbar("Erreur lors de la modification.", "error");
    }
  };

  const promptDelete = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async (
    showSnackbar: (message: string, type: SnackbarType) => void
  ) => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFn(itemToDelete);
      setData((prev) =>
        prev.filter((item) => (item[idKey] as unknown as string) !== itemToDelete)
      );
      showSnackbar("Suppression réussie.", "success");
    } catch (error) {
      showSnackbar("Erreur lors de la suppression.", "error");
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
