import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody required for Stripe webhook signature verification
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  const webOriginEnv = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  const origins = webOriginEnv.includes(',')
    ? webOriginEnv.split(',').map((o) => o.trim())
    : webOriginEnv;
  app.enableCors({ origin: origins, credentials: true });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
