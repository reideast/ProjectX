Template.nav.events({
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout();
        FlowRouter.go('homePage');
    },
    'click .navbar-collapse a': function(event){
        $(".navbar-collapse").collapse('hide');
    },

    'click #logo-img': function(event){
        $(".navbar-collapse").collapse('hide');
      }
});

Template.nav.helpers({
    users: function() {
        var user = Meteor.users.find();
        return user;
    },
});
