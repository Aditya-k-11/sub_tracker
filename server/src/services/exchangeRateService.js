class ExchangeRateService {
  constructor() {
    this.rates = new Map();
    this.CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
  }

  async getExchangeRates(baseCurrency) {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey || apiKey.includes('your-exchange-rate-api-key')) {
      // Simulate/mock behavior if API key is not yet set
      console.warn(`WARNING: EXCHANGE_RATE_API_KEY is not set. Using fallback rates for ${baseCurrency}.`);
      return {
        USD: 1,
        EUR: 0.9,
        GBP: 0.8,
        INR: 83.5,
        AUD: 1.5,
        CAD: 1.35
      };
    }

    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`);
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.conversion_rates) {
        return data.conversion_rates;
      }
      throw new Error('Invalid data format from exchange rate API');
    } catch (error) {
      console.error(`Failed to fetch exchange rates for ${baseCurrency}:`, error.message);
      throw error;
    }
  }

  async getCachedExchangeRates(baseCurrency) {
    const now = Date.now();
    const cached = this.rates.get(baseCurrency);

    // If cache exists and is valid, return it
    if (cached && (now - cached.timestamp < this.CACHE_DURATION)) {
      return cached.data;
    }

    try {
      // Fetch fresh rates
      const freshRates = await this.getExchangeRates(baseCurrency);
      
      // Update cache
      this.rates.set(baseCurrency, {
        timestamp: now,
        data: freshRates
      });
      
      return freshRates;
    } catch (error) {
      // Fallback: if fetch fails but we have stale cache, return it
      if (cached) {
        console.warn(`Returning stale exchange rates for ${baseCurrency} due to fetch error.`);
        return cached.data;
      }
      
      // If we have no cache and fetch failed, use hardcoded fallback rates to prevent crashing
      // Note: in a production app, we might want to fail the request if we absolutely need accurate rates.
      console.error(`No cached rates available for ${baseCurrency}. Using hardcoded fallbacks.`);
      const fallbacks = {
        USD: baseCurrency === 'USD' ? 1 : 1 / 83.5,
        EUR: baseCurrency === 'EUR' ? 1 : 0.9,
        GBP: baseCurrency === 'GBP' ? 1 : 0.8,
        INR: baseCurrency === 'INR' ? 1 : 83.5,
        AUD: baseCurrency === 'AUD' ? 1 : 1.5,
        CAD: baseCurrency === 'CAD' ? 1 : 1.35
      };
      
      // We don't cache the fallback to ensure we retry next time
      return fallbacks;
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
