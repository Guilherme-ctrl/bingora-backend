import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from './config/env.validation';
export declare function configureApp(app: INestApplication, config: ConfigService<AppEnv, true>): void;
