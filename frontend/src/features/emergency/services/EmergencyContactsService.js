/**
 * EmergencyContactsService — pure helpers to group, sort, and prioritize
 * emergency contacts.
 */
import { CONTACT_GROUP_META } from '../constants';

export const EmergencyContactsService = {
  /** Group contacts by their group, in the canonical group order. */
  grouped(contacts) {
    return Object.keys(CONTACT_GROUP_META)
      .map((group) => ({
        group,
        meta: CONTACT_GROUP_META[group],
        contacts: contacts.filter((c) => c.group === group),
      }))
      .filter((section) => section.contacts.length > 0);
  },

  /** Priority contacts first, then by name. */
  sort(contacts) {
    return [...contacts].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },

  priorityContacts(contacts) {
    return contacts.filter((c) => c.priority);
  },
};

export default EmergencyContactsService;
