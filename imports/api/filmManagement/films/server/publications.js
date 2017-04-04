import { Meteor } from 'meteor/meteor';
import '../films.js';

// always publishing all films, since there's no security needed around Read access to the files
Meteor.publish('files.films.all', function() {
    return Films.collection.find();
});

// unused:
// Meteor.publish('files.films.one', function (filmId) {
//     return Films.collection.find({ _id: filmId});
// });

// unused:
// Meteor.publish('files.films.userUploaded', function(userId) {
//     let user = Users.findOne({ _id: userId });
//     if (user) {
//         return Films.collection.find({ _id: user.uploadedFile.filmId});
//     } else {
//         console.log("Publish Error: No user with uploaded films with that id found");
//         return false;
//     }
// });
