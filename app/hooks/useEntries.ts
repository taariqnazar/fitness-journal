import { useQuery } from '@tanstack/react-query';

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await fetch('/api/entries');
      return res.json();
    },
  });
}
