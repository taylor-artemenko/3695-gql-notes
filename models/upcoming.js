const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upcomingSchema = new Schema({
  title: String,
  description: String,
  contents: String,
  priority: String,
  ownerID: String,
  image_url: Array,
  createdDate: String,
  dueDate: String,
  collabNames: String
}, {collection: 'upcoming'});

module.exports = mongoose.model('Upcoming', upcomingSchema);
