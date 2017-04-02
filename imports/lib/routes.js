
FlowRouter.route( '/', {
  action: function() {
    // Do whatever we need to do when we visit http://app.com/terms.
    BlazeLayout.render( 'homePage' );
  },
  name: 'homePage' // Optional route name.
});

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
