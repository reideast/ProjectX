console.log("DEBUG: ran comments/publications.js");

import { Meteor } from 'meteor/meteor';
import '../../users/users.js';
import '../comments.js';

Meteor.publish( 'post', function( postId ) {
    check( postId, String );

    if ( postId ) {
        return [
            Users.find( { '_id': postId } ),
            Comments.find( { 'postId': postId }, { sort: { "date": -1 } } )
        ];
    } else {
        return null;
    }
});


// Meteor.publish( 'post', function( postId ) {
//   check( postId, String );
//
//   if ( postId ) {
//     return Users.find( { '_id': postId } );
//   } else {
//     return null;
//   }
// });

// Meteor.publish( 'comments', function( postId ) {
//
//   check( postId, String );
//
//   if ( postId ) {
//     return Comments.find( {}, { sort: { "date": -1 } } );
//   } else {
//     return null;
//   }
// });


// Meteor.publish( 'comments', function(postId) {
//      return Comments.find({}, {sort: {date: -1}});
//      console.log("EXEC!");
// });
//
