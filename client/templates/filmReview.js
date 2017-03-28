// https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management/with-blaze
Template.filmReview.onRendered(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
        self.subscribe('files.films.all');
        self.subscribe('privateMessages.all');
    });
});

Template.filmReview.helpers({
    userData: function() {
        // get data:
        let userFilm = Users.findOne({ _id: FlowRouter.getParam('userId') });
        if (userFilm) {
            return userFilm;
        } else {
            return {};
        }
    },
    film: function() {
        // since we're calling the helper {{.. film}} within a {{#with userData}} helper block,
        // "this" is set to the value returned from {{userData}} namely, the result of Users.findOne(url param userId)
        // so, we can search the Films collection for that user's submitted film without consulting the User collection again
        if (this.submittedFilm) {
            return Films.collection.findOne({ _id: this.submittedFilm.fileId});
        } else {
            return {};
        }
    },
    titlecase: function(str) {
        if (str) {
            return str.toLowerCase().split(' ').map((word) => (word.charAt(0).toUpperCase() + word.slice(1))).join(' '); // method from https://medium.freecodecamp.com/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27
        } else {
            return "";
        }
    },
    numPrivateMessages: function() {
        if (Meteor.userId() && this._id) { // in the data context of a filmReview template, this is a User document for that filmmaker
            var rooms = PrivateMessages.findOne({ to: this._id, from: Meteor.userId() });
            if (rooms) {
                return rooms.messages.length;
            } else {
                // no previously created conversation found, return nothing
                return '';
            }
        } else {
            console.log("ERROR: No user logged in, so cannot show messages count");
            return '';
        }
    },
    notSelfUser: function() {
        // this helper, called with {{#if notSelfUser }}, will hide html content if this user is viewing their own Film page
        if (Meteor.userId() && this._id) { // in the data context of a filmReview template, this is a User document for that filmmaker
            if (Meteor.userId() !== this._id) {
                return true;
            } else {
                return false;
            }
        }
    },
    hasReviewerChecked: function(val) {
        // TODO: make a helper that finds if the user has already voted, and select that radio button
        console.log('hasReviewerChecked');
        console.log(this);
        const filmmakerId = this._id;
        const reviewerId = Meteor.userId();
        // AUGH can't use the .$ operation in MiniMongo projections (yet): https://docs.meteor.com/api/collections.html
        // const existingReview = Users.findOne({
        //     _id: filmmakerId,
        //     'submittedFilm.ratings.reviewerId': reviewerId
        // },{
        //     fields: { // projection
        //         'submittedFilm.ratings.$': 1
        //     }
        // });
        const existingReview = Users.findOne({
            _id: filmmakerId,
            'submittedFilm.ratings.reviewerId': reviewerId
        });
        console.log("found:");
        console.log(existingReview);
        if (existingReview) {
            const ratingsArray = existingReview.submittedFilm.ratings;
            console.log("found rating=");
            console.log(ratingsArray);
            // CAN'T find the specific array item yet, so have to .forEach it!
            return ratingsArray.some((item) => {
                return (item.reviewerId == reviewerId) && (item.rating == val); // note: note using === because one could be a string where the other is a Number
            }) ? "checked" : "";
            console.log("Error: Should have found the user's review, since the query returned it.");
            // didn't find it, so return false
        } // else no review already submitted, do not check anything
        return "";
    }
    // TODO: move this to a #with context to avoid 3xQuery
});

Template.filmReview.events({
    'change .ratingRadio': function(e) {
        // note: don't need to verify that e.target.checked is true, because Meteor's event handling code seems to only call the 'change' event for the positively selected one

        // console.log("changed!");
        // console.log(e);
        // console.log(e);
        // console.log(e.target.parentNode.parentNode);

        // add visual class to ratings radio when selected
        $('.list-group-item').removeClass('active');
        $(e.target.parentNode.parentNode).addClass('active');

        // console.log("this");
        // console.log(this);
        // console.log("userId");
        // console.log(Meteor.userId());
        // console.log("rating");
        // console.log(e.target.value);
        const filmmakerId = this._id;
        const reviewerId = Meteor.userId();
        const rating = e.target.value;
        Meteor.call('setRating', filmmakerId, reviewerId, rating, function(error, result) {
            if (error) {
                sAlert.error("Rating failed: " + error.reason);
            } else {
                sAlert.success("Your rating has been counted!");
            }
        });
    }
});
