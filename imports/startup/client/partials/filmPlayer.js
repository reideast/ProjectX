
Template.filmPlayer.helpers({
    film: function() {
        // since we're calling the helper {{.. film}} within a {{#with userData}} helper block,
        // "this" is set to the value returned from {{userData}} namely, the result of Users.findOne(url param userId)
        // so, we can search the Films collection for that user's submitted film without consulting the User collection again
        if ('submittedFilm' in this) {
            return Films.collection.findOne({ _id: this.submittedFilm.fileId});
        } else if ('fileId' in this) {
            return Films.collection.findOne({ _id: this.fileId});
        } else {
            return {};
        }
    },
});