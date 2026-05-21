import React, { useState, useEffect } from 'react';
import { Package, Customer, Transaction, SystemSettings, ApiLog } from './types';
import { 
  INITIAL_PACKAGES, INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, 
  INITIAL_SETTINGS, INITIAL_LOGS 
} from './data';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';
import BkashSimulator from './components/BkashSimulator';
import { 
  Wifi, ShieldAlert, Cpu, Heart, CheckCircle2, SwitchCamera, 
  User, ShieldCheck, Terminal, HelpCircle, Eye, EyeOff 
} from 'lucide-react';

export default function App() {
  // Navigation / View mode: Customer view vs Reseller Admin view
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');

  // Database core state with local storage support
  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem('isp_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('isp_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('isp_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('isp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [logs, setLogs] = useState<ApiLog[]>(() => {
    const saved = localStorage.getItem('isp_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Active payment gateway simulation overlay state
  const [activeSim, setActiveSim] = useState<{
    method: 'bKash' | 'Nagad' | 'Rocket';
    customer: Customer;
    pack: Package;
  } | null>(null);

  // Reseller panel password authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync with localStorage on state alterations
  useEffect(() => {
    localStorage.setItem('isp_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('isp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('isp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('isp_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('isp_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle immediate automated checkout gateway payment success
  const handlePaymentSuccess = (senderNumber: string, trxId: string) => {
    if (!activeSim) return;

    const { customer, pack, method } = activeSim;
    const profit = pack.resellerPrice - pack.ispCost;
    const nowStr = new Date().toISOString();

    // 1. Create Transaction (Completed)
    const newTx: Transaction = {
      id: 'TXN-' + Date.now().toString().slice(-6),
      customerId: customer.id,
      customerUserId: customer.userId,
      packageName: pack.name,
      amountPaid: pack.resellerPrice,
      ispCost: pack.ispCost,
      profit: profit,
      paymentMethod: method,
      senderNumber: senderNumber,
      trxId: trxId,
      timestamp: nowStr,
      status: 'Completed',
      ispApiActivated: true
    };

    // 2. Compute extended expiry date
    let pivotDate = new Date();
    const currentExpiry = new Date(customer.expiryDate);
    // If client subscription is still active, extend forward from existing date.
    if (currentExpiry > pivotDate) {
      pivotDate = currentExpiry;
    }
    pivotDate.setDate(pivotDate.getDate() + pack.durationDays);
    const newExpiryString = pivotDate.toISOString().split('T')[0];

    // 3. Update customer subscription profile
    const updatedCustomers = customers.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          activePackageId: pack.id,
          expiryDate: newExpiryString,
          status: 'Active' as const
        };
      }
      return c;
    });

    // 4. Subtract wholesale cost from parent ISP balance setting
    const updatedSettings = {
      ...settings,
      parentIspBalance: settings.parentIspBalance - pack.ispCost
    };

    // 5. Generate pristine API terminal Handshake verification outputs
    const newLogsBatch: ApiLog[] = [
      {
        id: 'log-' + Date.now() + '-1',
        timestamp: nowStr,
        type: 'Payment_Received',
        message: `${method} Secure Checkout Payment authorization of BDT ${pack.resellerPrice} Completed`,
        details: `TrxID: ${trxId}, Sender Mobile: ${senderNumber}, Ref Client Login ID: "${customer.userId}", Plan: "${pack.name}"`
      },
      {
        id: 'log-' + Date.now() + '-2',
        timestamp: nowStr,
        type: 'ISP_API_Request',
        message: `POST payload transmitted to Main ISP Switchboard API...`,
        details: `Request-Url: ${settings.parentIspApiUrl}\nAuth-Bearer: AmberIT_ResellerToken_8bc2a\nPayload-Headers: { "Content-Type": "application/json" }\nPayload-Body: {\n  "username": "${customer.userId}",\n  "api_sub_cost": ${pack.ispCost},\n  "command": "renew_pppoe_subscription",\n  "reference_trx": "${newTx.id}"\n}`
      },
      {
        id: 'log-' + Date.now() + '-3',
        timestamp: nowStr,
        type: 'ISP_API_Success',
        message: `HTTP 200 OK | Parent Router successfully authorized connection renewal!`,
        details: `Response-Data: {\n  "status": "success",\n  "client_auth": "PPPoE_Active",\n  "extended_days": 30,\n  "new_api_balance_bdt": ${updatedSettings.parentIspBalance}\n}\nLine assigned speed of ${pack.speed} Mbps activated successfully for Router user "${customer.userId}".`
      },
      {
        id: 'log-' + Date.now() + '-4',
        timestamp: nowStr,
        type: 'Profit_Lock',
        message: `Commission Locked! Net profit of BDT ${profit} maintained in private wallet`,
        details: `Accounting Split:\n  - Retained Retail Collection: BDT ${pack.resellerPrice} loaded into bKash account (${settings.bkashNumber}).\n  - Deducted Sub-Wholesale Cost: BDT ${pack.ispCost} deducted from AmberIT wallet credit.\n  - Accumulated Clean Profit Margin: BDT ${profit} permanently retained without ISP forwarding.`
      }
    ];

    // Commit state changes
    setTransactions([newTx, ...transactions]);
    setCustomers(updatedCustomers);
    setSettings(updatedSettings);
    setLogs([...logs, ...newLogsBatch]);
    setActiveSim(null);

    alert(`রেচার্জ সফল হয়েছে! (Recharge Successful)\n\nSubscriber "${customer.name}" (ID: ${customer.userId}) active until ${newExpiryString}.\n\nYour Profit of ৳${profit} has been safely kept in your wallet. ৳${pack.ispCost} cost deducted from ISP balance.`);
  };

  // Process manual send money submission
  const handleManualPaymentSubmit = (
    method: 'bKash' | 'Nagad' | 'Rocket', 
    customer: Customer, 
    pack: Package, 
    senderNum: string, 
    trxId: string
  ) => {
    const profit = pack.resellerPrice - pack.ispCost;
    const nowStr = new Date().toISOString();

    // 1. Create Transaction (Pending review by default OR auto approved based on setting toggle)
    const isAutoApprove = settings.autoApprovePayments;
    const status = isAutoApprove ? 'Completed' : 'Pending';

    const newTx: Transaction = {
      id: 'TXN-' + Date.now().toString().slice(-6),
      customerId: customer.id,
      customerUserId: customer.userId,
      packageName: pack.name,
      amountPaid: pack.resellerPrice,
      ispCost: pack.ispCost,
      profit: profit,
      paymentMethod: method,
      senderNumber: senderNum,
      trxId: trxId,
      timestamp: nowStr,
      status: status,
      ispApiActivated: isAutoApprove
    };

    let updatedCustomers = [...customers];
    let updatedSettings = { ...settings };
    let newLogsBatch: ApiLog[] = [];

    if (isAutoApprove) {
      // Auto upgrade client details if auto approve toggled true
      let pivotDate = new Date();
      const currentExpiry = new Date(customer.expiryDate);
      if (currentExpiry > pivotDate) {
        pivotDate = currentExpiry;
      }
      pivotDate.setDate(pivotDate.getDate() + pack.durationDays);
      const newExpiryString = pivotDate.toISOString().split('T')[0];

      updatedCustomers = customers.map(c => {
        if (c.id === customer.id) {
          return {
            ...c,
            activePackageId: pack.id,
            expiryDate: newExpiryString,
            status: 'Active' as const
          };
        }
        return c;
      });

      updatedSettings.parentIspBalance = settings.parentIspBalance - pack.ispCost;

      newLogsBatch = [
        {
          id: 'log-' + Date.now() + '-1',
          timestamp: nowStr,
          type: 'Payment_Received',
          message: `Manual Send Money verified. Received BDT ${pack.resellerPrice} via ${method}`,
          details: `Manual Transfer verified automatically via autoApprove. Sender number: ${senderNum}, TrxID: ${trxId}`
        },
        {
          id: 'log-' + Date.now() + '-2',
          timestamp: nowStr,
          type: 'ISP_API_Request',
          message: `Activated automated router activation hook for customer "${customer.userId}"`,
          details: `POST ${settings.parentIspApiUrl} | Wholesale cost BDT ${pack.ispCost} charged.`
        },
        {
          id: 'log-' + Date.now() + '-3',
          timestamp: nowStr,
          type: 'Profit_Lock',
          message: `Profit of ৳${profit} locked successfully to ${method} account.`,
          details: `Reseller cleared ৳${pack.ispCost} through credit balance to parent router. Balance remaining BDT ${updatedSettings.parentIspBalance}.`
        }
      ];

      setCustomers(updatedCustomers);
      setSettings(updatedSettings);
      setLogs([...logs, ...newLogsBatch]);
    } else {
      // Manual verification log
      newLogsBatch = [
        {
          id: 'log-' + Date.now() + '-1',
          timestamp: nowStr,
          type: 'Payment_Received',
          message: `New manual ${method} Send Money request submitted, pending verification`,
          details: `Client claims to have transferred BDT ${pack.resellerPrice} from ${senderNum} with TrxID: ${trxId}. Awaiting reseller approval.`
        }
      ];
      setLogs([...logs, ...newLogsBatch]);
    }

    setTransactions([newTx, ...transactions]);
    
    if (isAutoApprove) {
      alert(`ম্যানুয়াল রেচার্জ সফল! (Auto-approved)\n\nSubscriber line upgraded and active. Profit of ৳${profit} retained in your wallet.`);
    }
  };

  const handleClearLogs = () => {
    if (confirm('Verify: Do you want to clean all dynamic ISP webhook handshakes?')) {
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" id="isp-reseller-billing-panel">
      
      {/* Visual Navigation Top Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand with elegant responsive styling */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Wifi size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-none flex items-center gap-1.5">
                <span>{settings.resellerCompanyName}</span>
              </h1>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-wide">
                ISP Reseller Billing Panel • Local Bangladesh ISP Hub
              </p>
            </div>
          </div>

          {/* Interactive Multi-mode View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => {
                setViewMode('customer');
                setIsAdminAuthenticated(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'customer' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User size={14} className={viewMode === 'customer' ? 'text-amber-500' : ''} />
              <span>Customer Portal (গ্রাহক প্যানেল)</span>
            </button>
            
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'admin' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu size={14} className={viewMode === 'admin' ? 'text-amber-500' : ''} />
              <span>Reseller Panel (এডমিন প্যানেল)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Primary Application Showcase */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {viewMode === 'customer' ? (
          <CustomerPortal
            customers={customers}
            packages={packages}
            bkashNumber={settings.bkashNumber}
            nagadNumber={settings.nagadNumber}
            rocketNumber={settings.rocketNumber}
            resellerCompanyName={settings.resellerCompanyName}
            onInitiatePayment={(method, customer, pack) => setActiveSim({ method, customer, pack })}
            onManualPayment={handleManualPaymentSubmit}
          />
        ) : !isAdminAuthenticated ? (
          <div className="max-w-md mx-auto my-12 animate-slide-up">
            <div className="bg-white border border-slate-200/50 rounded-3xl p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>
              
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                  <ShieldAlert size={26} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">রিসেলার প্যানেল লক (Secure Gate)</h2>
                <p className="text-xs text-slate-500 mt-1">Authorized Access Only • Tanbin Reseller Panel</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasswordInput === (settings.adminPassword || 'admin')) {
                    setIsAdminAuthenticated(true);
                    setShowPasswordError(false);
                    setAdminPasswordInput('');
                  } else {
                    setShowPasswordError(true);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1 relative">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    এডমিন পাসওয়ার্ড দিন (Enter Code)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4.5 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-slate-50/50 pr-10"
                      placeholder="••••••••"
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        if (showPasswordError) setShowPasswordError(false);
                      }}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-650 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {showPasswordError && (
                    <p className="text-xs text-red-500 font-bold mt-1.5">
                      ❌ ভুল পাসওয়ার্ড! আবার চেষ্টা করুন (Incorrect Password!)
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} className="text-amber-500" />
                  <span>প্যানেলে প্রবেশ করুন (Access Dashboard)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('customer')}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-[11px] font-bold transition-all text-center cursor-pointer"
                >
                  কাস্টমার পোর্টালে ফিরে যান (Back to Customer Portal)
                </button>
              </form>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-4">
              সুরক্ষিত রিসেলার বিলিং গেট • ডেমো পাসওয়ার্ড: <span className="font-mono bg-white border border-slate-200 px-1 py-0.2 rounded font-bold text-slate-500">admin</span>
            </p>
          </div>
        ) : (
          <AdminPortal
            packages={packages}
            customers={customers}
            transactions={transactions}
            settings={settings}
            logs={logs}
            onUpdatePackages={setPackages}
            onUpdateCustomers={setCustomers}
            onUpdateSettings={setSettings}
            onClearLogs={handleClearLogs}
          />
        )}
      </main>

      {/* Active Gateway Simulator Overlay */}
      {activeSim && (
        <BkashSimulator
          method={activeSim.method}
          amount={activeSim.pack.resellerPrice}
          packageName={activeSim.pack.name}
          onSuccess={handlePaymentSuccess}
          onClose={() => setActiveSim(null)}
        />
      )}

      {/* Humble Page Footer in high constrast light theme */}
      <footer className="w-full bg-white border-t border-slate-200/50 py-4.5 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Encrypted Self-Recharge Router Switch. Admin panel profit secure.</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-extrabold text-slate-700">{settings.resellerCompanyName}</span>
            <span>• Gazipur, Bangladesh</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
