import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Avatar } from '../components/Avatar';
import { useToastStore } from '../context/toastStore';
import { useAuthStore } from '../context/authStore';
import { Loader2, Plus, Calendar, DollarSign, Users, Award, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HR: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'directory' | 'leaves' | 'payroll'>('directory');
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // New Employee Form States
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState('Technology');
  const [empSalary, setEmpSalary] = useState('7500');

  const { addToast } = useToastStore();

  const loadDirectory = async () => {
    try {
      const res = await apiFetch('/employees');
      setEmployees(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load employee directory', 'error');
    }
  };

  const loadLeaves = async () => {
    try {
      const res = await apiFetch('/employees/leaves');
      setLeaves(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load leave logs', 'error');
    }
  };

  const loadPayroll = async () => {
    try {
      const res = await apiFetch('/payroll/runs');
      setPayrollRuns(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch payroll history', 'error');
    }
  };

  useEffect(() => {
    setLoading(true);
    const loadTab = async () => {
      if (activeTab === 'directory') await loadDirectory();
      else if (activeTab === 'leaves') await loadLeaves();
      else if (activeTab === 'payroll') await loadPayroll();
    };
    loadTab().finally(() => setLoading(false));
  }, [activeTab]);

  // Execute Payroll Run
  const handleRunPayroll = async () => {
    try {
      await apiFetch('/payroll/run', { method: 'POST' });
      addToast('Monthly payroll executed and paid. Ledger updated.', 'success');
      setIsPayrollModalOpen(false);
      loadPayroll();
    } catch (err: any) {
      addToast(err.message || 'Error processing payroll', 'error');
    }
  };

  // Add Employee Submit
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empRole) {
      addToast('Mandatory fields required', 'warning');
      return;
    }

    try {
      await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: empName,
          role: empRole,
          department: empDept,
          baseSalary: empSalary,
          joinDate: new Date().toISOString(),
          status: 'ACTIVE',
        }),
      });

      addToast('Employee hired successfully', 'success');
      setIsEmployeeModalOpen(false);
      loadDirectory();
      
      // Reset form
      setEmpName('');
      setEmpRole('');
      setEmpSalary('7500');
    } catch (err: any) {
      addToast(err.message || 'Failed to hire employee', 'error');
    }
  };

  // Process leave approval
  const handleLeaveStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/employees/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      addToast(`Leave request ${status.toLowerCase()}`, 'success');
      loadLeaves();
    } catch (err: any) {
      addToast(err.message || 'Error updating leave', 'error');
    }
  };

  // Fetch current pending payroll entries
  const currentPendingRun = payrollRuns.find((r) => r.status === 'PENDING');
  const payrollEntries = currentPendingRun?.payrollEntries || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR & Payroll</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">Directory, Leave Schedules & Monthly Salary Runs</p>
        </div>
        
        {activeTab === 'directory' && user?.role?.writeHR && (
          <button onClick={() => setIsEmployeeModalOpen(true)} className="btn-primary flex items-center gap-2 font-mono text-xs uppercase tracking-wide">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        )}

        {activeTab === 'payroll' && currentPendingRun && user?.role?.writeHR && (
          <button 
            onClick={() => setIsPayrollModalOpen(true)} 
            className="btn-success flex items-center gap-2 font-mono text-xs uppercase tracking-wide bg-success text-background hover:bg-success-hover"
          >
            <DollarSign className="w-4 h-4" /> Run Payroll
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#12141A]/50 border border-border p-1 rounded-xl w-fit font-mono text-xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'directory' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Directory
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'leaves' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Leave tracker
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'payroll' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Payroll Run
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="w-full">
          {/* TAB 1: DIRECTORY */}
          {activeTab === 'directory' && (
            <DataTable
              columns={[
                { key: 'avatar', label: '', render: (emp) => <Avatar name={emp.name} src={emp.avatar} size="sm" /> },
                { key: 'name', label: 'Employee Name', sortable: true, render: (emp) => <span className="font-bold text-text-primary">{emp.name}</span> },
                { key: 'role', label: 'Role Designation', sortable: true, render: (emp) => <span className="text-text-muted">{emp.role}</span> },
                { key: 'department', label: 'Department', sortable: true, render: (emp) => <span>{emp.department}</span> },
                { key: 'joinDate', label: 'Hire Date', render: (emp) => <span>{new Date(emp.joinDate).toLocaleDateString()}</span> },
                { key: 'baseSalary', label: 'Monthly Base', render: (emp) => <span className="font-mono tabular-nums text-text-muted">${emp.baseSalary.toLocaleString()}</span> },
                { key: 'status', label: 'Status badge', render: (emp) => <StatusBadge status={emp.status} /> },
              ]}
              data={employees}
              searchPlaceholder="Search employee directory..."
            />
          )}

          {/* TAB 2: LEAVE MANAGEMENT */}
          {activeTab === 'leaves' && (
            <div className="flex flex-col gap-6">
              {/* Calendric Visual Planner Mock */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold font-mono tracking-wide text-text-primary">Visual Leaves Calendar Planner</h3>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-text-muted">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <span key={d} className="font-bold py-1 border-b border-border">{d}</span>)}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const isOnLeave = day >= 20 && day <= 27; // David's leave
                    const isPending = day >= 10 && day <= 15; // Jane's leave
                    
                    let bgClass = 'bg-[#12141A]/40 border border-border/30 text-text-muted';
                    let tooltip = '';

                    if (isOnLeave) {
                      bgClass = 'bg-warning/20 border border-warning/40 text-warning font-bold shadow-glow-warning';
                      tooltip = 'David on Leave';
                    } else if (isPending) {
                      bgClass = 'bg-primary/20 border border-primary/40 text-primary font-bold shadow-glow';
                      tooltip = 'Jane (Pending)';
                    }

                    return (
                      <div key={i} className={`p-2.5 rounded-lg flex flex-col items-center justify-center min-h-[45px] transition-all relative group cursor-pointer hover:border-text-primary ${bgClass}`}>
                        <span>{day}</span>
                        {tooltip && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                        {/* Hover Tooltip */}
                        {tooltip && (
                          <div className="absolute hidden group-hover:block bottom-12 bg-surface text-[9px] text-text-primary border border-border px-2 py-1 rounded font-mono shadow-2xl z-20 whitespace-nowrap">
                            {tooltip}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leave Requests Table */}
              <DataTable
                searchable={false}
                columns={[
                  { key: 'employee', label: 'Employee', render: (l) => <div className="flex items-center gap-2 font-bold"><Avatar name={l.employee?.name} src={l.employee?.avatar} size="sm" /> {l.employee?.name}</div> },
                  { key: 'dates', label: 'Duration Timeline', render: (l) => <span className="text-text-muted font-mono">{new Date(l.startDate).toLocaleDateString()} <ArrowRight className="inline w-3 h-3 mx-1" /> {new Date(l.endDate).toLocaleDateString()}</span> },
                  { key: 'reason', label: 'Reason/Note', render: (l) => <span className="text-text-muted">{l.reason || 'Annual leave'}</span> },
                  { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
                  {
                    key: 'action',
                    label: '',
                    render: (l) => (
                      l.status === 'PENDING' && user?.role?.writeHR ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleLeaveStatus(l.id, 'APPROVED')} className="btn-success py-1 px-2 text-[9px] font-mono uppercase font-bold">Approve</button>
                          <button onClick={() => handleLeaveStatus(l.id, 'REJECTED')} className="btn-danger py-1 px-2 text-[9px] font-mono uppercase">Reject</button>
                        </div>
                      ) : null
                    ),
                  },
                ]}
                data={leaves}
              />
            </div>
          )}

          {/* TAB 3: PAYROLL RUN */}
          {activeTab === 'payroll' && (
            <div className="flex flex-col gap-6">
              {/* If no pending run, display success history notification */}
              {!currentPendingRun ? (
                <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex gap-3 items-center shadow-glow-success font-mono text-xs">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-success">All Payroll processed</h4>
                    <p className="text-text-muted mt-0.5">The current month salary cycles are processed. You can review payouts below.</p>
                  </div>
                </div>
              ) : (
                /* Pending Run Entries */
                <div className="glass-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <div>
                      <h3 className="text-base font-bold font-mono tracking-wide text-text-primary">Pending Payout Entries</h3>
                      <p className="text-[10px] font-mono text-text-muted uppercase mt-0.5">Cycle: {new Date(currentPendingRun.periodStart).toLocaleDateString()} to {new Date(currentPendingRun.periodEnd).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <table className="min-w-full divide-y divide-border">
                    <thead className="text-[10px] text-text-muted font-mono uppercase text-left">
                      <tr>
                        <th className="py-2">Employee</th>
                        <th className="py-2 text-right">Base Salary</th>
                        <th className="py-2 text-right">Deductions (Tax)</th>
                        <th className="py-2 text-right">Net Salary</th>
                        <th className="py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2130]/40 text-xs font-mono text-text-primary">
                      {payrollEntries.map((e: any) => (
                        <tr key={e.id} className="hover:bg-[#1E2130]/10">
                          <td className="py-3 flex items-center gap-2">
                            <Avatar name={e.employee?.name} src={e.employee?.avatar} size="sm" />
                            <span className="font-bold">{e.employee?.name}</span>
                          </td>
                          <td className="py-3 text-right tabular-nums text-text-muted">${e.baseSalary.toLocaleString()}</td>
                          <td className="py-3 text-right tabular-nums text-danger">${e.deductions.toFixed(2)}</td>
                          <td className="py-3 text-right tabular-nums text-success font-bold">${e.netPay.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <StatusBadge status={e.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Run history list */}
              <div className="glass-card p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold font-mono tracking-wide text-text-primary">Executed Payroll Runs Log</h3>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {payrollRuns.filter(r => r.status === 'PROCESSED').map((run) => (
                    <div key={run.id} className="flex justify-between items-center py-2.5 border-b border-border/60 hover:bg-[#1E2130]/10 px-2 rounded transition-colors">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-success" />
                        <div>
                          <p className="font-bold text-text-primary">Cycle Ended {new Date(run.periodEnd).toLocaleDateString()}</p>
                          <p className="text-[10px] text-text-muted">Settled on {new Date(run.runDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-bold text-success tabular-nums">
                        ${run.payrollEntries?.reduce((sum: number, e: any) => sum + e.netPay, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title="Hire New Employee">
        <form onSubmit={handleAddEmployee} className="flex flex-col gap-4 font-mono text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-muted uppercase">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Donna Noble"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-muted uppercase">Designation / Role *</label>
            <input
              type="text"
              placeholder="e.g. Sales Executive"
              value={empRole}
              onChange={(e) => setEmpRole(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-muted uppercase">Department *</label>
            <select
              value={empDept}
              onChange={(e) => setEmpDept(e.target.value)}
              className="input-field bg-background"
            >
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Design">Design</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-text-muted uppercase">Monthly Base Salary ($) *</label>
            <input
              type="number"
              value={empSalary}
              onChange={(e) => setEmpSalary(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-border">
            <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="btn-secondary uppercase text-[10px] tracking-wider">
              Cancel
            </button>
            <button type="submit" className="btn-primary uppercase text-[10px] tracking-wider">
              Hire Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Run Payroll Settlement Confirmation Modal */}
      <Modal isOpen={isPayrollModalOpen} onClose={() => setIsPayrollModalOpen(false)} title="Process Monthly Salary Payouts">
        <div className="font-mono text-xs flex flex-col gap-4 text-text-primary">
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex gap-3 items-start shadow-glow-warning">
            <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-warning uppercase">General Ledger Settlement Alert</h4>
              <p className="text-text-muted mt-1 leading-normal">
                Running payroll will immediately deduct the salary net payout from cash accounts, withhold deductions to accounts payable, and register salary operations in the Ledger. 
                This action is final.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-surface/50 border border-border p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-text-muted">Total Employees:</span>
              <span className="text-text-primary font-bold">{employees.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Net Bank Transfer Payout:</span>
              <span className="text-success font-bold">
                ${payrollEntries.reduce((sum: number, e: any) => sum + e.netPay, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-border">
            <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="btn-secondary uppercase text-[10px] tracking-wider">
              Cancel
            </button>
            <button onClick={handleRunPayroll} className="btn-success uppercase text-[10px] tracking-wider font-bold">
              Execute Payouts
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
