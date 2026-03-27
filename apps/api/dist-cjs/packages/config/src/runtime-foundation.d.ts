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
export declare function getRuntimeFoundationConfig(): Readonly<RuntimeFoundationConfig>;
