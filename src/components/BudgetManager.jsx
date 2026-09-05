import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Tag
} from 'lucide-react';
import { formatCurrency } from '../lib/storage';

const COLOR_PALETTE = [
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#ef4444', label: 'Rose' },
  { hex: '#3b82f6', label: 'Blue' }
];

export default function BudgetManager({
  categories,
  transactions,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateCategoryLimit
}) {
  // Track responsive screen size (Laptop: 9 cards/page | Mobile: 3 cards/page)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  // Exactly 9 cards per page on Laptop/Desktop, 3 cards per page on Mobile
  const itemsPerPage = isMobile ? 3 : 9;
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

  // Ensure valid page number
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const currentCategories = categories.slice(startIndex, startIndex + itemsPerPage);

  // Cool-down ref for smooth 1-scroll page flips
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Wheel scroll flips 1 full page (all 9 cards at once)
  const handleScrollWheel = (e) => {
    if (totalPages <= 1) return;
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 350) return;

    if (e.deltaY > 15 && validPage < totalPages) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
      lastScrollTimeRef.current = now;
    } else if (e.deltaY < -15 && validPage > 1) {
      setCurrentPage(prev => Math.max(prev - 1, 1));
      lastScrollTimeRef.current = now;
    }
  };

  // Touch swipe flips 1 full page on mobile
  const handleTouchStart = (e) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (totalPages <= 1) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;

    if (diff > 40 && validPage < totalPages) { // Swiped up -> Next page
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    } else if (diff < -40 && validPage > 1) { // Swiped down -> Prev page
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }
  };

  // Modal State for Adding or Editing Category
  const [modalMode, setModalMode] = useState(null); // null | 'add' | 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form Fields
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  // Delete Confirmation Modal State
  const [deletingCategory, setDeletingCategory] = useState(null);

  const openAddModal = () => {
    setName('');
    setColor('#10b981');
    setMonthlyLimit('5000');
    setEditingCategory(null);
    setModalMode('add');
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || '#10b981');
    setMonthlyLimit(String(cat.monthlyLimit || 5000));
    setModalMode('edit');
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const limitNum = Number(monthlyLimit) || 0;

    if (modalMode === 'add') {
      if (typeof onAddCategory === 'function') {
        onAddCategory({
          name: name.trim(),
          color,
          monthlyLimit: limitNum
        });
      }
    } else if (modalMode === 'edit' && editingCategory) {
      if (typeof onEditCategory === 'function') {
        onEditCategory(editingCategory.id, {
          name: name.trim(),
          color,
          monthlyLimit: limitNum
        });
      } else if (typeof onUpdateCategoryLimit === 'function') {
        onUpdateCategoryLimit(editingCategory.id, limitNum);
      }
    }

    setModalMode(null);
    setEditingCategory(null);
  };

  const confirmDeleteCategory = () => {
    if (deletingCategory && typeof onDeleteCategory === 'function') {
      onDeleteCategory(deletingCategory.id);
    }
    setDeletingCategory(null);
  };

  return (
    <div className="glass-panel p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 animate-fadeIn flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-row items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-800/80 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Category Budget Controls
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Set, customize, and monitor monthly spending caps per category
          </p>
        </div>

        {/* ADD CATEGORY BUTTON */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition-all active:scale-98 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* GRID CARDS VIEW LAYOUT (Fixed skeleton cards, 9 cards on laptop, 3 cards on mobile) */}
      <div 
        onWheel={handleScrollWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 flex-1 min-h-0 items-start overflow-hidden py-0.5"
      >
        {currentCategories.map((cat) => {
          const spent = transactions
            .filter(t => t.type === 'expense' && t.category === cat.name)
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

          const limit = cat.monthlyLimit || 0;
          const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
          const isOver = limit > 0 && spent > limit;
          const isWarning = limit > 0 && pct >= 80 && !isOver;

          return (
            <div
              key={cat.id}
              className="glass-card p-2.5 sm:p-3.5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between h-[112px] sm:h-[124px] group hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color || '#10b981' }}
                    ></div>
                    <span className="text-xs font-bold text-slate-100 truncate">{cat.name}</span>
                  </div>

                  {isOver ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex-shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5" /> Over Budget
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5" /> 80%+ Used
                    </span>
                  ) : limit > 0 ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Healthy
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-mono">No Cap</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-extrabold text-white font-mono">
                    {formatCurrency(spent)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Limit: {formatCurrency(limit)}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-2 p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[10px] text-slate-400 font-medium">
                  {limit > 0 ? `${pct}% utilized` : 'Uncapped'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingCategory(cat)}
                    className="p-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No categories available. Click "Add Category" above to create one.
          </div>
        )}
      </div>

      {/* PAGINATION DOTS NAVIGATION (Clean dots only) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2.5 mt-2 border-t border-slate-800/60 flex-shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`h-2 rounded-full transition-all duration-300 ${
                validPage === i + 1
                  ? 'w-6 bg-emerald-400 shadow-sm shadow-emerald-500/50'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* GLASSMOPHIC ADD / EDIT CATEGORY MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-700/80 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {modalMode === 'add' ? 'Add New Category' : `Edit Category: ${editingCategory?.name}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shopping, Utilities, Medical"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Monthly Budget Limit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-emerald-400 font-mono font-extrabold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                  Category Theme Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        color === c.hex ? 'ring-2 ring-emerald-400 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {color === c.hex && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-950/80"
                >
                  {modalMode === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* GLASSMOPHIC DELETE CONFIRMATION DIALOG */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-rose-500/30 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Category?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-bold">"{deletingCategory.name}"</span>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold text-xs border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-950"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
