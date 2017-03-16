/* global jQuery*/
/*global $*/
sAlert.config({
  effect: 'scale',
  position: 'bottom',
  timeout: 5000,
  html: false,
  onRouteClose: true,
  stack: true,
  offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
  beep: false,
  onClose: _.noop
});

Template.signUp.onRendered(function() {

    /*jQuery.validator.addMethod("doesEmailExist", function(value, element) {
        console.log("Validation fired");
        return (Meteor.users.findOne({email: value})) ? true : false;
        //console.log("Validation check");
    }, "sorry this email is taken,please try another one");*/

    $('#signUp').validate({
        rules: {
            email: {
                required: true
                //doesEmailExist: true
            }
        }
    });
});





Template.signUp_reg.events({
    'submit #login-form': function(event){
        event.preventDefault();
        var email = $('[name=email-login]').val();
        var password = $('[name=password-login]').val();
        Meteor.loginWithPassword(email, password, function (err) {
        if (!err) {
            FlowRouter.go("/");
        }
        else {
            console.log(err);
            sAlert.error("Error: Email or password is incorrect");
        }
        });
            console.log("form submitted");
    },
    
    'submit #register-form': function(event) {
        event.preventDefault();
        if (event.target.filmTermsAccepted.checked) {
            console.log(event.target.person.value);
            // var emailvar=event.find('#email').value;
            var emailvar = event.target.email.value;
            var passwordvar = event.target.password.value;
            var namevar = event.target.username.value;
            var contactNovar = event.target.contactNo.value;
            console.log("Form submitted.");
            Accounts.createUser({
                email: emailvar,
                password: passwordvar,
                profile: {
                    user: {
                        filmTermsAccepted: event.target.filmTermsAccepted.checked,
                        name: namevar,
                        telephone: contactNovar,
                        person: event.target.person.value,
                       
                    }
                    
                }
                
            }, function(error) {
                if (error) {
                    sAlert.error(error.reason);
                }
                 console.log("createuser.");
        });
        }
        else {
            sAlert.error("Terms Must be checked");
        }
        //  FlowRouter.go("homePage");
        // name: "homePage";
    }
});



Template.nav.events({
    'click .logout': function(event){
        event.preventDefault();
         Meteor.logout();
          FlowRouter.go('homePage');
    }
});


// Meteor.publish("user", function() {
//     return Meteor.users.find();
// });

// Meteor.subscribe('user');

Template.nav.helpers({
    users: function() {
        var user = Meteor.users.find();
        return user;
    },
});



// jQuery.validator.addMethod("doesEmailExist", function(value, element) {
//     Template.tmp_signup.events({
//         'change #signUp': function() {
//             if (typeof console !== 'undefined') {
//                 var data = value; // 'value' argument represents the value of your input
//                 var findOut = Meteor.users.find({
//                     Email: data
//                 });
//                 if (findOut.fetch().length > 0) {
//                     return false; // fails - display error
//                 }
//                 else {
//                     return true; // passes - no message
//                 }
//             }
//         }
//     }, "this email is already exist. too bad");
