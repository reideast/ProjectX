Template.nav.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        FlowRouter.go('homePage');
    }
});

Template.nav.helpers({
    users: function() {
        var user = Meteor.users.find();
        return user;
    },
});
