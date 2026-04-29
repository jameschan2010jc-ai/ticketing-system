export function getHealthStatus() {
  return {
    status: "ok" as const,
    service: "ticketing-api" as const,
    version: "v1" as const,
    timestamp: new Date().toISOString()
  };
}
