
Meteor.publish("user", function() {
    return Meteor.users.find();
});

//Meteor.subscribe('user');