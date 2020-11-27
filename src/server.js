const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const mongoose = require('mongoose');
const mongooseConf = require('../conf/mongooseConn.js');
const schema = require('../schema/schema');
const checkUpcoming = require('../checkUpcoming.js');
const serveless = require('serverless-http');

// Server setup
const app = express();
const port = process.env.PORT || 4000;

const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const conn = mongooseConf.conn;
mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
  console.log('connected to MongoDB database');
});

checkUpcoming.checkUpcoming();

router.use('/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

router.get('/', (req, res) => {
  res.json({ 
    message: 'this is the home page' 
  });
});

app.use('/.netlify/functions/server', router);

module.exports.handler = serveless(app);