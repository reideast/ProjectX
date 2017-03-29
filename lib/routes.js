
FlowRouter.route( '/', {
  action: function() {
    // Do whatever we need to do when we visit http://app.com/terms.
    BlazeLayout.render( 'homePage' );
  },
  name: 'homePage' // Optional route name.
});

// FlowRouter.route( '/signUp', {
//   action: function() {
//     BlazeLayout.render( 'signUp' );
//   },
//   name: 'signUp'
// });

FlowRouter.route( '/filmSubmission', {
  action: function() {
    BlazeLayout.render( 'filmSubmission' );
  },
  name: 'filmSubmission'
});

FlowRouter.route( '/filmReview', {
  action: function() {
    BlazeLayout.render( 'filmReview' );
  },
  name: 'filmReview'
});

FlowRouter.route('/film/:userId', {
    action: function(params, queryParams) {
        // console.log("on a film page with id=" + params.userId);
        BlazeLayout.render('filmReview');
    },
    name: 'film',
});

FlowRouter.route('/viewFilms', {
    action: function() {
        BlazeLayout.render('viewFilms');
    },
    name: 'viewFilms',
});

FlowRouter.route( '/filmQueue', {
  action: function() {
    BlazeLayout.render( 'filmQueue' );
  },
  name: 'filmQueue'
});

FlowRouter.route( '/filmBookingDetails', {
  action: function() {
    BlazeLayout.render( 'filmBookingDetails' );
  },
  name: 'filmBookingDetails'
});

FlowRouter.route( '/filmBooking', {
  action: function() {
    BlazeLayout.render( 'filmBooking' );
  },
  name: 'filmBooking'
});

FlowRouter.route( '/adminPageUsers', {
  action: function() {
    BlazeLayout.render( 'adminPageUsers' );
  },
  name: 'adminPageUsers'
});

FlowRouter.route( '/adminPageSubmissionsMgt', {
  action: function() {
    BlazeLayout.render( 'adminPageSubmissionsMgt' );
  },
  name: 'adminPageSubmissionsMgt'
});

FlowRouter.route( '/adminPageSchedule', {
  action: function() {
    BlazeLayout.render( 'adminPageSchedule' );
  },
  name: 'adminPageSchedule'
});

FlowRouter.route( '/adminPageBookingsMgt', {
  action: function() {
    BlazeLayout.render( 'adminPageBookingsMgt' );
  },
  name: 'adminPageBookingsMgt'
});

FlowRouter.route( '/verify-email/:token', {
  name: 'verify-email',
  action( params ) {
    Accounts.verifyEmail( params.token, ( error ) =>{
      if ( error ) {
        Bert.alert( error.reason, 'danger' );
      } else {
        FlowRouter.go( '/' );
        Bert.alert( 'Email verified! Thanks!', 'success', 'growl-top-right' );
      }
    });
  }
});

FlowRouter.route( '/adminPageBookingsMgt', {
  action: function() {
    BlazeLayout.render( 'adminPageBookingsMgt' );
  },
  name: 'adminPageBookingsMgt'
});

FlowRouter.route( '/signUp_reg', {
  action: function() {
    BlazeLayout.render( 'signUp_reg' );
  },
  name: 'signUp_reg'
});

FlowRouter.route( '/profilePage', {
  action: function() {
    BlazeLayout.render( 'profilePage' );
  },
  name: 'profilePage'
});
FlowRouter.route('/', {
    action: function(params) {
        Tracker.autorun(function() {
            if (!Meteor.user()) {
              FlowLayout.render("welcome", { content: 'profilePage' });
            }
        });
      }
});
