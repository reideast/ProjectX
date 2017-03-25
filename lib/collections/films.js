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
        function createThumbnail(file, callback) {
            console.log("inside creating thumbnail function");
            console.log("file=");
            console.log(file);
            console.log(file._id);
            console.log(file.extension);

            let thumbnailInfo = {};
            thumbnailInfo.success = false;
            thumbnailInfo.path = "";
            thumbnailInfo.size = 0;
            thumbnailInfo.type = "image/gif";
            thumbnailInfo.extension = "gif";

            // TODO: in this function, write a new file to disk

            // Create thumbnail of video
            let filmAttributes = file; // TODO: rename
            let thumbnailPath = false;
            if (gm.isAvailable) {
                console.log("GM was available");

                // imageMagick = gm.subClass({ imageMagick: true });
                // console.log("imageMagick=")
                // console.log(imageMagick);

                console.log("gm=");
                console.log(gm);
                console.log("path=" + filmAttributes.path);

                // let finalSlaswh = filmAttributes.path.lastIndexOf('\\');
                // if (finalSlash === -1) {
                //     let finalSlash = filmAttributes.path.lastIndexOf('/');
                // }
                let ext = filmAttributes.path.lastIndexOf('.');
                // let filename = filmAttributes.path.substring(finalSlash + 1, ext);
                let filename = filmAttributes.path.substring(0, ext);
                console.log("filename=" + filename);
                thumbnailPath = filename + '.gif';

                // gm(filmAttributes.path).resize(300,300).write("output.jpg", function(err) {console.log("err=" + err)});
                gm(filmAttributes.path + '[10]').format(function(err, format) { // [100] is the frame number to grab
                    console.log("in .format(callback)");
                    if (err) {
                        console.log("err=");
                        console.log(err);
                        thumbnailPath = false;
                        console.log("Calling callback with FAILURE");
                        callback({success: false});
                    }
                    if (format) {
                        console.log("format=");
                        console.log(format);
                    }
                    console.log("finished with callback");
                }).write(thumbnailPath, function(err) {
                    console.log('in .write(callback)')
                    if (err) {
                        console.log("err=");
                        console.log(err);
                        thumbnailPath = false;
                        console.log("Calling callback with FAILURE");
                        callback({success: false});
                    }
                    console.log('fin with callback');

                    thumbnailInfo.success = true;
                    thumbnailInfo.path = thumbnailPath;
                    thumbnailInfo.size = 0;
                    thumbnailInfo.type = "thumbnail";
                    thumbnailInfo.extension = "gif";
                    callback(thumbnailInfo);
                })
                console.log("past gm()");

                // convert -quiet moviefile.mov[10] movieframe.gif

                // my $baz = FFmpeg::Thumbnail->new( { video => '/my/video/file.flv' } );
                // $baz->output_width( 640 );
                // $baz->output_height( 480 );
                // $baz->offset( 21 );
                // $baz->create_thumbnail( undef, '/my/first/thumbnail.png');
            } else {
                console.log("failed gm.isAvailable");
                thumbnailPath = false;
                console.log("Calling callback with FAILURE");
                callback({success: false});
            }
        }

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

        // var sourceFile = ffmpeg(fileRef.path).noProfile();
        // var formats = {
        // mp4: true,
        // gif: true
        // };
        // _.each(formats, function(convert, format) {
        var file, upd, version;
        // if (convert) {
        // file = _.clone(sourceFile);
        file = _.clone(fileRef);
        // version = file.someHowConvertVideoAndReturnFileData(format);
        createThumbnail(file, Meteor.bindEnvironment(function(thumbnailInfo) {
            // TODO: in this function, take the written file to disk and update the DB

            console.log("INSIDE CALLBACK: thumbnail function finished");

            if (thumbnailInfo.success) {

                    // upd = {
                    //     $set: {
                    //         'versions.gif': {
                    //             path:
                    //         }
                    //     }
                    // }
                    upd = {
                        $set: {}
                    };
                    upd['$set']['versions.' + 'thumbnail'] = {
                        path: thumbnailInfo.path,
                        size: thumbnailInfo.size,
                        type: thumbnailInfo.type,
                        extension: thumbnailInfo.extension
                    };
                    // return Videos.update(fileRef._id, upd);
                    Films.update(fileRef._id, upd);
            // }
                // });


                Meteor.call('filmInsert', fileRef, function(error, result) {
                        // display the error to the user and abort
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