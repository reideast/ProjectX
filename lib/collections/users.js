//Users = new Meteor.Collection('users');
Users = Meteor.users;

if (Meteor.isServer) {
    Meteor.publish('users.loggedIn', function() {
        return Users.find({ _id: this.userId });
    });

    Meteor.publish('users.all', function (userId) {
        return Users.find({});
    });

    Meteor.publish('users.withFilms', function() {
        return Users.find({
            submittedFilm: { $exists: true }
        });
    })
}
