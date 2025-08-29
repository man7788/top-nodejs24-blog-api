const express = require('express');

// Import all routes from routes/index barrel file
const routes = require('./routes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Invoke Passport configuration
require('./config/passport');

// Routes
app.use('/', routes.auth);
app.use('/posts', routes.post);
app.use('/posts', routes.comment);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});
