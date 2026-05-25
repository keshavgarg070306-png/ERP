import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToastStore } from '../context/toastStore';
import { useNotificationStore } from '../context/notificationStore';
import { useAuthStore } from '../context/authStore';
import { Loader2, Plus, Edit2, Check, AlertTriangle, Upload } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add Product modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductCat, setNewProductCat] = useState('');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductReorder, setNewProductReorder] = useState('5');
  const [newProductCost, setNewProductCost] = useState('50');
  const [newProductSupplier, setNewProductSupplier] = useState('1'); // Default TechDistributors
  const [newProductRetail, setNewProductRetail] = useState('100');
  const [newProductWholesale, setNewProductWholesale] = useState('80');

  const { addToast } = useToastStore();
  const { fetchNotifications } = useNotificationStore();

  const loadInventoryData = async () => {
    try {
      // Build filter queries
      let query = `/products?limit=100`;
      if (search) query += `&search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (categoryFilter) query += `&categoryId=${categoryFilter}`;

      const res = await apiFetch(query);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch inventory products', 'error');
    }
  };

  const loadCategories = async () => {
    // Seed standard category lookups
    setCategories([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Office Supplies' },
      { id: 3, name: 'Industrial Hardware' },
      { id: 4, name: 'Software Licenses' },
    ]);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadInventoryData();
    }, 300); // Debounce search changes

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadCategories();
    loadInventoryData().finally(() => setLoading(false));
  }, []);

  // Inline Stock Edit
  const startStockEdit = (p: any) => {
    setEditingStockId(p.id);
    setTempStockValue(String(p.stockQty));
  };

  const saveStockEdit = async (id: number) => {
    const parsed = parseInt(tempStockValue);
    if (isNaN(parsed) || parsed < 0) {
      addToast('Please enter a valid stock quantity', 'warning');
      return;
    }

    try {
      await apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stockQty: parsed }),
      });
      addToast('Stock level updated successfully', 'success');
      setEditingStockId(null);
      loadInventoryData();
      fetchNotifications(); // Refresh notifications in top bell in case low stock triggered
    } catch (err: any) {
      addToast(err.message || 'Error updating stock level', 'error');
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductSku || !newProductCat) {
      addToast('Please fill all mandatory fields', 'warning');
      return;
    }

    try {
      const pricingTiers = {
        Retail: parseFloat(newProductRetail) || 0,
        Wholesale: parseFloat(newProductWholesale) || 0,
      };

      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProductName,
          sku: newProductSku,
          categoryId: newProductCat,
          stockQty: newProductStock,
          reorderPoint: newProductReorder,
          unitCost: newProductCost,
          supplierId: newProductSupplier,
          pricingTiers,
        }),
      });

      addToast('Product added to catalog successfully', 'success');
      setIsModalOpen(false);
      loadInventoryData();
      fetchNotifications(); // Update bell status
      
      // Reset form
      setNewProductName('');
      setNewProductSku('');
      setNewProductCat('');
      setNewProductStock('10');
      setNewProductReorder('5');
      setNewProductCost('50');
      setNewProductRetail('100');
      setNewProductWholesale('80');
    } catch (err: any) {
      addToast(err.message || 'Error adding product', 'error');
    }
  };

  // CSV Drag-and-Drop Mock Handler
  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast('Please upload a valid CSV file (.csv)', 'warning');
      return;
    }

    addToast('Parsing uploaded CSV catalog items...', 'info');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length <= 1) {
        addToast('CSV file is empty or missing data rows', 'warning');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map((col) => col.replace(/^["']|["']$/g, '').trim());
        if (columns.length < 6) continue;

        const [name, sku, categoryIdStr, stockQtyStr, reorderPointStr, unitCostStr] = columns;

        try {
          await apiFetch('/products', {
            method: 'POST',
            body: JSON.stringify({
              name,
              sku,
              categoryId: parseInt(categoryIdStr) || 1,
              stockQty: parseInt(stockQtyStr) || 10,
              reorderPoint: parseInt(reorderPointStr) || 5,
              unitCost: parseFloat(unitCostStr) || 10.0,
              supplierId: 1, // Default supplier reference
              pricingTiers: {
                Retail: (parseFloat(unitCostStr) || 10.0) * 1.5,
                Wholesale: (parseFloat(unitCostStr) || 10.0) * 1.2,
              },
            }),
          });
          successCount++;
        } catch (err) {
          console.error(`Import error row ${i}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        addToast(`Successfully imported ${successCount} new products from CSV!`, 'success');
        loadInventoryData();
        fetchNotifications();
      }
      if (errorCount > 0) {
        addToast(`Failed to import ${errorCount} rows. Check SKU uniqueness.`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Low stock item checker for banner
  const lowStockProducts = products.filter((p) => p.stockQty < p.reorderPoint);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Catalog</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">Products, Stock Management & Purchasing Triggers</p>
        </div>
        {user?.role?.writeInventory && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 font-mono text-xs uppercase tracking-wide">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex gap-3 items-start animate-fade-in shadow-glow-warning">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <h4 className="text-sm font-bold font-mono text-warning">Low Stock Restock Orders Alert</h4>
            <p className="text-xs text-text-primary mt-1">
              There are currently <span className="font-bold text-warning">{lowStockProducts.length} items</span> below their reorder threshold. 
              The system has automatically generated pending purchase request records for: {lowStockProducts.map(p => p.sku).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* CSV Drag and Drop Zone */}
      {user?.role?.writeInventory && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-border bg-surface/30 hover:border-text-muted/50'
          }`}
          onClick={() => addToast('Simulating file dialog selector. Drop a CSV file here for instant import.', 'info')}
        >
          <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <h4 className="text-sm font-bold font-mono text-text-primary">Bulk Catalog Import</h4>
          <p className="text-xs text-text-muted mt-1">Drag and drop your product catalog CSV here to bulk import inventory</p>
        </div>
      )}

      {/* Filters bar */}
      <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search SKU or Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs text-xs font-mono"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field text-xs font-mono bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs font-mono bg-background"
          >
            <option value="">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        
        <span className="text-[10px] font-mono text-text-muted bg-[#1E2130]/30 border border-border px-3 py-1 rounded-full uppercase">
          Total Products: <span className="text-text-primary font-bold">{products.length}</span>
        </span>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <DataTable
          searchable={false} // Custom filter bar is richer
          columns={[
            { key: 'name', label: 'Product Name', sortable: true, render: (p) => <span className="font-bold text-text-primary">{p.name}</span> },
            { key: 'sku', label: 'SKU', sortable: true, render: (p) => <span className="text-text-muted">{p.sku}</span> },
            { key: 'category', label: 'Category', render: (p) => p.category?.name || 'Unassigned' },
            {
              key: 'stockQty',
              label: 'Stock Qty',
              sortable: true,
              render: (p) => (
                <div className="flex items-center gap-2">
                  {editingStockId === p.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tempStockValue}
                        onChange={(e) => setTempStockValue(e.target.value)}
                        className="input-field py-0.5 px-1.5 w-16 text-center font-bold text-xs"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveStockEdit(p.id)}
                      />
                      <button onClick={() => saveStockEdit(p.id)} className="p-1 bg-success/20 text-success border border-success/30 rounded hover:bg-success/30 transition-all active:scale-90">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{p.stockQty}</span>
                      {user?.role?.writeInventory && (
                        <button onClick={() => startStockEdit(p)} className="text-text-muted hover:text-primary p-0.5 rounded hover:bg-surface transition-all active:scale-95">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ),
            },
            { key: 'reorderPoint', label: 'Reorder Point', sortable: true, render: (p) => <span className="tabular-nums text-text-muted">{p.reorderPoint}</span> },
            { key: 'unitCost', label: 'Unit Cost', sortable: true, render: (p) => <span className="tabular-nums font-mono text-text-muted">${p.unitCost.toFixed(2)}</span> },
            {
              key: 'pricingTiers',
              label: 'Retail / Wholesale Price',
              render: (p) => {
                const tiers = typeof p.pricingTiers === 'string' ? JSON.parse(p.pricingTiers) : p.pricingTiers;
                return (
                  <span className="font-mono text-xs tabular-nums text-text-muted">
                    ${tiers?.Retail || '—'} <span className="text-border mx-1">/</span> ${tiers?.Wholesale || '—'}
                  </span>
                );
              },
            },
            { key: 'status', label: 'Status Badge', render: (p) => <StatusBadge status={p.status} /> },
          ]}
          data={products}
        />
      )}

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product to Catalog" size="lg">
        <form onSubmit={handleAddProduct} className="flex flex-col gap-4 font-mono text-xs text-text-primary">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="font-bold text-text-muted uppercase">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Laser Sensor Module"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="input-field"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">SKU Identifier *</label>
              <input
                type="text"
                placeholder="e.g. NC-LSM-02"
                value={newProductSku}
                onChange={(e) => setNewProductSku(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Category Category *</label>
              <select
                value={newProductCat}
                onChange={(e) => setNewProductCat(e.target.value)}
                className="input-field bg-background"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Initial Stock *</label>
              <input
                type="number"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Reorder Threshold *</label>
              <input
                type="number"
                value={newProductReorder}
                onChange={(e) => setNewProductReorder(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                value={newProductCost}
                onChange={(e) => setNewProductCost(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Pricing Tier: Retail ($)</label>
              <input
                type="number"
                step="0.01"
                value={newProductRetail}
                onChange={(e) => setNewProductRetail(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Pricing Tier: Wholesale ($)</label>
              <input
                type="number"
                step="0.01"
                value={newProductWholesale}
                onChange={(e) => setNewProductWholesale(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Supplier Field *</label>
              <select
                value={newProductSupplier}
                onChange={(e) => setNewProductSupplier(e.target.value)}
                className="input-field bg-background"
                required
              >
                <option value="1">TechDistributors Global</option>
                <option value="2">Apex Materials Ltd</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary uppercase text-[10px] tracking-wider">
              Cancel
            </button>
            <button type="submit" className="btn-primary uppercase text-[10px] tracking-wider">
              Confirm Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
