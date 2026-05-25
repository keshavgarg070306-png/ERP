import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToastStore } from '../context/toastStore';
import { useAuthStore } from '../context/authStore';
import { Loader2, Shield, ToggleLeft, ToggleRight, Building, Link, CheckSquare, Square } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'integrations'>('profile');
  const [roles, setRoles] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Company Profile states
  const [companyName, setCompanyName] = useState('NexCore Enterprises LLC');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC-5 (EST)');
  const [fiscalYear, setFiscalYear] = useState('January 1');

  const { addToast } = useToastStore();

  const loadRoles = async () => {
    try {
      const res = await apiFetch('/settings/roles');
      setRoles(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load role catalog', 'error');
    }
  };

  const loadIntegrations = async () => {
    try {
      const res = await apiFetch('/settings/integrations');
      setIntegrations(res || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load integrations status', 'error');
    }
  };

  useEffect(() => {
    setLoading(true);
    const loadTab = async () => {
      if (activeTab === 'roles') await loadRoles();
      else if (activeTab === 'integrations') await loadIntegrations();
    };
    loadTab().finally(() => setLoading(false));
  }, [activeTab]);

  // Toggle Role Matrix checkbox
  const togglePermission = async (roleId: number, permissionKey: string, currentValue: boolean) => {
    const updatedBody = { [permissionKey]: !currentValue };
    
    // Optimistic UI update
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...updatedBody } : r))
    );

    try {
      await apiFetch(`/settings/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedBody),
      });
      addToast('Role permissions matrix updated. Session token will reload.', 'success');
    } catch (err: any) {
      // Revert on failure
      loadRoles();
      addToast(err.message || 'Error updating permissions', 'error');
    }
  };

  // Toggle Integration status
  const handleToggleIntegration = async (name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    
    // Optimistic update
    setIntegrations((prev) =>
      prev.map((i) => (i.name === name ? { ...i, status: nextStatus } : i))
    );

    try {
      await apiFetch(`/settings/integrations/${name}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      addToast(`Integration ${name} set to ${nextStatus}`, 'success');
    } catch (err: any) {
      loadIntegrations();
      addToast(err.message || 'Error toggling integration', 'error');
    }
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Company profile settings saved successfully', 'success');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-xs text-text-muted font-mono uppercase mt-1">Configure company details, roles permissions matrix & endpoints</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#12141A]/50 border border-border p-1 rounded-xl w-fit font-mono text-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'profile' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Company Profile
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'roles' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'integrations' ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Link className="w-3.5 h-3.5" /> Integrations
        </button>
      </div>

      {activeTab === 'profile' ? (
        /* TAB 1: COMPANY PROFILE */
        <div className="glass-card p-6 max-w-xl">
          <h3 className="text-base font-bold font-mono tracking-wide text-text-primary border-b border-border pb-3 mb-5 uppercase">
            Corporate Meta Information
          </h3>

          <form onSubmit={saveProfile} className="flex flex-col gap-5 font-mono text-xs text-text-primary">
            {/* Logo upload mock */}
            <div className="flex items-center gap-4 border border-dashed border-border p-4 rounded-lg bg-surface/30">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center font-bold text-primary text-lg">
                NC
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold">Enterprise Brand Logo</span>
                <span className="text-[10px] text-text-muted">Upload 512x512px SVG or PNG file</span>
              </div>
              <button
                type="button"
                onClick={() => addToast('Simulating image upload dialog.', 'info')}
                className="btn-secondary py-1 px-3 ml-auto text-[10px] uppercase font-bold"
              >
                Upload
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-muted uppercase">Company Legal Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-muted uppercase">Standard Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field bg-background"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - European Euro</option>
                  <option value="GBP">GBP (£) - British Pound Sterling</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-muted uppercase">Default Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input-field bg-background"
                >
                  <option value="UTC-5 (EST)">UTC-5 (EST) Eastern Time</option>
                  <option value="UTC+0 (GMT)">UTC+0 (GMT) Greenwich Time</option>
                  <option value="UTC+5:30 (IST)">UTC+5:30 (IST) Indian Standard Time</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="font-bold text-text-muted uppercase">Fiscal Year Commencement</label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {user?.role?.writeSettings && (
              <button type="submit" className="btn-primary py-2.5 font-bold uppercase tracking-wider text-sm mt-3 self-end">
                Save Profile Settings
              </button>
            )}
          </form>
        </div>
      ) : loading ? (
        <div className="h-[30vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : activeTab === 'roles' ? (
        /* TAB 2: ROLES PERMISSIONS MATRIX CHECKLIST */
        <div className="glass-card p-6 flex flex-col gap-4 overflow-x-auto">
          <h3 className="text-base font-bold font-mono tracking-wide text-text-primary border-b border-border pb-3 flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-primary" /> Role Permissions Matrix Checklist
          </h3>

          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="text-left text-xs font-mono text-text-muted uppercase tracking-wider">
                <th className="py-3 font-bold">Role Title</th>
                <th className="py-3 font-bold text-center">Read Inventory</th>
                <th className="py-3 font-bold text-center">Write Inventory</th>
                <th className="py-3 font-bold text-center">Read Sales</th>
                <th className="py-3 font-bold text-center">Write Sales</th>
                <th className="py-3 font-bold text-center">Read Finance</th>
                <th className="py-3 font-bold text-center">Write Finance</th>
                <th className="py-3 font-bold text-center">Read HR</th>
                <th className="py-3 font-bold text-center">Write HR</th>
                <th className="py-3 font-bold text-center">Read Settings</th>
                <th className="py-3 font-bold text-center">Write Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2130]/30 font-mono text-xs text-text-primary">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-[#1E2130]/10">
                  <td className="py-3.5 font-bold text-primary">{role.name}</td>
                  
                  {/* Inventory checkboxes */}
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'readInventory', role.readInventory)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.readInventory ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'writeInventory', role.writeInventory)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.writeInventory ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>

                  {/* Sales checkboxes */}
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'readSales', role.readSales)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.readSales ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'writeSales', role.writeSales)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.writeSales ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>

                  {/* Finance checkboxes */}
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'readFinance', role.readFinance)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.readFinance ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'writeFinance', role.writeFinance)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.writeFinance ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>

                  {/* HR checkboxes */}
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'readHR', role.readHR)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.readHR ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'writeHR', role.writeHR)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.writeHR ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>

                  {/* Settings checkboxes */}
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'readSettings', role.readSettings)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.readSettings ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                  <td className="py-3.5 text-center">
                    <button 
                      onClick={() => user?.role?.writeSettings && togglePermission(role.id, 'writeSettings', role.writeSettings)} 
                      disabled={!user?.role?.writeSettings}
                      className={`inline-block hover:scale-105 transition-all text-text-muted ${user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'}`}
                    >
                      {role.writeSettings ? <CheckSquare className="w-4.5 h-4.5 text-primary" /> : <Square className="w-4.5 h-4.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* TAB 3: INTEGRATIONS TOGGLES */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {integrations.map((item) => {
            const isConnected = item.status === 'CONNECTED';
            
            let nameLabel = 'Payment Gateway';
            let desc = 'Configure Stripe to process order invoices and bank reconciliation payouts';
            if (item.name === 'sendgrid') {
              nameLabel = 'Email SMTP Gateway';
              desc = 'Connect SendGrid email APIs to auto-send invoice due reminders';
            } else if (item.name === 'slack') {
              nameLabel = 'Slack Webhook Notifications';
              desc = 'Forward low stock alert alerts directly to slack developer channels';
            }

            return (
              <div
                key={item.id}
                className={`glass-card p-6 border flex flex-col justify-between gap-5 transition-all duration-300 ${
                  isConnected ? 'border-primary/20 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-text-primary uppercase text-sm">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isConnected ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted uppercase font-bold mt-1">{nameLabel}</span>
                  <p className="text-text-muted text-[11px] leading-normal mt-2">{desc}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                  <span className="text-text-muted text-[10px] uppercase font-bold">API Connection</span>
                  <button
                    onClick={() => user?.role?.writeSettings && handleToggleIntegration(item.name, item.status)}
                    disabled={!user?.role?.writeSettings}
                    className={`text-text-muted transition-all active:scale-90 ${
                      user?.role?.writeSettings ? 'hover:text-text-primary' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {isConnected ? (
                      <ToggleRight className="w-9 h-9 text-success" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-text-muted" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
