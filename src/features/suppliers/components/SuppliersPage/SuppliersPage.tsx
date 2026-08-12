import { useState, useEffect } from "react";
import { Snackbar } from "@/components/ui/Snackbar/snackbar";
import * as api from "../../services/supplier.service";
import type { Supplier, SupplierProduct, SupplierDto, SupplierProductDto, SuppliedItem } from "../../types/supplier.type";
import { ItemService } from "@/features/items/services";

import { SuppliersList } from "../SuppliersList/SuppliersList";
import { SupplierProductsList } from "../SupplierProductsList/SupplierProductsList";
import { SupplierForm } from "../SupplierForm/SupplierForm";
import { SupplierProductForm } from "../ProductForms/SupplierProductForm";
import { SupplierProductPriceForm } from "../ProductForms/SupplierProductPriceForm";
import { SupplierProductLinkForm } from "../ProductForms/SupplierProductLinkForm";

export function SuppliersPage() {
  const [snackbar, setSnackbar] = useState<{ message: string, type: "success" | "error" | "info" } | null>(null);
  const addSnackbar = (message: string, type: "success" | "error" | "info") => setSnackbar({ message, type });
  
  // State: Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // State: Products (for selected supplier)
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Dialogs
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);

  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceProduct, setPriceProduct] = useState<SupplierProduct | null>(null);
  const [priceActionType, setPriceActionType] = useState<"change" | "fix">("change");

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkProduct, setLinkProduct] = useState<SupplierProduct | null>(null);
  const [linkedItems, setLinkedItems] = useState<SuppliedItem[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  
  useEffect(() => {
    fetchSuppliers();
  }, [supplierPage, supplierSearch]);

  useEffect(() => {
    if (selectedSupplier) {
      fetchProducts(selectedSupplier.idSupplier);
    }
  }, [selectedSupplier]);

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await api.getSuppliers({ page: supplierPage, limit: 10, search: supplierSearch });
      setSuppliers(res.records || []);
      setTotalSuppliers(res.total || 0);
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur lors du chargement des fournisseurs", "error");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchProducts = async (idSupplier: string) => {
    setLoadingProducts(true);
    try {
      const res = await api.getSupplierProducts({ idSupplier, limit: 100 });
      setProducts(res.records || []);
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur lors du chargement des produits", "error");
    } finally {
      setLoadingProducts(false);
    }
  };

  const openLinkDialog = async (product: SupplierProduct) => {
    setLinkProduct(product);
    setLinkDialogOpen(true);
    try {
      const [linksRes, itemsRes] = await Promise.all([
        api.getSuppliedItems({ idSupplierProduct: product.idSupplierProduct, limit: 100 }),
        ItemService.getAll()
      ]);
      setLinkedItems(linksRes.records || []);
      setAllItems(itemsRes);
    } catch (err) {
      addSnackbar("Erreur lors du chargement des articles liés", "error");
    }
  };

  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!linkProduct) return;
    const formData = new FormData(e.currentTarget);
    const idItem = formData.get("idItem") as string;
    
    try {
      await api.createSuppliedItem({ idItem, idSupplierProduct: linkProduct.idSupplierProduct });
      addSnackbar("Article lié avec succès", "success");
      // Refresh
      const linksRes = await api.getSuppliedItems({ idSupplierProduct: linkProduct.idSupplierProduct, limit: 100 });
      setLinkedItems(linksRes.records || []);
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur de liaison", "error");
    }
  };

  const handleDeleteLink = async (idSuppliedItem: string) => {
    try {
      await api.deleteSuppliedItem(idSuppliedItem);
      addSnackbar("Liaison supprimée", "success");
      setLinkedItems(prev => prev.filter(l => l.idSuppliedItem !== idSuppliedItem));
    } catch (err) {
      addSnackbar("Erreur de suppression", "error");
    }
  };

  // --- SUPPLIER ACTIONS ---
  const handleSaveSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: SupplierDto = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
      providesDelivery: formData.get("providesDelivery") === "true",
      deliveryDelay: Number(formData.get("deliveryDelay")) || undefined,
    };

    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.idSupplier, payload);
        addSnackbar("Fournisseur mis à jour", "success");
      } else {
        await api.createSupplier(payload);
        addSnackbar("Fournisseur créé", "success");
      }
      setSupplierDialogOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur de sauvegarde", "error");
    }
  };

  // --- PRODUCT ACTIONS ---
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    const formData = new FormData(e.currentTarget);
    const payload: SupplierProductDto = {
      name: formData.get("name") as string,
      actualPrice: Number(formData.get("actualPrice")),
      minPurchaseNumber: Number(formData.get("minPurchaseNumber")) || 1,
      idSupplier: selectedSupplier.idSupplier,
      notes: formData.get("notes") as string,
    };

    try {
      if (editingProduct) {
        await api.updateSupplierProduct(editingProduct.idSupplierProduct, payload);
        addSnackbar("Produit mis à jour", "success");
      } else {
        await api.createSupplierProduct(payload);
        addSnackbar("Produit ajouté", "success");
      }
      setProductDialogOpen(false);
      fetchProducts(selectedSupplier.idSupplier);
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur de sauvegarde", "error");
    }
  };

  // --- PRICE ACTIONS ---
  const handleSavePrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!priceProduct || !selectedSupplier) return;
    
    const formData = new FormData(e.currentTarget);
    const newPrice = Number(formData.get("price"));
    const changeDate = formData.get("changeDate") as string | undefined;

    try {
      if (priceActionType === "change") {
        await api.changeProductPrice(priceProduct.idSupplierProduct, newPrice, changeDate);
        addSnackbar("Nouveau prix enregistré (Historisé)", "success");
      } else {
        await api.fixProductPriceError(priceProduct.idSupplierProduct, newPrice);
        addSnackbar("Erreur de prix corrigée (Sans nouvel historique)", "success");
      }
      setPriceDialogOpen(false);
      fetchProducts(selectedSupplier.idSupplier);
    } catch (err: any) {
      addSnackbar(err.response?.data?.message || "Erreur de modification du prix", "error");
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in">
      <SuppliersList 
        suppliers={suppliers}
        loadingSuppliers={loadingSuppliers}
        totalSuppliers={totalSuppliers}
        supplierPage={supplierPage}
        supplierSearch={supplierSearch}
        onSearchChange={setSupplierSearch}
        onPageChange={setSupplierPage}
        selectedSupplier={selectedSupplier}
        onSelectSupplier={setSelectedSupplier}
        onNewSupplier={() => { setEditingSupplier(null); setSupplierDialogOpen(true); }}
      />

      <SupplierProductsList 
        selectedSupplier={selectedSupplier}
        products={products}
        loadingProducts={loadingProducts}
        onEditSupplier={(supplier) => { setEditingSupplier(supplier); setSupplierDialogOpen(true); }}
        onNewProduct={() => { setEditingProduct(null); setProductDialogOpen(true); }}
        onEditProduct={(product) => { setEditingProduct(product); setProductDialogOpen(true); }}
        onPriceProduct={(product, actionType) => {
          setPriceProduct(product);
          setPriceActionType(actionType);
          setPriceDialogOpen(true);
        }}
        onLinkProduct={(product) => openLinkDialog(product)}
      />

      <SupplierForm 
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        editingSupplier={editingSupplier}
        onSave={handleSaveSupplier}
      />

      <SupplierProductForm 
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
      />

      <SupplierProductPriceForm 
        open={priceDialogOpen}
        onOpenChange={setPriceDialogOpen}
        priceProduct={priceProduct}
        priceActionType={priceActionType}
        onSave={handleSavePrice}
      />

      <SupplierProductLinkForm 
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        linkProduct={linkProduct}
        linkedItems={linkedItems}
        allItems={allItems}
        onAddLink={handleAddLink}
        onDeleteLink={handleDeleteLink}
      />

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
