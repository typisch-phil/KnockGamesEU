import { useQuery } from "@tanstack/react-query";

interface ServerStatus {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: string;
  ping?: number;
  error?: string;
}

export function useServerStatus(host: string = "play.knockgames.eu", port: number = 25565) {
  return useQuery<ServerStatus>({
    queryKey: ["/api/server-status", host, port],
    queryFn: async () => {
      const response = await fetch(`/api/server-status?host=${encodeURIComponent(host)}&port=${port}`);
      if (!response.ok) {
        throw new Error("Failed to fetch server status");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: 2000,
  });
}