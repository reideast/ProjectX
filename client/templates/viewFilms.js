Template.viewFilms.onCreated(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
        self.subscribe('files.films.all');
        console.log("DEBUG: subscribed to all users (who have films)");
    });
})

Template.viewFilms.helpers({
    filmListing: Users.find({}),
    // fileRef: Films.collection.findOne({}),
    // thumbURL: function(argId) {
    //     if (argId) {
    //         console.log("inside the thumbURL template helper");
    //         console.log("id is");
    //         console.log(argId);
    //         console.log("this is");
    //         console.log(this);
    //         let film = Films.findOne({_id: argId});
    //         console.log("done searching the db. film=");
    //         console.log(film);
    //
    //         // film.versions.thumbnail
    //         return film;
    //     }
    // },
    thumbRef: function() {
        // TODO: this is currently broken. after a "meteor reset" and creating a user, it showed a that user's film
        // TODO: the problem is that you're searching "this", which gives the logged in user!!
        // if (argId) {
        console.log("inside the thumbURL template helper");
        console.log("this is");
        console.log(this);

        if (this.submittedFilm) {
            let film = Films.collection.findOne({ _id: this.submittedFilm.fileId});
            // let film = Films.findOne({_id: argId});
            console.log("done searching the db. film=");
            console.log(film);

            // film.versions.thumbnail
            return film;
        } else {
            console.log("ERR: No submitted film for THIS");
        }
        // }
    }
});