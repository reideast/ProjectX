this.Videos = new Meteor.Files({
    storagePath: '/media', // if slash is first, will be on root of FILE SYSTEM: '/media',
    debug: true,
    collectionName: 'MeteorUploadFiles', //'videos',
    allowClientCode: false, // Disallow remove files from Client
    // namingFunction: function() {
    //     return "myFileName";
    // },
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 2147483648 && /mp4|avi|3gp/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload video, with size equal or less than 2GB';
        }
    },
    onAfterUpload: function (file) {
        console.log('DEBUG THIS:');
        console.log(this);
        console.log("DEBUG FILE:");
        console.log(file);
        console.log("DEBUG FILE.PATH:");
        console.log(file.path);

        // console.log("DEBUG ID:");
        // console.log(this._id);
        // doesn't work: // console.log(_id);
        // doesn't work: // console.log(this.userId()) <-- NOT A FUNCTION
        // doesn't work: // console.log(user._id) <-- user is not defined
        // doesn't work: // console.log(Meteor.userId()) <-- Exception in callback of async function: Error: Meteor.userId can only be invoked in method calls. Use this.userId in publish functions.
        // console.log(this.userId)
        // console.log(Meteor.users.find.fetch())
        // console.log(Meteor.users.findOne()._id)

        // Users.update({ _id: this._id }, {
        //     $set: {
        //         media: { hello: 'hello world!' }
        //     }
        // });

        var post = {
            file: file,
            path: file.path
        };

        Meteor.call('videoInsert', post, function(error, result) {
            // display the error to the user and abort
            if (error) {
                // return alert(error.reason);
                return console.log(error.reason);
            } else {
                // return alert("No error!");
                return console.log("No error!");
            }
            // Router.go('postPage', {_id: result._id});
        });
    }
});

if (Meteor.isServer) {
    Videos.denyClient();
    Meteor.publish('files.videos.all', function () {
        // return Videos.find().cursor;
        return Videos.collection.find({});
        // TODO: {user _id??}
    });
} else {
    Meteor.subscribe('files.videos.all');
    //  Meteor.subscribe('files.videos.all');
}

Meteor.methods({
    videoInsert: function(videoAttributes) {
        // check(Meteor.userId(), String);
        // check(videoAttributes, {
        //     title: String,
        //     url: String
        // });

        console.log("IN METHOD: file");
        console.log(videoAttributes.file);
        /*
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

        console.log("IN METHOD: path");
        console.log(videoAttributes.path);
        console.log("IN METHOD: if userId");
        if ('userId' in videoAttributes.file) {
            console.log("IN METHOD: _id");
            console.log(videoAttributes.file.userId);

            var user = Users.findOne({ _id: videoAttributes.file.userId});
            console.log("IN METHOD, Meteor.users.find({ _id: videoAttributes.file.userId}) ");
            console.log(user);
            console.log('IN METHOD, user._id');
            console.log(user._id);
            var video = {
                videoId: videoAttributes.file._id,
                submitted: new Date(),
                path: videoAttributes.path
            };
            var videoId = Users.update({ _id: user._id }, {
                $set: {
                    media: video,
                }
            });
        } else {
            console.log('User was not logged in');
        }


        return {
            _id: videoId
        };
    }
});