// https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management/with-blaze
Template.filmReview.onRendered(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
        self.subscribe('files.films.all');
        self.subscribe('privateMessages.all');
        // let postId = FlowRouter.current().params._id;
        self.subscribe( 'post', FlowRouter.getParam('userId') );
        self.subscribe( 'comments' );
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
        const reviewerId = Meteor.userId();
        if (reviewerId) {
            const ratingsArray = this.submittedFilm.ratings;
            const filtered = ratingsArray.filter((item) => {
                return item.reviewerId == reviewerId;
            });
            if (filtered.length === 1) {
                return (filtered[0].rating == val);
            } else {
                console.log("Info: No review yet submitted");
            }
        }
        return false;
    },
    reviewScore: function() {
        return this.submittedFilm.ratingScore;
    }
});

Template.filmReview.events({
    'change .ratingRadio': function(e) {
        // note: don't need to verify that e.target.checked is true, because Meteor's event handling code seems to only call the 'change' event for the positively selected one

        // add visual class to ratings radio when selected
        $('.list-group-item').removeClass('active');
        $(e.target.parentNode.parentNode).addClass('active');

        // update the db
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

// Template.filmReview.onCreated( function() {
//   let postId = FlowRouter.current().params._id;
//   Template.instance().subscribe( 'post', postId );
// });


Template.filmReview.events({
  'submit #add-comment' ( event, template ) {
    event.preventDefault();

    let comment = {
      postId: this._id,
      author: template.find( "[name='author']" ).value,
      content: template.find( "[name='content']" ).value,
      date: new Date
    };



    Meteor.call( 'addComment', comment, ( error, response ) => {
      if ( error ) {
        Bert.alert( error.reason, "warning" );
      }
    });
  }
});

Template.filmReview.helpers({
  // post() {
  //   let post = Users.findOne();
  //
  //   if ( post ) {
  //     return post;
  //   }
  // },
  comments() {
    console.log("this=");
    console.log(this);
    console.log(this._id);

    let comments = Comments.find({ postId: this._id},{ sort: { date: -1 }});
    console.log("found, count=");
    console.log(comments.count());
    console.log(comments.fetch());

    if ( comments ) {
      return comments;
    }
  }
});

// Meteor.publish( 'comments', function(postId) {
//      return Comments.find({}, {sort: {date: -1}});
//      console.log("EXEC!");
// });


// Template.filmReview.helpers({
//   commen: function () {
//     return Comments.find({}, {
//       sort: { date: -1 }
//     });
//   }
// });
