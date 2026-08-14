/**
 * Repairs text that was stored or transmitted as Latin-1 but is actually UTF-8
 * (e.g. "â€”" instead of "—", "ðŸš€" instead of "🚀").
 */
export const repairUtf8Mojibake = (value) => {
  if (typeof value !== 'string' || !value) {
    return value;
  }

  if (!/[ÃÂâð]/.test(value)) {
    return value;
  }

  try {
    const repaired = decodeURIComponent(escape(value));
    return repaired.includes('\uFFFD') ? value : repaired;
  } catch {
    return value;
  }
};

export const displayText = (value) => repairUtf8Mojibake(value);
