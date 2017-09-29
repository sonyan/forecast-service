const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.enable('trust proxy');
app.use(cors());

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
const datastore = Datastore({
  projectId: 'weather-181322'
});

/**
 * Retrieve the latest 7 records from the database.
 */
function getForecasts(city, state) {
  const dsQuery = datastore.createQuery('forecast')
    .filter('city', '=', city)
    .filter('state', '=', state)
    .order('date', { descending: true })
    .limit(7);

  return datastore.runQuery(dsQuery)
    .then((results) => {
      const entities = results[0];
      return entities;
    });
}

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// api routes
app.get('/:city/:state', (req, res) => {
  const {city, state} = req.params;
  getForecasts(city, state).then(results => {
    res.status(200).send(results);
  });
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
