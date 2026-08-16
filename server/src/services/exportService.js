import Subscription from '../models/Subscription.js';
import { getEffectiveMonthlyCost } from '../utils/effectiveCost.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

/**
 * Fetch and format subscription data for a given user.
 */
export const getExportableSubscriptionData = async (userId) => {
  const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

  let totalActiveMonthlySpend = 0;
  let activeCount = 0;
  let cancelledCount = 0;

  const formattedSubscriptions = subscriptions.map(sub => {
    // We use the effective monthly cost helper, passing the subscription's own cost
    // so we get the accurate native-currency cost (or we can assume it will be used as is)
    const effectiveMonthlyCost = getEffectiveMonthlyCost(sub);

    if (sub.status === 'active') {
      activeCount++;
      totalActiveMonthlySpend += effectiveMonthlyCost;
    } else if (sub.status === 'cancelled') {
      cancelledCount++;
    }

    return {
      name: sub.name,
      category: sub.category,
      cost: sub.cost,
      currency: sub.currency || 'USD',
      billingCycle: sub.billingCycle,
      effectiveMonthlyCost: Number(effectiveMonthlyCost.toFixed(2)),
      status: sub.status,
      sharedWithCount: sub.sharedWithCount || 1,
      nextRenewalDate: sub.nextRenewalDate ? sub.nextRenewalDate.toISOString().split('T')[0] : 'N/A',
      createdAt: sub.createdAt ? sub.createdAt.toISOString().split('T')[0] : 'N/A',
      cancelledAt: sub.cancelledAt ? sub.cancelledAt.toISOString().split('T')[0] : 'N/A',
      notes: sub.notes || ''
    };
  });

  return {
    subscriptions: formattedSubscriptions,
    summary: {
      totalActiveMonthlySpend: Number(totalActiveMonthlySpend.toFixed(2)),
      totalSubscriptionCount: subscriptions.length,
      activeCount,
      cancelledCount
    }
  };
};

/**
 * Generate CSV string from export data
 */
export const generateCSV = (exportData) => {
  const fields = [
    { label: 'Subscription Name', value: 'name' },
    { label: 'Category', value: 'category' },
    { label: 'Cost', value: 'cost' },
    { label: 'Currency', value: 'currency' },
    { label: 'Billing Cycle', value: 'billingCycle' },
    { label: 'Effective Monthly Cost', value: 'effectiveMonthlyCost' },
    { label: 'Status', value: 'status' },
    { label: 'Shared With (People)', value: 'sharedWithCount' },
    { label: 'Next Renewal Date', value: 'nextRenewalDate' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Cancelled At', value: 'cancelledAt' },
    { label: 'Notes', value: 'notes' }
  ];

  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(exportData.subscriptions);
};

/**
 * Generate PDF buffer from export data
 */
export const generatePDF = (exportData, userInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text('SubTrack — Subscription Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`User: ${userInfo.name} (${userInfo.email})`);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Summary
      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(12).text(`Total Active Monthly Spend: ${exportData.summary.totalActiveMonthlySpend}`);
      doc.text(`Total Subscriptions: ${exportData.summary.totalSubscriptionCount}`);
      doc.text(`Active: ${exportData.summary.activeCount} | Cancelled: ${exportData.summary.cancelledCount}`);
      doc.moveDown(2);

      // Subscriptions Table
      doc.fontSize(14).text('Subscription Details', { underline: true });
      doc.moveDown();

      // We do a simple list format for the PDF for readability instead of drawing a complex grid
      exportData.subscriptions.forEach((sub, index) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${sub.name} (${sub.status.toUpperCase()})`);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Category: ${sub.category} | Currency: ${sub.currency}`);
        doc.text(`Cost: ${sub.cost} per ${sub.billingCycle} (Effective Monthly: ${sub.effectiveMonthlyCost})`);
        if (sub.status === 'active') {
          doc.text(`Next Renewal: ${sub.nextRenewalDate}`);
        } else {
          doc.text(`Cancelled At: ${sub.cancelledAt}`);
        }
        if (sub.sharedWithCount > 1) {
          doc.text(`Shared with: ${sub.sharedWithCount} people`);
        }
        if (sub.notes) {
          doc.text(`Notes: ${sub.notes}`);
        }
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
