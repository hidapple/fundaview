import { useState } from 'react';
import type { QuarterlyRevenue, AnnualRevenue } from '../types';

const YEAR_OPTIONS = [3, 5, 10, 0] as const;

function yearOptionLabel(n: number): string {
  return n === 0 ? 'All' : `${n}Y`;
}

interface RevenueTableProps {
  quarterly: QuarterlyRevenue[];
  annual: AnnualRevenue[];
}

interface CellData {
  revenue: number;
  yoy: number | null;
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}兆 USD`;
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}億 USD`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(2)}万 USD`;
  return `${value.toLocaleString('en-US')} USD`;
}

function formatYoy(value: number | null): string {
  if (value === null) return '';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function yoyColor(value: number | null): string {
  if (value === null) return '';
  if (value >= 25) return 'text-green-600';
  if (value >= 0) return 'text-slate-500';
  if (value < 0) return 'text-red-600';
  return 'text-slate-500';
}

function calcYoy(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function RevenueTable({ quarterly, annual }: RevenueTableProps) {
  const [yearLimit, setYearLimit] = useState<number>(5);

  if (quarterly.length === 0 && annual.length === 0) {
    return <p className="text-gray-500 text-sm">データがありません。</p>;
  }

  const qMap = new Map<number, Map<number, number>>();
  for (const q of quarterly) {
    if (!qMap.has(q.fiscalYear)) qMap.set(q.fiscalYear, new Map());
    qMap.get(q.fiscalYear)!.set(q.fiscalQuarter, q.revenue);
  }

  const aMap = new Map<number, number>();
  for (const a of annual) {
    aMap.set(a.fiscalYear, a.revenue);
  }

  const allYears = new Set<number>();
  for (const y of qMap.keys()) allYears.add(y);
  for (const y of aMap.keys()) allYears.add(y);
  const years = [...allYears].sort((a, b) => a - b);
  const visibleYears = yearLimit === 0 ? years : years.slice(-yearLimit);

  const rows: { year: number; quarters: (CellData | null)[]; total: CellData | null }[] = [];
  for (const year of visibleYears) {
    const qData = qMap.get(year);
    const quarters: (CellData | null)[] = [1, 2, 3, 4].map((q) => {
      const revenue = qData?.get(q);
      if (revenue === undefined) return null;
      const prevYearQ = qMap.get(year - 1)?.get(q);
      const yoy = prevYearQ !== undefined ? calcYoy(revenue, prevYearQ) : null;
      return { revenue, yoy };
    });

    const annualRevenue = aMap.get(year);
    let total: CellData | null = null;
    if (annualRevenue !== undefined) {
      const prevAnnual = aMap.get(year - 1);
      const yoy = prevAnnual !== undefined ? calcYoy(annualRevenue, prevAnnual) : null;
      total = { revenue: annualRevenue, yoy };
    }

    rows.push({ year, quarters, total });
  }

  return (
    <div>
      <div className="flex gap-1 mb-2 justify-end">
        {YEAR_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setYearLimit(n)}
            className={`px-2.5 py-0.5 text-xs rounded ${
              yearLimit === n
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {yearOptionLabel(n)}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600">
              <th className="py-2 px-3 font-medium text-left">FY</th>
              <th className="py-2 px-3 font-medium text-right">Q1</th>
              <th className="py-2 px-3 font-medium text-right">Q2</th>
              <th className="py-2 px-3 font-medium text-right">Q3</th>
              <th className="py-2 px-3 font-medium text-right">Q4</th>
              <th className="py-2 px-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.year}
                className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="py-2 px-3 font-medium text-gray-800">{row.year}</td>
                {row.quarters.map((cell, qi) => (
                  <td key={qi} className="py-2 px-3 text-right">
                    {cell ? (
                      <div>
                        <div className="text-gray-800">{formatRevenue(cell.revenue)}</div>
                        {cell.yoy !== null && (
                          <div className={`text-xs ${yoyColor(cell.yoy)}`}>{formatYoy(cell.yoy)}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                ))}
                <td className="py-2 px-3 text-right">
                  {row.total ? (
                    <div>
                      <div className="font-medium text-gray-800">{formatRevenue(row.total.revenue)}</div>
                      {row.total.yoy !== null && (
                        <div className={`text-xs ${yoyColor(row.total.yoy)}`}>{formatYoy(row.total.yoy)}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
