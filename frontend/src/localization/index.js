/**
 * ShadowNet — localization entry point.
 * Exposes the active string table as `strings` and a tiny `format` helper for
 * `{placeholder}` interpolation. A future locale switch changes only this file.
 */
import { en } from './en';

export const strings = en;

/**
 * Interpolate `{key}` placeholders in a template.
 * @param {string} template e.g. 'Resend code in {seconds}s'
 * @param {Record<string, string|number>} [params]
 */
export function format(template, params = {}) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export default strings;
