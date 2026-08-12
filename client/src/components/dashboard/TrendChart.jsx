import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

const formatShortCurrency = (value, currencyCode = 'INR') => {
  
  const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).formatToParts(0);
  const symbol = parts.find(p => p.type === 'currency')?.value || '$';
  
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}k`;
  }
  return `${symbol}${value}`;
};

const CustomTooltip = ({ active, payload, label, currencyCode }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-bg p-3 rounded-xl shadow-lg border border-white/10 min-w-[120px]">
        <p className="text-xs text-brand-text/70 mb-1 font-medium">{label}</p>
        <p className="text-lg font-bold text-brand-text tabular-nums">
          {formatCurrency(payload[0].value, currencyCode)}
        </p>
      </div>
    );
  }
  return null;
};

const TrendChart = ({ trend }) => {
  const { user } = useAuth();
  const currencyCode = user?.currency || 'INR';

  if (!trend || trend.length === 0) return null;

  let displayTrend = [...trend];
  if (displayTrend.length === 1) {
    const currentMonth = displayTrend[0].month;
    let [year, month] = currentMonth.split('-').map(Number);
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    const prevMonthStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    displayTrend = [
      { month: prevMonthStr, totalSpend: 0 },
      displayTrend[0]
    ];
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-6 font-medium">Monthly Trend</h3>
      
      <div className="flex-grow min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e64f0b" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#e64f0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'rgba(254, 216, 251, 0.7)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'rgba(254, 216, 251, 0.7)' }}
              tickFormatter={(val) => formatShortCurrency(val, currencyCode)}
            />
            <Tooltip 
              content={<CustomTooltip currencyCode={currencyCode} />} 
              isAnimationActive={false}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="totalSpend" 
              stroke="#e64f0b" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSpend)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f76c2e' }}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {trend.length === 1 && (
        <p className="text-xs text-brand-text/50 text-center mt-6">
          Trend builds up as more months of data are collected
        </p>
      )}
    </motion.div>
  );
};

export default React.memo(TrendChart);
