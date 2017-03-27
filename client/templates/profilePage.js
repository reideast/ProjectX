Template.profilePage.onCreated(function() {
    let self = this;
    self.autorun(() => {
        self.subscribe('chatrooms');
        self.subscribe('users.all');
    });
});

Template.profilePage.helpers({
    privateMessageConversations: function() {
        if (Meteor.userId()) {
            return ChatRooms.find({ to: Meteor.userId() });
        } else {
            return {};
        }
    },
    formatTime: function(myTime) {
        const time = new Date(myTime);
        return time.toString();
        // TODO: format nicer. use this as example of functions:
        // let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
    },
    conversationDetails: function(userId) {
        return Users.findOne({ _id: userId });
    }
});
