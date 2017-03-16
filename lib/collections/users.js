//Users = new Meteor.Collection('users');
Users = Meteor.users;

if (Meteor.isServer) {
    Meteor.publish('users.one', function (userId) {
        return Users.find({ _id: userId });
    });
}
