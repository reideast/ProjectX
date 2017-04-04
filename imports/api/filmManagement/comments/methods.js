console.log("DEBUG: comments/methods.js");

import { Meteor } from 'meteor/meteor';
// import the code used to create and export collection object, Comments
import './comments.js'; // TODO: once users.js is properly in export-style, this line should change to: import { Users } from './users.js';

// TODO: change to export-style: https://github.com/meteor/todos/blob/master/imports/api/lists/methods.js
// define server methods
Meteor.methods({
    addComment( comment ) {
        // TODO: check( comment, Comments.simpleSchema() );

        try {
            var commentId = Comments.insert( comment );
            return commentId;
        } catch( exception ) {
            return exception;
        }
    }
});
