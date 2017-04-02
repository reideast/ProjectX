var Dropbox, Request, bound, client, fs, Collections = {};
if (Meteor.isServer) {
    console.log("Loading NPM libraries:");
    Dropbox = Npm.require('dropbox');
    Request = Npm.require('request');
    fs = Npm.require('fs');
    console.log("DROPBOX:" + Dropbox + "REQUEST:" + Request + "FS:" + fs);

    // define this alias to Meteor.bindEnvironment that is used by Files scripts
    bound = Meteor.bindEnvironment(function(callback) {
        return callback();
    });

    console.log("Has Dropbox config been loaded??");
    console.log(Meteor.settings.dropbox);
    if (Meteor.settings.dropbox) {
        // create Dropbox worker
        client = new Dropbox.Client({
            key: Meteor.settings.dropbox.key,
            secret: Meteor.settings.dropbox.secret,
            token: Meteor.settings.dropbox.token
        });
    } else {
        console.log("STARTUP ERROR: Dropbox config was not loaded to Meteor");
    }
}

this.Films = new Meteor.Files({
    // storagePath: '/films', // if slash is first, will be on root of FILE SYSTEM: '/media', default is .meteor/assets/app/uploads
    debug: false,
    collectionName: 'films',
    namingFunction: function() {
        if (Meteor.userId() != null) {
            let now = new Date();
            let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '_' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
            return Meteor.userId() + '_' + dateStr;
        } else {
            return 'invalidFilm-userNotLoggedIn'; // should never happen because of other validation
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
        // call createThumbnail function (defined just below)
        createThumbnail(fileRef,
            Meteor.bindEnvironment(function(thumbnailInfo) { // bindEnvironment is needed because there is Meteor code within a callback (namely Meteor.call())
                // This callback executes after createThumbnail() is finished
                if (thumbnailInfo.success) {
                    // since the film has already been written to the Films collection, update() it with a thumbnail
                    // save the "subversion": https://github.com/VeliovGroup/Meteor-Files/wiki/Create-and-Manage-Subversions
                    Films.update(fileRef._id, { $set: {
                        'versions.thumbnail': {
                            path: thumbnailInfo.path,
                            type: thumbnailInfo.type,
                            extension: thumbnailInfo.extension
                        }
                    }});

                    // in addition to saving the film to the Films collection, call the server-side function to save the film to the User's collection
                    Meteor.call('filmSaveAsUsersUploadedFile', fileRef, function(error, result) {
                        if (error) {
                            console.log("Film insertion failed: " + error.reason);
                        }
                    });
                } else { // .success = false
                    console.log(thumbnailInfo.message || "No error message returned from thumbnail function.");
                }
            }) // end createThumbnail's callback
        );  // end call to createThumbnail

        // this function is only used within onAfterUpload(), so I encapsulated it here
        function createThumbnail(file, callback) {
            // Create thumbnail of video
            if (gm.isAvailable) { // only if the graphicsMagick package is properly installed
                // make new filename with image extension
                let thumbnailPath = file.path.substring(0, file.path.lastIndexOf('.')) + '.jpg';

                // do conversion
                let frameNumberToGrab = 10;
                gm(file.path + '[' + frameNumberToGrab + ']').format(function(err, format) {}).write(thumbnailPath, function(err) {
                    if (!err) {
                        callback({
                            success: true,
                            path: thumbnailPath,
                            type: "image/jpeg",
                            extension: "jpg"
                        });
                    } else {
                        callback({success: false, message: 'Conversion failed to run'});
                    }
                });
            } else {
                callback({success: false, message: 'Thumbnail conversion package is not available'});
            }
        }
    } // end onAfterUpload
}); // end creating new Mongo Files collection

// ****************** Publish and Subscribe to media for this user ******************
if (Meteor.isServer) {
    Films.denyClient();

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
}

// ****************** Save Uploaded File to User Collection ******************
if (Meteor.isServer) {
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
}
