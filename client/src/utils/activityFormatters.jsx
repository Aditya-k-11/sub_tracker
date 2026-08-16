import React from 'react';
import { PlusCircle, Pencil, XCircle, CheckCircle, CheckSquare, XSquare, Settings, FileText } from 'lucide-react';

export const formatActivityText = (activity) => {
  const { action, subscriptionName, metadata } = activity;
  const name = subscriptionName || 'a subscription';

  switch (action) {
    case 'subscription_created':
      return `Added ${name}`;
    case 'subscription_updated':
      return `Updated ${name}`;
    case 'subscription_cancelled':
      return `Cancelled ${name}`;
    case 'usage_logged':
      return `Logged usage on ${name}`;
    case 'suggestion_confirmed':
      return `Added ${name} from ${metadata?.source === 'google' ? 'Gmail' : 'Outlook'} suggestion`;
    case 'suggestion_dismissed':
      return `Dismissed suggestion for ${name}`;
    case 'budget_set':
      return `Updated budget settings`;
    case 'notes_updated':
      return `Updated notes on ${name}`;
    default:
      return `Performed action on ${name}`;
  }
};

export const formatActivityMetadata = (activity) => {
  if (!activity.metadata || Object.keys(activity.metadata).length === 0) return null;

  const { action, metadata } = activity;

  if (action === 'subscription_updated' && metadata.updatedFields) {
    return `Updated fields: ${metadata.updatedFields.join(', ')}`;
  }

  if (action === 'subscription_created') {
    const parts = [];
    if (metadata.cost !== undefined) parts.push(`Cost: ${metadata.cost} ${metadata.currency || ''}`);
    if (metadata.category) parts.push(`Category: ${metadata.category}`);
    if (parts.length > 0) return parts.join(' • ');
  }

  // Fallback for simple key-values
  try {
    const pairs = Object.entries(metadata)
      .filter(([_, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`);
    
    if (pairs.length > 0) return pairs.join(' • ');
  } catch (e) {
    return null;
  }
  
  return null;
};

export const getActivityIcon = (action) => {
  switch (action) {
    case 'subscription_created':
      return <PlusCircle className="w-5 h-5 text-accent" />;
    case 'subscription_updated':
      return <Pencil className="w-5 h-5 text-primary-400" />;
    case 'subscription_cancelled':
      return <XCircle className="w-5 h-5 text-white/50" />;
    case 'usage_logged':
      return <CheckCircle className="w-5 h-5 text-accent" />;
    case 'suggestion_confirmed':
      return <CheckSquare className="w-5 h-5 text-primary-500" />;
    case 'suggestion_dismissed':
      return <XSquare className="w-5 h-5 text-white/40" />;
    case 'budget_set':
      return <Settings className="w-5 h-5 text-secondary" />;
    case 'notes_updated':
      return <FileText className="w-5 h-5 text-primary-300" />;
    default:
      return <CheckCircle className="w-5 h-5 text-white/50" />;
  }
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
