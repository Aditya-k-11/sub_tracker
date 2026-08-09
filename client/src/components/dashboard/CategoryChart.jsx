import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

const CHART_COLORS = ['#e64f0b', '#f76c2e', '#f9d2be', '#fa82fa', '#d750d7', '#fbc5fb'];

const CategoryChart = ({ categories }) => {
  const { user } = useAuth();
  
  if (!categories || categories.length === 0) {
    return (
      <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 h-full flex flex-col items-center justify-center">
        <EmptyState title="No categories yet" message="Add subscriptions to see a breakdown" />
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-6 font-medium">Spend by Category</h3>
      
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
              contentStyle={{ backgroundColor: '#1c011a', color: '#fed8fb', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-auto overflow-y-auto pr-2">
        {categories.map((cat, idx) => (
          <div key={cat.category} className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
              <span className="text-brand-text/90 font-medium">{cat.category}</span>
              <span className="text-xs text-brand-text/50">({cat.subscriptionCount})</span>
            </div>
            <span className="font-semibold text-brand-text">{formatCurrency(cat.monthlySpend, user?.currency)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(CategoryChart);
