Template.viewFilms.onCreated(function() {
    let self = this;
    self.autorun(function() {
        console.log("subscribed");
        self.subscribe('users.withFilms');
    });
})

Template.viewFilms.helpers({
    filmListing: Users.find({})
});