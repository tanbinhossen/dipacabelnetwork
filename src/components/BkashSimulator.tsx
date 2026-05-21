import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Key, Lock, HelpCircle, X, CheckCircle } from 'lucide-react';

interface BkashSimulatorProps {
  method: 'bKash' | 'Nagad' | 'Rocket';
  amount: number;
  packageName: string;
  onSuccess: (senderNumber: string, trxId: string) => void;
  onClose: () => void;
}

export default function BkashSimulator({ method, amount, packageName, onSuccess, onClose }: BkashSimulatorProps) {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'success'>('number');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const generateTrxId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 10;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (method === 'bKash' ? 'BK' : method === 'Nagad' ? 'NG' : 'RK') + result;
  };

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^(01)[3-9][0-9]{8}$/)) {
      setError('Please enter a valid 11-digit mobile number starting with 01');
      return;
    }
    setError('');
    setStep('otp');
    setOtpTimer(120);
    // Simulate auto-filling OTP for convenience
    setTimeout(() => {
      setOtp('128945');
    }, 1500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setError('');
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('PIN must be secure');
      return;
    }
    setError('');
    setStep('processing');

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        const fakeTrx = generateTrxId();
        onSuccess(phoneNumber, fakeTrx);
      }, 1500);
    }, 2000);
  };

  // Color theme variables based on payment gateway selected
  const getTheme = () => {
    switch (method) {
      case 'bKash':
        return {
          primary: 'bg-[#E2125B]', // bKash Pink
          hover: 'hover:bg-[#c10f4d]',
          lightBg: 'bg-[#FDF1F5]',
          text: 'text-[#E2125B]',
          logoText: 'bKash Checkout',
          accent: '#E2125B',
          logoPath: 'https://seeklogo.com/images/B/bkash-logo-06354DD2B4-seeklogo.com.png'
        };
      case 'Nagad':
        return {
          primary: 'bg-[#F26522]', // Nagad Orange
          hover: 'hover:bg-[#d65318]',
          lightBg: 'bg-[#FEF5F1]',
          text: 'text-[#F26522]',
          logoText: 'Nagad Checkout',
          accent: '#F26522',
          logoPath: 'https://seeklogo.com/images/N/nagad-logo-84C0F7AD4F-seeklogo.com.png'
        };
      case 'Rocket':
        return {
          primary: 'bg-[#8C3280]', // Rocket Purple
          hover: 'hover:bg-[#722168]',
          lightBg: 'bg-[#FAF4F9]',
          text: 'text-[#8C3280]',
          logoText: 'Rocket Payment',
          accent: '#8C3280',
          logoPath: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B1D61D2B52-seeklogo.com.png'
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="payment-simulator-modal">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Top Header Section simulating real invoice */}
        <div className={`p-5 ${theme.primary} text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-black/10 rounded-full p-1 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg text-xs font-bold shrink-0 tracking-wider">
              ISP SECURE
            </div>
            <div className="h-4 w-[1px] bg-white/30" />
            <div className="text-sm font-medium tracking-wide truncate max-w-[200px]">
              {packageName}
            </div>
          </div>

          <div className="mt-4 flex justify-between items-baseline">
            <span className="text-xs text-white/70">Payment Amount</span>
            <span className="text-2xl font-black font-mono">৳ {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-600" />
            <span>Secure ISP Sandbox Router Gateway</span>
          </div>
          <span className="font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">DEMO MODE</span>
        </div>

        {/* Core Gateway Mock Body */}
        <div className="p-6 flex-1 flex flex-col justify-between min-h-[300px]">
          
          {step === 'number' && (
            <form onSubmit={handleNumberSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  {/* Brand Logo Banner placeholder styled elegant */}
                  <div className={`px-5 py-2.5 rounded-xl font-bold text-lg tracking-wider text-white ${theme.primary} flex items-center gap-2 shadow-sm`}>
                    <span className="text-white font-extrabold">{theme.logoText.split(' ')[0]}</span>
                    <span className="text-white/80 font-normal text-xs bg-black/10 px-1.5 py-0.5 rounded">PAY</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Phone size={16} className="text-gray-400" />
                    Enter {method} Account Number (11-digit)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-gray-400 font-mono text-sm">+88</span>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-base tracking-widest text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:ring-gray-300"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    By confirming, you agree to ISP package subscription terms of service.
                  </p>
                </div>

                {error && <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-500 transition-all uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-4 ${theme.primary} ${theme.hover} text-white rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-wider`}
                >
                  Proceed
                </button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`${theme.lightBg} p-3 rounded-full ${theme.text}`}>
                    <Key size={32} />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-gray-800">Verification OTP Sent</h3>
                  <p className="text-xs text-gray-500">
                    A code has been sent to <span className="font-mono text-gray-700 font-bold">{phoneNumber}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full tracking-widest text-center py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    required
                    autoFocus
                  />
                  <div className="flex justify-between items-center text-xs text-gray-400 px-1 pt-1">
                    <span>Didn't get code? Auto-fill active.</span>
                    <span className="font-mono text-gray-600 font-medium">OTP Code: 128945 (Resend in {otpTimer}s)</span>
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('number')}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-500 transition-all uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-4 ${theme.primary} ${theme.hover} text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md`}
                >
                  Verify Code
                </button>
              </div>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`${theme.lightBg} p-3 rounded-full ${theme.text}`}>
                    <Lock size={32} />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-sm font-bold text-gray-800">Secure PIN Authentication</h3>
                  <p className="text-xs text-gray-500">
                    Enter your {method} account PIN for billing authorization
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest text-center">
                    Enter 5-Digit Account PIN
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="•••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="w-full tracking-widest text-center py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-2xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-center text-gray-400 italic">
                    ⚠️ ISP Sandbox secures PIN processing. No secrets are stored or saved.
                  </p>
                </div>

                {error && <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('otp')}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-500 transition-all uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-4 ${theme.primary} ${theme.hover} text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-md`}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8">
              {/* Spinner */}
              <div className="relative w-16 h-16">
                <div className={`absolute inset-0 rounded-full border-4 border-gray-100`}></div>
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${theme.text}`} style={{ borderColor: `${theme.accent} transparent transparent transparent` }}></div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-gray-800">Processing Subscription Payment...</h3>
                <p className="text-xs text-gray-400">Verifying funds and updating ISP profiles on Parent server</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8 animate-fade-in">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full border border-emerald-100 scale-110">
                <CheckCircle size={44} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-gray-800">Payment Authorized!</h3>
                <p className="text-xs text-gray-500">Transaction completed and verified successfully</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full inline-block">
                  ISP User Line API successfully updated!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Footer with standard legal copy */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Lock size={12} className="text-gray-400 shrink-0" />
            <span>128-bit Encryption SSL Active</span>
          </div>
          <div className="flex items-center gap-1 hover:text-gray-600 cursor-pointer">
            <HelpCircle size={12} />
            <span>Support: 16247</span>
          </div>
        </div>

      </div>
    </div>
  );
}
