
const EXCHANGE_RATES = {
  'USD': 1.0,
  'INR': 83.50,
  'EUR': 0.92,
  'GBP': 0.79,
  'AUD': 1.53,
  'CAD': 1.36
};

export const normalizeCurrencyCode = (symbolOrCode) => {
  if (!symbolOrCode) return 'USD'; 
  const clean = symbolOrCode.toUpperCase().trim();
  
  if (['$', 'USD'].includes(clean)) return 'USD';
  if (['₹', 'RS', 'RS.', 'INR'].includes(clean)) return 'INR';
  if (['€', 'EUR'].includes(clean)) return 'EUR';
  if (['£', 'GBP'].includes(clean)) return 'GBP';

  if (EXCHANGE_RATES[clean]) return clean;

  return 'USD';
};

export const convertCurrency = (amount, fromSymbolOrCode, toCode) => {
  if (amount == null || isNaN(amount)) return amount;

  const fromIso = normalizeCurrencyCode(fromSymbolOrCode);
  const toIso = normalizeCurrencyCode(toCode);

  if (fromIso === toIso) {
    return Math.round(amount * 100) / 100;
  }

  const fromRate = EXCHANGE_RATES[fromIso] || 1.0;
  const toRate = EXCHANGE_RATES[toIso] || 1.0;

  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;

  return Math.round(convertedAmount * 100) / 100;
};
