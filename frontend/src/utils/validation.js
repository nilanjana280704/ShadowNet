/**
 * ShadowNet — form validation helpers.
 * Pure functions returning an error-message key (from strings.validation) or
 * null when valid. Screens map the returned message to a ValidationLabel.
 */
import { strings } from '../localization';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

export function validateRequired(value) {
  return value && String(value).trim().length > 0 ? null : strings.validation.required;
}

export function validateEmail(value) {
  if (!value) return strings.validation.required;
  return EMAIL_RE.test(value.trim()) ? null : strings.validation.email;
}

export function validateName(value) {
  return value && value.trim().length >= 2 ? null : strings.validation.name;
}

export function validatePhone(value) {
  if (!value) return strings.validation.required;
  return PHONE_RE.test(value.trim()) ? null : strings.validation.phone;
}

export function validatePassword(value) {
  if (!value) return strings.validation.required;
  if (value.length < 8) return strings.validation.passwordShort;
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) return strings.validation.passwordWeak;
  return null;
}

export function validateConfirm(value, original) {
  if (!value) return strings.validation.required;
  return value === original ? null : strings.validation.passwordMatch;
}

export function validateAccepted(value) {
  return value ? null : strings.validation.terms;
}

export function validateOtp(value, length = 6) {
  return value && value.length === length ? null : strings.validation.otp;
}

/**
 * Password strength 0..3 for a ProgressIndicator (weak → strong).
 * @returns {{ score:number, label:string }}
 */
export function passwordStrength(value = '') {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value)) score += 1;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
}

/**
 * Run a map of { field: validatorResult } and return { valid, errors }.
 * @param {Record<string, string|null>} results
 */
export function collect(results) {
  const errors = {};
  Object.keys(results).forEach((k) => {
    if (results[k]) errors[k] = results[k];
  });
  return { valid: Object.keys(errors).length === 0, errors };
}
