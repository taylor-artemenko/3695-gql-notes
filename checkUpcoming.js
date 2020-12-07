const cron = require('node-cron');
const moment = require('moment');
const Note = require('./models/note');
const Upcoming = require('./models/upcoming');

const checkUpcoming = () => {
  //const cronTab = '1 0 */1 * *'; //every day
  const cronTab = '*/10 * * * * *'; // every 10 minutes
  const todayDate = moment().format('YYYY-MM-DD');

  cron.schedule(cronTab, () => {
    console.log('running test');
    Note.find({ dueDate: todayDate }, (err, notes) => {
      if (err) {
        return console.error(err);
      }

      for (i = 0; i < notes.length; i++) {
        let upcoming = new Upcoming({
          title: notes[i].title,
          description: notes[i].description,
          contents: notes[i].content,
          priority: [i].priority,
          ownerID: notes[i].ownerID,
          image_url: notes[i].image_url,
          createdDate: notes[i].createdDate,
          dueDate: notes[i].dueDate,
          collabNames: notes[i].collabNames
        });

        upcoming.save();

      }
    });
  });
};

module.exports = {
  checkUpcoming: checkUpcoming
};
