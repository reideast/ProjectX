// Disable these if not needed
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../api/filmManagement/users/users.js';

// Load template itself
import './templatename.html';
// Load templates used inside this template
import '../components/subTemplate.js';

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