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
        if (this.submittedFilm) {
            let film = Films.collection.findOne({ _id: this.submittedFilm.fileId});
            return film;
        }
    }
});