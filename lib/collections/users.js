//Users = new Meteor.Collection('users');
Users = Meteor.users;

if (Meteor.isServer) {
    Meteor.publish('users.one', function (userId) {
        return Users.find({ _id: userId });
    });

    Meteor.publish('users.withFilms', function() {
        return Users.find({
            submittedFilm: { $exists: true }
        });
    })
}
