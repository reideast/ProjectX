Template.viewFilms.onCreated(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
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