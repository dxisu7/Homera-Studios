import React, { useState } from 'react';
import { User, Invoice } from '../types';
import { User as UserIcon, CreditCard, Receipt, Settings, Shield, Check, Download, AlertCircle, Globe, Lock, Upload, X, Star } from 'lucide-react';

interface AccountSettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const VAT_RATES: Record<string, number> = {
  'Netherlands': 21,
  'Germany': 19,
  'United Kingdom': 20,
  'France': 20,
  'United States': 0,
  'Belgium': 21,
  'Spain': 21,
};

const COUNTRIES = Object.keys(VAT_RATES).sort();

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'billing'>('profile');
  
  // Profile State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [country, setCountry] = useState(user.country || 'Netherlands');
  
  // Password State
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  
  // Payment State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'CREDIT_CARD' | 'PAYPAL'>('CREDIT_CARD');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  // Upgrade Flow State
  const [pendingTier, setPendingTier] = useState<User['tier'] | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Invoice State
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-2023-001', date: '2023-10-01', amount: 24.99, status: 'PAID', pdfUrl: '#' },
    { id: 'INV-2023-002', date: '2023-11-01', amount: 24.99, status: 'PAID', pdfUrl: '#' },
    { id: 'INV-2023-003', date: '2023-12-01', amount: 34.99, status: 'PAID', pdfUrl: '#' },
  ]);

  const currentVatRate = VAT_RATES[country] || 21;

  const getPriceForTier = (tier: User['tier']) => {
    switch(tier) {
        case 'PREMIUM_2K': return 24.99;
        case 'ULTRA_4K': return 34.99;
        case 'ULTRA_16K': return 99.00;
        default: return 0;
    }
  };

  const calculateTotal = (price: number) => {
    const vatAmount = price * (currentVatRate / 100);
    return {
      total: price + vatAmount,
      vat: vatAmount
    };
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ ...user, name, email, country });
      
      if (passwordNew) {
         setNotification("Password updated successfully.");
         setPasswordOld('');
         setPasswordNew('');
      } else {
         setNotification("Profile information updated.");
      }

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setNotification(null); }, 3000);
    }, 1000);
  };

  const handleTierChangeRequest = (tier: User['tier']) => {
    if (tier === user.tier) return;
    
    setPendingTier(tier);

    // If Free tier, just downgrade
    if (tier === 'FREE') {
      if (confirm("Are you sure you want to downgrade to the Free plan? You will lose access to premium features.")) {
         onUpdateUser({ ...user, tier: 'FREE' });
         setNotification("Plan downgraded to Free Tier.");
         setPendingTier(null);
      }
      return;
    }

    // For paid tiers, check payment method
    if (!user.paymentMethod) {
      setNotification(`To upgrade to ${tier.replace('_', ' ')}, please add a payment method first.`);
      setActiveTab('billing');
      setIsAddingPayment(true);
      // We keep pendingTier set, so we know to resume after payment add
    } else {
      setShowUpgradeModal(true);
    }
  };

  const confirmUpgrade = () => {
    if (!pendingTier || !user.paymentMethod) return;
    setIsSaving(true);

    const planPrice = getPriceForTier(pendingTier);
    const { total } = calculateTotal(planPrice);

    // LOG REQUIREMENT: Payment execution routing
    console.log(`[System] Initiating transaction via <PAYMENT_PROCESSOR_ACCOUNT>`);
    console.log(`[System] Method: ${user.paymentMethod.type}, Amount: ${total.toFixed(2)}, Currency: EUR`);

    setTimeout(() => {
      // 1. Update User Tier
      onUpdateUser({ ...user, tier: pendingTier });

      // 2. Generate Invoice
      const newInvoice: Invoice = {
        id: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        amount: total,
        status: 'PAID',
        pdfUrl: '#'
      };
      setInvoices([newInvoice, ...invoices]);

      // 3. Cleanup
      setIsSaving(false);
      setShowUpgradeModal(false);
      setPendingTier(null);
      setNotification("Subscription upgraded successfully!");
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  const handlePaymentSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // LOG REQUIREMENT: Payment execution routing
    console.log(`[Secure] Routing payment method update to <PAYMENT_PROCESSOR_ACCOUNT>`);

    setTimeout(() => {
      const newMethod = paymentType === 'CREDIT_CARD' 
        ? { type: 'VISA' as const, last4: cardNum.slice(-4) || '1234' }
        : { type: 'PAYPAL' as const, email: paypalEmail };

      onUpdateUser({ ...user, paymentMethod: newMethod });
      
      setIsAddingPayment(false);
      setIsSaving(false);
      setNotification("Payment method saved securely.");
      setTimeout(() => setNotification(null), 3000);

      // Resume Upgrade Flow if active
      if (pendingTier) {
        setActiveTab('subscription');
        setShowUpgradeModal(true);
      }
    }, 1500);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading Invoice ${invoiceId} (PDF) from <PAYMENT_PROCESSOR_ACCOUNT>...`);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (!file.type.startsWith('image/')) {
        setNotification("Please select a valid image file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Immediate update for "simulated" upload
        onUpdateUser({ ...user, avatarUrl: result });
        setNotification("Profile picture updated.");
        
        // Clear notification after delay
        setTimeout(() => setNotification(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Settings className="w-8 h-8 text-yellow-500" />
        Account Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <UserIcon className="w-4 h-4" />
            Profile & Security
          </button>
          <button 
            onClick={() => setActiveTab('subscription')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'subscription' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <Shield className="w-4 h-4" />
            Subscription
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
          >
            <CreditCard className="w-4 h-4" />
            Billing & Invoices
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {notification && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Check className="w-5 h-5" />
              {notification}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold text-zinc-500 border-2 border-dashed border-zinc-700 overflow-hidden relative group shadow-inner">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-zinc-500">{user.name.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                         <Upload className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    {/* Invisible file input covering the area for better UX on drag/click */}
                    <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload New Picture
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                    <p className="text-xs text-zinc-500">Recommended: Square JPG, PNG. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Email Address</label>
                    <div className="relative">
                        <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Country / Region</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                        <select 
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pl-10 text-white focus:border-yellow-500 outline-none transition-colors text-sm appearance-none cursor-pointer"
                        >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">Used for tax calculation (Current VAT: {currentVatRate}%)</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-500" />
                    Security
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Current Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={passwordOld}
                          onChange={(e) => setPasswordOld(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">New Password</label>
                        <input 
                          type="password" 
                          placeholder="New password"
                          value={passwordNew}
                          onChange={(e) => setPasswordNew(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-yellow-500 outline-none transition-colors text-sm"
                        />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Current Plan</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.tier === 'ULTRA_16K' ? 'bg-yellow-500 text-black border border-yellow-400 shadow-yellow-500/50 shadow-sm' :
                      user.tier === 'ULTRA_4K' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                      user.tier === 'PREMIUM_2K' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                      'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {user.tier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <CreditCard className="w-4 h-4" />
                    <span>Next billing date: <span className="text-white font-medium">{new Date(user.nextBillingDate).toLocaleDateString()}</span></span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                     { 
                       id: 'FREE', 
                       name: 'Standard', 
                       price: 0, 
                       features: ['1920x1080 Output', 'Standard Quality', 'Basic Styles'] 
                     },
                     { 
                       id: 'PREMIUM_2K', 
                       name: 'Premium 2K', 
                       price: 24.99, 
                       features: ['2560x1440 Output', 'High Quality', 'Commercial Use'] 
                     },
                     { 
                       id: 'ULTRA_4K', 
                       name: 'Ultra 4K', 
                       price: 34.99, 
                       features: ['3840x2160 Output', 'Ultra High Quality', 'Agency Tools'] 
                     },
                     { 
                       id: 'ULTRA_16K', 
                       name: 'Ultra-Realistic 16K', 
                       price: 99.00, 
                       isNew: true,
                       features: ['15369x8640 Output', 'Flagship Realism', 'Priority GPU', 'Dedicated Support'] 
                     }
                  ].map((plan) => {
                    const priceBreakdown = calculateTotal(plan.price);
                    return (
                    <div 
                      key={plan.id}
                      className={`relative border rounded-xl p-5 flex flex-col h-full transition-all ${
                        user.tier === plan.id 
                          ? 'bg-zinc-900 border-yellow-500 ring-1 ring-yellow-500' 
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                       {user.tier === plan.id && (
                         <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg z-10">
                           CURRENT
                         </div>
                       )}
                       {plan.isNew && user.tier !== plan.id && (
                         <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/20 z-10 border border-white/20 flex items-center gap-1">
                           <Star className="w-3 h-3 fill-current" /> NEW
                         </div>
                       )}
                       
                       <div className="mb-4 mt-2">
                         <h4 className={`font-bold ${plan.isNew ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400' : 'text-white'}`}>{plan.name}</h4>
                         <div className="text-2xl font-bold text-white mt-1">€{plan.price}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
                         {plan.price > 0 && (
                             <div className="text-[10px] text-zinc-500 mt-1">
                                 + €{priceBreakdown.vat.toFixed(2)} VAT ({currentVatRate}%)
                                 <br/>
                                 Total: €{priceBreakdown.total.toFixed(2)}
                             </div>
                         )}
                       </div>
                       <ul className="flex-1 space-y-2 mb-6">
                         {plan.features.map((f, i) => (
                           <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                             <Check className={`w-3 h-3 flex-shrink-0 mt-0.5 ${plan.isNew ? 'text-purple-400' : 'text-emerald-500'}`} />
                             {f}
                           </li>
                         ))}
                       </ul>
                       <button 
                        onClick={() => handleTierChangeRequest(plan.id as any)}
                        disabled={user.tier === plan.id}
                        className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
                          user.tier === plan.id 
                            ? 'bg-zinc-800 text-zinc-500 cursor-default'
                            : plan.isNew
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:brightness-110 border border-white/10'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                       >
                         {user.tier === plan.id ? 'Active Plan' : 'Switch Plan'}
                       </button>
                    </div>
                  )})}
                </div>
             </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               
               {/* Payment Method Section */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
                 <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
                 
                 {!isAddingPayment ? (
                    // Display Current Method
                    user.paymentMethod ? (
                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
                            {user.paymentMethod.type === 'PAYPAL' ? (
                                <span className="font-bold text-blue-500 italic text-xs">PayPal</span>
                            ) : (
                                <CreditCard className="w-5 h-5 text-zinc-400" />
                            )}
                            </div>
                            <div>
                            <div className="text-sm font-bold text-white">
                                {user.paymentMethod.type === 'PAYPAL' 
                                ? user.paymentMethod.email 
                                : `${user.paymentMethod.type} ending in ${user.paymentMethod.last4}`}
                            </div>
                            <div className="text-xs text-zinc-500">Active for automatic billing</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsAddingPayment(true)}
                            className="text-sm text-zinc-400 hover:text-white underline"
                        >
                            Update
                        </button>
                    </div>
                    ) : (
                    <div className="text-center p-8 bg-zinc-950/50 border border-dashed border-zinc-800 rounded-lg">
                        <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm mb-4">No payment method added</p>
                        <button 
                            onClick={() => setIsAddingPayment(true)}
                            className="text-sm bg-white text-black px-4 py-2 rounded hover:bg-zinc-200"
                        >
                        Add Payment Method
                        </button>
                    </div>
                    )
                 ) : (
                     // ADD/EDIT FORM
                     <form onSubmit={handlePaymentSave} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                         <h3 className="text-sm font-bold text-white mb-4">Update Payment Details</h3>
                         
                         {/* Type Toggle */}
                         <div className="flex gap-4 mb-4">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="ptype" 
                                    checked={paymentType === 'CREDIT_CARD'} 
                                    onChange={() => setPaymentType('CREDIT_CARD')}
                                    className="accent-yellow-500"
                                />
                                 <span className="text-sm text-zinc-300">Credit Card</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="ptype" 
                                    checked={paymentType === 'PAYPAL'} 
                                    onChange={() => setPaymentType('PAYPAL')}
                                    className="accent-yellow-500"
                                />
                                 <span className="text-sm text-zinc-300">PayPal</span>
                             </label>
                         </div>

                         {paymentType === 'CREDIT_CARD' ? (
                             <div className="space-y-3">
                                 <div>
                                     <input 
                                        type="text" 
                                        placeholder="Card Number" 
                                        required 
                                        value={cardNum}
                                        onChange={e => setCardNum(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        required 
                                        value={cardExp}
                                        onChange={e => setCardExp(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none"
                                    />
                                     <input 
                                        type="text" 
                                        placeholder="CVC" 
                                        required 
                                        value={cardCvc}
                                        onChange={e => setCardCvc(e.target.value)}
                                        className="bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none"
                                    />
                                 </div>
                             </div>
                         ) : (
                             <div>
                                 <input 
                                    type="email" 
                                    placeholder="PayPal Email Address" 
                                    required 
                                    value={paypalEmail}
                                    onChange={e => setPaypalEmail(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none"
                                />
                             </div>
                         )}
                         
                         <div className="flex items-center gap-3 mt-4">
                             <button 
                                type="submit" 
                                disabled={isSaving}
                                className="text-xs bg-yellow-500 text-black px-4 py-2 rounded font-bold hover:bg-yellow-400"
                             >
                                 {isSaving ? 'Processing...' : 'Save Method'}
                             </button>
                             <button 
                                type="button" 
                                onClick={() => { setIsAddingPayment(false); setPendingTier(null); }} 
                                className="text-xs text-zinc-500 hover:text-white"
                             >
                                 Cancel
                             </button>
                         </div>
                         <p className="text-[10px] text-zinc-600 mt-2">
                            Securely processed via &lt;PAYMENT_PROCESSOR_ACCOUNT&gt;. No data stored locally.
                         </p>
                     </form>
                 )}
               </div>

               {/* Invoice History */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Invoice History</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-950 text-zinc-500 uppercase font-bold text-xs">
                        <tr>
                          <th className="px-6 py-4">Invoice ID</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-zinc-300">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-zinc-400">{inv.id}</td>
                            <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-bold text-white">€{inv.amount.toFixed(2)}</td>
                            <td className="px-6 py-4">
                               <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                                 {inv.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleDownloadInvoice(inv.id)}
                                className="text-zinc-400 hover:text-white transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && pendingTier && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { setShowUpgradeModal(false); setPendingTier(null); }}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-yellow-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Confirm Subscription</h3>
                <p className="text-zinc-400 mb-6 text-sm">
                   You are upgrading to <strong className="text-white">{pendingTier.replace('_', ' ')}</strong>. 
                   Please review the breakdown below.
                </p>

                <div className="bg-zinc-950 rounded-lg p-4 space-y-3 mb-6 border border-zinc-800">
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Monthly Plan</span>
                      <span className="text-white font-medium">€{getPriceForTier(pendingTier).toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">VAT ({currentVatRate}% - {country})</span>
                      <span className="text-white font-medium">€{calculateTotal(getPriceForTier(pendingTier)).vat.toFixed(2)}</span>
                   </div>
                   <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                      <span className="font-bold text-white">Total</span>
                      <span className="font-bold text-xl text-yellow-500">€{calculateTotal(getPriceForTier(pendingTier)).total.toFixed(2)}</span>
                   </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6 bg-zinc-800/50 p-3 rounded">
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  Charging {user.paymentMethod?.type} ending in {user.paymentMethod?.last4 || user.paymentMethod?.email?.split('@')[0]}
                </div>

                <button
                  onClick={confirmUpgrade}
                  disabled={isSaving}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : 'Confirm & Pay'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};