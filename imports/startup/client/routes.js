import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';


// NOTE: This is where all client side code is brought in. I'm not sure why these imports shouldn't instead be in ./index.js, but I'll follow the example for now
// Import templates
import '../../ui/components/nav.js'; // TODO: once router is templat-ized, remove this
import '../../ui/pages/DEFAULT_BODY_TEMPLATE.html'; // TODO: once router is templat-ized, remove this

// TODO: Make sure the rest of this file fits the app example. see example file: https://github.com/meteor/todos/blob/master/imports/startup/client/routes.js

// TODO: template-ize routes. basic example: https://github.com/meteor/todos/blob/master/imports/startup/client/routes.js
// FlowRouter.route('/lists/:_id', {
//   name: 'Lists.show',
//   action() {
//     BlazeLayout.render('App_body', { main: 'Lists_show_page' });
//   },
// });

// ************ Template-Based Routes ************
import '../../ui/pages/homePage.js';
FlowRouter.route( '/', {
    action: function() {
        // Do whatever we need to do when we visit http://app.com/terms.
        BlazeLayout.render( 'homePage' );
    },
    name: 'homePage' // Optional route name.
});
// FlowRouter.route('/', {
//     action: function(params) {
//         Tracker.autorun(function() {
//             if (!Meteor.user()) {
//                 FlowLayout.render("welcome", { content: 'profilePage' });
//             }
//         });
//     }
// });

import '../../ui/pages/filmSubmission.js';
FlowRouter.route( '/filmSubmission', {
    action: function() {
        BlazeLayout.render( 'filmSubmission' );
    },
    name: 'filmSubmission'
});

import '../../ui/pages/filmReview.js';
FlowRouter.route( '/filmReview', {
    action: function() {
        BlazeLayout.render( 'filmReview' );
    },
    name: 'filmReview'
});

import '../../ui/pages/filmReview.js';
FlowRouter.route('/film/:userId', {
    action: function(params, queryParams) {
        // console.log("on a film page with id=" + params.userId);
        BlazeLayout.render('filmReview');
    },
    name: 'film',
});

import '../../ui/pages/viewFilms.js';
FlowRouter.route('/viewFilms', {
    action: function() {
        BlazeLayout.render('viewFilms');
    },
    name: 'viewFilms',
});

import '../../ui/pages/signUpLogin.js';
FlowRouter.route( '/signUpLogin', {
    action: function() {
        BlazeLayout.render( 'signUpLogin' );
    },
    name: 'signUpLogin'
});

import '../../ui/pages/profilePage.js';
FlowRouter.route( '/profilePage', {
    action: function() {
        BlazeLayout.render( 'profilePage' );
    },
    name: 'profilePage'
});

// ************ Non-Template-Based Routes ************
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
