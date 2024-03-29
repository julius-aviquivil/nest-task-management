import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ValidationError, BadRequestException, Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = config.get('server');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  if(process.env.NODE_ENV === 'development') app.enableCors();
  else {
    app.enableCors({ 
      origin: serverConfig.origin,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      preflightContinue: false
    });
    logger.log(`Accepting request from origin ${serverConfig.origin}`);
  } 

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
    })
  );

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application listening on port: ${port}. ENV=${process.env.NODE_ENV}`);
}
bootstrap();
