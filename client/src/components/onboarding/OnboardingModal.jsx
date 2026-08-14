import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { completeOnboarding } from '../../services/userService';
import { PlusCircle, Mail, ArrowRight, Sparkles } from 'lucide-react';

const OnboardingModal = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chosenPath, setChosenPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async (path) => {
    setLoading(true);
    try {
      await completeOnboarding();
      onComplete(); // update parent state
      if (path === 'manual') {
        navigate('/subscriptions?openAdd=true');
      } else if (path === 'email') {
        navigate('/settings');
      }
      // if skip, stay on dashboard
    } catch (error) {
      console.error('Failed to complete onboarding', error);
      // Even if it fails, close it for now so they aren't stuck
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark blurry backdrop */}
      <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-xl"></div>
      
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl bg-brand-surface/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[400px]"
      >
        <div className="absolute top-4 right-6 z-10">
          <button 
            onClick={() => handleComplete('skip')}
            className="text-sm font-medium text-white/50 hover:text-white transition-colors py-2"
          >
            Skip for now
          </button>
        </div>

        <div className="flex-1 p-8 sm:p-12 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div 
                key="step0"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center w-full"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Welcome to SubTrack</h2>
                <p className="text-lg text-white/70 max-w-lg mx-auto mb-8">
                  Never pay for an unused subscription again. Track your recurring expenses, catch unexpected price hikes, and get notified before your free trials end.
                </p>
                <Button variant="primary" size="lg" onClick={nextStep}>
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div 
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-8">How would you like to get started?</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button 
                    onClick={() => { setChosenPath('manual'); nextStep(); }}
                    className="group flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-2xl transition-all text-left w-full"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">Add Manually</h3>
                    <p className="text-sm text-white/60 text-center">
                      I'll enter my subscriptions one by one myself.
                    </p>
                  </button>

                  <button 
                    onClick={() => { setChosenPath('email'); nextStep(); }}
                    className="group flex flex-col items-center p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-2xl transition-all text-left w-full"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">Auto-Scan Email</h3>
                    <p className="text-sm text-white/60 text-center">
                      Connect Gmail/Outlook to find them automatically.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center w-full"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">You're all set!</h2>
                <p className="text-lg text-white/70 max-w-sm mx-auto mb-8">
                  {chosenPath === 'manual' 
                    ? "Great — let's add your first subscription now." 
                    : "Great — let's connect your email to scan for subscriptions."}
                </p>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => handleComplete(chosenPath)}
                  disabled={loading}
                >
                  {loading ? 'Completing...' : 'Continue'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center pb-8 gap-2">
          {[0, 1, 2].map((step) => (
            <div 
              key={step} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === step ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/20'}`}
            ></div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
