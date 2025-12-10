import React from "react";
import { Check, Star } from "lucide-react";
import { SubscriptionPlan } from "../config/subscriptions";

interface SubscriptionCardProps {
    plan: SubscriptionPlan;
    isCurrent: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionCard({ plan, isCurrent, onSelect }: SubscriptionCardProps) {
  const isBestValue = plan.id === 'ultra_4k';
  const isFlagship = plan.id === 'ultra_realistic_16k';

  const getBorderColor = () => {
    if (isCurrent) return "border-yellow-500 ring-1 ring-yellow-500 bg-zinc-900";
    if (isFlagship) return "border-purple-500/50 hover:border-purple-400 bg-gradient-to-b from-zinc-900 to-purple-900/10";
    return "border-zinc-800 hover:border-zinc-600 bg-zinc-900";
  };

  const getButtonClass = () => {
    if (isCurrent) return "bg-zinc-800 text-zinc-500 cursor-default";
    if (isFlagship) return "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110";
    return "bg-white text-black hover:bg-zinc-200";
  };

  return (
    <div className={`relative border rounded-xl p-6 shadow-xl transition-all duration-300 flex flex-col h-full ${getBorderColor()}`}>
      
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-lg">
           CURRENT PLAN
        </div>
      )}

      {isFlagship && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-lg flex items-center gap-1">
           <Star className="w-3 h-3 fill-current" /> NEW
        </div>
      )}

      <div className="mb-4 text-center">
        <h3 className={`text-lg font-bold mb-1 ${isFlagship ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' : 'text-white'}`}>
          {plan.name}
        </h3>
        <p className="text-xs text-zinc-500 font-mono">{plan.resolution}</p>
      </div>
      
      <div className="mb-6 text-center">
        {plan.priceExVat === 0 ? (
          <span className="text-3xl font-bold text-white">Free</span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white">
              €{plan.priceExVat}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">/ mo (ex VAT)</span>
          </div>
        )}
      </div>

      <ul className="flex-1 space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
            <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isFlagship ? 'text-purple-400' : 'text-emerald-500'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${getButtonClass()}`}
      >
        {isCurrent ? "Active Plan" : "Upgrade"}
      </button>
    </div>
  );
}
