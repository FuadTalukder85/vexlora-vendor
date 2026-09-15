"use client";

import React, { useState } from "react";
import { CreditCard, DollarSign, Download, Building } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";

const mockPayouts = [
  {
    id: "PAY-5012",
    amount: 14250.0,
    status: "PAID",
    period: "Aug 01 - Aug 31, 2026",
    payoutDate: "2026-09-02T00:00:00Z",
    bank: "Chase Bank (**** 4892)",
  },
  {
    id: "PAY-4988",
    amount: 10600.5,
    status: "PAID",
    period: "Jul 01 - Jul 31, 2026",
    payoutDate: "2026-08-02T00:00:00Z",
    bank: "Chase Bank (**** 4892)",
  },
  {
    id: "PAY-4912",
    amount: 8340.2,
    status: "PAID",
    period: "Jun 01 - Jun 30, 2026",
    payoutDate: "2026-07-02T00:00:00Z",
    bank: "Chase Bank (**** 4892)",
  },
];

export default function PayoutsPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState(2485.0);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setIsRequestModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Payouts & Finance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track net earnings, commission deductions, bank transfer schedules, and requesting payouts.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsRequestModalOpen(true)}>
          <DollarSign className="w-4 h-4" />
          Request Instant Payout
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-primary to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Available Balance
          </span>
          <h2 className="text-3xl font-black tracking-tight">{formatCurrency(4850.35)}</h2>
          <p className="text-[11px] text-slate-300">Ready for instant bank transfer</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Pending Escrow Balance
          </span>
          <h2 className="text-3xl font-extrabold text-primary">{formatCurrency(1240.5)}</h2>
          <p className="text-[11px] text-slate-400">Clears upon sub-order delivery</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Commission Rate
          </span>
          <h2 className="text-3xl font-extrabold text-highlight">8.5%</h2>
          <p className="text-[11px] text-slate-400">Fixed tier platform commission</p>
        </div>
      </div>

      {/* Payout History & Bank Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Payout History" subtitle="Previous bank transfers and payouts">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Payout ID</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Bank Account</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {mockPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-primary">{p.id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.period}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{p.bank}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success">{p.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Bank Account Details" subtitle="Destination for funds transfer">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-primary">Chase Business Checking</p>
                  <p className="text-[11px] text-slate-500">Account ending in **** 4892</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1 text-slate-600">
                <p>Routing: *****9012</p>
                <p>Holder: Apex Electronics Inc.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Net Revenue Payout"
      >
        <form onSubmit={handlePayoutSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Available to Withdraw: {formatCurrency(4850.35)}
            </label>
            <input
              type="number"
              max={4850.35}
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-primary"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-slate-600 space-y-1">
            <p>Target Bank: Chase Business Checking (**** 4892)</p>
            <p>Processing Time: 1 - 2 Business Days</p>
          </div>

          {payoutSuccess && (
            <p className="p-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-center">
              Payout request submitted successfully!
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
