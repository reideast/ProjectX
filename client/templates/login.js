Template.signUp.events({
    'submit form': function(event) {
        event.preventDefault();
        if (event.target.terms.checked) {
            console.log(event.target.person.value);
            var emailvar = event.target.email.value;
            var passwordvar = event.target.password.value;
            var namevar = event.target.name.value;
            var contactNovar = event.target.contactNo.value;
            console.log("Form submitted.");
            Accounts.createUser({
                email: emailvar,
                password: passwordvar,
                profile: {
                    user: {
                        terms: event.target.terms.checked,
                        name: namevar,
                        telephone: contactNovar,
                        person: event.target.person.value,

                    }
                }
            });
        }
        else {
            alert("Must be checked")
        }
        name: "homePage";
    }
});