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

if (Meteor.isServer) {
    Meteor.methods({
        setRating: function(filmmakerId, reviewerId, rating) {
            console.log("METHOD: setRating");
            console.log("arg");
            console.log(arguments);
            if (rating == 0 ||  rating == -1 || rating == 1) {
                if (reviewerId === this.userId) {
                    const userObj = Users.findOne({
                        _id: filmmakerId
                    });
                    if (userObj) {
                        if (userObj.submittedFilm) {
                            // Note: can't use a simple $addToSet, because I'm pushing a document: {reviwerId, rating}, and that document won't be the SAME value if rating changes, therefore would be a duplicate insert
                            // Also, can't do a simple "upsert", because that doesn't work with the array.$ positional operator (see mongo docs)
                            // So, all I have to search first, then update OR insert
                            // I could have also 1. $pull 2. $push, but I feel like a $pull operation is more costly
                            const existingReview = Users.findOne({
                                _id: filmmakerId,
                                'submittedFilm.ratings.reviewerId': reviewerId
                            });
                            console.log('existingReview=');
                            console.log(existingReview);
                            if (existingReview) {
                                Users.update({
                                    _id: filmmakerId,
                                    'submittedFilm.ratings.reviewerId': reviewerId
                                }, {
                                    $set: {
                                        'submittedFilm.ratings.$.rating': rating
                                    }
                                });
                            } else {
                                Users.update({
                                    _id: filmmakerId,
                                }, {
                                    $push: {
                                        'submittedFilm.ratings': {
                                            reviewerId: reviewerId,
                                            rating: rating
                                        }
                                    }
                                });
                            }
                        } else {
                            console.log("Error: That user has not submitted a film to rate.");
                            throw new Meteor.Error(500, "That user has not submitted a film to rate.");
                        }
                    } else {
                        console.log("Error: Did not find that film to rate.");
                        throw new Meteor.Error(500, "Did not find that film to rate.");
                    }
                } else {
                    console.log("Error: The logged-in user did not submit the rating");
                    throw new Meteor.Error(500, "The logged-in user did not submit the rating");
                }
            } else {
                console.log("Error: That was not a valid rating value.");
                throw new Meteor.Error(500, "That was not a valid rating value.");
            }
        }
    });
}
