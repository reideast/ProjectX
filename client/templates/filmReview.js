// https://kadira.io/academy/meteor-routing-guide/content/subscriptions-and-data-management/with-blaze
Template.filmReview.onCreated(function() {
    let self = this;
    self.autorun(function() {
        let usr = FlowRouter.getParam('userId');
        // subscribe to the published user data (defined in users.js):
        self.subscribe('users.one', usr);

        console.log("INSIDE AUTORUN");
        console.log('usr=' + usr);
        // let userVideo = Users.find({
        //     _id: FlowRouter.getParam('userId')
        // });
        // console.log('found:')
        // console.log(userVideo);
        // console.log('userVideo.submittedFilm=')
        // console.log(userVideo.submittedFilm);
        // let video = Films.collection.findOne({ _id: userVideo.submittedFilm._fileId});
        // console.log('found:');
        // console.log(video);
    });
});

Template.filmReview.helpers({
    userData: function() {
        // get data:
        // note: despite using "findOne()", this does depend on the Subscription to get the proper user data
        let usrVideo = Users.findOne({
            _id: FlowRouter.getParam('userId')
        }) || {};
        // note: .count() won't work to see if one was retrieved or not: usrVideo.count());
        // TODO: error handling: how to show if attemping to show a video that's not found
        // TODO: show route with slug rather than _id. idea: https://github.com/deborah-ufw/flow-router-dynamic-links-use-slug
        console.log(usrVideo);
        return usrVideo;
    },
    video: function() {
        // var
    }
});