const LOCAL_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5MB
const WARNING_THRESHOLD = 0.8;

export function getStorageUsage(): {
  usedBytes: number;
  limitBytes: number;
  percentage: number;
  isWarning: boolean;
} {
  if (typeof window === "undefined") {
    return { usedBytes: 0, limitBytes: LOCAL_STORAGE_LIMIT_BYTES, percentage: 0, isWarning: false };
  }

  let usedBytes = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      usedBytes += (localStorage.getItem(key) ?? "").length * 2; // UTF-16 = 2 bytes/char
    }
  }

  const percentage = usedBytes / LOCAL_STORAGE_LIMIT_BYTES;

  return {
    usedBytes,
    limitBytes: LOCAL_STORAGE_LIMIT_BYTES,
    percentage,
    isWarning: percentage >= WARNING_THRESHOLD,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
