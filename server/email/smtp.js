Meteor.startup(function() {
    if (process.env.MAIL_URL) {
        console.log("Found a MAIL_URL!");
        console.log(process.env.MAIL_URL);
    } else {
        console.log("ERROR: Did not find a MAIL_URL");
    }

    if (process.env.DROPBOX) {
        console.log("Found a DROPBOX!");
        console.log(process.env.DROPBOX);
        const dropbox = JSON.parse(process.env.DROPBOX).dropbox;
        console.log("JSON:");
        console.log(dropbox);
        console.log("meteor.settings:");
        console.log(Meteor.settings);
        Meteor.settings.dropbox = JSON.parse(process.env.DROPBOX).dropbox;
        console.log("Added dropbox:");
        console.log(Meteor.settings);
    } else {
        console.log("ERROR: Did not find a MAIL_URL");
    }


    var dropbox = Npm.require('dropbox');
    console.log(dropbox);
});
