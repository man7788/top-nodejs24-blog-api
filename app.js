const express = require('express');
const errorHandler = require('./src/middlewares/errors/errorHandler');

// Import all routes from routes/index barrel file
const routes = require('./src/routes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Invoke Passport configuration
require('./src/middlewares/passport/passport');

// Routes
app.use('/', routes.auth);
app.use('/posts', routes.post);
app.use('/posts', routes.comment);
// Not found route
app.use(routes.notFound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});

// Custom error handler
app.use(errorHandler);
