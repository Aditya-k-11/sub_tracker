import React, { useState, useEffect } from 'react';
import { getSpendSummary, getCategoryBreakdown, getSpendTrend, getWastedSpend, getNotifications } from '../services/analyticsService';
import { logUsage } from '../services/subscriptionService';
import SummaryCards from '../components/dashboard/SummaryCards';
import CategoryChart from '../components/dashboard/CategoryChart';
import TrendChart from '../components/dashboard/TrendChart';
import WastedSpendPanel from '../components/dashboard/WastedSpendPanel';
import RenewalCalendarPanel from '../components/dashboard/RenewalCalendarPanel';
import Toast from '../components/common/Toast';

const DashboardPage = () => {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });
  const dismissToast = () => setToast(null);

  const [data, setData] = useState({
    summary: null,
    categories: [],
    trend: [],
    wasted: { flaggedSubscriptions: [], potentialMonthlySavings: 0 },
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingUsage, setSubmittingUsage] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, categoriesData, trendData, wastedData, notificationsData] = await Promise.all([
        getSpendSummary(),
        getCategoryBreakdown(),
        getSpendTrend(),
        getWastedSpend(),
        getNotifications(false) // fetch all for the dashboard panel
      ]);
      
      setData({
        summary: summaryData,
        categories: categoriesData.categories,
        trend: trendData.trend,
        wasted: wastedData,
        notifications: notificationsData.notifications || notificationsData // AppLayout expects an array directly from the updated getNotifications
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUsageLogged = async (subscriptionId, note) => {
    setSubmittingUsage(true);
    try {
      await logUsage(subscriptionId, note);
      
      // Fetch fresh wasted spend and summary (in case usage affected costPerUse or triggered snapshots)
      const [wastedData, summaryData] = await Promise.all([
        getWastedSpend(),
        getSpendSummary()
      ]);
      
      setData(prev => ({ 
        ...prev, 
        wasted: wastedData,
        summary: summaryData
      }));
      showToast('Usage logged');
    } catch (err) {
      console.error('Failed to log usage from dashboard', err);
      showToast('Failed to log usage. Please try again.', 'error');
    } finally {
      setSubmittingUsage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-[140px] border border-gray-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl h-[400px] border border-gray-100 shadow-sm animate-pulse"></div>
          <div className="bg-white rounded-2xl h-[400px] border border-gray-100 shadow-sm animate-pulse"></div>
        </div>
        
        <div className="bg-white rounded-2xl h-[200px] border border-gray-100 shadow-sm animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center shadow-sm max-w-lg mx-auto">
          <p className="mb-6 font-medium">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden space-y-8 relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={dismissToast} 
        />
      )}
      
      <div className="animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
        <SummaryCards summary={data.summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="h-[400px]">
          <CategoryChart categories={data.categories} />
        </div>
        <div className="h-[400px]">
          <TrendChart trend={data.trend} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        <div>
          <WastedSpendPanel 
            flagged={data.wasted.flaggedSubscriptions} 
            potentialSavings={data.wasted.potentialMonthlySavings} 
            onUsageLogged={handleUsageLogged}
            submittingUsage={submittingUsage}
          />
        </div>
        <div>
          <RenewalCalendarPanel notifications={data.notifications} />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
