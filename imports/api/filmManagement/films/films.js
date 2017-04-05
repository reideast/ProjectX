import { Meteor } from 'meteor/meteor';

var Dropbox, Request, bound, client, fs, Collections = {};
var useDropBox = false;
if (Meteor.isServer) {
    // define this alias to Meteor.bindEnvironment that is used by Files scripts
    bound = Meteor.bindEnvironment(function(callback) {
        return callback();
    });

    console.log("DEBUG: Has Dropbox config been loaded??");
    // console.log(Meteor.settings.dropbox);
    if (Meteor.settings.dropbox) {
        console.log("DEBUG: Yes");

        useDropBox = true;
        console.log("DEBUG: Loading NPM libraries:");
        Dropbox = Npm.require('dropbox');
        Request = Npm.require('request');
        fs = Npm.require('fs');
        console.log("DEBUG: Has Npm properly loaded? DROPBOX:" + Dropbox + "REQUEST:" + Request + "FS:" + fs);

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
        if (file.size <= 1024 * 1024 * 256 && /mp4|avi|3gp/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload film, with size equal or less than 256MB' + (filesize(file.size));
        }
    },

    downloadCallback(fileObj) {
        if (this.params && this.params.query && this.params.query.download === 'true') {
            Films.update(fileObj._id, {
                $inc: {
                    'meta.downloads': 1
                }
            });
        }
        return true;
    },

    interceptDownload(http, fileRef, version) {
        if (useDropBox) {
            const path = (fileRef && fileRef.versions && fileRef.versions[version] && fileRef.versions[version].meta && fileRef.versions[version].meta.pipeFrom) ? fileRef.versions[version].meta.pipeFrom : void 0;
            if (path) {
                // If file is successfully moved to Storage
                // We will pipe request to Storage
                // So, original link will stay always secure

                // To force ?play and ?download parameters
                // and to keep original file name, content-type,
                // content-disposition and cache-control
                // we're using low-level .serve() method
                this.serve(http, fileRef, fileRef.versions[version], version, Request({
                    url: path,
                    headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
                }));
                return true;
            }
            // While file is not yet uploaded to Storage
            // We will serve file from FS
            return false;
        }
        return false;
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

// if (Meteor.isServer) {
//     // TODO: can this go in the server/publications.js file? or can it be client & server code?
//     Films.denyClient();
// }
if (Meteor.isServer) {
    Films.denyClient();
    Films.on('afterUpload', function(fileRef) {
        if (useDropBox) {
            const makeUrl = (stat, fileRef, version, triesUrl = 0) => {
                client.makeUrl(stat.path, {
                    long: true,
                    downloadHack: true
                }, (error, xml) => {
                    bound(() => {
                        // Store downloadable link in file's meta object
                        if (error) {
                            if (triesUrl < 10) {
                                Meteor.setTimeout(() => {
                                    makeUrl(stat, fileRef, version, ++triesUrl);
                                }, 2048);
                            } else {
                                console.error(error, {
                                    triesUrl: triesUrl
                                });
                            }
                        } else if (xml) {
                            const upd = { $set: {} };
                            upd['$set']['versions.' + version + '.meta.pipeFrom'] = xml.url;
                            upd['$set']['versions.' + version + '.meta.pipePath'] = stat.path;
                            this.collection.update({
                                _id: fileRef._id
                            }, upd, (error) => {
                                if (error) {
                                    console.error(error);
                                } else {
                                    // Unlink original files from FS
                                    // after successful upload to DropBox
                                    this.unlink(this.collection.findOne(fileRef._id), version);
                                }
                            });
                        } else {
                            if (triesUrl < 10) {
                                Meteor.setTimeout(() => {
                                    // Generate downloadable link
                                    makeUrl(stat, fileRef, version, ++triesUrl);
                                }, 2048);
                            } else {
                                console.error("client.makeUrl doesn't returns xml", {
                                    triesUrl: triesUrl
                                });
                            }
                        }
                    });
                });
            };

            const writeToDB = (fileRef, version, data, triesSend = 0) => {
                // DropBox already uses random URLs
                // No need to use random file names
                client.writeFile(fileRef._id + '-' + version + '.' + fileRef.extension, data, (error, stat) => {
                    bound(() => {
                        if (error) {
                            if (triesSend < 10) {
                                Meteor.setTimeout(() => {
                                    // Write file to DropBox
                                    writeToDB(fileRef, version, data, ++triesSend);
                                }, 2048);
                            } else {
                                console.error(error, {
                                    triesSend: triesSend
                                });
                            }
                        } else {
                            makeUrl(stat, fileRef, version);
                        }
                    });
                });
            };

            const readFile = (fileRef, vRef, version, triesRead = 0) => {
                fs.readFile(vRef.path, (error, data) => {
                    bound(() => {
                        if (error) {
                            if (triesRead < 10) {
                                readFile(fileRef, vRef, version, ++triesRead);
                            } else {
                                console.error(error);
                            }
                        } else {
                            writeToDB(fileRef, version, data);
                        }
                    });
                });
            };

            sendToStorage = (fileRef) => {
                _.each(fileRef.versions, (vRef, version) => {
                    readFile(fileRef, vRef, version);
                });
            };
        } else if (useS3) {
            sendToStorage = (fileRef) => {
                _.each(fileRef.versions, (vRef, version) => {
                    // We use Random.id() instead of real file's _id
                    // to secure files from reverse engineering
                    // As after viewing this code it will be easy
                    // to get access to unlisted and protected files
                    const filePath = 'files/' + (Random.id()) + '-' + version + '.' + fileRef.extension;
                    client.putFile(vRef.path, filePath, (error) => {
                        bound(() => {
                            if (error) {
                                console.error(error);
                            } else {
                                const upd = { $set: {} };
                                upd['$set']['versions.' + version + '.meta.pipeFrom'] = Meteor.settings.s3.cfdomain + '/' + filePath;
                                upd['$set']['versions.' + version + '.meta.pipePath'] = filePath;
                                this.collection.update({
                                    _id: fileRef._id
                                }, upd, (error) => {
                                    if (error) {
                                        console.error(error);
                                    } else {
                                        // Unlink original files from FS
                                        // after successful upload to AWS:S3
                                        this.unlink(this.collection.findOne(fileRef._id), version);
                                    }
                                });
                            }
                        });
                    });
                });
            };
        }

        if (/png|jpe?g/i.test(fileRef.extension || '')) {
            _app.createThumbnails(this, fileRef, (fileRef, error) => {
                if (error) {
                    console.error(error);
                }
                if (useDropBox || useS3) {
                    sendToStorage(this.collection.findOne(fileRef._id));
                }
            });
        } else {
            if (useDropBox || useS3) {
                sendToStorage(fileRef);
            }
        }
    });

    // This line now commented due to Heroku usage
    // Films.collection._ensureIndex {'meta.expireAt': 1}, {expireAfterSeconds: 0, background: true}

    // Intercept FileCollection's remove method
    // to remove file from DropBox or AWS S3
    if (useDropBox || useS3) {
        _origRemove = Films.remove;
        Films.remove = function(search) {
            const cursor = this.collection.find(search);
            cursor.forEach((fileRef) => {
                _.each(fileRef.versions, (vRef) => {
                    if (vRef && vRef.meta && vRef.meta.pipePath != null) {
                        if (useDropBox) {
                            // DropBox usage:
                            client.remove(vRef.meta.pipePath, (error) => {
                                bound(() => {
                                    if (error) {
                                        console.error(error);
                                    }
                                });
                            });
                        } else {
                            // AWS:S3 usage:
                            client.deleteFile(vRef.meta.pipePath, (error) => {
                                bound(() => {
                                    if (error) {
                                        console.error(error);
                                    }
                                });
                            });
                        }
                    }
                });
            });
            // Call original method
            _origRemove.call(this, search);
        };
    }

    // Remove all files on server load/reload, useful while testing/development
    // Meteor.startup -> Films.remove {}

    // Remove files along with MongoDB records two minutes before expiration date
    // If we have 'expireAfterSeconds' index on 'meta.expireAt' field,
    // it won't remove files themselves.
    Meteor.setInterval(() => {
        Films.remove({
            'meta.expireAt': {
                $lte: new Date(+new Date() + 120000)
            }
        }, _app.NOOP);
    }, 120000);

    Meteor.publish('latest', function(take = 10, userOnly = false) {
        check(take, Number);
        check(userOnly, Boolean);

        let selector;
        if (userOnly && this.userId) {
            selector = {
                userId: this.userId
            };
        } else {
            selector = {
                $or: [
                    {
                        'meta.unlisted': false,
                        'meta.secured': false,
                        'meta.blamed': {
                            $lt: 3
                        }
                    }, {
                        userId: this.userId
                    }
                ]
            };
        }

        return Films.find(selector, {
            limit: take,
            sort: {
                'meta.created_at': -1
            },
            fields: {
                _id: 1,
                name: 1,
                size: 1,
                meta: 1,
                type: 1,
                isPDF: 1,
                isText: 1,
                isJSON: 1,
                isVideo: 1,
                isAudio: 1,
                isImage: 1,
                userId: 1,
                'versions.thumbnail40.extension': 1,
                'versions.preview.extension': 1,
                extension: 1,
                _collectionName: 1,
                _downloadRoute: 1
            }
        }).cursor;
    });

    Meteor.publish('file', function(_id) {
        check(_id, String);
        return Films.find({
            $or: [
                {
                    _id: _id,
                    'meta.secured': false
                }, {
                    _id: _id,
                    'meta.secured': true,
                    userId: this.userId
                }
            ]
        }, {
            fields: {
                _id: 1,
                name: 1,
                size: 1,
                type: 1,
                meta: 1,
                isPDF: 1,
                isText: 1,
                isJSON: 1,
                isVideo: 1,
                isAudio: 1,
                isImage: 1,
                extension: 1,
                'versions.preview.extension': 1,
                _collectionName: 1,
                _downloadRoute: 1
            }
        }).cursor;
    });

    Meteor.methods({
        filesLenght(userOnly = false) {
            check(userOnly, Boolean);

            let selector;
            if (userOnly && this.userId) {
                selector = {
                    userId: this.userId
                };
            } else {
                selector = {
                    $or: [
                        {
                            'meta.unlisted': false,
                            'meta.secured': false,
                            'meta.blamed': {
                                $lt: 3
                            }
                        }, {
                            userId: this.userId
                        }
                    ]
                };
            }
            return Films.find(selector).count();
        },
        unblame(_id) {
            check(_id, String);
            Films.update({
                _id: _id
            }, {
                $inc: {
                    'meta.blamed': -1
                }
            }, _app.NOOP);
            return true;
        },
        blame(_id) {
            check(_id, String);
            Films.update({
                _id: _id
            }, {
                $inc: {
                    'meta.blamed': 1
                }
            }, _app.NOOP);
            return true;
        },
        changeAccess(_id) {
            check(_id, String);
            if (Meteor.userId()) {
                const file = Films.findOne({
                    _id: _id,
                    userId: Meteor.userId()
                });

                if (file) {
                    Films.update(_id, {
                        $set: {
                            'meta.unlisted': file.meta.unlisted ? false : true
                        }
                    }, _app.NOOP);
                    return true;
                }
            }
            throw new Meteor.Error(401, 'Access denied!');
        },
        changePrivacy(_id) {
            check(_id, String);
            if (Meteor.userId()) {
                const file = Films.findOne({
                    _id: _id,
                    userId: Meteor.userId()
                });

                if (file) {
                    Films.update(_id, {
                        $set: {
                            'meta.unlisted': true,
                            'meta.secured': file.meta.secured ? false : true
                        }
                    }, _app.NOOP);
                    return true;
                }
            }
            throw new Meteor.Error(401, 'Access denied!');
        }
    });
}