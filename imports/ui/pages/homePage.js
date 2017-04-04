import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

// Load template itself
import './homePage.html';
// Load templates used inside this template
import '../components/callToAction.js';
import '../components/filmGrid.js';
import '../components/gallery.js';
import '../components/footer.js'; // TODO remove this once template-ized

// helpers and events would go here
