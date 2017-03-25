this.Films = new Meteor.Files({
    // storagePath: '/films', // if slash is first, will be on root of FILE SYSTEM: '/media', default is .meteor/assets/app/uploads
    debug: false,
    collectionName: 'films',
    // allowClientCode: false, // Disallow remove files from Client
    namingFunction: function() {
        if (Meteor.userId() != null) {
            let now = new Date();
            let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
            return 'userid_' + Meteor.userId() + '_date_' + dateStr;
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
    onAfterUpload: function (fileRef) {
        // this function is only used within onAfterUpload(), so I encapsulated it here
        function createThumbnail(file, callback) {
            // Create thumbnail of video
            // only if the graphicsMagick package is properly installed
            if (gm.isAvailable) {
                // imageMagick = gm.subClass({ imageMagick: true });

                // make new filename with image extension
                let ext = file.path.lastIndexOf('.');
                let filename = file.path.substring(0, ext);
                console.log("filename=" + filename);
                let thumbnailPath = filename + '.gif';

                // do conversion
                let frameNumberToGrab = 10;
                gm(file.path + '[' + frameNumberToGrab + ']').format(function(err, format) {
                    // if (err) {
                    // }
                }).write(thumbnailPath, function(err) {
                    if (err) {
                        console.log("Error: Conversion failed to run");
                        callback({success: false, message: 'Conversion failed to run'});
                    } else {
                        let thumbnailInfo = {};
                        thumbnailInfo.success = true;
                        thumbnailInfo.path = thumbnailPath;
                        thumbnailInfo.size = 0;
                        thumbnailInfo.type = "image/gif";
                        thumbnailInfo.extension = "gif";
                        callback(thumbnailInfo);
                    }
                })
            } else {
                console.log("Error: Thumbnail conversion package is not available");
                callback({success: false, message: 'Thumbnail conversion package is not available'});
            }
        }

        // Begin actual code execution here
        var file, upd, version;
        file = _.clone(fileRef);
        createThumbnail(file, Meteor.bindEnvironment(function(thumbnailInfo) {
            // This callback executes after createThumbnail() is finished
            if (thumbnailInfo.success) {
                    Films.update(fileRef._id, {
                        $set: {
                            'versions.thumbnail': {
                                path: thumbnailInfo.path,
                                size: thumbnailInfo.size,
                                type: thumbnailInfo.type,
                                extension: thumbnailInfo.extension
                            }
                        }
                    });
            // }
                // });


                Meteor.call('filmInsert', fileRef, function(error, result) {
                        // display the error to the user and abort
                        // TODO: make this return to the film submission page and then enable submit button
                        if (error) {
                            console.log("Film insertion failed: " + error.reason);
                            return "Film insertion failed: " + error.reason;
                        } else {
                            console.log("Film has been added to your user in the database");
                            return true;
                        }
                    });
            } // end thumbnailInfo.success
        } // end createThumbnail's callback
        ) // end bindEnvironment()
    );  // end call to createThumbnail
    } // end onAfterUpload
}); // end creating new Mongo Files collection

// ****************** Publish and Subscribe to media for this user ******************
if (Meteor.isServer) {
    Films.denyClient();
    Meteor.publish('files.films.all', function() {
        return Films.collection.find({});
    });

    // TODO: now that the above is changed, the FilmSubmission page displays ALL USERS' films
    // Meteor.publish('files.films.current', function () {
    //     // console.log("IN PUBLISH: this.userId=" + this.userId);
    //     if (this.userId != null) {
    //         // console.log("these are the videos for the logged in user:");
    //         // console.log(Videos.collection.find({userId: this.userId}));
    //         return Films.collection.find({userId: this.userId});
    //     } else {
    //         // console.log("No logged in user, no videos returned");
    //         return null;
    //     }
    // });

    Meteor.publish('files.films.one', function (filmId) {
        return Films.collection.find({ _id: filmId});
    });
} else {
    // Meteor.subscribe('files.films.current');
    Meteor.subscribe('files.films.all');
}

// ****************** Save Uploaded File to User Collection ******************
if (Meteor.isServer) {
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
                user = Users.findOne({ _id: filmAttributes.userId});
                var film = {
                    // Information to save to 'users' collection
                    // Note filmId can be used with Videos.remove({_id}) to delete from file system!
                    filmId: filmAttributes._id,
                    submitted: new Date(),
                    path: filmAttributes.path, // path is the actual path on the file system
                    // thumbnailPath: thumbnailPath
                };
                try {
                    var filmId = Users.update({ _id: user._id }, {
                        // note: using $set here, not $push to an array, so each user can only have one film
                        $push: {
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
            // console.log("INSIDE METHOD");
            // make sure fileId is inside Films AND users.uploadedFiles
            // console.log(this.userId);
            let userObj = Users.find({
                _id: this.userId,
                uploadedFile: { $elemMatch: { filmId: filmData.fileId}}
            });
            let isFound = userObj.count() === 1;
            if (isFound) {
                // console.log("FOUND USER W/ FILM")
                let foundObj = Films.findOne({ _id: filmData.fileId }).fetch()[0];
                filmData.path = foundObj.path; // insert saved path into filmData object

                // console.log(userObj);
                // console.log(userObj.fetch()[0]);
                // console.log(userObj.fetch()[0].uploadedFile);

                // let uploadedFilmObj = Users.findOne({ 'uploadedFile.filmId': filmData.fileId }, {'uploadedFile.$': 1});
                // console.log(uploadedFilmObj.uploadedFile);
                // console.log(uploadedFilmObj.uploadedFile[0]);
                // console.log(uploadedFilmObj.uploadedFile[0].thumbnailPath);
                // filmData.thumbnailPath = uploadedFilmObj.uploadedFile[0].thumbnailPath;

                // update user with $set submittedFilm
                Users.update({ _id: this.userId}, {
                    $set: {
                        submittedFilm: filmData
                    }
                });
                // console.log("UPDATED USER COLLECTION W/ submittedFilm")

                // remove all files from Users.uploadedFiles
                // and, for each one removed, remove it extra files from Films.remove() to delete it from disk
                let savedFilmId = filmData.fileId;
                Users.update({ _id: this.userId }, {
                    $pull: {
                        uploadedFile: {} // filmId: { $ne: savedFilmId } }
                    }
                });
                // console.log("PULLED FROM uploadedFile ARRAY")
                Films.remove({
                    userId: this.userId,
                    _id: { $ne: savedFilmId }
                }); // because of Meteor-Files package, this will remove video from both mongo and local file system!
                // console.log("REMOVED FROM Films COLLECTION")
            } else {
                console.log("Error: The logged-in user did not upload that film.");
                throw new Meteor.Error(500, "Film was not uploaded to this user");
            }

        }

    });
}