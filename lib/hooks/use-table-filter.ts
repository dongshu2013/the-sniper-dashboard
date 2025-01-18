import { useState, useCallback } from 'react';

export type FilterConfig = Record<string, string>;

export function useTableFilter<T>(initialData: T[]) {
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});

  const handleFilter = useCallback((data: T[], filters: FilterConfig) => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        const itemValue = String(
          key.split('.').reduce((obj: any, key) => obj?.[key], item) ?? ''
        ).toLowerCase();

        return itemValue.includes(value.toLowerCase());
      });
    });
  }, []);

  const updateFilter = useCallback((column: string, value: string) => {
    setFilterConfig((prev) => ({
      ...prev,
      [column]: value
    }));
  }, []);

  return {
    filterConfig,
    handleFilter,
    updateFilter
  };
}
