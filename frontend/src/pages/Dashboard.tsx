import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { MetricCard } from '../components/MetricCard';
import { AreaChart } from '../components/AreaChart';
import { StatusBadge } from '../components/StatusBadge';
import { useToastStore } from '../context/toastStore';
import { Loader2, Plus, Activity } from 'lucide-react';

interface DashboardProps {
  onQuickAction: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onQuickAction }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await apiFetch('/dashboard/metrics');
      setData(result);
    } catch (err: any) {
      console.error(err);
      addToast('Failed to fetch dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const { metrics, sparklines, revenueChart, topProducts, activities } = data;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">Real-time Enterprise Overview</p>
        </div>
      </div>

      {/* 1. KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={metrics.totalRevenue}
          prefix="$"
          trend={14.8}
          sparkline={sparklines.revenue}
        />
        <MetricCard
          label="Active Orders"
          value={metrics.activeOrders}
          trend={8.2}
          sparkline={sparklines.activeOrders}
        />
        <MetricCard
          label="Low Stock Items"
          value={metrics.lowStockItems}
          trend={-12.5} // stock going down is good/bad depending on direction, here is improvement
          sparkline={sparklines.lowStock}
        />
        <MetricCard
          label="Pending Invoices"
          value={metrics.pendingInvoices}
          trend={2.4}
          sparkline={sparklines.pendingInvoices}
        />
      </div>

      {/* 2. Main Content Grid (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Revenue Area Chart - 8 Columns */}
        <div className="lg:col-span-8 glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold font-mono tracking-wide text-text-primary">Revenue vs Operating Cost</h3>
              <p className="text-[10px] font-mono text-text-muted uppercase mt-0.5">Last 12 Months Cashflow</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-success">
                <span className="w-2.5 h-2.5 rounded-full bg-success" /> Operations
              </span>
            </div>
          </div>
          <AreaChart data={revenueChart} />
        </div>

        {/* Recent Activity Log - 4 Columns */}
        <div className="lg:col-span-4 glass-card p-6 flex flex-col gap-4 h-[395px] overflow-hidden">
          <div className="flex justify-between items-center border-b border-border pb-3 flex-shrink-0">
            <h3 className="text-base font-bold font-mono tracking-wide text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Audit Activity
            </h3>
            <span className="text-[9px] font-mono text-text-muted uppercase bg-[#1E2130]/50 border border-border px-2 py-0.5 rounded">
              Live
            </span>
          </div>

          <div className="flex-grow overflow-y-auto flex flex-col gap-4 pr-1">
            {activities.length === 0 ? (
              <p className="text-xs font-mono text-text-muted text-center py-12">No recent system activities.</p>
            ) : (
              activities.map((act: any) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <div className="flex-grow">
                    <p className="text-text-primary font-mono font-medium leading-tight">
                      <span className="text-text-muted font-bold mr-1">{act.user}</span>
                      {act.description}
                    </p>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Top Products Table */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-text-primary">Top Performing Products</h3>
            <p className="text-[10px] font-mono text-text-muted uppercase mt-0.5">Ranked by unit sales volume</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#1E2130]/40">
            <thead>
              <tr className="text-xs font-mono text-text-muted uppercase text-left">
                <th className="py-2.5 font-bold">Product Name</th>
                <th className="py-2.5 font-bold">SKU</th>
                <th className="py-2.5 font-bold text-right">Units Sold</th>
                <th className="py-2.5 font-bold text-right">Revenue</th>
                <th className="py-2.5 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2130]/30 text-xs font-mono">
              {topProducts.map((p: any) => (
                <tr key={p.id} className="hover:bg-[#1E2130]/10 transition-colors">
                  <td className="py-3 text-text-primary font-bold">{p.name}</td>
                  <td className="py-3 text-text-muted">{p.sku}</td>
                  <td className="py-3 text-right tabular-nums text-text-primary">{p.unitsSold}</td>
                  <td className="py-3 text-right tabular-nums text-success font-bold">${p.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Quick Actions Floating Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#12141A]/95 border border-[#1E2130] rounded-full py-2.5 px-6 shadow-2xl backdrop-blur-xl flex items-center gap-4">
        <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider">Quick Actions:</span>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={() => onQuickAction('new-order')}
          className="flex items-center gap-1.5 text-xs font-mono text-text-primary hover:text-primary transition-colors hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Order
        </button>
        <div className="h-2 w-2 rounded-full bg-border" />
        <button
          onClick={() => onQuickAction('new-invoice')}
          className="flex items-center gap-1.5 text-xs font-mono text-text-primary hover:text-success transition-colors hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Invoice
        </button>
        <div className="h-2 w-2 rounded-full bg-border" />
        <button
          onClick={() => onQuickAction('add-product')}
          className="flex items-center gap-1.5 text-xs font-mono text-text-primary hover:text-warning transition-colors hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Product
        </button>
      </div>
    </div>
  );
};
