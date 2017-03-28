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
