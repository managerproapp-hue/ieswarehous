
const storage = {
  local: {
    get<T,>(key: string, defaultValue: T): T {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
      }
    },
    set<T,>(key: string, value: T): void {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    },
    remove(key: string): void {
      localStorage.removeItem(key);
    },
  },
  session: {
    get<T,>(key: string, defaultValue: T): T {
      try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch (error) {
        console.error(`Error reading sessionStorage key “${key}”:`, error);
        return defaultValue;
      }
    },
    set<T,>(key: string, value: T): void {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting sessionStorage key “${key}”:`, error);
      }
    },
    remove(key: string): void {
      sessionStorage.removeItem(key);
    },
  },
};

export default storage;
