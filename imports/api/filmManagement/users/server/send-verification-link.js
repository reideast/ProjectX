import { Meteor } from 'meteor/meteor';
// TODO: do we need an import for Accounts?

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
