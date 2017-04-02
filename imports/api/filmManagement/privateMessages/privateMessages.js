import { Mongo } from 'meteor/mongo';

PrivateMessages = new Mongo.Collection('privateMessages');

PrivateMessages.allow({
    insert: function(userId,doc) { return true; },
    update: function(userId,doc,fieldNames, modifier) { return true; },
    remove: function(userId,doc) { return false; }
});
