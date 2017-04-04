import { Meteor } from 'meteor/meteor';

import '../privateMessages.js';

Meteor.publish('privateMessages.all',function(){
    return PrivateMessages.find({});
});
