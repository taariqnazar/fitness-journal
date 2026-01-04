import { useQuery } from "@tanstack/react-query";

export function useFitnessData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Network error");
      return res.json();
    },
    staleTime: 60000, // Refresh data every minute
  });
}
