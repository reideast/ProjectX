Template.profilePage.onCreated(function() {
    console.log("this.data=");
    console.log(this.data);
    const dataContext = this.data;
    this.autorun(() => {
        // const chatSubscribeHandle = this.subscribe('chatrooms')
        this.subscribe('chatrooms');
        this.subscribe('users.all');
        // Tracker.autorun(() => {
        //     // const isReady = chatSubscribeHandle.ready();
        //     // console.log("ready?");
        //     // console.log(isReady);
        //     if (chatSubscribeHandle.ready()) {
        //         // let toUserID = "pionFpKYEvqwK3rfu";
        //         const toUserID = dataContext._id;
        //         // Session.set('roomid', toUserID);
        //         // var count = ChatRooms.find( { _id: toUserID } ).count(); // REMOVED: now we're gonna find by id
        //     }
    });
});

Template.profilePage.helpers({
    privateMessageConversations: function() {
        if (Meteor.userId()) {
            console.log("Found " + ChatRooms.find({ to: Meteor.userId() }).count() + " chatrooms");
            return ChatRooms.find({ to: Meteor.userId() });
        } else {
            return {};
        }
    },
    formatTime: function(myTime) {
        // console.log(myTime);
        const time = new Date(myTime);
        return time.toString();
        // TODO: format nicer. use this as example of functions:
        // let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
    },
    conversationDetails: function(userId) {
        return Users.findOne({ _id: userId });
    }
});
