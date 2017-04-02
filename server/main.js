// NOTE: This "psudo-global" import is left in for backwards compatibility to meteor 1.3. see: https://guide.meteor.com/structure.html#importing-meteor-globals
// NOTE: You can still directly call functions, e.g. Meteor.publish, without these imports. But it's best to load them first
import { Meteor } from 'meteor/meteor';
// import { EJSON } from 'meteor/ejson'; // not used by this app

// NOTE: this is the application entry point for server. all other js
import '/imports/startup/server';
import '/imports/startup/both';
