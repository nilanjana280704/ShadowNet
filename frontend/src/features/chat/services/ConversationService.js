/**
 * ConversationService — pure list logic for the chat list: ordering (pinned
 * first, then most recent), filtering, search, and unread totals.
 */
import { ConversationType, GroupType } from '../constants';

export const ConversationFilter = Object.freeze({
  ALL: 'all',
  UNREAD: 'unread',
  NEARBY: 'nearby',
  PINNED: 'pinned',
  EMERGENCY: 'emergency',
});

export const ConversationService = {
  sort(conversations) {
    return [...conversations].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.lastMessageAt - a.lastMessageAt;
    });
  },

  filter(conversations, filterKey) {
    switch (filterKey) {
      case ConversationFilter.UNREAD:
        return conversations.filter((c) => c.unread > 0);
      case ConversationFilter.NEARBY:
        return conversations.filter((c) => c.proximity === 'nearby');
      case ConversationFilter.PINNED:
        return conversations.filter((c) => c.pinned);
      case ConversationFilter.EMERGENCY:
        return conversations.filter((c) => c.groupType === GroupType.EMERGENCY || c.proximity === 'nearby');
      default:
        return conversations;
    }
  },

  search(conversations, query) {
    if (!query) return conversations;
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  },

  totalUnread(conversations) {
    return conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  },

  isGroup(conversation) {
    return conversation?.type === ConversationType.GROUP;
  },
};

export default ConversationService;
