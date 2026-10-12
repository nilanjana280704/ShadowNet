/**
 * AttachmentService — factory for the structured attachments a message can
 * carry (location, resource, contact, shelter, medical camp, volunteer). Pure;
 * produces the shape AttachmentCard renders. No file uploads.
 */
import { AttachmentType, MessageType } from '../constants';

export const AttachmentService = {
  location({ title = 'Shared location', subtitle, coords } = {}) {
    return { type: AttachmentType.LOCATION, title, subtitle, coords };
  },
  resource({ title, subtitle } = {}) {
    return { type: AttachmentType.RESOURCE, title, subtitle };
  },
  contact({ title, subtitle } = {}) {
    return { type: AttachmentType.CONTACT, title, subtitle };
  },
  shelter({ title, subtitle } = {}) {
    return { type: AttachmentType.SHELTER, title, subtitle };
  },
  medical({ title, subtitle } = {}) {
    return { type: AttachmentType.MEDICAL, title, subtitle };
  },
  volunteer({ title, subtitle } = {}) {
    return { type: AttachmentType.VOLUNTEER, title, subtitle };
  },

  /** The message type that best matches an attachment (for quick actions). */
  messageTypeFor(attachmentType) {
    const map = {
      [AttachmentType.LOCATION]: MessageType.LOCATION,
      [AttachmentType.RESOURCE]: MessageType.RESOURCE_REQUEST,
      [AttachmentType.VOLUNTEER]: MessageType.VOLUNTEER_REQUEST,
    };
    return map[attachmentType] || MessageType.TEXT;
  },
};

export default AttachmentService;
