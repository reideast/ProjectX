import { Meteor } from 'meteor/meteor';

var Dropbox, Request, bound, client, fs, Collections = {};
if (Meteor.isServer) {
    console.log("Loading NPM libraries:");
    Dropbox = Npm.require('dropbox');
    Request = Npm.require('request');
    fs = Npm.require('fs');
    console.log("Has Npm properly loaded? DROPBOX:" + Dropbox + "REQUEST:" + Request + "FS:" + fs);

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

if (Meteor.isServer) {
    // TODO: can this go in the server/publications.js file? or can it be client & server code?
    Films.denyClient();
}
