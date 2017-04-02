// import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// import { FlowRouter } from 'meteor/kadira:flow-router';

// Load template itself
import './filmGrid.html';
// Load templates used inside this template
import '../../api/filmManagement/users/users.js';
import '../../api/filmManagement/films/films.js';

Template.filmGrid.onRendered(function() {
    let self = this;
    self.autorun(function() {
        self.subscribe('users.withFilms');
        self.subscribe('files.films.all');
    });
})

Template.filmGrid.helpers({
    filmListing: Users.find({ submittedFilm: { $exists: true } }),

    thumbRef: function() {
        if (this.submittedFilm) {
            let film = Films.collection.findOne({ _id: this.submittedFilm.fileId});
            return film;
        }
    }
});