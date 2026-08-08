import { getFullEmailContent } from './gmailService.js';
import { extractAmount, guessBillingCycle, matchKnownService } from '../utils/emailParsingHelpers.js';
import { convertCurrency } from '../utils/currencyConversion.js';
import SuggestedSubscription from '../models/SuggestedSubscription.js';
import User from '../models/User.js';

export const parseEmailCandidate = async (userId, candidate, userCurrency = 'INR') => {
  
  const serviceMatch = matchKnownService(candidate.sender, candidate.subject);

  let fullBodyText = '';
  try {
    fullBodyText = await getFullEmailContent(userId, candidate.messageId);
  } catch (err) {
    console.error(`Skipping parsing for message ${candidate.messageId} due to fetch error.`);
  }

  // 3. Extract amount and billing cycle
  let amountData = extractAmount(fullBodyText) || extractAmount(candidate.snippet);
  let cycle = guessBillingCycle(fullBodyText) || guessBillingCycle(candidate.snippet);

  let convertedCost = null;
  if (amountData) {
    convertedCost = convertCurrency(amountData.amount, amountData.currency, userCurrency);
  }

  // 4. Compute Confidence Score
  let confidence = 'none';

  if (serviceMatch.confidence === 'high' && convertedCost !== null) {
    confidence = 'high';
  } else if (serviceMatch.confidence === 'high' || convertedCost !== null) {
    confidence = 'medium';
  } else if (serviceMatch.confidence === 'low' && convertedCost === null) {
    confidence = 'low';
  }

  if (confidence === 'none' || (serviceMatch.name === null && convertedCost === null)) {
    confidence = 'reject';
  }

  return {
    messageId: candidate.messageId,
    suggestedName: serviceMatch.name,
    suggestedCategory: serviceMatch.category,
    suggestedCost: convertedCost,
    suggestedBillingCycle: cycle,
    confidence: confidence,
    sourceSubject: candidate.subject,
    sourceSender: candidate.sender,
    sourceDate: candidate.receivedDate
  };
};

export const parseAllCandidates = async (userId, candidates) => {
  if (!candidates || candidates.length === 0) return [];

  const user = await User.findById(userId);
  const userCurrency = user ? user.currency : 'INR';

  const parsedPromises = candidates.map(candidate => parseEmailCandidate(userId, candidate, userCurrency));
  const results = await Promise.all(parsedPromises);

  const confidenceValues = { 'high': 3, 'medium': 2, 'low': 1 };
  
  return results
    .filter(res => res.confidence !== 'reject')
    .sort((a, b) => confidenceValues[b.confidence] - confidenceValues[a.confidence]);
};

export const saveSuggestedSubscriptions = async (userId, parsedCandidates) => {
  let newSuggestions = 0;
  let alreadyReviewed = 0;

  for (const candidate of parsedCandidates) {
    
    const existing = await SuggestedSubscription.findOne({ userId, sourceMessageId: candidate.messageId });
    
    if (existing && existing.status !== 'pending') {
      alreadyReviewed++;
      continue;
    }

    await SuggestedSubscription.findOneAndUpdate(
      { userId, sourceMessageId: candidate.messageId },
      {
        suggestedName: candidate.suggestedName,
        suggestedCategory: candidate.suggestedCategory,
        suggestedCost: candidate.suggestedCost,
        suggestedBillingCycle: candidate.suggestedBillingCycle,
        confidence: candidate.confidence,
        sourceSubject: candidate.sourceSubject,
        sourceSender: candidate.sourceSender,
        sourceDate: candidate.sourceDate,
        
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    if (!existing) {
      newSuggestions++;
    }
  }

  return {
    newSuggestions,
    alreadyReviewed,
    total: parsedCandidates.length
  };
};
