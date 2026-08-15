class CurrencyService {
  constructor() {
    this.rates = {};
    this.lastFetched = null;
    this.CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    this.baseCurrency = 'USD';
  }

  async fetchRates() {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          this.rates = data.rates;
          this.lastFetched = Date.now();
          console.log('Currency rates updated successfully.');
        }
      } else {
        throw new Error('Response not OK');
      }
    } catch (error) {
      console.error('Failed to fetch currency rates:', error.message);
      // Fallback rates if the API fails
      if (Object.keys(this.rates).length === 0) {
        this.rates = {
          USD: 1,
          EUR: 0.9,
          GBP: 0.8,
          INR: 83.5,
          AUD: 1.5,
          CAD: 1.35
        };
      }
    }
  }

  async getRates() {
    if (!this.lastFetched || (Date.now() - this.lastFetched > this.CACHE_DURATION)) {
      await this.fetchRates();
    }
    return this.rates;
  }

  async convert(amount, fromCurrency, toCurrency) {
    if (!amount) return 0;
    if (fromCurrency === toCurrency) return amount;

    const rates = await this.getRates();
    
    // Convert from source currency to USD (base)
    const rateFromBase = rates[fromCurrency] || 1;
    const amountInBase = amount / rateFromBase;
    
    // Convert from USD (base) to target currency
    const rateToBase = rates[toCurrency] || 1;
    const convertedAmount = amountInBase * rateToBase;

    return convertedAmount;
  }
}

export const currencyService = new CurrencyService();
