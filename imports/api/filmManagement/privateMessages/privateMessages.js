PrivateMessages = new Mongo.Collection('privateMessages');

if (Meteor.isServer) {
    Meteor.publish('privateMessages.all',function(){
        return PrivateMessages.find({});
    });
}
