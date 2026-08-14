import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Layers, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogUsageModal from '../subscriptions/LogUsageModal';

const getInsightIcon = (type) => {
  switch (type) {
    case 'wasted_spend':
      return <AlertTriangle className="h-6 w-6 text-amber-500" />;
    case 'trial_ending':
      return <Clock className="h-6 w-6 text-blue-500" />;
    case 'high_category_spend':
      return <Layers className="h-6 w-6 text-purple-500" />;
    default:
      return <AlertTriangle className="h-6 w-6 text-gray-400" />;
  }
};

const InsightsPanel = ({ insights }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [usageTarget, setUsageTarget] = useState(null);
  const navigate = useNavigate();
  const pauseTimeoutRef = useRef(null);

  useEffect(() => {
    if (!insights || insights.length <= 1) return;

    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
      }, 7000); // 7 second rotation
      return () => clearInterval(timer);
    }
  }, [insights, isPaused]);

  const handleManualNavigation = (index) => {
    setCurrentIndex(index);
    pauseAutoRotation();
  };

  const handleNext = () => {
    if (!insights || insights.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % insights.length);
    pauseAutoRotation();
  };

  const handlePrev = () => {
    if (!insights || insights.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? insights.length - 1 : prev - 1));
    pauseAutoRotation();
  };

  const pauseAutoRotation = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    // Resume after 10 seconds of inactivity
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  };

  const handleAction = (insight) => {
    if (insight.actionType === 'log_usage') {
      setUsageTarget({ _id: insight.actionTarget, name: insight.title.replace("You're not using ", "") });
    } else if (insight.actionType === 'view_subscription') {
      navigate(`/subscriptions/${insight.actionTarget}`);
    } else if (insight.actionType === 'view_category') {
      navigate(`/categories/${encodeURIComponent(insight.actionTarget)}`);
    } else {
      console.log(`Action: ${insight.actionType} on target: ${insight.actionTarget}`);
    }
  };

  const handleUsageLogged = () => {
    setUsageTarget(null);
    // Ideally refetch insights here, but for now we'll just let the user see it update later
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-green-500/20 p-3 rounded-full">
            <XCircle className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">All good!</h3>
            <p className="text-gray-300">No new insights right now — everything looks good.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className="bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl mb-6 overflow-hidden relative group">
      {/* Subtle animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 opacity-50 animate-pulse pointer-events-none"></div>

      <div className="p-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between min-h-[140px]">
        <div className="flex-1 w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-white/5 p-3 rounded-2xl shadow-inner border border-white/10 shrink-0">
                {getInsightIcon(currentInsight.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{currentInsight.title}</h3>
                <p className="text-gray-300 mb-3">{currentInsight.description}</p>
                <button
                  onClick={() => handleAction(currentInsight)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium text-white shadow-sm border border-white/10"
                >
                  {currentInsight.actionLabel}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls */}
        {insights.length > 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handlePrev} className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={handleNext} className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      {insights.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleManualNavigation(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to insight ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {usageTarget && (
        <LogUsageModal
          subscription={usageTarget}
          onClose={() => setUsageTarget(null)}
          onSuccess={handleUsageLogged}
        />
      )}
    </div>
  );
};

export default InsightsPanel;
