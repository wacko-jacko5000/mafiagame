export interface RuntimeFoundationConfig {
  web: {
    defaultPort: number;
  };
  api: {
    defaultPort: number;
    globalPrefix: string;
    healthPath: string;
  };
}

const runtimeFoundationConfig: RuntimeFoundationConfig = {
  web: {
    defaultPort: 3000
  },
  api: {
    defaultPort: 3001,
    globalPrefix: "api",
    healthPath: "/health"
  }
};

export function getRuntimeFoundationConfig(): Readonly<RuntimeFoundationConfig> {
  return runtimeFoundationConfig;
}
