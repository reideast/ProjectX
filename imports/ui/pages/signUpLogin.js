import { Meteor } from 'meteor/meteor'; // Disable these if not needed
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
// TODO: need to import Bert?
// TODO: need to import Accounts?

// Load template itself
import './signUpLogin.html';
// Load templates used inside this template
import '../components/footer.js'; // TODO remove this once template-ized

Template.signUpLogin.events({
    'submit #login-form': function(event){
        event.preventDefault();
        var email = $('[name=email-login]').val();
        var password = $('[name=password-login]').val();
        Meteor.loginWithPassword(email, password, function (err) {
            if (!err) {
                FlowRouter.go("homePage");
            }
            else {
                Bert.alert("Error: Email or password is incorrect", 'danger', 'growl-top-right');
            }
        });
    },

    'submit #register-form': function(event) {
        event.preventDefault();
        if (event.target.filmTermsAccepted.checked) {
            var emailvar = event.target.email.value;
            var passwordvar = event.target.password.value;
            var namevar = event.target.username.value;
            var contactNovar = event.target.contactNo.value;
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
                    Bert.alert(error.reason, 'danger', 'growl-top-right');
                }
            });
        }
        else {
            Bert.alert("Terms Must be checked", 'danger', 'growl-top-right');
        }
        FlowRouter.go("homePage");
    }
});

