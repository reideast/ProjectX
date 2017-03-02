this.Videos = new Meteor.Files({
    storagePath: '/media', // if slash is first, will be on root of FILE SYSTEM: '/media',
    debug: true,
    collectionName: 'Videos',
    allowClientCode: false, // Disallow remove files from Client
    onBeforeUpload: function (file) {
        // Allow upload files under 10MB, and only in png/jpg/jpeg formats
        if (file.size <= 2147483648 && /mp4|avi|3gp/i.test(file.extension)) {
            return true;
        } else {
            return 'Please upload video, with size equal or less than 2GB';
        }
    }
});

if (Meteor.isServer) {
    Videos.denyClient();
    Meteor.publish('files.videos.all', function () {
        return Videos.find().cursor;
    });
    //  Meteor.publish('files.videos.all', function () {
    //    return Videos.find().cursor;
    //  });

} else {

    Meteor.subscribe('files.videos.all');
    //  Meteor.subscribe('files.videos.all');
}