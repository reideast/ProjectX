// import { Meteor } from 'meteor/meteor'; // Disable these if not needed
import { Template } from 'meteor/templating';
// import { FlowRouter } from 'meteor/kadira:flow-router';

// Load template itself
import './filmPlayer.html';
// Load templates used inside this template
// Load collections from API folder
import '../../api/filmManagement/films/films.js';

// helpers and events go here
Template.filmPlayer.helpers({
    film: function() {
        // since we're calling the helper {{.. film}} within a {{#with userData}} helper block,
        // "this" is set to the value returned from {{userData}} namely, the result of Users.findOne(url param userId)
        // so, we can search the Films collection for that user's submitted film without consulting the User collection again
        if ('submittedFilm' in this) {
            return Films.collection.findOne({ _id: this.submittedFilm.fileId});
        } else if ('fileId' in this) {
            return Films.collection.findOne({ _id: this.fileId}); // NOTE: had to add this in so the sub-template works in two different template (with different data contexts)
        } else {
            return {};
        }
    },
});