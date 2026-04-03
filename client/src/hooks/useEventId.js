import { useMemo } from 'react';

export function useEventId() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('event') || '001';
  }, [window.location.search]);
}
