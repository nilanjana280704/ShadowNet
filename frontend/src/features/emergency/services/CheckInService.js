/**
 * CheckInService — builds a safe check-in record from a predefined message key.
 * The record is stored in the check-in slice and (optionally) sent to family via
 * the chat/engine in the thunk.
 */
import { CHECK_IN_MESSAGES } from '../constants';

let counter = 0;

export const CheckInService = {
  messages() {
    return CHECK_IN_MESSAGES;
  },

  create(messageKey, { audience = 'Family' } = {}) {
    const preset = CHECK_IN_MESSAGES.find((m) => m.key === messageKey) || CHECK_IN_MESSAGES[0];
    counter += 1;
    return {
      id: `ci-${Date.now().toString(36)}-${counter}`,
      key: preset.key,
      label: preset.label,
      icon: preset.icon,
      tone: preset.tone,
      audience,
      at: Date.now(),
    };
  },
};

export default CheckInService;
