// Format ISO date -> "15 Aug 2026"
export function formatDate(dateInput) {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d)) return "N/A";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Days remaining from today to target date (can be negative)
export function daysRemaining(dateInput) {
  if (!dateInput) return null;
  const target = new Date(dateInput);
  if (isNaN(target)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function getWarrantyStatus(expiryDate) {
  const days = daysRemaining(expiryDate);
  if (days === null) return "Not Applicable";
  if (days <= 0) return "Expired";
  if (days <= 30) return "Expiring Soon";
  return "Active";
}

export function getReturnStatus(deadline) {
  const days = daysRemaining(deadline);
  if (days === null) return "Not Applicable";
  if (days <= 0) return "Expired";
  if (days <= 3) return "Urgent";
  if (days <= 7) return "Upcoming";
  return "Safe";
}

// % of warranty period elapsed (used for progress bar)
export function getWarrantyProgress(purchaseDate, expiryDate) {
  if (!purchaseDate || !expiryDate) return 0;
  const start = new Date(purchaseDate).getTime();
  const end = new Date(expiryDate).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}