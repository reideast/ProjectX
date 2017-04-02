Comments = new Mongo.Collection('comments');

if (Meteor.isServer) {
  Meteor.methods({
    addComment( comment ) {
      //check( comment, Comments.simpleSchema() );

      try {
        var commentId = Comments.insert( comment );
        return commentId;
      } catch( exception ) {
        return exception;
      }
    }
  });
}
