"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const config_1 = require("@mafia-game/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const runtimeConfig = (0, config_1.getRuntimeFoundationConfig)();
    const port = Number(process.env.PORT ?? runtimeConfig.api.defaultPort);
    app.setGlobalPrefix(runtimeConfig.api.globalPrefix);
    app.enableCors({
        origin: true,
        credentials: true
    });
    await app.listen(port);
}
void bootstrap();
