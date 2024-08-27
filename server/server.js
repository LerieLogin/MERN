const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const db = require('./config/connection');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas'); // Import your type definitions and resolvers
const { authMiddleware } = require('./utils/auth'); // Import your auth middleware

const app = express();
const PORT = process.env.PORT || 3001;

// Create a new Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => authMiddleware({ req }), // Apply auth middleware for each request
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply the Apollo GraphQL middleware and set the path to /graphql
server.start().then(() => {
  server.applyMiddleware({ app, path: '/graphql' });

  // Serve static assets if in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // Use your existing routes for RESTful API
  app.use(routes);

  // Start the database connection and the server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(` Now listening on http://localhost:${PORT}`);
      console.log(`now listening http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
});