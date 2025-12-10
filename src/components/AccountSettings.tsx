import React, { useState } from 'react';
import { User, Invoice } from '../types';
import { subscriptionPlans } from '../config/subscriptions';
import SubscriptionCard from './SubscriptionCard';
import { calculateVat } from '../services/stripeService';
import { User as UserIcon, CreditCard, Settings, Shield, Check, Download, AlertCircle, Globe, Lock, Upload, X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface AccountSettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const COUNTRIES = ['Netherlands', 'Germany', 'United Kingdom', 'France', 'United States', 'Belgium', 'Spain'];

export const AccountSettings: React.FC<AccountSettingsProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'billing'>('profile');
  
  // Profile State
  const [displayName, setDisplayName] = useState(user.displayName);
  const [country, setCountry] = useState(user.country || 'Netherlands');
  
  // Payment State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'CREDIT_CARD' | 'PAYPAL'>('CREDIT_CARD');
  
  // Upgrade Flow
  const [pendingTier, setPendingTier] = useState<typeof subscriptionPlans[0] | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Mock Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', date: '2023-11-01', amount: 24.99, vatAmount: 5.25, total: 30.24, status: 'PAID', pdfUrl: '#', items: [{desc: 'Premium 2K', amount: 24.99}] },
  ]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate Firestore Update
    setTimeout(() => {
      onUpdateUser({ ...user, displayName, country });
      setNotification("Profile updated.");
      setIsSaving(false);
      setTimeout(() => setNotification(null), 3000);
    }, 1000);
  };

  const handlePlanSelect = (plan: typeof subscriptionPlans[0]) => {
    if (plan.id === user.tier) return;
    setPendingTier(plan);
    if (plan.id === 'standard') {
        if(confirm("Downgrade to standard?")) {
            onUpdateUser({...user, tier: 'standard'});
        }
    } else {
        setShowUpgradeModal(true);
    }
  };

  const confirmUpgrade = () => {
    if (!pendingTier) return;
    setIsSaving(true);

    const vat = calculateVat(pendingTier.priceExVat, country);
    const total = pendingTier.priceExVat + vat;

    // Simulate Stripe Charge & Firestore Update
    setTimeout(() => {
      onUpdateUser({ ...user, tier: pendingTier.id as User['tier'] });
      
      const newInvoice: Invoice = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString(),
        amount: pendingTier.priceExVat,
        vatAmount: vat,
        total: total,
        status: 'PAID',
        pdfUrl: '#',
        items: [{ desc: `${pendingTier.name} Subscription`, amount: pendingTier.priceExVat }]
      };
      
      setInvoices([newInvoice, ...invoices]);
      setIsSaving(false);
      setShowUpgradeModal(false);
      setPendingTier(null);
      setNotification(`Upgraded to ${pendingTier.name}!`);
    }, 2000);
  };

  const generatePDF = (inv: Invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Homera Studios Ai - Invoice", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${inv.id}`, 20, 40);
    doc.text(`Date: ${new Date(inv.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Status: ${inv.status}`, 20, 60);

    doc.text(`Billed To: ${user.displayName}`, 20, 80);
    doc.text(`Country: ${user.country}`, 20, 90);

    let y = 110;
    inv.items.forEach(item => {
        doc.text(`${item.desc}`, 20, y);
        doc.text(`€${item.amount.toFixed(2)}`, 150, y);
        y += 10;
    });

    doc.line(20, y, 190, y);
    y += 10;
    doc.text(`Subtotal:`, 120, y); doc.text(`€${inv.amount.toFixed(2)}`, 150, y);
    y += 10;
    doc.text(`VAT:`, 120, y); doc.text(`€${inv.vatAmount.toFixed(2)}`, 150, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Total:`, 120, y); doc.text(`€${inv.total.toFixed(2)}`, 150, y);

    doc.save(`invoice-${inv.id}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Settings className="w-8 h-8 text-yellow-500" />
        Account Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          {['profile', 'subscription', 'billing'].map(tab => (
            <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full text-left px-4 py-3 rounded-lg capitalize ${activeTab === tab ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
                {tab}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">
            {notification && <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/50">{notification}</div>}

            {activeTab === 'profile' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Profile Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Display Name</label>
                            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 font-bold mb-2">Country (for VAT)</label>
                            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-white">
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <button onClick={handleProfileSave} disabled={isSaving} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-zinc-200">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'subscription' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {subscriptionPlans.map(plan => (
                        <SubscriptionCard key={plan.id} plan={plan} isCurrent={plan.id === user.tier} onSelect={handlePlanSelect} />
                    ))}
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Invoice History</h2>
                    <div className="space-y-2">
                        {invoices.map(inv => (
                            <div key={inv.id} className="flex justify-between items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                                <div>
                                    <div className="font-bold text-white">{inv.id}</div>
                                    <div className="text-xs text-zinc-500">{new Date(inv.date).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-white font-bold">€{inv.total.toFixed(2)}</span>
                                    <button onClick={() => generatePDF(inv)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white" title="Download PDF">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {showUpgradeModal && pendingTier && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 rounded-xl p-8 max-w-md w-full border border-zinc-700">
                  <h3 className="text-2xl font-bold text-white mb-4">Upgrade to {pendingTier.name}</h3>
                  <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between text-zinc-400"><span>Price</span><span>€{pendingTier.priceExVat.toFixed(2)}</span></div>
                      <div className="flex justify-between text-zinc-400"><span>VAT ({calculateVat(100, country) > 0 ? 'Applicable' : '0%'})</span><span>€{calculateVat(pendingTier.priceExVat, country).toFixed(2)}</span></div>
                      <div className="flex justify-between text-white font-bold border-t border-zinc-700 pt-2"><span>Total</span><span>€{(pendingTier.priceExVat + calculateVat(pendingTier.priceExVat, country)).toFixed(2)}</span></div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={confirmUpgrade} className="flex-1 bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400">Pay & Upgrade</button>
                      <button onClick={() => setShowUpgradeModal(false)} className="flex-1 bg-zinc-800 text-white py-3 rounded-lg font-bold hover:bg-zinc-700">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
