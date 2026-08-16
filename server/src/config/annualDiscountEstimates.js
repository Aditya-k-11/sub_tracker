// Mapping of service names to typical annual discount percentages (0 means no annual option)
// We first try an exact match, then fall back to the category default.
export const KNOWN_SERVICE_DISCOUNTS = {
  "Netflix": 0,
  "Spotify": 0.17,
  "Adobe Creative Cloud": 0.16,
  "Notion": 0.20,
  "Disney+ Hotstar": 0.25,
  "Amazon Prime": 0.16,
  "YouTube Premium": 0.15,
  "Apple Music": 0.16,
  "ChatGPT Plus": 0,
  "GitHub Copilot": 0.16,
  "Strava": 0.16,
  "MyFitnessPal": 0.16,
  "DigitalOcean": 0
};

export const DEFAULT_CATEGORY_DISCOUNT_ESTIMATE = {
  Entertainment: 0.15,
  Fitness: 0.10,
  Productivity: 0.18,
  Utilities: 0.12,
  Other: 0.10
};
