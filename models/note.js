const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: String,
  description: String,
  contents: String,
  priority: String,
  userID: String,
  image_url: String
});

module.exports = mongoose.model('Note', noteSchema);
