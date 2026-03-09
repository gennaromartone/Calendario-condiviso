/**
 * Safe link builders for info importanti.
 * Only builds tel: from validated valore.telefono; Maps from validated valore.indirizzo.
 * Security: same validation as server (telefono regex, indirizzo max 500).
 */

const TELEFONO_REGEX = /^[\d\s\+\-\(\)\.]+$/;
const MAX_MAPS_QUERY = 500;

/**
 * Build tel: URL only from validated telefono.
 * Uses encodeURI for allowed chars per spec.
 */
export function safeTelUrl(telefono: string | undefined): string | null {
  if (!telefono || typeof telefono !== "string") return null;
  const trimmed = telefono.trim();
  if (!trimmed || trimmed.length > 50) return null;
  if (!TELEFONO_REGEX.test(trimmed)) return null;
  return `tel:${encodeURI(trimmed)}`;
}

/**
 * Build Google Maps search URL only from validated indirizzo.
 * Max query length ~500.
 */
export function safeMapsUrl(indirizzo: string | undefined): string | null {
  if (!indirizzo || typeof indirizzo !== "string") return null;
  const trimmed = indirizzo.trim();
  if (!trimmed) return null;
  const query = trimmed.length > MAX_MAPS_QUERY
    ? trimmed.slice(0, MAX_MAPS_QUERY)
    : trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
