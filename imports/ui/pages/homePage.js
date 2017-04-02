import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

// Load template itself
import './homePage.html';
// Load templates used inside this template
import '../components/callToAction.js';
    // {{> filmGrid}}
    // {{> gallery}}
    // {{> footer}}
    //
// helpers and events would go here
