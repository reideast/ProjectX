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

    // TODO: make a helper that finds if the user has already voted, and select that radio button
});

Template.filmReview.events({
    'change .ratingRadio': function(e) {
        // TODO: I need to do "if selected" here, don't I

        console.log("changed!");
        console.log(e.target.value);
        // console.log(e);
        // console.log(e.target.parentNode.parentNode);

        // add visual class to ratings radio when selected
        $('.list-group-item').removeClass('active');
        const elem = $(e.target);
        const label = $(e.target.parentNode.parentNode);
        // console.log(label);
        label.addClass('active');

        // TODO: update to database
    }
});
