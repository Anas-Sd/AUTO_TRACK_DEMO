import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Calendar, Sliders } from 'lucide-react';
import { formatCurrency } from '../lib/storage';

export default function AnalyticsCharts({ transactions, categories }) {
  const [timeframe, setTimeframe] = useState('daily'); // 'daily' | 'monthly' | 'yearly' | 'custom'
  const [activeIndex, setActiveIndex] = useState(null);
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const containerRef = useRef(null);
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);

  const openStartDatePicker = () => {
    if (startDateInputRef.current) {
      if (typeof startDateInputRef.current.showPicker === 'function') {
        startDateInputRef.current.showPicker();
      } else {
        startDateInputRef.current.focus();
      }
    }
  };

  const openEndDatePicker = () => {
    if (endDateInputRef.current) {
      if (typeof endDateInputRef.current.showPicker === 'function') {
        endDateInputRef.current.showPicker();
      } else {
        endDateInputRef.current.focus();
      }
    }
  };

  // Global click / tap listener to clear active selection when tapping outside
  useEffect(() => {
    const handleGlobalTap = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveIndex(null);
      }
    };

    document.addEventListener('mousedown', handleGlobalTap);
    document.addEventListener('touchstart', handleGlobalTap);

    return () => {
      document.removeEventListener('mousedown', handleGlobalTap);
      document.removeEventListener('touchstart', handleGlobalTap);
    };
  }, []);

  // Filter transactions according to selected timeframe or custom date range
  const getFilteredTransactions = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    
    if (timeframe === 'daily') {
      const todaysTx = transactions.filter(t => t.date === todayStr);
      return todaysTx.length > 0 ? todaysTx : transactions;
    }

    if (timeframe === 'monthly') {
      const currentMonthKey = todayStr.slice(0, 7);
      const monthlyTx = transactions.filter(t => t.date.startsWith(currentMonthKey));
      return monthlyTx.length > 0 ? monthlyTx : transactions;
    }

    if (timeframe === 'yearly') {
      const currentYearKey = todayStr.slice(0, 4);
      const yearlyTx = transactions.filter(t => t.date.startsWith(currentYearKey));
      return yearlyTx.length > 0 ? yearlyTx : transactions;
    }

    if (timeframe === 'custom') {
      return transactions.filter(t => {
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return t.date >= startDate;
        if (!startDate && endDate) return t.date <= endDate;
        return t.date >= startDate && t.date <= endDate;
      });
    }
    
    return transactions;
  };

  const filteredTx = getFilteredTransactions();

  // Calculate Category-wise Income & Expense Slices for the Pie Chart
  const categoryChartData = categories
    .map(cat => {
      const catTx = filteredTx.filter(t => t.category === cat.name);
      
      const income = catTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        
      const expense = catTx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const net = income - expense;
      const volume = expense > 0 ? expense : income;

      return {
        name: cat.name,
        color: cat.color || '#10b981',
        value: volume,
        income,
        expense,
        net,
        transactionCount: catTx.length
      };
    })
    .filter(item => item.value > 0 || item.income > 0 || item.expense > 0);

  // Total Income and Expense for the active view
  const activeTotalIncome = filteredTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const activeTotalExpense = filteredTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const activeSlice = activeIndex !== null && categoryChartData[activeIndex]
    ? categoryChartData[activeIndex]
    : null;

  // Custom Active Sector Expansion on Hover / Tap with Touch Event Forwarding
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
    return (
      <g
        onClick={(e) => {
          e.stopPropagation();
          setActiveIndex(index);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          setActiveIndex(index);
        }}
        className="cursor-pointer"
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#10b981"
          strokeWidth={2.5}
        />
      </g>
    );
  };

  const handleContainerClick = (e) => {
    // Reset active index only when tapping completely outside the donut container and category list items
    const isDonutTap = Boolean(e.target.closest('.donut-container'));
    const isListTap = Boolean(e.target.closest('.category-list-item'));
    const isPickerTap = Boolean(e.target.closest('.date-picker-bar'));

    if (!isDonutTap && !isListTap && !isPickerTap) {
      setActiveIndex(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-fadeIn"
    >
      
      {/* CATEGORY PIE CHART SPENDING INTELLIGENCE (2 cols on lg) */}
      <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden">
        
        {/* Header & Timeframe Mode Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Spending Intelligence</h2>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              Hover or tap category slices to reveal Income & Expense breakdown
            </p>
          </div>

          {/* Timeframe Toggle Buttons: Daily (Default), Monthly, Yearly, Custom */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => { setTimeframe('daily'); setActiveIndex(null); }}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                timeframe === 'daily'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => { setTimeframe('monthly'); setActiveIndex(null); }}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                timeframe === 'monthly'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => { setTimeframe('yearly'); setActiveIndex(null); }}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                timeframe === 'yearly'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => { setTimeframe('custom'); setActiveIndex(null); }}
              className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                timeframe === 'custom'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/80'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>
        </div>

        {/* CUSTOM DATE RANGE PICKER SELECTOR (Responsive 2-col grid on mobile, flex row on laptop) */}
        {timeframe === 'custom' && (
          <div className="date-picker-bar mb-4 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <Calendar className="w-4 h-4" />
              <span>Custom Date Range Analytics:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
              
              {/* START DATE CALENDAR PICKER BUTTON */}
              <div
                onClick={openStartDatePicker}
                className="flex items-center justify-between sm:justify-center gap-2 bg-slate-950 hover:bg-slate-850 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-800 text-xs cursor-pointer transition-all hover:border-emerald-500/50 min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">From:</span>
                </div>
                <input
                  ref={startDateInputRef}
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActiveIndex(null);
                  }}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer text-right sm:text-left min-w-0"
                />
              </div>

              {/* END DATE CALENDAR PICKER BUTTON */}
              <div
                onClick={openEndDatePicker}
                className="flex items-center justify-between sm:justify-center gap-2 bg-slate-950 hover:bg-slate-850 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-800 text-xs cursor-pointer transition-all hover:border-emerald-500/50 min-w-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">To:</span>
                </div>
                <input
                  ref={endDateInputRef}
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActiveIndex(null);
                  }}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer text-right sm:text-left min-w-0"
                />
              </div>

            </div>
          </div>
        )}

        {/* SUMMARY BADGES OVERVIEW */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Income</span>
            <span className="text-xs font-extrabold text-emerald-400 font-mono">+{formatCurrency(activeTotalIncome)}</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Expense</span>
            <span className="text-xs font-extrabold text-rose-400 font-mono">-{formatCurrency(activeTotalExpense)}</span>
          </div>
        </div>

        {/* PIE CHART DISPLAY WITH MOBILE DONUT CENTER OVERLAY */}
        <div className="donut-container h-56 sm:h-64 w-full flex items-center justify-center relative">
          {categoryChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onMouseLeave={() => setActiveIndex(null)}>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onClick={(_, index, e) => {
                      if (e) e.stopPropagation();
                      setActiveIndex(index);
                    }}
                  >
                    {categoryChartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.color}
                        stroke="rgba(9, 13, 22, 0.9)"
                        strokeWidth={2}
                        className="cursor-pointer transition-all hover:opacity-80"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }}
                        onTouchEnd={(e) => {
                          e.stopPropagation();
                          setActiveIndex(idx);
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* CENTER DONUT HOLE NATIVE OVERLAY */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                {activeSlice ? (
                  <div className="animate-fadeIn space-y-0.5 max-w-[100px] truncate">
                    <div
                      className="text-[11px] font-extrabold truncate"
                      style={{ color: activeSlice.color }}
                    >
                      {activeSlice.name}
                    </div>
                    <div className="text-[10px] font-extrabold text-emerald-400 font-mono">
                      +₹{activeSlice.income}
                    </div>
                    <div className="text-[10px] font-extrabold text-rose-400 font-mono">
                      -₹{activeSlice.expense}
                    </div>
                  </div>
                ) : (
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-semibold leading-tight uppercase tracking-wider">
                    Tap / Hover<br/>Category
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-xs">No transactions in selected range.</div>
          )}
        </div>

        {/* ACTIVE CATEGORY BOTTOM SUMMARY CARD */}
        {activeSlice ? (
          <div className="mt-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeSlice.color }}></div>
              <div>
                <div className="text-xs font-bold text-white">{activeSlice.name}</div>
                <div className="text-[10px] text-slate-400">{activeSlice.transactionCount} transactions</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 justify-end font-mono">
                  <ArrowUpRight className="w-3 h-3" /> Income: {formatCurrency(activeSlice.income)}
                </div>
                <div className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 justify-end font-mono">
                  <ArrowDownRight className="w-3 h-3" /> Expense: {formatCurrency(activeSlice.expense)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 p-2 text-center text-[10px] text-slate-500 italic">
            Hover or tap any category slice to inspect detailed income & expenses
          </div>
        )}

      </div>

      {/* CATEGORY BREAKDOWN SIDE LIST */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              Category Breakdown
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
              {categoryChartData.length} Sectors
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mb-3">Hover or tap items to highlight slice</p>

          {/* LIST OF CATEGORIES WITH TIMEFRAME SPENDS (FIT EXACTLY 5 ITEMS WITH SCROLL) */}
          <div className="space-y-2 max-h-[285px] overflow-y-auto pr-1.5 scrollbar-thin">
            {categoryChartData.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(activeIndex === idx ? null : idx);
                }}
                className={`category-list-item p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  activeIndex === idx
                    ? 'bg-slate-800 border-emerald-500/50 shadow-md'
                    : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="flex items-center gap-2 text-[10px] mt-0.5 font-mono">
                      <span className="text-emerald-400 font-medium">+₹{item.income}</span>
                      <span className="text-rose-400 font-medium">-₹{item.expense}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-extrabold text-white font-mono">
                    {formatCurrency(item.expense)}
                  </div>
                  <div className="text-[9px] text-slate-400">Expense</div>
                </div>
              </div>
            ))}
            {categoryChartData.length === 0 && (
              <p className="text-[11px] text-slate-500 text-center py-6">No category data in range.</p>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 mt-3 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between flex-shrink-0">
          <span>Active Category:</span>
          <span className="text-emerald-400 font-bold">
            {activeSlice ? activeSlice.name : 'None (Hover/Tap slice)'}
          </span>
        </div>
      </div>

    </div>
  );
}
