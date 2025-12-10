import React from 'react';
import { User } from '../types';
import { subscriptionPlans } from '../config/subscriptions';
import { Users, DollarSign, Activity, Image } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  if (currentUser.role !== 'admin') {
    return <div className="text-center text-red-500 mt-10">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Users /></div>
            <div>
              <div className="text-2xl font-bold text-white">1,234</div>
              <div className="text-xs text-zinc-500">Total Users</div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-500"><DollarSign /></div>
            <div>
              <div className="text-2xl font-bold text-white">€45.2k</div>
              <div className="text-xs text-zinc-500">Monthly Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500"><Image /></div>
            <div>
              <div className="text-2xl font-bold text-white">856</div>
              <div className="text-xs text-zinc-500">Jobs Today</div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><Activity /></div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-zinc-500">System Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-950 text-zinc-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Tier</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    {[1,2,3,4,5].map((_, i) => (
                        <tr key={i} className="hover:bg-zinc-800/50">
                            <td className="px-6 py-4">User {i + 1}</td>
                            <td className="px-6 py-4">user{i+1}@example.com</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-zinc-800 rounded text-xs">{subscriptionPlans[i % 4].name}</span></td>
                            <td className="px-6 py-4 text-emerald-500">Active</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
