Template.viewFilms.onRendered(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
        self.subscribe('files.films.all');
    });
})

Template.viewFilms.helpers({
    filmListing: Users.find({ submittedFilm: { $exists: true } }),
    
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