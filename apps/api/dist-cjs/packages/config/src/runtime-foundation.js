"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuntimeFoundationConfig = getRuntimeFoundationConfig;
const runtimeFoundationConfig = {
    web: {
        defaultPort: 3000
    },
    api: {
        defaultPort: 3001,
        globalPrefix: "api",
        healthPath: "/health"
    }
};
function getRuntimeFoundationConfig() {
    return runtimeFoundationConfig;
}
