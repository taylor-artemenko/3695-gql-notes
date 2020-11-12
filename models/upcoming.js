const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upcomingSchema = new Schema({
  title: String,
  description: String,
  contents: String,
  priority: String,
  userID: String,
  image_url: String,
  dueDate: String
}, {collection: 'upcoming'});

module.exports = mongoose.model('Upcoming', upcomingSchema);
