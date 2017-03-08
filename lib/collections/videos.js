this.Films = new Meteor.Files({
    storagePath: '/films', // if slash is first, will be on root of FILE SYSTEM: '/media',
    debug: false,
    collectionName: 'films',
    // allowClientCode: false, // Disallow remove files from Client
    namingFunction: function() {
        if (Meteor.userId() != null) {
            let now = new Date();
            let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
            return 'film_id_' + Meteor.userId() + '_date_' + dateStr;
        } else {
            return 'invalidFilm-userNotLoggedIn';
        }
    },
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 2147483648 && /mp4|avi|3gp/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload film, with size equal or less than 2GB';
        }
    },
    onAfterUpload: function (file) {
//         console.log("LOGGED IN USER FROM METEOR.METHOD:");
//         console.log('Meteor.user()');
//         console.log(Meteor.user());
//         console.log('Meteor.userId()');
//         console.log(Meteor.userId());
//         console.log("this.userId");
//         console.log(this.userId);
//         /*
//         Meteor.user() - Get the current user record, or null if no user is logged in. A reactive data source.64
// Meteor.userId() - Get the current user id, or null if no user is logged in. A reactive data source.20
// this.userId - Access inside the publish function. The id of the logged-in user, or null if no user is logged in.16 and The id of the user that made this method call, or null if no user was logged in.8
// */
        // call the Meteor.method to insert video into user's document
        Meteor.call('filmInsert', file, function(error, result) {
            // display the error to the user and abort
            if (error) {
                console.log("Film insertion failed: " + error.reason);
                return "Film insertion failed: " + error.reason;
            } else {
                console.log("Film has been added to your user in the database");
                return true;
            }
        });
    }
});

// ****************** Publish and Subscribe to media for this user ******************
if (Meteor.isServer) {
    Films.denyClient();
    Meteor.publish('files.films.all', function () {
        // console.log("IN PUBLISH: this.userId=" + this.userId);
        if (this.userId != null) {
            // console.log("these are the videos for the logged in user:");
            // console.log(Videos.collection.find({userId: this.userId}));
            return Films.collection.find({userId: this.userId});
        } else {
            // console.log("No logged in user, no videos returned");
            return null;
        }
    });
} else {
    Meteor.subscribe('files.films.all');
}

// ****************** Save Uploaded File to User Collection ******************
Meteor.methods({
    filmInsert: function(filmAttributes) {
        /* object: filmAttributes
            IN METHOD: file
            { name: '2017-02-25 10.28.16.mp4',
            extension: 'mp4',
            path: '\\media\\mR2Je2hqJdmcii6Aq.mp4',
            meta: {},
            type: 'video/mp4',
            size: 26448338,
            versions:
            { original:
            { path: '\\media\\mR2Je2hqJdmcii6Aq.mp4',
            size: 26448338,
            type: 'video/mp4',
            extension: 'mp4' } },
            isVideo: true,
            isAudio: false,
            isImage: false,
            isText: false,
            isJSON: false,
            isPDF: false,
            _storagePath: '\\media',
            _downloadRoute: '/cdn/storage',
            _collectionName: 'MeteorUploadFiles',
            _id: 'mR2Je2hqJdmcii6Aq',
            userId: 'eC2AwLkYAE4GfADJp',
            public: false }
        */

        if ('userId' in filmAttributes) {
            var user = Users.findOne({ _id: filmAttributes.userId});
            var film = {
                // Information to save to 'users' collection
                // Note filmId can be used with Videos.remove({_id}) to delete from file system!
                filmId: filmAttributes._id,
                submitted: new Date(),
                path: filmAttributes.path // path is the actual path on the file system
            };
            try {
                var filmId = Users.update({ _id: user._id }, {
                    // note: using $set here, not $push to an array, so each user can only have one film
                    $push: {
                        uploadedFile: film
                    }
                });
                // on server or in methods, the update method blocks until either succssful, or an exception is thrown: https://docs.meteor.com/api/collections.html#Mongo-Collection-update
                return {
                    _id: filmId
                };
            } catch (e) {
                throw new Meteor.Error("Exception while updating user collection!");
            }
        } else {
            console.log('User was not logged in, will not save film!');
            Films.remove({ _id: filmAttributes._id }); // because of Meteor-Files package, this will remove video from both mongo and local file system!
            throw new Meteor.Error("User was not logged in, will not save film!");
        }
    },
    filmSubmit: function(filmData) {
        // TODO: after submission, delete any videos in user.uploadedVideo[] EXCEPT for selected one
        // so each user can only have one saved film

        console.log("INSIDE METHOD");
        // console.log("filmData");
        // console.log(filmData);

        // make sure fileId is inside Films AND users.uploadedFiles
        // console.log(this.userId);
        let isFilmInUser = Users.find({
            _id: this.userId,
            uploadedFile: { $elemMatch: { filmId: filmData.fileId}}
        }).count() === 1;
        if (isFilmInUser) {
            console.log("FOUND USER W/ FILM")

            // update user with $set submittedFilm
            Users.update({ _id: this.userId}, {
                $set: {
                    submittedFilm: filmData
                }
            });
            console.log("UPDATED USER COLLECTION W/ submittedFilm")

            // remove all extra files from Users.uploadedFiles
            // and, for each one removed, remove it extra files from Films.remove() to delete it from disk
            let savedFilmId = filmData.fileId;
            Users.update({ _id: this.userId }, {
                $pull: {
                    uploadedFile: {
                        _id: { $ne: savedFilmId }
                    }
                }
            });
            console.log("PULLED FROM uploadedFile ARRAY")
            Films.remove({
                userId: this.userId,
                _id: { $ne: savedFilmId }
            }); // because of Meteor-Files package, this will remove video from both mongo and local file system!
            console.log("REMOVED FROM Films COLLECTION")
        } else {
            throw new Meteor.Error("Film was not uploaded to this user")
        }

    }

});