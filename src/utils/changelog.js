// ===== SECTION LABELS =====

const SECTION_LABELS = {
  new: 'Nouveautés',
  improved: 'Améliorations',
  fixed: 'Corrections de bugs',
};

const STATUS_LABELS = {
  alpha: 'Alpha',
  beta: 'Beta',
  stable: 'Stable',
};

// ===== PURE FUNCTIONS =====

/**
 * @pure - No side effects, only depends on parameters
 * @param {{new?: string[], improved?: string[], fixed?: string[]}} entry - Version entry from changelog.json
 * @returns {{key: string, label: string, items: string[]}[]} Non-empty sections for this version
 */
export function getVersionSections(entry) {
  return Object.entries(SECTION_LABELS)
    .map(([key, label]) => ({ key, label, items: entry[key] ?? [] }))
    .filter((section) => section.items.length > 0);
}

/**
 * @pure - No side effects, only depends on parameters
 * @param {string} status - One of 'alpha', 'beta', 'stable'
 * @returns {string} Human-readable label for the status
 */
export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

/**
 * @pure - No side effects, only depends on parameters
 * @param {string} isoDate - Date string in ISO format (YYYY-MM-DD)
 * @returns {string} Date formatted as "31 août 2026"
 */
export function formatChangelogDate(isoDate) {
  if (!isoDate) return '';

  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
