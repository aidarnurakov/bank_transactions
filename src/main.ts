import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Bank/Transaction API')
    .setDescription('Simple banking system API with async transaction queue')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    'Swagger docs: http://localhost:' + (process.env.PORT ?? 3000) + '/api',
  );
}
bootstrap()
  .then(() => {
    console.log('Server is running on port 3000');
  })
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  });
