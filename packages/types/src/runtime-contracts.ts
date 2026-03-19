export interface ApiHealthResponse {
  service: "api";
  status: "ok" | "degraded";
  timestamp: string;
  database: {
    status: "up" | "down";
  };
}
