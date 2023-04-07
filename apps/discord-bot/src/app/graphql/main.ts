import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'https';
import https from 'https';
import { resolvers } from './resolvers/index.ts';
import { typeDefs } from './schemas/index.ts';
import { GRAPHQL_PORT, LOCAL_CERT, LOCAL_CERT_KEY } from '../config/secrets';
import path from 'path';
import fs from 'fs';

function createServer(app: express.Express) {
    if (LOCAL_CERT && LOCAL_CERT_KEY) {
        const ssl = {
            key: fs.readFileSync(path.resolve(path.dirname(__dirname), LOCAL_CERT_KEY)),
            cert: fs.readFileSync(path.resolve(path.dirname(__dirname), LOCAL_CERT)),
        };

        return https.createServer(ssl, app);
    } else {
        return http.createServer(app);
    }
}

async function startApolloServer() {
    // Required logic for integrating with Express
    const app = express();
    // Our httpServer handles incoming requests to our Express app.
    // Below, we tell Apollo Server to "drain" this httpServer,
    // enabling our servers to shut down gracefully.
    const httpServer = createServer(app);

    // Same ApolloServer initialization as before, plus the drain plugin
    // for our httpServer.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        cache: 'bounded',
    });

    // More required logic for integrating with Express
    await server.start();
    server.applyMiddleware({
        app,

        // By default, apollo-server hosts its GraphQL endpoint at the
        // server root. However, *other* Apollo Server packages host it at
        // /graphql. Optionally provide this to match apollo-server.
        path: '/',
    });

    // Modified server startup
    await new Promise<void>((resolve) => httpServer.listen({ port: GRAPHQL_PORT }, resolve));
    console.log(`🚀 Graphql Server ready at https://localhost:${GRAPHQL_PORT}${server.graphqlPath}`);
}

startApolloServer();
