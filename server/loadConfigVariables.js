if (Meteor.isServer) {
    Meteor.startup(function() {
        if (process.env.MAIL_URL) {
            console.log("Startups success: Found a MAIL_URL");
            // email package loads from process.env already
        } else {
            console.log("STARTUP ERROR: Did not find a MAIL_URL");
        }

        if (process.env.DROPBOX) {
            console.log("Startups success: Found a DROPBOX");
            // import to the proper spot for Files package
            Meteor.settings.dropbox = JSON.parse(process.env.DROPBOX).dropbox;
            console.log("DEBUG Meteor.settings.dropbox:");
            console.log(Meteor.settings.dropbox);
        } else {
            console.log("STARTUP ERROR: Did not find a DROPBOX");
        }
    });
}
