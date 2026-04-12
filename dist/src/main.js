"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const node_path_1 = require("node:path");
const app_module_1 = require("./app.module");
const bootstrap_app_1 = require("./bootstrap-app");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get((config_1.ConfigService));
    (0, bootstrap_app_1.configureApp)(app, config);
    app.useStaticAssets((0, node_path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map