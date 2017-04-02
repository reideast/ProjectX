import { Meteor } from 'meteor/meteor';

// TODO: change to export-style: https://github.com/meteor/todos/blob/master/imports/api/lists/lists.js
Users = Meteor.users; // NOTE: don't need to do it this way, because Meteor already has Meteor.users pre-creted: Users = new Meteor.Collection('users');

// TODO: create security like in: https://github.com/meteor/todos/blob/master/imports/api/lists/lists.js
// TODO: also in the other collections!
