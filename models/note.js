const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  title: String,
  description: String,
  contents: String,
  priority: String,
  ownerID: String,
  image_url: Array,
  createdDate: String,
  dueDate: String,
  collabNames: String
});

module.exports = mongoose.model('Note', noteSchema);
