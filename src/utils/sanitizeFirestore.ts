/**
 * Utility to sanitize objects before sending to Firestore
 * Removes any undefined values or converts them to null / defaults
 * to prevent Firestore "Unsupported field value: undefined" errors.
 */

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // If it's a plain object (not a FieldValue/Date/Array), sanitize recursively
        if (value.constructor === Object) {
          clean[key] = sanitizeForFirestore(value);
        } else {
          clean[key] = value;
        }
      } else {
        clean[key] = value;
      }
    }
  }

  return clean as Partial<T>;
}
