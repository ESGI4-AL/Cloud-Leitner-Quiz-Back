import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './src/app.module';
import express from 'express';
import { Handler, Context, APIGatewayProxyEvent, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

// Déclarer une variable pour stocker l'instance du serveur
let server: Handler;

// Déclarer une variable pour suivre si l'initialisation est en cours
let serverInitializing: Promise<Handler> | null = null;

async function bootstrap(): Promise<Handler> {
  try {
    console.log('Starting bootstrap...');
    const expressApp = express();

    // Réduire les logs NestJS pour améliorer les performances
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error'] }
    );
    console.log('NestJS app created');

    // Configuration CORS
    app.enableCors({
      origin: ['https://don7egqkuefue.cloudfront.net', 'http://localhost:5173'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization',
      credentials: true
    });

    // Initialiser l'application
    await app.init();
    console.log('App initialized');

    // Créer et retourner le handler serverless express
    return serverlessExpress({ app: expressApp });
  } catch (error) {
    console.error('Bootstrap error:', error);
    throw error;
  }
}

// Commencer l'initialisation en dehors du handler pour optimiser les cold starts
serverInitializing = bootstrap().then(serverInstance => {
  server = serverInstance;
  serverInitializing = null;
  return server;
}).catch(err => {
  console.error('Failed to initialize server outside handler:', err);
  serverInitializing = null;
  throw err;
});

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => {
  // Configurer le contexte pour une meilleure gestion de Lambda
  context.callbackWaitsForEmptyEventLoop = false;

  console.log('Lambda invoked with event path:', event.path);

  try {
    // Si le serveur n'est pas encore initialisé
    if (!server) {
      console.log('Server not initialized yet');

      // Si l'initialisation est déjà en cours, attendez-la
      if (serverInitializing) {
        console.log('Waiting for server initialization...');
        server = await serverInitializing;
      } else {
        // Sinon, démarrez l'initialisation
        console.log('Starting server initialization...');
        server = await bootstrap();
      }
      console.log('Server initialized successfully');
    }

    // Appeler le handler serverless express avec l'événement
    return server(event, context, callback);
  } catch (error) {
    console.error('Handler error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Retourner une réponse d'erreur formatée
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://don7egqkuefue.cloudfront.net',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
