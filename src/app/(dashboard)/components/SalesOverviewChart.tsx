import React from "react";

const chartData = [
  { month: "Jan", sales: 12400, payout: 11200 },
  { month: "Feb", sales: 15800, payout: 14300 },
  { month: "Mar", sales: 14200, payout: 12900 },
  { month: "Apr", sales: 18900, payout: 17100 },
  { month: "May", sales: 21500, payout: 19400 },
  { month: "Jun", sales: 19800, payout: 17900 },
  { month: "Jul", sales: 24850, payout: 22600 },
];

export const SalesOverviewChart: React.FC = () => {
  const maxSales = Math.max(...chartData.map((d) => d.sales));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-primary">Monthly Sales & Earnings</h3>
          <p className="text-xs text-secondary mt-0.5">Gross revenue vs net payouts (2026)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary inline-block" />
            <span className="text-primary">Gross Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-primary">Net Payout</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
        {chartData.map((item) => {
          const salesHeightPercent = (item.sales / maxSales) * 100;
          const payoutHeightPercent = (item.payout / maxSales) * 100;

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-10">
                Gross: ${item.sales.toLocaleString()} | Net: ${item.payout.toLocaleString()}
              </div>

              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                <div
                  style={{ height: `${salesHeightPercent}%` }}
                  className="w-1/2 bg-primary/90 hover:bg-primary rounded-t-md transition-all duration-300"
                />
                <div
                  style={{ height: `${payoutHeightPercent}%` }}
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300"
                />
              </div>
              <span className="text-[11px] font-medium text-secondary">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
