import { Meteor } from 'meteor/meteor';
import '../users/users.js';

import './films.js'; // TODO: once films.js is properly in export-style, this line should change to: import { Films } from './films.js';

// ****************** Save Uploaded File to User Collection ******************
Meteor.methods({
    filmSaveAsUsersUploadedFile: function(filmAttributes) {
        if ('userId' in filmAttributes) {
            user = Users.findOne({ _id: filmAttributes.userId});
            var film = {
                // Information to save to 'users' collection
                filmId: filmAttributes._id,
                submitted: new Date(),
            };
            try {
                var filmId = Users.update({ _id: user._id }, {
                    // note: using $set here, not $push to an array, so each user can only have one film
                    $set: {
                        uploadedFile: film
                    }
                });
                // on server or in methods, the update method blocks until either succssful, or an exception is thrown: https://docs.meteor.com/api/collections.html#Mongo-Collection-update
                return { _id: filmId };
            } catch (e) {
                console.log("Caught error: " + e);
                throw new Meteor.Error(500, "Exception while updating user collection!");
            }
        } else {
            console.log('User was not logged in, will not save film!');
            Films.remove({ _id: filmAttributes._id }); // because of Meteor-Files package, this will remove video from both mongo and local file system!
            throw new Meteor.Error(500, "User was not logged in, will not save film!");
        }
    },

    filmSubmit: function(filmData) {
        // make sure fileId is inside Films AND users.uploadedFile
        let userObj = Users.find({
            _id: this.userId,
            'uploadedFile.filmId': filmData.fileId
        });
        let isFound = userObj.count() === 1;
        if (isFound) {
            let foundObj = Films.findOne({ _id: filmData.fileId }).fetch()[0];

            // update user with $set submittedFilm
            Users.update({ _id: this.userId}, {
                $set: {
                    submittedFilm: filmData
                }
            });

            // remove all files from Users.uploadedFile
            Users.update({ _id: this.userId }, {
                $unset: {
                    uploadedFile: 1
                }
            });
            // remove extra files using Films.remove(). Because of Meteor-Files package, this will remove video from both mongo and local file system!
            Films.remove({
                userId: this.userId,
                _id: { $ne: filmData.fileId }
            });
        } else {
            console.log("Error: The logged-in user did not upload that film.");
            throw new Meteor.Error(500, "Film was not uploaded to this user");
        }
    },

    filmUpdate: function(filmData) {
        // make sure fileId is inside Films AND users.uploadedFile
        let userObj = Users.find({
            _id: this.userId,
        });
        let isFound = userObj.count() === 1;
        if (isFound) {
            // update user with $set submittedFilm
            Users.update({ _id: this.userId}, {
                $set: {
                    'submittedFilm.title': filmData.title,
                    'submittedFilm.genre': filmData.genre,
                    'submittedFilm.length': filmData.length,
                    'submittedFilm.description': filmData.description
                }
            });
        } else {
            console.log("Error: The logged-in user did not upload that film.");
            throw new Meteor.Error(500, "Film was not uploaded to this user");
        }
    }
});
