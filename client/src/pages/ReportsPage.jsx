import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { exportSubscriptions } from '../services/exportService';
import { useToast } from '../context/ToastContext';
import { FiDownload, FiFileText, FiPieChart } from 'react-icons/fi';
import Spinner from '../components/common/Spinner';

const ReportsPage = () => {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { showToast } = useToast();

  const handleExport = async (format) => {
    if (format === 'csv') setIsExportingCsv(true);
    else setIsExportingPdf(true);

    try {
      await exportSubscriptions(format);
      showToast(`Successfully exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast(`Failed to export ${format.toUpperCase()}`, 'error');
    } finally {
      if (format === 'csv') setIsExportingCsv(false);
      else setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
          Reports & Exports
        </h1>
        <p className="text-brand-text-muted mt-2">
          Download your subscription data for budgeting, tax records, or offline analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-bg/90 to-brand-bg/50 backdrop-blur-xl border border-brand-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-primary/20 rounded-lg">
              <FiFileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text">CSV Export</h2>
              <p className="text-sm text-brand-text-muted">Raw data for spreadsheets</p>
            </div>
          </div>
          <p className="text-brand-text-muted mb-6">
            Export all your subscriptions (both active and cancelled) in a flat, comma-separated format. Perfect for importing into Excel, Google Sheets, or personal finance software.
          </p>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExportingCsv}
            className="w-full py-3 px-4 bg-brand-bg border border-brand-primary/30 rounded-xl text-brand-primary hover:bg-brand-primary/10 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
          >
            {isExportingCsv ? <Spinner size="sm" className="mr-2" /> : <FiDownload className="mr-2" />}
            {isExportingCsv ? 'Generating CSV...' : 'Download CSV'}
          </button>
        </motion.div>

        {/* PDF Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-brand-bg/90 to-brand-bg/50 backdrop-blur-xl border border-brand-primary/20 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-secondary/20 rounded-lg">
              <FiPieChart className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text">PDF Report</h2>
              <p className="text-sm text-brand-text-muted">Formatted document</p>
            </div>
          </div>
          <p className="text-brand-text-muted mb-6">
            Generate a clean, printable PDF document containing a summary of your spending and a complete list of all your tracked subscriptions.
          </p>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExportingPdf}
            className="w-full py-3 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center font-medium shadow-lg shadow-brand-primary/20"
          >
            {isExportingPdf ? <Spinner size="sm" className="mr-2" color="white" /> : <FiDownload className="mr-2" />}
            {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </motion.div>
      </div>
      
      {/* Future Insights Section Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 border border-brand-primary/10 rounded-2xl bg-brand-bg/30 text-center"
      >
        <p className="text-brand-text-muted italic">
          More advanced reporting and insights will be available here in the future.
        </p>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
