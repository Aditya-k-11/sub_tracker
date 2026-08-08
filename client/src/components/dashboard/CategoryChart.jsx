import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

const CHART_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#eff6ff'];

const CategoryChart = ({ categories }) => {
  const { user } = useAuth();
  
  if (!categories || categories.length === 0) {
    return (
      <motion.div whileHover={{ y: -4 }} className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 p-6 border border-white/40 h-full flex flex-col items-center justify-center">
        <EmptyState title="No categories yet" message="Add subscriptions to see a breakdown" />
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 p-6 border border-white/40 h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-6 font-medium">Spend by Category</h3>
      
      <div className="h-48 sm:h-56 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="monthlySpend"
              nameKey="category"
              stroke="none"
            >
              {categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => formatCurrency(value, user?.currency)}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-auto overflow-y-auto pr-2">
        {categories.map((cat, idx) => (
          <div key={cat.category} className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
              <span className="text-gray-700 font-medium">{cat.category}</span>
              <span className="text-xs text-gray-400">({cat.subscriptionCount})</span>
            </div>
            <span className="font-semibold text-gray-900">{formatCurrency(cat.monthlySpend, user?.currency)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(CategoryChart);
