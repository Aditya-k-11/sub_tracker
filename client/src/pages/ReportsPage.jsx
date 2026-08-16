import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { exportSubscriptions } from '../services/exportService';
import { Download, FileText, PieChart } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

const ReportsPage = () => {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleExport = async (format) => {
    setMessage({ text: '', type: '' });
    if (format === 'csv') setIsExportingCsv(true);
    else setIsExportingPdf(true);

    try {
      await exportSubscriptions(format);
      setMessage({ text: `Successfully exported as ${format.toUpperCase()}`, type: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ text: `Failed to export ${format.toUpperCase()}`, type: 'error' });
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

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 shadow-primary/5 shadow-xl rounded-2xl p-6 flex flex-col transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-primary/20 rounded-lg">
              <FileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text">CSV Export</h2>
              <p className="text-sm text-brand-text-muted">Raw data for spreadsheets</p>
            </div>
          </div>
          <p className="text-brand-text/70 mb-6 flex-grow">
            Export all your subscriptions (both active and cancelled) in a flat, comma-separated format. Perfect for importing into Excel, Google Sheets, or personal finance software.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleExport('csv')}
            loading={isExportingCsv}
          >
            <Download className="w-5 h-5 mr-2" />
            Download CSV
          </Button>
        </motion.div>

        {/* PDF Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 shadow-primary/5 shadow-xl rounded-2xl p-6 flex flex-col transition-all"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-brand-secondary/20 rounded-lg">
              <PieChart className="w-6 h-6 text-brand-secondary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text">PDF Report</h2>
              <p className="text-sm text-brand-text-muted">Formatted document</p>
            </div>
          </div>
          <p className="text-brand-text/70 mb-6 flex-grow">
            Generate a clean, printable PDF document containing a summary of your spending and a complete list of all your tracked subscriptions.
          </p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleExport('pdf')}
            loading={isExportingPdf}
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </Button>
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
