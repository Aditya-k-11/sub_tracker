import { KNOWN_SERVICES } from '../config/knownServicesCatalog.js';

export const extractAmount = (text) => {
  if (!text) return null;

  const regex = /(₹|Rs\.?|INR|\$)\s*((?:[0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.[0-9]{1,2})?)/i;
  
  const match = text.match(regex);
  if (match && match[1] && match[2]) {
    const rawCurrency = match[1];
    
    const cleanAmount = match[2].replace(/,/g, '');
    const amount = parseFloat(cleanAmount);
    if (!isNaN(amount)) {
      return { amount, currency: rawCurrency };
    }
  }

  return null;
};

/**
 * Guesses the billing cycle from keywords in the text.
 * 
 * @param {string} text - The raw text of the email body or snippet.
 * @returns {string|null} - 'monthly', 'yearly', 'weekly', or null if not found.
 */
export const guessBillingCycle = (text) => {
  if (!text) return null;
  const lowerText = text.toLowerCase();

  if (lowerText.match(/\b(monthly|per month|\/mo)\b/)) return 'monthly';
  if (lowerText.match(/\b(yearly|annual|annually|per year|\/yr)\b/)) return 'yearly';
  if (lowerText.match(/\b(weekly|per week|\/wk)\b/)) return 'weekly';

  return null;
};

export const matchKnownService = (senderEmail, subject) => {
  let emailAddress = senderEmail || '';
  
  // Extract just the email part if it comes as "Name <email@domain.com>"
  const emailMatch = emailAddress.match(/<(.+)>/);
  if (emailMatch) {
    emailAddress = emailMatch[1];
  }
  
  const domain = emailAddress.split('@')[1]?.toLowerCase() || '';

  // 1. Try to match against the known catalog via sender domain
  const knownMatch = KNOWN_SERVICES.find(s => s.senderDomains.includes(domain));
  if (knownMatch) {
    return {
      name: knownMatch.name,
      category: knownMatch.defaultCategory,
      confidence: 'high'
    };
  }

  if (subject) {
    let guessedName = subject;
    const prefixesToRemove = [
      /^your receipt from\s+/i,
      /^payment confirmation[:\-]?\s+/i,
      /^invoice from\s+/i,
      /^receipt for\s+/i,
      /^your payment to\s+/i,
      /receipt/i,
      /invoice/i,
      /confirmation/i
    ];

    for (const prefix of prefixesToRemove) {
      guessedName = guessedName.replace(prefix, '').trim();
    }

    // Clean up leftover symbols like dashes or extra spaces
    guessedName = guessedName.replace(/^[-:]\s*/, '').trim();

    if (guessedName.length > 1 && guessedName.length < 50) {
      return {
        name: guessedName,
        category: 'Other',
        confidence: 'low'
      };
    }
  }

  return {
    name: null,
    category: null,
    confidence: 'none'
  };
};
