import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JWTTOKEN, PORT, SWAGGER_ENDPOINT } from './constants';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Retailer System')
    .setDescription(
      'A website to give retailers and users a smooth experience to buy/sell products',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      JWTTOKEN,
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SWAGGER_ENDPOINT, app, document);
  await app.listen(process.env.PORT || PORT);
}
bootstrap();
