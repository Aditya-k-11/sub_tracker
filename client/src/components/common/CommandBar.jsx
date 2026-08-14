import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, LayoutDashboard, Settings, List } from 'lucide-react';
import { useCommandBar } from '../../context/CommandBarContext';
import { getSubscriptions } from '../../services/subscriptionService';
import { formatCurrency } from '../../utils/formatters';

const FIXED_ACTIONS = [
  { id: 'action-add', title: 'Add Subscription', type: 'action', icon: <Plus className="h-5 w-5" />, action: (navigate) => navigate('/subscriptions?openAdd=true') },
  { id: 'action-dashboard', title: 'Go to Dashboard', type: 'action', icon: <LayoutDashboard className="h-5 w-5" />, action: (navigate) => navigate('/') },
  { id: 'action-subscriptions', title: 'Go to Subscriptions', type: 'action', icon: <List className="h-5 w-5" />, action: (navigate) => navigate('/subscriptions') },
  { id: 'action-settings', title: 'Go to Settings', type: 'action', icon: <Settings className="h-5 w-5" />, action: (navigate) => navigate('/settings') },
];

const CommandBar = () => {
  const { isOpen, close } = useCommandBar();
  const [query, setQuery] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setHighlightedIndex(0);
      // Fetch subscriptions only if not already loaded in local state
      if (subscriptions.length === 0) {
        getSubscriptions()
          .then(data => {
            // Data might be paginated or an array depending on implementation
            const subs = Array.isArray(data) ? data : data.subscriptions || [];
            setSubscriptions(subs);
          })
          .catch(err => console.error("Failed to fetch subscriptions for command bar:", err));
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, subscriptions.length]);

  const filteredSubs = subscriptions
    .filter(sub => sub.name.toLowerCase().includes(query.toLowerCase()))
    .map(sub => ({
      id: `sub-${sub._id}`,
      title: sub.name,
      subtitle: `${sub.category} • ${formatCurrency(sub.cost, sub.currency)}/${sub.billingCycle}`,
      type: 'subscription',
      action: (nav) => nav(`/subscriptions?highlight=${sub._id}`)
    }));

  const filteredActions = FIXED_ACTIONS.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  const results = [...filteredSubs, ...filteredActions];

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[highlightedIndex]) {
        results[highlightedIndex].action(navigate);
        close();
      }
    }
  };

  const handleSelect = (result) => {
    result.action(navigate);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#1A1E29]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-white/10">
              <Search className="h-6 w-6 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search subscriptions or commands..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 py-5 px-4 focus:outline-none focus:ring-0 text-lg"
              />
              <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-400 font-mono">
                ESC
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((result, idx) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center text-left px-4 py-3 rounded-xl transition-colors ${
                      idx === highlightedIndex ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {result.type === 'action' ? (
                      <div className={`p-2 rounded-lg mr-4 ${idx === highlightedIndex ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-400'}`}>
                        {result.icon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-indigo-400 font-bold mr-4 text-lg">
                        {result.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      {result.subtitle && <span className="text-sm text-gray-400">{result.subtitle}</span>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-white/50">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandBar;
