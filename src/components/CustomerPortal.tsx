import React, { useState } from 'react';
import { Customer, Package, Transaction } from '../types';
import { 
  Wifi, Calendar, User, Phone, MapPin, Hash, Sparkles, Check, 
  ArrowRight, ShieldAlert, CheckCircle, HelpCircle, AlertCircle 
} from 'lucide-react';

interface CustomerPortalProps {
  customers: Customer[];
  packages: Package[];
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  resellerCompanyName: string;
  onInitiatePayment: (method: 'bKash' | 'Nagad' | 'Rocket', customer: Customer, pack: Package) => void;
  onManualPayment: (method: 'bKash' | 'Nagad' | 'Rocket', customer: Customer, pack: Package, senderNum: string, trxId: string) => void;
}

export default function CustomerPortal({
  customers,
  packages,
  bkashNumber,
  nagadNumber,
  rocketNumber,
  resellerCompanyName,
  onInitiatePayment,
  onManualPayment
}: CustomerPortalProps) {
  
  const [userIdInput, setUserIdInput] = useState('');
  const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [paymentGateway, setPaymentGateway] = useState<'bKash' | 'Nagad' | 'Rocket' | null>(null);
  
  // Manual transaction tracking
  const [manualMode, setManualMode] = useState(false);
  const [manualSenderNumber, setManualSenderNumber] = useState('');
  const [manualTrxId, setManualTrxId] = useState('');
  const [manualSubmitted, setManualSubmitted] = useState(false);
  
  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedInput = userIdInput.trim().toLowerCase();
    const found = customers.find(
      c => c.userId.toLowerCase() === formattedInput || c.mobile === formattedInput
    );
    
    if (found) {
      setLoggedInCustomer(found);
      setSelectedPackId(found.activePackageId || packages[0]?.id || '');
      setPaymentGateway(null);
      setManualMode(false);
      setManualSubmitted(false);
    } else {
      alert('Subscriber connection ID or mobile phone not registered. Please enter a valid user like "tanbin01" or "abir_net".');
    }
  };

  const handleLogout = () => {
    setLoggedInCustomer(null);
    setUserIdInput('');
  };

  // Helper calculation for expiration countdown
  const getExpiryContext = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `Expired ${Math.abs(diffDays)} days ago`,
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        critical: true
      };
    } else if (diffDays === 0) {
      return {
        text: 'Expires TODAY',
        color: 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse',
        critical: true
      };
    } else if (diffDays === 1) {
      return {
        text: 'Expires TOMORROW',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        critical: true
      };
    } else {
      return {
        text: `${diffDays} days remaining`,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        critical: false
      };
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInCustomer || !selectedPackId || !paymentGateway) return;
    
    const pack = packages.find(p => p.id === selectedPackId);
    if (!pack) return;

    if (!manualSenderNumber.match(/^(01)[3-9][0-9]{8}$/)) {
      alert('Please enter a valid 11-digit mobile number');
      return;
    }

    if (manualTrxId.length < 8) {
      alert('Please enter a valid Transaction TrxID');
      return;
    }

    onManualPayment(paymentGateway, loggedInCustomer, pack, manualSenderNumber, manualTrxId);
    setManualSubmitted(true);
  };

  return (
    <div className="space-y-6" id="customer-portal-root">
      
      {!loggedInCustomer ? (
        /* LOGIN LANDING CARD */
        <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Wifi size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">ISP Customer Recharge</h2>
              <p className="text-xs text-gray-500">Pay your monthly bill and extend your line instantly</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600">Enter Internet User ID or Phone Number</label>
              <input
                type="text"
                placeholder="e.g. tanbin01 or abir_net"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>Verify ID & Pay</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* DEMO ACCENTS FOR EASY USER INTERACTION */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <HelpCircle size={15} />
              <span>Demo Accounts for Quick Verification</span>
            </div>
            <p className="text-[11px] text-amber-900/85 leading-relaxed">
              Login as any configured subscriber to simulate live billing:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button 
                onClick={() => { setUserIdInput('tanbin01'); }} 
                className="bg-white hover:bg-amber-100 p-2 rounded-lg text-left border border-amber-200/50 font-mono"
              >
                <strong>User:</strong> tanbin01
                <span className="block text-slate-400 font-sans text-[9px]">Expires tomorrow</span>
              </button>
              <button 
                onClick={() => { setUserIdInput('jasim_wireless'); }} 
                className="bg-white hover:bg-amber-100 p-2 rounded-lg text-left border border-amber-200/50 font-mono"
              >
                <strong>User:</strong> jasim_wireless
                <span className="block text-red-500 font-sans text-[9px]">Line Expired / Suspended</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* CUSTOMER PROFILE CARD & BILLING PROCESS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-slate-900">
          
          {/* Column 1: Connection Credentials Details & State */}
          <div className="bg-slate-50 border border-slate-200/30 rounded-3xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Wifi size={18} className="text-amber-500" />
                <span className="text-xs font-black uppercase text-slate-400">Connection Status</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] font-semibold text-rose-500 hover:underline uppercase"
              >
                Exit Portal
              </button>
            </div>

            {/* Subscriber Bio profile */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-250/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 leading-tight">{loggedInCustomer.name}</h3>
                    <span className="text-[10px] font-mono font-bold text-gray-500">Router ID: {loggedInCustomer.userId}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Phone size={12} />
                    <span className="font-mono">{loggedInCustomer.mobile}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 truncate col-span-2">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{loggedInCustomer.address || 'Local Substation'}</span>
                  </div>
                </div>
              </div>

              {/* Countdown box */}
              {(() => {
                const expiry = getExpiryContext(loggedInCustomer.expiryDate);
                return (
                  <div className={`p-4 rounded-2xl border flex flex-col justify-between ${expiry.color}`}>
                    <div className="flex items-center justify-between text-xs font-bold gap-1">
                      <span className="flex items-center gap-1"><Calendar size={14} /> Subscription Status</span>
                      <span className="font-mono text-[10px] py-0.5 px-1.5 bg-white/60 border border-slate-300/30 rounded uppercase font-black">{loggedInCustomer.status}</span>
                    </div>
                    <div className="text-base font-extrabold font-mono mt-2 tracking-wide">
                      {expiry.text}
                    </div>
                    <div className="text-[10px] opacity-70 mt-1">
                      Active Expiry: {loggedInCustomer.expiryDate}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Column 2 & 3: Package Options & Payment Gateways */}
          <div className="md:col-span-2 space-y-6">
            
            {!paymentGateway ? (
              /* PANEL A: CHOOSE A BANDWIDTH TIER */
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">Select Internet Extension Plan</h3>
                  <p className="text-xs text-gray-500">Choose your dynamic bandwidth connection package for the next 30 days</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map(p => {
                    const isSelected = selectedPackId === p.id;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPackId(p.id)}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-xs' 
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-3 right-3 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
                            <Check size={12} />
                          </span>
                        )}
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unlimited Net</span>
                          <h4 className="font-black text-slate-800 text-sm leading-tight">{p.name}</h4>
                          <div className="text-xs text-amber-600 font-bold font-mono">{p.speed} Mbps Bandwidth Line</div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">Monthly Billing</span>
                          <span className="text-lg font-black font-mono text-slate-800">৳ {p.resellerPrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const pack = packages.find(p => p.id === selectedPackId);
                      if (pack) {
                        setPaymentGateway('bKash'); // Default to bKash gateway view
                      } else {
                        alert('Please select an extension subscription plan');
                      }
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Gateway Selection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* PANEL B: CHOOSE MOBILE PAYMENT WALLET */
              <div className="space-y-5">
                <button
                  onClick={() => setPaymentGateway(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-2 block uppercase tracking-wider"
                >
                  ← Go back to Package List
                </button>

                <div className="border border-slate-200/50 rounded-2xl p-5 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">Recharge Subscription Billing</span>
                    <strong className="text-sm font-extrabold text-slate-800">
                      {packages.find(p => p.id === selectedPackId)?.name}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-semibold">Total Invoice Amount</span>
                    <strong className="text-lg font-black font-mono text-amber-600">
                      ৳ {packages.find(p => p.id === selectedPackId)?.resellerPrice}
                    </strong>
                  </div>
                </div>

                {/* Gateway channels selectors */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Payment Channel</h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => { setPaymentGateway('bKash'); setManualMode(false); setManualSubmitted(false); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                        paymentGateway === 'bKash' ? 'border-[#E2125B] bg-[#E2125B]/5 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black bg-[#E2125B] text-white text-xs">
                        bKash
                      </div>
                      <span className="text-[10px] text-slate-700">bKash Fast</span>
                    </button>

                    <button
                      onClick={() => { setPaymentGateway('Nagad'); setManualMode(false); setManualSubmitted(false); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                        paymentGateway === 'Nagad' ? 'border-[#F26522] bg-[#F26522]/5 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black bg-[#F26522] text-white text-xs">
                        Nagad
                      </div>
                      <span className="text-[10px] text-slate-700">Nagad Pay</span>
                    </button>

                    <button
                      onClick={() => { setPaymentGateway('Rocket'); setManualMode(false); setManualSubmitted(false); }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-bold ${
                        paymentGateway === 'Rocket' ? 'border-[#8C3280] bg-[#8C3280]/5 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black bg-[#8C3280] text-white text-[10px]">
                        Rocket
                      </div>
                      <span className="text-[10px] text-slate-700">Rocket Pay</span>
                    </button>
                  </div>
                </div>

                {/* Automation vs Manual Switch */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4">
                  <div className="flex border-b border-gray-100 pb-3">
                    <button
                      onClick={() => setManualMode(false)}
                      className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
                        !manualMode ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'
                      }`}
                    >
                      Instant Merchant API (Auto)
                    </button>
                    <button
                      onClick={() => setManualMode(true)}
                      className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
                        manualMode ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-400'
                      }`}
                    >
                      Personal Send Money (Manual)
                    </button>
                  </div>

                  {!manualMode ? (
                    /* AUTOMATED PAYMENT BANNER */
                    <div className="space-y-4 text-center py-4">
                      <div className="text-slate-600 space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">Direct Secure Checkout</h4>
                        <p className="text-xs text-gray-500">
                          Secure API connection activates your router line instantly on parent ISP switchboard
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          const pack = packages.find(p => p.id === selectedPackId);
                          if (pack && paymentGateway) {
                            onInitiatePayment(paymentGateway, loggedInCustomer, pack);
                          }
                        }}
                        className={`mx-auto max-w-xs w-full py-4 px-6 rounded-xl font-black text-white text-xs tracking-widest uppercase shadow-md transition-all flex items-center justify-center gap-2 font-mono ${
                          paymentGateway === 'bKash' ? 'bg-[#E2125B] hover:bg-[#c10f4d]' : 
                          paymentGateway === 'Nagad' ? 'bg-[#F26522] hover:bg-[#d65318]' : 
                          'bg-[#8C3280] hover:bg-[#722168]'
                        }`}
                      >
                        <Sparkles size={16} />
                        <span>Checkout via {paymentGateway}</span>
                      </button>
                    </div>
                  ) : (
                    /* MANUAL PAYMENT TRANSFER PROCESS */
                    <div className="space-y-4 animate-fade-in">
                      
                      {!manualSubmitted ? (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2.5 text-slate-700 leading-relaxed">
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <AlertCircle size={15} className="text-amber-500 shrink-0" />
                              <span>Instruction to send manual payment:</span>
                            </div>
                            <ol className="list-decimal pl-4.5 space-y-1">
                              <li>Go to your {paymentGateway} app/menu and select <strong>Send Money</strong>.</li>
                              <li>Send <strong>৳ {packages.find(p => p.id === selectedPackId)?.resellerPrice}</strong> to our Personal {paymentGateway} Account: <strong className="font-mono text-emerald-700">{paymentGateway === 'bKash' ? bkashNumber : paymentGateway === 'Nagad' ? nagadNumber : rocketNumber}</strong></li>
                              <li>Collect the 10-character <strong>TrxID</strong> from the purchase confirmation SMS.</li>
                              <li>Provide your sender mobile number and the TrxID below to initiate manual recharge validation.</li>
                            </ol>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-gray-600">Your {paymentGateway} Sender Number</label>
                              <input
                                type="text"
                                placeholder="017xxxxxxxx"
                                value={manualSenderNumber}
                                onChange={(e) => setManualSenderNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-gray-600">Transaction TrxID (from SMS)</label>
                              <input
                                type="text"
                                placeholder="e.g. BK8A9KLM31"
                                value={manualTrxId}
                                onChange={(e) => setManualTrxId(e.target.value.substring(0, 12))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono uppercase"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Calendar size={14} />
                            <span>Confirm Manual Submission</span>
                          </button>
                        </form>
                      ) : (
                        <div className="text-center py-6 space-y-3 animate-scale-up">
                          <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 uppercase">Manual Submission Received</h5>
                            <p className="text-[11px] text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
                              Your payment from <span className="font-mono text-gray-700">{manualSenderNumber}</span> (TrxID: <span className="font-mono text-gray-700 font-bold uppercase">{manualTrxId}</span>) has been submitted. The reseller ({resellerCompanyName}) will verify receipt in their bKash account and activate your lines.
                            </p>
                          </div>
                          <button
                            onClick={() => setManualSubmitted(false)}
                            className="text-[10px] text-slate-500 hover:underline uppercase font-bold"
                          >
                            Submit another code
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
