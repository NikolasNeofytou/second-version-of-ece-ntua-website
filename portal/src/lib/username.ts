// Centralized username normalization & validation utilities
// Keeps business rules consistent across availability + setup endpoints.

export interface UsernameValidationResult {
  ok: boolean;
  code?: UsernameErrorCode;
  message?: string;
}

export type UsernameErrorCode =
  | 'REQUIRED'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'INVALID_FORMAT'
  | 'RESERVED'
  | 'LEADING_UNDERSCORE'
  | 'CONSECUTIVE_SEPARATORS';

// Reserved names (routes, common system words, pronouns, etc.)
export const RESERVED_USERNAMES = new Set([
  'admin','root','system','support','help','about','contact','api','auth','login','logout','signup','register','settings','profile','profiles','user','users','me','self','account','accounts','dashboard','home','index','feed','explore','search','network','connections','connection','announcements','news','terms','privacy','security','legal','status','static','public','assets','_next','next','graphql','v1','v2'
]);

const FORMAT_REGEX = /^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/; // start & end alphanumeric, underscores allowed internally

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsernameFormat(u: string): UsernameValidationResult {
  if (!u) return { ok: false, code: 'REQUIRED', message: 'Username is required' };
  if (u.length < 3) return { ok: false, code: 'TOO_SHORT', message: 'At least 3 characters' };
  if (u.length > 30) return { ok: false, code: 'TOO_LONG', message: 'At most 30 characters' };
  if (u.startsWith('_')) return { ok: false, code: 'LEADING_UNDERSCORE', message: 'Cannot start with underscore' };
  if (!FORMAT_REGEX.test(u)) return { ok: false, code: 'INVALID_FORMAT', message: 'Only lowercase letters, numbers, underscores (no trailing underscore)' };
  if (u.includes('__')) return { ok: false, code: 'CONSECUTIVE_SEPARATORS', message: 'No consecutive underscores' };
  if (RESERVED_USERNAMES.has(u)) return { ok: false, code: 'RESERVED', message: 'That name is reserved' };
  return { ok: true };
}

export function validateUsername(raw: string): UsernameValidationResult {
  const u = normalizeUsername(raw);
  return validateUsernameFormat(u);
}
