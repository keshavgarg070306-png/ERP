import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Drawer } from '../components/Drawer';
import { StatusBadge } from '../components/StatusBadge';
import { useToastStore } from '../context/toastStore';
import { useAuthStore } from '../context/authStore';
import { Loader2, ListOrdered, FileText, CheckCircle2 } from 'lucide-react';

const PIPELINE_COLUMNS = ['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const Sales: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Order Form state (within standard Add modal or inline, let's offer a modal if quick-action trigger)
  // Let's first implement load Orders
  const { addToast } = useToastStore();

  const loadOrders = async () => {
    try {
      const res = await apiFetch('/orders?limit=100');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch sales pipeline', 'error');
    }
  };

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, orderId: number) => {
    e.dataTransfer.setData('text/plain', String(orderId));
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop!
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const orderIdStr = e.dataTransfer.getData('text/plain');
    const orderId = parseInt(orderIdStr);

    if (isNaN(orderId)) return;

    // Find current order
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (order.status === targetStatus) return;

    // Optimistic UI update
    const originalOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
    );

    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: targetStatus }),
      });
      addToast(`Order ${order.orderNumber} moved to ${targetStatus}`, 'success');
      loadOrders(); // Reload to capture any auto-invoice updates or timestamps
    } catch (err: any) {
      setOrders(originalOrders); // Rollback on error
      addToast(err.message || 'Failed to update order pipeline status', 'error');
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // Generate Invoice trigger
  const triggerInvoiceGeneration = async (order: any) => {
    try {
      // First update status to CONFIRMED if it was DRAFT
      if (order.status === 'DRAFT') {
        await apiFetch(`/orders/${order.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'CONFIRMED' }),
        });
      } else {
        // Just run confirmed trigger
        await apiFetch(`/orders/${order.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'CONFIRMED' }),
        });
      }
      
      addToast(`Draft invoice generated for ${order.orderNumber}`, 'success');
      setIsDrawerOpen(false);
      loadOrders();
    } catch (err: any) {
      addToast(err.message || 'Error generating invoice', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Orders</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">Kanban CRM & Fulfillment Pipeline</p>
        </div>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        /* Kanban Board Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto min-h-[60vh] pb-6">
          {PIPELINE_COLUMNS.map((colName) => {
            const colOrders = orders.filter((o) => o.status === colName);

            return (
              <div
                key={colName}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colName)}
                className="bg-[#12141A]/30 border border-[#1E2130]/80 rounded-xl p-3 flex flex-col gap-3 min-w-[200px]"
              >
                {/* Column Title */}
                <div className="flex justify-between items-center border-b border-border pb-2 flex-shrink-0 font-mono">
                  <span className="text-xs font-bold text-text-primary tracking-wide">{colName}</span>
                  <span className="text-[10px] text-text-muted bg-[#1E2130] px-2 py-0.5 rounded border border-border/80">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-grow overflow-y-auto flex flex-col gap-3 max-h-[65vh] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-12 border border-dashed border-border/50 rounded-lg text-center text-[10px] font-mono text-text-muted select-none">
                      Drop orders here
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable={user?.role?.writeSales}
                        onDragStart={(e) => user?.role?.writeSales ? handleDragStart(e, order.id) : e.preventDefault()}
                        onDragEnd={handleDragEnd}
                        onClick={() => openOrderDetails(order)}
                        className="bg-[#12141A] border border-border hover:border-primary/40 rounded-xl p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {/* ID & Date */}
                        <div className="flex justify-between items-start font-mono text-[10px] text-text-muted">
                          <span className="text-primary font-bold">{order.orderNumber}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Customer */}
                        <h4 className="text-sm font-bold font-mono text-text-primary tracking-tight truncate">
                          {order.customer?.name || 'Walk-in Customer'}
                        </h4>

                        {/* Items count & Value */}
                        <div className="flex justify-between items-center font-mono border-t border-[#1E2130] pt-2.5 mt-1">
                          <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <ListOrdered className="w-3.5 h-3.5" />
                            {order.items?.length || 0} items
                          </span>
                          <span className="text-xs font-bold text-success tabular-nums">
                            ${order.totalValue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedOrder ? `Order: ${selectedOrder.orderNumber}` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6 font-mono text-xs text-text-primary">
            {/* Status & Quick Info */}
            <div className="grid grid-cols-2 gap-4 bg-[#0A0B0F] p-4 border border-border rounded-xl">
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase">Fulfillment Status</span>
                <div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-text-muted text-[10px] uppercase">Order Value</span>
                <span className="text-base font-bold text-success">${selectedOrder.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2 border-t border-[#1E2130] pt-3">
                <span className="text-text-muted text-[10px] uppercase">Order Timestamp</span>
                <span className="text-text-primary">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-text-primary border-b border-border pb-1.5 uppercase tracking-wide">
                Customer Information
              </h4>
              <div className="flex flex-col gap-2 bg-surface/50 p-3 rounded-lg border border-border">
                <div className="flex justify-between">
                  <span className="text-text-muted">Client Name:</span>
                  <span className="text-text-primary font-bold">{selectedOrder.customer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Contact Email:</span>
                  <span className="text-text-primary">{selectedOrder.customer?.email}</span>
                </div>
                {selectedOrder.customer?.phone && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Contact Phone:</span>
                    <span className="text-text-primary">{selectedOrder.customer?.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-text-primary border-b border-border pb-1.5 uppercase tracking-wide">
                Line Items
              </h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-[#12141A]">
                    <tr className="text-[10px] text-text-muted text-left uppercase">
                      <th className="px-4 py-2">Item</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2130] text-xs">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#1E2130]/20">
                        <td className="px-4 py-2 font-bold text-text-primary">{item.product?.name}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-muted">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-muted">{item.quantity}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-text-primary font-bold">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline Progress */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-text-primary border-b border-border pb-1.5 uppercase tracking-wide">
                Order Activity Timeline
              </h4>
              <div className="flex flex-col gap-4 pl-2.5 border-l border-border relative ml-2.5 pt-1">
                <div className="relative">
                  <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-success" />
                  <p className="font-bold text-text-primary">Order Placed</p>
                  <p className="text-[10px] text-text-muted">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                {['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                  <div className="relative">
                    <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-success" />
                    <p className="font-bold text-text-primary">Order Confirmed</p>
                    <p className="text-[10px] text-text-muted">Draft invoice auto-generated</p>
                  </div>
                )}
                {['SHIPPED', 'DELIVERED'].includes(selectedOrder.status) && (
                  <div className="relative">
                    <div className="absolute -left-[14px] top-1.5 w-2 h-2 rounded-full bg-success" />
                    <p className="font-bold text-text-primary">Order Shipped & Invoiced</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions (e.g. Generate Invoice button) */}
            {user?.role?.writeSales && (
              <div className="border-t border-border pt-4 mt-2 flex gap-3 justify-end">
                {['CONFIRMED', 'SHIPPED'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => triggerInvoiceGeneration(selectedOrder)}
                    className="btn-success flex items-center gap-1.5 text-[10px] uppercase font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" /> Re-trigger Invoice
                  </button>
                )}
                {selectedOrder.status === 'DRAFT' && (
                  <button
                    onClick={() => triggerInvoiceGeneration(selectedOrder)}
                    className="btn-primary flex items-center gap-1.5 text-[10px] uppercase font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Invoice
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
