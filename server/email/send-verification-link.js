Meteor.methods({
    sendVerificationLink() {
        let userId = Meteor.userId();
        if ( userId ) {
            return Accounts.sendVerificationEmail( userId );
        }
    }
});

Accounts.config({
    sendVerificationEmail: true
});
