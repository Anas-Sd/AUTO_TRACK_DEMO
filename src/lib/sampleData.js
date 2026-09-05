export const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', monthlyLimit: 12000 },
  { id: 'cat-2', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', monthlyLimit: 8000 },
  { id: 'cat-3', name: 'Transport & Fuel', icon: 'Fuel', color: '#3b82f6', monthlyLimit: 5000 },
  { id: 'cat-4', name: 'Bills & Utilities', icon: 'Zap', color: '#8b5cf6', monthlyLimit: 6000 },
  { id: 'cat-5', name: 'Entertainment', icon: 'Tv', color: '#06b6d4', monthlyLimit: 4000 },
  { id: 'cat-6', name: 'Health & Medical', icon: 'HeartPulse', color: '#ef4444', monthlyLimit: 3000 },
  { id: 'cat-7', name: 'Salary & Income', icon: 'Wallet', color: '#10b981', monthlyLimit: 0 },
  { id: 'cat-8', name: 'Investments', icon: 'TrendingUp', color: '#10b981', monthlyLimit: 15000 },
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    title: 'Monthly Salary - Tech Corp',
    amount: 85000,
    type: 'income',
    category: 'Salary & Income',
    paidFrom: 'HDFC Bank',
    paidTo: 'Self',
    paymentApp: 'Bank Transfer',
    date: '2026-09-01',
    notes: 'September salary credit'
  },
  {
    id: 'tx-102',
    title: 'Starbucks Coffee & Snacks',
    amount: 450,
    type: 'expense',
    category: 'Food & Dining',
    paidFrom: 'HDFC Card',
    paidTo: 'Starbucks Ind',
    paymentApp: 'Google Pay',
    date: '2026-09-02',
    notes: 'Coffee with team'
  },
  {
    id: 'tx-103',
    title: 'Petrol Fill - Shell Station',
    amount: 1800,
    type: 'expense',
    category: 'Transport & Fuel',
    paidFrom: 'SBI Account',
    paidTo: 'Shell Fuel',
    paymentApp: 'PhonePe',
    date: '2026-09-02',
    notes: 'Car tank refill'
  },
  {
    id: 'tx-104',
    title: 'Amazon Shopping - Wireless Earbuds',
    amount: 3499,
    type: 'expense',
    category: 'Shopping',
    paidFrom: 'HDFC Card',
    paidTo: 'Amazon Pay',
    paymentApp: 'Amazon Pay',
    date: '2026-09-01',
    notes: 'Noise cancelling earbuds'
  },
  {
    id: 'tx-105',
    title: 'Electricity Bill - BESCOM',
    amount: 2150,
    type: 'expense',
    category: 'Bills & Utilities',
    paidFrom: 'HDFC Bank',
    paidTo: 'BESCOM',
    paymentApp: 'CRED',
    date: '2026-08-30',
    notes: 'August utility bill'
  },
  {
    id: 'tx-106',
    title: 'Dinner at Barbeque Nation',
    amount: 2400,
    type: 'expense',
    category: 'Food & Dining',
    paidFrom: 'SBI Account',
    paidTo: 'Barbeque Nation',
    paymentApp: 'Paytm',
    date: '2026-08-28',
    notes: 'Family dinner weekend'
  },
  {
    id: 'tx-107',
    title: 'SIP Mutual Fund Investment',
    amount: 10000,
    type: 'expense',
    category: 'Investments',
    paidFrom: 'HDFC Bank',
    paidTo: 'Zerodha Coin',
    paymentApp: 'UPI Direct',
    date: '2026-09-01',
    notes: 'Monthly Index Fund SIP'
  },
  {
    id: 'tx-108',
    title: 'Zomato Food Delivery',
    amount: 620,
    type: 'expense',
    category: 'Food & Dining',
    paidFrom: 'HDFC Card',
    paidTo: 'Zomato Ltd',
    paymentApp: 'Google Pay',
    date: '2026-09-03',
    notes: 'Late night dinner'
  }
];

export const INITIAL_SUBSCRIPTIONS = [
  { id: 'sub-1', name: 'Netflix Premium (4K)', cost: 649, billingCycle: 'monthly', nextBillingDate: '2026-09-15', category: 'Entertainment', provider: 'Netflix' },
  { id: 'sub-2', name: 'Spotify Individual', cost: 119, billingCycle: 'monthly', nextBillingDate: '2026-09-20', category: 'Entertainment', provider: 'Spotify' },
  { id: 'sub-3', name: 'Google One 100GB Storage', cost: 130, billingCycle: 'monthly', nextBillingDate: '2026-09-10', category: 'Bills & Utilities', provider: 'Google' },
  { id: 'sub-4', name: 'Cult.fit Gym Membership', cost: 12999, billingCycle: 'yearly', nextBillingDate: '2026-12-01', category: 'Health & Medical', provider: 'Cult.fit' },
];
