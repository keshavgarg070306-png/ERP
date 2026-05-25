import React, { useState } from 'react';
import { useAuthStore } from '../context/authStore';
import { useToastStore } from '../context/toastStore';
import { ShieldCheck, Info } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      addToast('Welcome back to NexCore ERP', 'success');
      onSuccess();
    } catch (err: any) {
      addToast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to fill credentials for user convenience
  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('nexcore123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Visual glowing design details */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/5 blur-[120px]" />

      <div className="w-full max-w-md glass-card p-8 border border-border relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl border border-primary/20 mb-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-wider text-text-primary">NEXCORE <span className="text-primary">ERP</span></h2>
          <p className="text-text-muted text-xs font-mono mt-1">ENTERPRISE MISSION CONTROL</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-text-muted uppercase">Email Address</label>
            <input
              type="email"
              placeholder="e.g. admin@nexcore.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-text-muted uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary outline-none focus:ring-1 focus:ring-primary"
              />
              Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset links can be configured via integrations settings.'); }} className="text-xs font-mono text-primary hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary py-2.5 w-full mt-2 font-mono uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Credentials Sandbox Helper */}
        <div className="mt-8 pt-6 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono mb-3">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>QUICK SIGN-IN FOR DEMO ROLES:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillCredentials('admin@nexcore.com')}
              className="px-2.5 py-1.5 bg-[#0A0B0F] border border-border hover:border-primary rounded text-[11px] font-mono text-text-muted hover:text-text-primary text-left transition-colors"
            >
              🔑 Sarah (Admin)
            </button>
            <button
              onClick={() => fillCredentials('accountant@nexcore.com')}
              className="px-2.5 py-1.5 bg-[#0A0B0F] border border-border hover:border-primary rounded text-[11px] font-mono text-text-muted hover:text-text-primary text-left transition-colors"
            >
              💼 Alice (Accountant)
            </button>
            <button
              onClick={() => fillCredentials('manager@nexcore.com')}
              className="px-2.5 py-1.5 bg-[#0A0B0F] border border-border hover:border-primary rounded text-[11px] font-mono text-text-muted hover:text-text-primary text-left transition-colors"
            >
              🔧 John (Manager)
            </button>
            <button
              onClick={() => fillCredentials('viewer@nexcore.com')}
              className="px-2.5 py-1.5 bg-[#0A0B0F] border border-border hover:border-primary rounded text-[11px] font-mono text-text-muted hover:text-text-primary text-left transition-colors"
            >
              👁️ Bob (Viewer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
