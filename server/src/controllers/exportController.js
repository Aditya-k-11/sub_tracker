import { getExportableSubscriptionData, generateCSV, generatePDF } from '../services/exportService.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import ActivityLog from '../models/ActivityLog.js';

export const exportSubscriptions = catchAsync(async (req, res, next) => {
  const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
  
  const user = await User.findById(req.user.id);
  const exportData = await getExportableSubscriptionData(req.user.id);
  
  const dateStr = new Date().toISOString().split('T')[0];

  if (format === 'pdf') {
    const pdfBuffer = await generatePDF(exportData, user);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="subtrack-export-${dateStr}.pdf"`);
    res.send(pdfBuffer);
  } else {
    const csvString = generateCSV(exportData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="subtrack-export-${dateStr}.csv"`);
    res.send(csvString);
  }

  // Log activity
  await ActivityLog.create({
    userId: req.user.id,
    action: 'data_exported',
    details: `Exported subscriptions as ${format.toUpperCase()}`,
    metadata: { format }
  });
});
