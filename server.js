const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const mongoose = require('mongoose');
const mongooseConf = require('./conf/mongooseConn.js');
const schema = require('./schema/schema');
const checkUpcoming = require('./checkUpcoming.js');

// Server setup
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const conn = mongooseConf.conn;
mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
  console.log('connected to MongoDB database');
});

checkUpcoming.checkUpcoming();

app.use('/graphql',
  graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

app.get('/', (req, res) => {
  res.json({ 
    message: 'this is the home page' 
  });
});

app.listen(port, () => {
  console.log('app is listening on port ' + port);
});
