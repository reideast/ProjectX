// https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management/with-blaze
Template.filmReview.onCreated(function() {
    // subscribe to the published user data (defined in users.js):
    let self = this;
    self.autorun(function() {
        let usr = FlowRouter.getParam('userId');
        self.subscribe('users.one', usr);
    });
});

Template.filmReview.helpers({
    userData: function() {
        // get data:
        // note: despite using "findOne()", this does depend on the Subscription to get the proper user data
        console.log(Users);
        let userFilm = Users.findOne({
            _id: FlowRouter.getParam('userId')
        }) || {};
        console.log(userFilm);
        // note: .count() won't work to see if one was retrieved or not: usrVideo.count());
        // TODO: error handling: how to show if attemping to show a video that's not found
        // TODO: show route with slug rather than _id. idea: https://github.com/deborah-ufw/flow-router-dynamic-links-use-slug
        console.log(userFilm.submittedFilm.fileId);
        // TODO: this doesn't currenlty exist as a Published object!!
        Meteor.subscribe('files.films.current', userFilm.submittedFilm.fileId);
        return userFilm;
    },
    film: function() {
        // by calling this template like so: {{#with video submittedFilm}}, i have set the data context
        // and "this" is set to the user that was found

        // necessary to have this subscription here in order to get user.submittedFilm.fileId
        // console.log("INSIDE HELPER video");
        // let userFilm = Users.findOne({ _id: FlowRouter.getParam('userId') });
        // console.log('found:')
        // console.log(userFilm);
        // console.log('userFilm.submittedFilm=')
        // console.log(userFilm.submittedFilm);
        // TODO: this doesn't currenlty exist as a Published object!!
        Meteor.subscribe('files.films.current', this.submittedFilm.fileId);
        // this.subscribe('files.films.current', userFilm.submittedFilm.fileId);
        let film = Films.collection.findOne({ _id: this.submittedFilm.fileId});
        // console.log(film);
        // let video = Films.collection.findOne({ _id: userFilm.submittedFilm.fileId});
        // console.log('found:');
        // console.log(video);
        return film;

        // note: by returning the findOne object from the Films collection, you can use the template helper {{fileURL}} inside of a {{#with video}} block
    }
});