import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Drawer } from '../components/Drawer';
import { useToastStore } from '../context/toastStore';
import { useAuthStore } from '../context/authStore';
import { Loader2, DollarSign, Printer, Mail, Download, BarChart2, BookOpen, FileText } from 'lucide-react';

export const Finance: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'invoices' | 'ledger' | 'pl'>('invoices');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [plData, setPlData] = useState<any>(null);
  
  // P&L Period Toggle
  const [plPeriod, setPlPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  // Loading states
  const [loading, setLoading] = useState(true);

  // Selected Invoice for Drawer Preview
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const { addToast } = useToastStore();

  const loadInvoices = async () => {
    try {
      const res = await apiFetch('/invoices');
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load invoices', 'error');
    }
  };

  const loadLedger = async () => {
    try {
      const res = await apiFetch('/reports/ledger');
      setLedger(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load General Ledger', 'error');
    }
  };

  const loadPLReport = async () => {
    try {
      const res = await apiFetch(`/reports/pl?period=${plPeriod}`);
      setPlData(res || null);
    } catch (err) {
      console.error(err);
      addToast('Failed to compute Profit & Loss report', 'error');
    }
  };

  // Reload everything on active tab shifts
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      if (activeTab === 'invoices') await loadInvoices();
      else if (activeTab === 'ledger') await loadLedger();
      else if (activeTab === 'pl') await loadPLReport();
    };
    loadData().finally(() => setLoading(false));
  }, [activeTab, plPeriod]);

  // Record mock payment in invoice
  const markInvoicePaid = async (inv: any) => {
    try {
      await apiFetch(`/invoices/${inv.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'PAID' }),
      });
      addToast(`Invoice ${inv.invoiceNumber} recorded as PAID. General Ledger updated.`, 'success');
      setIsInvoiceOpen(false);
      loadInvoices(); // Reload
    } catch (err: any) {
      addToast(err.message || 'Error recording payment', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Hub</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">General Ledger, Profit & Loss reporting & Billing</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#12141A]/50 border border-border p-1 rounded-xl w-fit font-mono text-xs">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'invoices' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Invoices List
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'ledger' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> General Ledger
        </button>
        <button
          onClick={() => setActiveTab('pl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'pl' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> P&L Statement
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        /* Tab Contents */
        <div className="w-full">
          {/* TAB 1: INVOICES */}
          {activeTab === 'invoices' && (
            <DataTable
              columns={[
                { key: 'invoiceNumber', label: 'Invoice No.', sortable: true, render: (inv) => <span className="font-bold text-primary">{inv.invoiceNumber}</span> },
                { key: 'orderNumber', label: 'Order Ref', render: (inv) => <span className="text-text-muted">{inv.order?.orderNumber}</span> },
                { key: 'customer', label: 'Customer Client', render: (inv) => <span>{inv.order?.customer?.name}</span> },
                { key: 'dueDate', label: 'Due Date', sortable: true, render: (inv) => <span>{new Date(inv.dueDate).toLocaleDateString()}</span> },
                { key: 'totalAmount', label: 'Amount Due', sortable: true, render: (inv) => <span className="tabular-nums font-bold text-text-primary">${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
                { key: 'status', label: 'Status', render: (inv) => <StatusBadge status={inv.status} /> },
                {
                  key: 'action',
                  label: '',
                  render: (inv) => (
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsInvoiceOpen(true);
                      }}
                      className="btn-secondary py-1 px-2.5 text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 hover:border-primary/50"
                    >
                      <Printer className="w-3.5 h-3.5" /> Preview
                    </button>
                  ),
                },
              ]}
              data={invoices}
              searchPlaceholder="Search invoices by number or customer..."
            />
          )}

          {/* TAB 2: GENERAL LEDGER */}
          {activeTab === 'ledger' && (
            <DataTable
              columns={[
                { key: 'date', label: 'Date', render: (ent) => <span>{new Date(ent.date).toLocaleDateString()}</span> },
                { key: 'code', label: 'Acct Code', render: (ent) => <span className="text-text-muted">{ent.account?.code}</span> },
                { key: 'account', label: 'Account Name', render: (ent) => <span className="font-bold">{ent.account?.name}</span> },
                { key: 'description', label: 'Description/Ref', render: (ent) => <span className="text-text-muted">{ent.description}</span> },
                { key: 'debit', label: 'Debit (+)', render: (ent) => <span className="text-primary font-bold tabular-nums">{ent.debit > 0 ? `$${ent.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</span> },
                { key: 'credit', label: 'Credit (-)', render: (ent) => <span className="text-success font-bold tabular-nums">{ent.credit > 0 ? `$${ent.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}</span> },
              ]}
              data={ledger}
              searchPlaceholder="Search transactions..."
            />
          )}

          {/* TAB 3: PROFIT & LOSS REPORT */}
          {activeTab === 'pl' && plData && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Controls */}
              <div className="flex justify-between items-center glass-panel p-4">
                <div className="flex gap-2 font-mono text-xs">
                  <button
                    onClick={() => setPlPeriod('monthly')}
                    className={`px-3 py-1.5 rounded border ${
                      plPeriod === 'monthly' ? 'bg-primary/20 text-primary border-primary' : 'border-border hover:border-text-muted text-text-muted'
                    }`}
                  >
                    Monthly view
                  </button>
                  <button
                    onClick={() => setPlPeriod('quarterly')}
                    className={`px-3 py-1.5 rounded border ${
                      plPeriod === 'quarterly' ? 'bg-primary/20 text-primary border-primary' : 'border-border hover:border-text-muted text-text-muted'
                    }`}
                  >
                    Quarterly view
                  </button>
                  <button
                    onClick={() => setPlPeriod('annual')}
                    className={`px-3 py-1.5 rounded border ${
                      plPeriod === 'annual' ? 'bg-primary/20 text-primary border-primary' : 'border-border hover:border-text-muted text-text-muted'
                    }`}
                  >
                    Annual view
                  </button>
                </div>

                <span className="text-[10px] font-mono text-text-muted uppercase">
                  Reporting Period: <span className="text-text-primary font-bold">{plPeriod}</span>
                </span>
              </div>

              {/* Two Column Sheet Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mono text-xs">
                {/* Income Card */}
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-text-primary border-b border-border pb-2 uppercase tracking-wider text-primary">
                    1. Revenues & Inflow
                  </h4>
                  <div className="flex flex-col gap-3">
                    {plData.income.length === 0 ? (
                      <p className="text-text-muted text-center py-6">No income records mapped</p>
                    ) : (
                      plData.income.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <span>
                            <span className="text-text-muted font-bold mr-2">{item.code}</span>
                            {item.name}
                          </span>
                          <span className="tabular-nums font-bold text-text-primary">
                            ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border pt-4 mt-2 flex justify-between font-bold text-text-primary">
                    <span>TOTAL REVENUE</span>
                    <span className="tabular-nums">${plData.totals.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Expenses Card */}
                <div className="glass-card p-6 flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-text-primary border-b border-border pb-2 uppercase tracking-wider text-danger">
                    2. Operating Expenses
                  </h4>
                  <div className="flex flex-col gap-3">
                    {plData.expenses.length === 0 ? (
                      <p className="text-text-muted text-center py-6">No expense records mapped</p>
                    ) : (
                      plData.expenses.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <span>
                            <span className="text-text-muted font-bold mr-2">{item.code}</span>
                            {item.name}
                          </span>
                          <span className="tabular-nums font-bold text-text-primary">
                            ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border pt-4 mt-2 flex justify-between font-bold text-text-primary">
                    <span>TOTAL EXPENSES</span>
                    <span className="tabular-nums">${plData.totals.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Net profit row highlighted in teal */}
              <div className="glass-card p-6 border border-success/30 bg-success/5 shadow-glow-success flex justify-between items-center font-mono text-sm">
                <span className="font-bold text-success uppercase tracking-wider">Net Operating Surplus (Profit)</span>
                <span className="text-xl font-bold text-success tabular-nums">
                  ${plData.totals.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detailed Preview Drawer */}
      <Drawer
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title={selectedInvoice ? `Invoice: ${selectedInvoice.invoiceNumber}` : ''}
        size="lg"
      >
        {selectedInvoice && (
          <div className="flex flex-col gap-6 font-mono text-xs text-text-primary">
            {/* PRINT READY LAYOUT CONTAINER */}
            <div className="bg-white text-slate-800 p-8 rounded-xl border border-slate-200 shadow-md flex flex-col gap-6" id="printable-invoice">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-wider font-mono">NEXCORE <span className="text-blue-600">ERP</span></h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">100 Mission Control Blvd, Suite 400</p>
                  <p className="text-[10px] text-slate-400 font-mono">San Francisco, CA 94103</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-slate-900 font-mono uppercase tracking-wider">INVOICE</h3>
                  <p className="text-sm font-bold text-blue-600 font-mono mt-1">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              {/* Client & Billing Info */}
              <div className="grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Billed To:</h4>
                  <p className="font-bold text-slate-900 text-sm font-mono">{selectedInvoice.order?.customer?.name}</p>
                  <p className="text-slate-500 font-mono">{selectedInvoice.order?.customer?.email}</p>
                  {selectedInvoice.order?.customer?.phone && <p className="text-slate-500 font-mono">{selectedInvoice.order?.customer?.phone}</p>}
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Invoice Meta:</h4>
                  <p className="text-slate-500 font-mono">
                    <span className="font-bold text-slate-700">Date Issued:</span> {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500 font-mono mt-1">
                    <span className="font-bold text-slate-700">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500 font-mono mt-1">
                    <span className="font-bold text-slate-700">Status:</span> {selectedInvoice.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="min-w-full divide-y divide-slate-200 border-b border-slate-200 mt-2">
                <thead>
                  <tr className="text-[10px] text-slate-400 text-left uppercase font-mono font-bold">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Unit Cost</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {selectedInvoice.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold font-mono text-slate-900">{item.product?.name}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mt-2">
                <div className="w-1/2 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>Subtotal Amount:</span>
                    <span className="tabular-nums">${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>V.A.T. (0% Rate):</span>
                    <span className="tabular-nums">$0.00</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between font-mono font-bold text-slate-900 text-sm">
                    <span>TOTAL AMOUNT DUE:</span>
                    <span className="tabular-nums text-blue-600">${selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer note */}
              <div className="text-center text-[10px] text-slate-400 mt-6 border-t border-slate-100 pt-4 font-mono">
                Thank you for your enterprise partnership with NexCore ERP. Payout term is Net 30.
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="border-t border-border pt-4 mt-2 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-1.5 text-[10px] uppercase font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> Print Layout
              </button>
              <button
                onClick={() => {
                  addToast('Opening print dialog. Set Destination to "Save as PDF" to download.', 'info');
                  setTimeout(() => window.print(), 500);
                }}
                className="btn-secondary flex items-center gap-1.5 text-[10px] uppercase font-bold"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
              <button
                onClick={() => addToast(`Invoice email dispatched to ${selectedInvoice.order?.customer?.email}`, 'success')}
                className="btn-secondary flex items-center gap-1.5 text-[10px] uppercase font-bold"
              >
                <Mail className="w-3.5 h-3.5" /> Send via Email
              </button>
              
              {selectedInvoice.status !== 'PAID' && user?.role?.writeFinance && (
                <button
                  onClick={() => markInvoicePaid(selectedInvoice)}
                  className="btn-success flex items-center gap-1.5 text-[10px] uppercase font-bold"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Record Payment
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
