import React, { useState } from 'react';
import { Package, Customer, Transaction, SystemSettings, ApiLog } from '../types';
import { 
  Users, Layers, DollarSign, Settings, Terminal, Plus, Trash2, 
  RefreshCw, TrendingUp, Key, Cpu, HelpCircle, AlertCircle, Save,
  Lock
} from 'lucide-react';

interface AdminPortalProps {
  packages: Package[];
  customers: Customer[];
  transactions: Transaction[];
  settings: SystemSettings;
  logs: ApiLog[];
  onUpdatePackages: (pkgs: Package[]) => void;
  onUpdateCustomers: (customs: Customer[]) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onClearLogs: () => void;
}

export default function AdminPortal({
  packages,
  customers,
  transactions,
  settings,
  logs,
  onUpdatePackages,
  onUpdateCustomers,
  onUpdateSettings,
  onClearLogs
}: AdminPortalProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'customers' | 'settings' | 'logs'>('overview');
  
  // Package edit state
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [pkgEditName, setPkgEditName] = useState('');
  const [pkgEditSpeed, setPkgEditSpeed] = useState(10);
  const [pkgEditResellerPrice, setPkgEditResellerPrice] = useState(500);
  const [pkgEditIspCost, setPkgEditIspCost] = useState(350);

  // New package Form State
  const [showAddPkg, setShowAddPkg] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgSpeed, setNewPkgSpeed] = useState(10);
  const [newPkgResellerPrice, setNewPkgResellerPrice] = useState(500);
  const [newPkgIspCost, setNewPkgIspCost] = useState(350);

  // Customer Manager States
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustUserId, setNewCustUserId] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustPkgId, setNewCustPkgId] = useState(packages[0]?.id || '');
  const [newCustConnectionType, setNewCustConnectionType] = useState<'PPPoE' | 'Static IP' | 'DHCP'>('PPPoE');

  // General Settings States
  const [editedSettings, setEditedSettings] = useState<SystemSettings>({ ...settings });

  // Calculating total statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  
  // Reseller profit details
  const totalResellerRevenue = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amountPaid, 0);

  const totalIspCostsPaid = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.ispCost, 0);

  const totalNetProfit = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.profit, 0);

  // Packages profit calculator helpers
  const handleSavePackage = (id: string) => {
    const updated = packages.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: pkgEditName,
          speed: Number(pkgEditSpeed),
          resellerPrice: Number(pkgEditResellerPrice),
          ispCost: Number(pkgEditIspCost)
        };
      }
      return p;
    });
    onUpdatePackages(updated);
    setEditingPackageId(null);
  };

  const handleStartEditPackage = (p: Package) => {
    setEditingPackageId(p.id);
    setPkgEditName(p.name);
    setPkgEditSpeed(p.speed);
    setPkgEditResellerPrice(p.resellerPrice);
    setPkgEditIspCost(p.ispCost);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const newPkg: Package = {
      id: 'pkg-' + Date.now(),
      name: newPkgName,
      speed: Number(newPkgSpeed),
      resellerPrice: Number(newPkgResellerPrice),
      ispCost: Number(newPkgIspCost),
      durationDays: 30
    };
    onUpdatePackages([...packages, newPkg]);
    setShowAddPkg(false);
    // Reset fields
    setNewPkgName('');
    setNewPkgSpeed(10);
    setNewPkgResellerPrice(500);
    setNewPkgIspCost(350);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this internet package?')) {
      onUpdatePackages(packages.filter(p => p.id !== id));
    }
  };

  // Customer utilities
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustUserId.trim() || !newCustName.trim()) return;

    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name: newCustName,
      userId: newCustUserId.toLowerCase().replace(/\s+/g, ''),
      mobile: newCustMobile,
      address: newCustAddress,
      activePackageId: newCustPkgId || packages[0]?.id || '',
      expiryDate: defaultExpiry.toISOString().split('T')[0],
      status: 'Active',
      connectionType: newCustConnectionType
    };

    onUpdateCustomers([...customers, newCust]);
    setShowAddCustomer(false);
    // Reset forms
    setNewCustName('');
    setNewCustUserId('');
    setNewCustMobile('');
    setNewCustAddress('');
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to terminate this customer connection?')) {
      onUpdateCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleToggleCustomerStatus = (id: string) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        const nextStatus: 'Active' | 'Suspended' | 'Pending' = 
          c.status === 'Active' ? 'Suspended' : 'Active';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateCustomers(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(editedSettings);
    alert('Reseller configuration updated successfully!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6" id="admin-portal-root">
      
      {/* Admin Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1 shrink-0">
        <div className="px-3 py-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Reseller Management
        </div>
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'overview' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <TrendingUp size={18} />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'packages' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Layers size={18} />
          <span>Pack & Profit Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'customers' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Users size={18} />
          <span>Customer Lines</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'settings' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Settings size={18} />
          <span>Settings & Password (পাসওয়ার্ড ও সেটিংস)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === 'logs' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Terminal size={18} className="text-amber-500" />
          <span className="flex-1">Live API Terminal</span>
          {logs.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono scale-90">
              {logs.length}
            </span>
          )}
        </button>

        <div className="mt-8 border-t border-slate-200/60 pt-4 px-3 space-y-2">
          <div className="text-[11px] text-slate-400 font-medium">ISP Subsidary Account</div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
            <div className="text-[10px] text-gray-500">Parent ISP Balance</div>
            <div className="font-mono text-base font-bold text-emerald-600">৳ {settings.parentIspBalance.toFixed(2)}</div>
            <div className="text-[9px] text-slate-400 mt-1 truncate">{settings.parentIspName}</div>
          </div>
        </div>
      </div>

      {/* Main Panel Display Area */}
      <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Reseller Dashboard</h2>
                <p className="text-xs text-gray-500">Live summary of internet subscribers, billing, and profit retention</p>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 font-mono py-1 px-3 bg-slate-50 border border-slate-200/50 rounded-full">
                COMPANY: {settings.resellerCompanyName.toUpperCase()}
              </div>
            </div>

            {/* Quick Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4.5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subscribers</span>
                  <div className="text-3xl font-black text-slate-800 font-mono">{totalCustomers}</div>
                  <span className="text-[10px] text-emerald-600 font-medium font-mono">{activeCustomers} Active Lines</span>
                </div>
                <div className="bg-slate-200/50 text-slate-600 p-2.5 rounded-xl">
                  <Users size={22} />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4.5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Collected BDT</span>
                  <div className="text-3xl font-black text-slate-800 font-mono">৳{totalResellerRevenue}</div>
                  <span className="text-[10px] text-gray-400 font-medium">Paid by users in bKash/Nagad</span>
                </div>
                <div className="bg-pink-50 text-[#E2125B] p-2.5 rounded-xl border border-pink-100/50">
                  <DollarSign size={22} />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4.5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ISP Cost Paid</span>
                  <div className="text-3xl font-black text-slate-800 font-mono">৳{totalIspCostsPaid}</div>
                  <span className="text-[10px] text-gray-400 font-medium">Cleared to Parent Panel</span>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100/50">
                  <Cpu size={22} />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4.5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">Net Profit Retained</span>
                  <div className="text-3xl font-black text-emerald-900 font-mono">৳{totalNetProfit}</div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 rounded px-1.5 py-0.5 inline-block mt-0.5">
                    Moved to your bKash
                  </span>
                </div>
                <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-xs">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            {/* Explanatory banner showing profits remain locked in bKash */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="bg-amber-100 text-amber-800 p-2 rounded-xl shrink-0 mt-0.5">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-900">How You Make Extra Money (Profit Margin Model)</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your custom customer pricing is independent of what you pay the parent ISP. When a customer recharges a 
                  package on this website:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/50 text-[11px] text-amber-950">
                    <strong className="text-pink-600">1. Customer Pays Retail</strong>
                    <br />Customer transfers <strong>৳ 800</strong> to your personal bKash number.
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-lg border border-amber-200/50 text-[11px] text-amber-950">
                    <strong className="text-blue-600">2. API Deducts Raw Cost</strong>
                    <br />Your integrated API pays <strong>৳ 550</strong> cost money from Parent ISP Balance.
                  </div>
                  <div className="bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200/50 text-[11px] text-emerald-950">
                    <strong className="text-emerald-700">3. Extra Money Retained</strong>
                    <br />Remaining profit of <strong>৳ 250</strong> stays saved in your bKash wallet!
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Billing Logs List */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800">Recent Customer Recharges</h3>
              <div className="bg-slate-50 rounded-2xl p-1.5 border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-200/50 uppercase tracking-wider">
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Package Recharged</th>
                      <th className="p-3">Amount Billed</th>
                      <th className="p-3">Your Net Profit</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-100/60 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{t.id}</td>
                        <td className="p-3 text-slate-600">{t.customerUserId}</td>
                        <td className="p-3 font-sans text-slate-600">{t.packageName}</td>
                        <td className="p-3 text-slate-800 font-semibold">৳{t.amountPaid}</td>
                        <td className="p-3 text-emerald-700 font-semibold bg-emerald-50/50">৳{t.profit}</td>
                        <td className="p-3 text-slate-400 font-sans">{new Date(t.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-6 text-slate-400 font-sans">No subscriber payments logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PACKAGES */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Profit & Package Tuner</h2>
                <p className="text-xs text-gray-500">Formulate custom packages and calculate exact commissions on subscriber recharges</p>
              </div>
              <button
                onClick={() => setShowAddPkg(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Add Custom Package</span>
              </button>
            </div>

            {/* CREATE PACKAGE INLINE MODAL/FORM */}
            {showAddPkg && (
              <form onSubmit={handleCreatePackage} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-4 animate-slide-up">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-amber-500" />
                  Define New Bandwidth Package
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Package Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="e.g. Shorol Speed (8 Mbps)"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Bandwidth Speed (Mbps)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      value={newPkgSpeed}
                      onChange={(e) => setNewPkgSpeed(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Selling Price (BDT Client Pays)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      value={newPkgResellerPrice}
                      onChange={(e) => setNewPkgResellerPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Parent ISP Cost Price (Deducted)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      value={newPkgIspCost}
                      onChange={(e) => setNewPkgIspCost(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-100/50 p-2.5 rounded-lg text-[11px] text-amber-900 border border-amber-200/40 flex items-center justify-between">
                  <span>Computed Margins: Selling at <strong>৳{newPkgResellerPrice}</strong> minus Cost <strong>৳{newPkgIspCost}</strong></span>
                  <span className="font-bold">Net Profit per user: ৳{newPkgResellerPrice - newPkgIspCost}</span>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddPkg(false)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add Package Settings
                  </button>
                </div>
              </form>
            )}

            {/* PACKAGES EDIT LISTING TABLE */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-500 border-b border-slate-200/50 uppercase tracking-widest">
                    <th className="p-4">Package Identity</th>
                    <th className="p-4 text-center">Allocated Speed</th>
                    <th className="p-4 text-center">Customer Pays (You Collect)</th>
                    <th className="p-4 text-center">Cost Charged by ISP (Deducted)</th>
                    <th className="p-4 text-center">Commission (Your Profit)</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {packages.map(p => (
                    <tr key={p.id} className="hover:bg-slate-200/20 transition-colors">
                      <td className="p-4">
                        {editingPackageId === p.id ? (
                          <input
                            type="text"
                            className="px-2 py-1 border border-gray-300 rounded text-xs bg-white w-full max-w-[200px]"
                            value={pkgEditName}
                            onChange={(e) => setPkgEditName(e.target.value)}
                          />
                        ) : (
                          <div className="font-semibold text-slate-800">{p.name}</div>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono">
                        {editingPackageId === p.id ? (
                          <input
                            type="number"
                            className="px-1.5 py-1 border border-gray-300 rounded text-xs bg-white text-center w-16"
                            value={pkgEditSpeed}
                            onChange={(e) => setPkgEditSpeed(Number(e.target.value))}
                          />
                        ) : (
                          <span className="text-slate-600 font-bold">{p.speed} Mbps</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-700">
                        {editingPackageId === p.id ? (
                          <input
                            type="number"
                            className="px-1.5 py-1 border border-gray-300 rounded text-xs bg-white text-center w-20"
                            value={pkgEditResellerPrice}
                            onChange={(e) => setPkgEditResellerPrice(Number(e.target.value))}
                          />
                        ) : (
                          <span>৳ {p.resellerPrice}</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono text-blue-600">
                        {editingPackageId === p.id ? (
                          <input
                            type="number"
                            className="px-1.5 py-1 border border-gray-300 rounded text-xs bg-white text-center w-20"
                            value={pkgEditIspCost}
                            onChange={(e) => setPkgEditIspCost(Number(e.target.value))}
                          />
                        ) : (
                          <span>৳ {p.ispCost}</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono">
                        {editingPackageId === p.id ? (
                          <span className="text-emerald-700 font-extrabold">
                            ৳ {pkgEditResellerPrice - pkgEditIspCost}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold">
                            ৳ {p.resellerPrice - p.ispCost}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {editingPackageId === p.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingPackageId(null)}
                              className="text-gray-500 hover:text-gray-800 font-medium font-sans"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSavePackage(p.id)}
                              className="bg-emerald-600 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-emerald-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleStartEditPackage(p)}
                              className="text-amber-600 hover:text-amber-800 font-medium font-sans hover:underline"
                            >
                              Edit
                            </button>
                            <span>|</span>
                            <button
                              onClick={() => handleDeletePackage(p.id)}
                              className="text-red-500 hover:text-red-700 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active User Connections</h2>
                <p className="text-xs text-gray-500">Monitor active user credentials, status, expiration counters, and assign packages</p>
              </div>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Add Customer Core</span>
              </button>
            </div>

            {/* ADD CUSTOMER FORM */}
            {showAddCustomer && (
              <form onSubmit={handleCreateCustomer} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-4 animate-slide-up">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} className="text-amber-500" />
                  Install Subscriber Connection (PPPoE / Router)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="e.g. Md. Tanbin Hossen"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Connection User ID (e.g. login username)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-slate-800"
                      placeholder="e.g. tanbin01"
                      value={newCustUserId}
                      onChange={(e) => setNewCustUserId(e.target.value)}
                      required
                    />
                    <span className="text-[10px] text-gray-400 block">This is what they enter to self-recharge.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Mobile No (11 digit)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                      placeholder="017xxxxxxxx"
                      value={newCustMobile}
                      onChange={(e) => setNewCustMobile(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Address / Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="e.g. Board Bazar, Gazipur"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Assigned Package</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                      value={newCustPkgId}
                      onChange={(e) => setNewCustPkgId(e.target.value)}
                    >
                      {packages.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ৳ {p.resellerPrice}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">Router Auth Mode</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                      value={newCustConnectionType}
                      onChange={(e) => setNewCustConnectionType(e.target.value as any)}
                    >
                      <option value="PPPoE">PPPoE (Dial up / Username)</option>
                      <option value="Static IP">Static IP Address</option>
                      <option value="DHCP">DHCP (IP Auto分配)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(false)}
                    className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                  >
                    Register Line
                  </button>
                </div>
              </form>
            )}

            {/* CUSTOMER PORTAL LIST */}
            <div className="bg-slate-50 border border-slate-200/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 text-[11px] font-bold text-slate-500 border-b border-slate-200/50 uppercase tracking-widest">
                      <th className="p-4">Subscriber Name</th>
                      <th className="p-4">Router User ID</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Assigned Tier</th>
                      <th className="p-4">Billing Expiry</th>
                      <th className="p-4 text-center">Core Status</th>
                      <th className="p-4 text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {customers.map(c => {
                      const p = packages.find(pkg => pkg.id === c.activePackageId);
                      return (
                        <tr key={c.id} className="hover:bg-slate-200/20 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{c.name}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{c.connectionType} Client</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-600">{c.userId}</td>
                          <td className="p-4 font-mono text-slate-500">
                            {c.mobile}
                            <div className="text-[9px] text-slate-400 font-sans truncate max-w-[120px]">{c.address || 'No address logged'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800 truncate max-w-[150px]">{p ? p.name : 'Unknown Pack'}</div>
                            <div className="text-[10px] text-emerald-700 font-semibold font-mono">Retail: ৳ {p?.resellerPrice}</div>
                          </td>
                          <td className="p-4 font-mono">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              new Date(c.expiryDate) < new Date() ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {c.expiryDate}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleCustomerStatus(c.id)}
                              title="Click to toggle status manually"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider transition-all uppercase ${
                                c.status === 'Active' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                                  : c.status === 'Suspended'
                                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                  : 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {c.status}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteCustomer(c.id)}
                              className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">পাসওয়ার্ড ও গেটওয়ে সেটিংস (Password & Gateway Settings)</h2>
              <p className="text-xs text-gray-500">Configure personal gateway numbers, modify admin panel security passwords, and connect parent billing APIs</p>
            </div>

            {/* Account Settings & Password Configuration Block */}
            <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
                <Lock size={18} className="text-amber-500" />
                পাসওয়ার্ড এবং অ্যাডমিন প্যানেল সেটিংস (Admin Panel Access & Security Setup)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Set Admin Panel Password (নতুন এডমিন পাসওয়ার্ড দিন) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white"
                    value={editedSettings.adminPassword || ''}
                    onChange={(e) => setEditedSettings({ ...editedSettings, adminPassword: e.target.value })}
                    placeholder="e.g. admin"
                    required
                  />
                  <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                    প্যাসের মাধ্যমে এই প্যানেলে প্রবেশ সুরক্ষিত থাকবে। ডিফল্ট কোড হলো <span className="font-mono font-bold bg-slate-100 px-1 py-0.2 rounded border border-slate-250 text-slate-700 font-bold">admin</span>।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Company / Brand Name (আপনার ব্র্যান্ড বা ব্যবসার নাম)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white"
                    value={editedSettings.resellerCompanyName}
                    onChange={(e) => setEditedSettings({ ...editedSettings, resellerCompanyName: e.target.value })}
                    required
                  />
                  <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                    এই নামটি কাস্টমার পোর্টালে গ্রাহকদের কাছে শো করবে।
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Mobile Wallet Settings */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                  <DollarSign size={18} className="text-pink-600" />
                  Direct Wallet Configuration (Where you get paid)
                </h3>

                <div className="space-y-3">

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">bKash Mobile (Personal/Merchant)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                        value={editedSettings.bkashNumber}
                        onChange={(e) => setEditedSettings({ ...editedSettings, bkashNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">bKash Account Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                        value={editedSettings.bkashType}
                        onChange={(e) => setEditedSettings({ ...editedSettings, bkashType: e.target.value as any })}
                      >
                        <option value="Personal">Personal Wallet</option>
                        <option value="Merchant">Merchant Account API</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Nagad Mobile Wallet</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                        value={editedSettings.nagadNumber}
                        onChange={(e) => setEditedSettings({ ...editedSettings, nagadNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Nagad Wallet Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                        value={editedSettings.nagadType}
                        onChange={(e) => setEditedSettings({ ...editedSettings, nagadType: e.target.value as any })}
                      >
                        <option value="Personal">Personal Wallet</option>
                        <option value="Merchant">Merchant Account API</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Rocket Phone Wallet</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                        value={editedSettings.rocketNumber}
                        onChange={(e) => setEditedSettings({ ...editedSettings, rocketNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Rocket Account Type</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                        value={editedSettings.rocketType}
                        onChange={(e) => setEditedSettings({ ...editedSettings, rocketType: e.target.value as any })}
                      >
                        <option value="Personal">Personal Wallet</option>
                        <option value="Merchant">Merchant Account API</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Back-end API Integration settings */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                  <Cpu size={18} className="text-amber-500" />
                  Parent ISP Automated API Integrator
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 font-sans">Official parent ISP name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      value={editedSettings.parentIspName}
                      onChange={(e) => setEditedSettings({ ...editedSettings, parentIspName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">API Activation Endpoint URL (Simulated)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-slate-700"
                      value={editedSettings.parentIspApiUrl}
                      onChange={(e) => setEditedSettings({ ...editedSettings, parentIspApiUrl: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Reseller Login ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono text-slate-700"
                        value={editedSettings.parentIspUsername}
                        onChange={(e) => setEditedSettings({ ...editedSettings, parentIspUsername: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">Parent Panel Secret API Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                        placeholder="••••••••••••••••"
                        value="dhaka_reseller_master_access_key"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="block text-xs font-semibold text-gray-800">Automatic Activation Router API Hook</label>
                        <span className="text-[10px] text-gray-400 block max-w-[200px]">Trigger Parent API to deduct wholesale cost price immediately upon customer bKash success</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editedSettings.autoApprovePayments}
                        onChange={(e) => setEditedSettings({ ...editedSettings, autoApprovePayments: e.target.checked })}
                        className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500 focus:accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider shadow-md"
              >
                <Save size={16} />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 5: LOGS TERMINAL */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Parent ISP API Handshake Terminal</h2>
                <p className="text-xs text-gray-500">Live JSON payload handshakes transmitting cost orders to main ISP router switch</p>
              </div>
              <button
                onClick={onClearLogs}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Flush Logs
              </button>
            </div>

            <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 font-mono text-xs overflow-hidden shadow-2xl relative border border-slate-800">
              <div className="absolute top-3 right-5 flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span>
              </div>
              <div className="text-[10px] text-slate-500 tracking-widest border-b border-slate-800 pb-3 mb-4 uppercase">
                SYSTEM INTERFACE : PRO-ROUTER v2.09c | SSL SYNC ACTIVE
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 flex flex-col-reverse">
                
                {[...logs].reverse().map((log, index) => (
                  <div key={log.id || index} className="space-y-1.5 animate-fade-in border-b border-slate-800 pb-3 last:border-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 bg-slate-850 px-1 py-0.5 rounded text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          log.type === 'Payment_Received' ? 'bg-pink-900/40 text-pink-400' :
                          log.type === 'ISP_API_Success' ? 'bg-emerald-900/40 text-emerald-400' :
                          log.type === 'Profit_Lock' ? 'bg-amber-900/30 text-amber-400 border border-amber-900/50' :
                          'bg-blue-900/40 text-blue-400'
                        }`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-slate-600 text-[10px]">LOG #{logs.length - index}</span>
                    </div>

                    <div className="text-slate-200 font-semibold">{log.message}</div>
                    
                    {log.details && (
                      <pre className="bg-slate-950 p-3 rounded-lg text-[11px] text-emerald-500/90 whitespace-pre-wrap overflow-x-auto border border-slate-850">
                        {log.details}
                      </pre>
                    )}
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    Terminal idle. Waiting for subscriber self-recharge transactions...
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
              <Terminal size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="leading-relaxed">
                <strong>Reseller Tip:</strong> The terminal documents the API lifecycle. Because you sell packages for more than you pay,
                the parent ISP automatically gets charged their sub-rate while your direct customer's funds stay inside your own bKash account — perfectly 
                ensuring profit retention with absolute billing security.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
