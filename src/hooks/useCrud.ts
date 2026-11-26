import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { SnackbarType } from "@/components/ui/Snackbar/snackbar";

export function useCrud<T, C = never, U = never>(
  fetchFn: () => Promise<T[]>,
  createFn: (data: C) => Promise<T>,
  updateFn: (id: string, data: U) => Promise<T>,
  deleteFn: (id: string) => Promise<void>,
  idKey: keyof T,
  queryKeys?: string[],
) {
  const queryClient = useQueryClient();
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

  const invalidateQueries = useCallback(() => {
    if (queryKeys && queryKeys.length > 0) {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  }, [queryClient, queryKeys]);

  const handleAdd = async (
    newData: C,
    showSnackbar: (message: string, type: SnackbarType) => void,
  ): Promise<T | undefined> => {
    try {
      const created = await createFn(newData);
      setData((prev) => [...prev, created]);
      invalidateQueries();
      fetchData();
      showSnackbar("Ajout réussi.", "success");
      return created;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de l'ajout.";
      showSnackbar(msg, "error");
      return undefined;
    }
  };

  const handleEdit = async (
    id: string,
    updatedData: U,
    showSnackbar: (message: string, type: SnackbarType) => void,
  ): Promise<T | undefined> => {
    try {
      const updated = await updateFn(id, updatedData);
      setData((prev) =>
        prev.map((item) =>
          (item[idKey] as unknown as string) === id
            ? { ...item, ...updatedData, ...(updated || {}) }
            : item,
        ),
      );
      invalidateQueries();
      fetchData();
      showSnackbar("Modification réussie.", "success");
      return updated;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de la modification.";
      showSnackbar(msg, "error");
      return undefined;
    }
  };

  const promptDelete = (id: string) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const executeDelete = async (
    showSnackbar: (message: string, type: SnackbarType) => void,
  ): Promise<void> => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteFn(itemToDelete);
      setData((prev) =>
        prev.filter(
          (item) => (item[idKey] as unknown as string) !== itemToDelete,
        ),
      );
      invalidateQueries();
      fetchData();
      showSnackbar("Suppression réussie.", "success");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
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
    fetchData,
  };
}
