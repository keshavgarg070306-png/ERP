import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Zap, HelpCircle } from 'lucide-react';

interface CommandOption {
  id: string;
  category: 'Modules' | 'Actions' | 'Help';
  label: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onTriggerAction: (action: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: CommandOption[] = [
    { id: 'nav-dash', category: 'Modules', label: 'Go to Dashboard', action: () => onNavigate('dashboard') },
    { id: 'nav-inv', category: 'Modules', label: 'Go to Inventory', action: () => onNavigate('inventory') },
    { id: 'nav-sales', category: 'Modules', label: 'Go to Sales & Orders Pipeline', action: () => onNavigate('sales') },
    { id: 'nav-fin', category: 'Modules', label: 'Go to Finance Ledger & Invoices', action: () => onNavigate('finance') },
    { id: 'nav-hr', category: 'Modules', label: 'Go to HR & Payroll Management', action: () => onNavigate('hr') },
    { id: 'nav-set', category: 'Modules', label: 'Go to Company Settings', action: () => onNavigate('settings') },
    
    { id: 'act-order', category: 'Actions', label: 'Create New Customer Order', action: () => onTriggerAction('new-order') },
    { id: 'act-invoice', category: 'Actions', label: 'Generate New Invoice', action: () => onTriggerAction('new-invoice') },
    { id: 'act-product', category: 'Actions', label: 'Add New Product to Catalog', action: () => onTriggerAction('add-product') },
    
    { id: 'help-shortcuts', category: 'Help', label: 'View Keyboard Shortcuts Guide', action: () => alert('Keyboard Shortcuts: \nCmd+K / Ctrl+K - Search \nEsc - Close Panels') },
  ];

  // Filter options based on query
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Focus input on mount
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0A0B0F]/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Palette Body */}
      <div className="w-full max-w-xl glass-modal border border-border shadow-2xl z-10 overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[#0A0B0F]/50">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or module..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none border-none py-1 font-mono"
          />
          <kbd className="flex-shrink-0 bg-[#1E2130] text-text-muted text-[10px] font-mono px-2 py-0.5 rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Option Listings */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm font-mono text-text-muted">
              No matching commands. Try searching "Finance" or "Product".
            </div>
          ) : (
            // Group and render
            Object.entries(
              filtered.reduce((groups, option) => {
                if (!groups[option.category]) groups[option.category] = [];
                groups[option.category].push(option);
                return groups;
              }, {} as Record<string, CommandOption[]>)
            ).map(([category, items]) => (
              <div key={category} className="mb-2">
                {/* Group Heading */}
                <span className="text-[10px] font-mono font-bold tracking-wider text-text-muted/65 px-3 uppercase py-1 block">
                  {category}
                </span>

                {/* Group Items */}
                <div className="flex flex-col gap-0.5 mt-1">
                  {items.map((item) => {
                    // Calculate index in the global filtered array for active selection highlighting
                    const globalIdx = filtered.findIndex((o) => o.id === item.id);
                    const isSelected = globalIdx === selectedIndex;

                    // Choose icon based on category
                    let categoryIcon = <Compass className="w-4 h-4" />;
                    if (item.category === 'Actions') categoryIcon = <Zap className="w-4 h-4 text-warning" />;
                    if (item.category === 'Help') categoryIcon = <HelpCircle className="w-4 h-4 text-primary" />;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 font-mono ${
                          isSelected 
                            ? 'bg-primary text-white border border-primary/40 shadow-glow' 
                            : 'text-text-muted hover:bg-[#1E2130]/35 hover:text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isSelected ? 'text-white' : 'text-text-muted'}>
                            {categoryIcon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-mono">
                            ENTER
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
