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
import { SupplierPaymentForm } from "@/features/purchases/components/PurchaseList/SupplierPaymentForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";

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
  const [totalProducts, setTotalProducts] = useState(0);
  const [productPage, setProductPage] = useState(1);

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
  const [allItems, setAllItems] = useState<import("@/features/items/types").Item[]>([]);
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [supplierPage, supplierSearch]);

  useEffect(() => {
    if (selectedSupplier) {
      fetchProducts(selectedSupplier.idSupplier, productPage);
    }
  }, [selectedSupplier, productPage]);

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const res = await api.getSuppliers({ page: supplierPage, limit: 10, search: supplierSearch });
      setSuppliers(res.records || []);
      setTotalSuppliers(res.total || 0);
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur lors du chargement des fournisseurs", "error");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchProducts = async (idSupplier: string, page = 1) => {
    setLoadingProducts(true);
    try {
      const res = await api.getSupplierProducts({ idSupplier, limit: 10, page });
      setProducts(res.records || []);
      setTotalProducts(res.total || 0);
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur lors du chargement des produits", "error");
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
        ItemService.getAll({ isProduced: false, limit: 1000 })
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
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur lors de l'enregistrement", "error");
    }
  };

  const handleDeleteLink = async (idSuppliedItem: string) => {
    try {
      await api.deleteSuppliedItem(idSuppliedItem);
      addSnackbar("Liaison supprimée", "success");
      setLinkedItems(prev => prev.filter(l => l.idSuppliedItem !== idSuppliedItem));
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur lors de la suppression de l'article lié", "error");
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
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur de sauvegarde", "error");
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
      fetchProducts(selectedSupplier.idSupplier, productPage);
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur de sauvegarde", "error");
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
      fetchProducts(selectedSupplier.idSupplier, productPage);
    } catch (err: unknown) {
      addSnackbar((err as any).response?.data?.message || "Erreur de modification du prix", "error");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-140px)] gap-6 animate-in fade-in">
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
        totalProducts={totalProducts}
        productPage={productPage}
        onPageChange={setProductPage}
        onEditSupplier={(supplier) => { setEditingSupplier(supplier); setSupplierDialogOpen(true); }}
        onNewProduct={() => { setEditingProduct(null); setProductDialogOpen(true); }}
        onEditProduct={(product) => { setEditingProduct(product); setProductDialogOpen(true); }}
        onPriceProduct={(product, actionType) => {
          setPriceProduct(product);
          setPriceActionType(actionType);
          setPriceDialogOpen(true);
        }}
        onLinkProduct={(product) => openLinkDialog(product)}
        onPaySupplier={(supplier) => {
          setPaymentSupplier(supplier);
          setPaymentDialogOpen(true);
        }}
        onBack={() => setSelectedSupplier(null)}
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

      {paymentDialogOpen && paymentSupplier && (
        <ConfirmDialog
          open={paymentDialogOpen}
          title="Paiement fournisseur"
          onOpenChange={(open) => { if (!open) setPaymentDialogOpen(false); }}
          onConfirm={() => {}}
          hideConfirmButton
          cancelText="Fermer"
        >
          <SupplierPaymentForm
            idSupplier={paymentSupplier.idSupplier}
            onSuccess={() => {
              setPaymentDialogOpen(false);
              addSnackbar("Paiement enregistré", "success");
              fetchProducts(paymentSupplier.idSupplier, productPage);
            }}
            onCancel={() => setPaymentDialogOpen(false)}
          />
        </ConfirmDialog>
      )}

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
