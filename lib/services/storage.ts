// Client-side local storage helper for interactive Mock CRUD

export function getStoredData<T>(key: string, defaultData: T): T {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(`dairyflow_${key}`);
    if (!raw) {
      localStorage.setItem(`dairyflow_${key}`, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw) as T;
  } catch {
    return defaultData;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`dairyflow_${key}`, JSON.stringify(data));
    // Trigger window event so reactive listeners can re-render
    window.dispatchEvent(new CustomEvent(`dairyflow_update_${key}`, { detail: data }));
  } catch (e) {
    console.error(`Failed to store data for ${key}:`, e);
  }
}
