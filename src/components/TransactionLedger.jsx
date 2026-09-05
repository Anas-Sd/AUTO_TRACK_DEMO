import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit3,
  Download,
  Tag,
  Calendar,
  Filter,
  X,
  ArrowUpDown,
  RotateCcw,
  ChevronDown,
  Check
} from 'lucide-react';
import { formatCurrency } from '../lib/storage';

// Custom Glassmorphic Select Component to prevent OS native select bounds overflow
function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {label && (
        <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl px-3 py-2 text-xs text-left text-slate-200 flex items-center justify-between gap-2 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
      >
        <span className="truncate font-medium">{selectedOption ? selectedOption.label : value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d1322] border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto scrollbar-thin p-1 animate-fadeIn">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                opt.value === value
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TransactionLedger({ transactions, categories, onDeleteTransaction, onEditTransaction }) {
  // Toggle Drawer States
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [timeframe, setTimeframe] = useState('all'); // 'all' | 'today' | 'this_month' | 'custom' | 'specific_month'
  const [selectedMonth, setSelectedMonth] = useState(''); // 'YYYY-MM'
  
  // Custom Date Range State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sort State
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Refs for Date Pickers
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const openStartDatePicker = () => {
    if (startDateRef.current) {
      if (typeof startDateRef.current.showPicker === 'function') {
        startDateRef.current.showPicker();
      } else {
        startDateRef.current.focus();
      }
    }
  };

  const openEndDatePicker = () => {
    if (endDateRef.current) {
      if (typeof endDateRef.current.showPicker === 'function') {
        endDateRef.current.showPicker();
      } else {
        endDateRef.current.focus();
      }
    }
  };

  // Dynamically extract unique payment sources / apps from existing transactions
  const uniqueSources = useMemo(() => {
    const sourcesSet = new Set();
    transactions.forEach(t => {
      if (t.paidFrom) sourcesSet.add(t.paidFrom);
      if (t.paymentApp) sourcesSet.add(t.paymentApp);
    });
    return Array.from(sourcesSet).sort();
  }, [transactions]);

  // Dynamically extract unique months available in transactions (YYYY-MM format)
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthSet.add(t.date.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'ALL') count++;
    if (selectedType !== 'ALL') count++;
    if (selectedSource !== 'ALL') count++;
    if (timeframe !== 'all') count++;
    return count;
  }, [selectedCategory, selectedType, selectedSource, timeframe]);

  // Options formatting for CustomSelect
  const categoryOptions = useMemo(() => [
    { value: 'ALL', label: 'All Categories' },
    ...categories.map(c => ({ value: c.name, label: c.name }))
  ], [categories]);

  const typeOptions = [
    { value: 'ALL', label: 'All Types (Income & Expenses)' },
    { value: 'expense', label: 'Expenses Only (-₹)' },
    { value: 'income', label: 'Income Only (+₹)' }
  ];

  const sourceOptions = useMemo(() => [
    { value: 'ALL', label: 'All Sources & Apps' },
    ...uniqueSources.map(s => ({ value: s, label: s }))
  ], [uniqueSources]);

  const monthOptions = useMemo(() => [
    { value: '', label: 'Select Month' },
    ...availableMonths.map(m => ({ value: m, label: m }))
  ], [availableMonths]);

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthKey = todayStr.slice(0, 7);

    let result = transactions.filter(t => {
      // 1. Search Query Filter
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        (t.notes && t.notes.toLowerCase().includes(query)) ||
        (t.paidTo && t.paidTo.toLowerCase().includes(query)) ||
        (t.paidFrom && t.paidFrom.toLowerCase().includes(query)) ||
        (t.paymentApp && t.paymentApp.toLowerCase().includes(query)) ||
        t.category.toLowerCase().includes(query) ||
        String(t.amount).includes(query);

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

      // 3. Type Filter (income / expense)
      const matchesType = selectedType === 'ALL' || t.type === selectedType;

      // 4. Source / Payment App Filter
      const matchesSource =
        selectedSource === 'ALL' ||
        t.paidFrom === selectedSource ||
        t.paymentApp === selectedSource;

      // 5. Timeframe / Date Range Filter
      let matchesTimeframe = true;
      if (timeframe === 'today') {
        matchesTimeframe = t.date === todayStr;
      } else if (timeframe === 'this_month') {
        matchesTimeframe = t.date.startsWith(currentMonthKey);
      } else if (timeframe === 'specific_month' && selectedMonth) {
        matchesTimeframe = t.date.startsWith(selectedMonth);
      } else if (timeframe === 'custom') {
        if (startDate && endDate) {
          matchesTimeframe = t.date >= startDate && t.date <= endDate;
        } else if (startDate) {
          matchesTimeframe = t.date >= startDate;
        } else if (endDate) {
          matchesTimeframe = t.date <= endDate;
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesSource && matchesTimeframe;
    });

    // 6. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0);
      return 0;
    });

    return result;
  }, [
    transactions,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedSource,
    timeframe,
    selectedMonth,
    startDate,
    endDate,
    sortBy
  ]);

  // Analytics summary for current filtered set
  const filteredSummary = useMemo(() => {
    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      count: filtered.length,
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense
    };
  }, [filtered]);

  // Reset all filters back to default & close dropdown panel
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedSource('ALL');
    setTimeframe('all');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setShowFilterPanel(false);
  };

  // Export CSV (Exports currently filtered & sorted dataset)
  const handleExportCSV = () => {
    const isFiltered = activeFilterCount > 0 || searchTerm.trim() !== '';
    const headers = ['ID', 'Date', 'Title', 'Type', 'Amount (INR)', 'Category', 'Paid From', 'Paid To', 'Payment App', 'Notes'];
    const rows = filtered.map(t => [
      t.id,
      t.date,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.paidFrom || '').replace(/"/g, '""')}"`,
      `"${(t.paidTo || '').replace(/"/g, '""')}"`,
      `"${(t.paymentApp || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filePrefix = isFiltered ? 'SpendPulse_Filtered_Ledger' : 'SpendPulse_Full_Ledger';
    link.setAttribute('download', `${filePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortLabel = () => {
    if (sortBy === 'date-desc') return 'Newest';
    if (sortBy === 'date-asc') return 'Oldest';
    if (sortBy === 'amount-desc') return 'Highest $';
    if (sortBy === 'amount-asc') return 'Lowest $';
    return 'Sort';
  };

  return (
    <div className="glass-panel p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 animate-fadeIn flex-1 min-h-0 flex flex-col overflow-hidden">
      
      {/* HEADER TITLE & TOP ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Complete log of auto-captured & manual transactions
          </p>
        </div>

        {/* ACTION ROW: SEARCH & ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          
          {/* EXPANDED FULL-WIDTH SEARCH INPUT */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, note, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-7 py-2 sm:py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* ACTION BUTTONS: FILTER, SORT, EXPORT CSV (RESPONSIVE EQUAL GRID ON MOBILE) */}
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
            
            {/* FILTER TRIGGER BUTTON */}
            <button
              onClick={() => {
                setShowFilterPanel(prev => !prev);
                setShowSortPanel(false);
              }}
              className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all min-w-0 ${
                showFilterPanel || activeFilterCount > 0
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* SORT TRIGGER BUTTON */}
            <button
              onClick={() => {
                setShowSortPanel(prev => !prev);
                setShowFilterPanel(false);
              }}
              className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all min-w-0 ${
                showSortPanel || sortBy !== 'date-desc'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{getSortLabel()}</span>
              <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${showSortPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* DYNAMIC FILTERED/FULL EXPORT CSV BUTTON */}
            <button
              onClick={handleExportCSV}
              className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all min-w-0 ${
                activeFilterCount > 0 || searchTerm.trim() !== ''
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title={
                activeFilterCount > 0 || searchTerm.trim() !== ''
                  ? `Download ${filtered.length} filtered and sorted records`
                  : `Download all ${filtered.length} records`
              }
            >
              <Download className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {activeFilterCount > 0 || searchTerm.trim() !== '' ? 'CSV' : 'Export'}
              </span>
            </button>

          </div>

        </div>
      </div>

      {/* EXPANDABLE FILTER PANEL (Renders ONLY when showFilterPanel === true) */}
      {showFilterPanel && (
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 mb-4 space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Filter Transactions</span>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[10px] text-rose-400 font-bold hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* CUSTOM GLASSMOPHIC SELECTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* 1. CATEGORY FILTER */}
            <CustomSelect
              label="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
            />

            {/* 2. TRANSACTION TYPE FILTER */}
            <CustomSelect
              label="Transaction Type"
              value={selectedType}
              onChange={setSelectedType}
              options={typeOptions}
            />

            {/* 3. PAYMENT SOURCE FILTER */}
            <CustomSelect
              label="Source / Account"
              value={selectedSource}
              onChange={setSelectedSource}
              options={sourceOptions}
            />

          </div>

          {/* TIMEFRAME & DATE RANGE FILTER SELECTION */}
          <div className="pt-2.5 border-t border-slate-900 space-y-2.5">
            <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Timeframe & Date Range
            </label>

            <div className="flex flex-col space-y-2.5">
              
              {/* TIMEFRAME CHIP BUTTONS GRID */}
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTimeframe('all')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    timeframe === 'all' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setTimeframe('today')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    timeframe === 'today' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeframe('this_month')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    timeframe === 'this_month' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeframe('specific_month')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    timeframe === 'specific_month' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  By Month
                </button>
                <button
                  onClick={() => setTimeframe('custom')}
                  className={`col-span-2 sm:col-span-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    timeframe === 'custom' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {/* DYNAMIC DATE INPUT CONTROLS */}
              {timeframe === 'specific_month' && (
                <div className="w-full">
                  <CustomSelect
                    label="Select Month"
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    options={monthOptions}
                  />
                </div>
              )}

              {timeframe === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  <div
                    onClick={openStartDatePicker}
                    className="flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 px-3 py-2 rounded-xl border border-slate-800 text-xs cursor-pointer transition-all hover:border-emerald-500/50"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">From Date:</span>
                    </div>
                    <input
                      ref={startDateRef}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer text-right min-w-0"
                    />
                  </div>

                  <div
                    onClick={openEndDatePicker}
                    className="flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 px-3 py-2 rounded-xl border border-slate-800 text-xs cursor-pointer transition-all hover:border-emerald-500/50"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">To Date:</span>
                    </div>
                    <input
                      ref={endDateRef}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer text-right min-w-0"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* EXPANDABLE SORT PANEL (Renders ONLY when showSortPanel === true) */}
      {showSortPanel && (
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30 mb-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-900">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sort Transactions</span>
          </div>

          {/* SORT OPTIONS GRID CHIPS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            <button
              onClick={() => { setSortBy('date-desc'); setShowSortPanel(false); }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                sortBy === 'date-desc'
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <span>Newest First (Date ↓)</span>
              {sortBy === 'date-desc' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => { setSortBy('date-asc'); setShowSortPanel(false); }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                sortBy === 'date-asc'
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <span>Oldest First (Date ↑)</span>
              {sortBy === 'date-asc' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => { setSortBy('amount-desc'); setShowSortPanel(false); }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                sortBy === 'amount-desc'
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <span>Highest Amount ($ ↓)</span>
              {sortBy === 'amount-desc' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => { setSortBy('amount-asc'); setShowSortPanel(false); }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                sortBy === 'amount-asc'
                  ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <span>Lowest Amount ($ ↑)</span>
              {sortBy === 'amount-asc' && <Check className="w-3.5 h-3.5" />}
            </button>

          </div>
        </div>
      )}

      {/* FILTERED SUMMARY BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
            {filteredSummary.count} Items
          </span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] text-slate-400 italic">
              ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-emerald-400 font-bold">
            +{formatCurrency(filteredSummary.income)}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-rose-400 font-bold">
            -{formatCurrency(filteredSummary.expense)}
          </span>
        </div>
      </div>

      {/* MOBILE LIST CARD VIEW (Shown on mobile screens < 640px) */}
      <div className="block sm:hidden space-y-2.5 flex-1 min-h-0 overflow-y-auto pr-1 scrollbar-thin">
        {filtered.map((t) => {
          const isIncome = t.type === 'income';
          return (
            <div key={t.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2.5 hover:border-slate-700 transition-colors">
              
              {/* Icon & Details */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isIncome
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs truncate">{t.title}</span>
                    {t.paymentApp && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400 border border-slate-700/50 flex-shrink-0">
                        {t.paymentApp}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-medium truncate">{t.category}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400 flex-shrink-0">{t.date}</span>
                  </div>
                  {(t.paidFrom || t.notes) && (
                    <div className="text-[9px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                      {t.paidFrom && <span>Via: {t.paidFrom}</span>}
                      {t.notes && <span>• {t.notes}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount & Quick Actions */}
              <div className="text-right flex-shrink-0 flex flex-col items-end justify-between gap-1">
                <div className={`font-extrabold text-xs font-mono ${
                  isIncome ? 'text-emerald-400' : 'text-slate-100'
                }`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTransaction(t)}
                    title="Edit"
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    title="Delete"
                    className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No matching transactions found with current filters.
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Shown on screens >= 640px) */}
      <div className="hidden sm:block flex-1 min-h-0 overflow-y-auto overflow-x-auto scrollbar-thin pr-1.5">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#090d16]/95 backdrop-blur-md z-10">
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pt-1 px-2 bg-[#090d16]/95">Transaction / Note</th>
              <th className="pb-3 pt-1 px-2 bg-[#090d16]/95">Category</th>
              <th className="pb-3 pt-1 px-2 bg-[#090d16]/95">Source / App</th>
              <th className="pb-3 pt-1 px-2 bg-[#090d16]/95">Date</th>
              <th className="pb-3 pt-1 px-2 text-right bg-[#090d16]/95">Amount</th>
              <th className="pb-3 pt-1 px-2 text-right bg-[#090d16]/95">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((t) => {
              const isIncome = t.type === 'income';
              return (
                <tr key={t.id} className="hover:bg-slate-900/40 transition-colors group">
                  
                  {/* Title & Notes */}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5 text-xs">
                          <span>{t.title}</span>
                          {t.paymentApp && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700/50">
                              {t.paymentApp}
                            </span>
                          )}
                        </div>
                        {t.notes && <div className="text-[11px] text-slate-400">{t.notes}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-[11px]">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      {t.category}
                    </span>
                  </td>

                  {/* Payment Source */}
                  <td className="py-3 px-2 text-slate-400 text-xs">
                    <div>{t.paidFrom || 'UPI'}</div>
                    {t.paidTo && <div className="text-[10px] text-slate-500">To: {t.paidTo}</div>}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-2 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {t.date}
                  </td>

                  {/* Amount */}
                  <td className={`py-3 px-2 text-right font-extrabold text-sm whitespace-nowrap font-mono ${
                    isIncome ? 'text-emerald-400' : 'text-slate-100'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditTransaction(t)}
                        title="Edit Transaction"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        title="Delete Transaction"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                  No matching transactions found with current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
