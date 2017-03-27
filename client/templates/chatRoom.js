// Tracker.autorun(function(){
// Meteor.subscribe("chatrooms");
// Meteor.subscribe("onlusers");
// });

// CHANGED added the onRendered function to MANUALLY set an ID for the chatroom
// TODO:
Template.chatRoom.onCreated(function() {
    // let self = this;
    // self.autorun(function() {
    //     self.subscribe("chatrooms");
    //     self.subscribe("onlusers");
    // });
    this.autorun(() => {
        const chatSubscribeHandle = this.subscribe('chatrooms')
        // console.log("subscribed to chatrooms");
        // this.subscribe("onlusers");

        Tracker.autorun(() => {
            // const isReady = chatSubscribeHandle.ready();
            // console.log("ready?");
            // console.log(isReady);
            if (chatSubscribeHandle.ready()) {
                let toUserID = "pionFpKYEvqwK3rfu";
                // Session.set('roomid', toUserID);
                // var count = ChatRooms.find( { _id: toUserID } ).count(); // REMOVED: now we're gonna find by id
                // console.log(toUserID);
                // console.log(Meteor.userId());
                if (Meteor.userId()) {
                    var rooms = ChatRooms.find({ to: toUserID, from: Meteor.userId() });
                    console.log("found a room that already exists? count=");
                    console.log(rooms.count());
                    if( rooms.count() === 1 ) {
                        //already room exists
                        const id = rooms.fetch()[0]._id;
                        Session.set("roomid", id);
                        console.log("from session:");
                        console.log(Session.get('roomid'));
                    } else if( rooms.count() === 0 ) {
                        //no room exists
                        var newRoom = ChatRooms.insert(
                            {
                                // _id: toUserID, // CHANGED: commented out, so ID will be auto-generated
                                to: toUserID,
                                from: Meteor.userId(),
                                messages: [
                                    // {
                                    //     "name": "test dude",
                                    //     "text": "dude's msg",
                                    //     "createdAt": Date.now()
                                    // }
                                ]
                            }
                        );
                        Session.set('roomid',newRoom);
                    } else {
                        console.log("ERROR: MORE THAN ONE CHATROOM");
                    }
                }

            }
        });
    });
});

// Template.sidebar.helpers({
//     'onlusr':function(){
//         return Meteor.users.find({ "status.online": true , _id: {$ne: Meteor.userId()} });
//     }
// });
//
// Template.sidebar.events({
//     'click .user':function(){
//         Session.set('currentId',this._id);
//     }
// });

Template.messages.helpers({
    'msgs': function() {
        const result = ChatRooms.findOne({
            _id: Session.get('roomid')
        });
        if (result) {
            return result.messages; // note: returns an array
        }
    }
});

Template.input.events = {
    'keydown input#message' : function (event) {
        if (event.which == 13) { // if key is {enter}
            if (Meteor.user())
            {
                var name = Meteor.user().profile.user.name;
                var messageInputBox = document.getElementById('message');
                var roomid = Session.get("roomid")
                if (messageInputBox.value !== '') {
                    if (ChatRooms.findOne({ _id: roomid })) {
                        var de = ChatRooms.update(
                            { _id: roomid },
                            {
                                $push: {
                                    messages:{
                                        name: name,
                                        text: messageInputBox.value,
                                        createdAt: Date.now()
                                    }
                                }
                            }
                        );
                    }

                    // reset form
                    messageInputBox.value = '';
                }
            } else {
                console.log("ERROR: ONLY LOGGED IN USERS CAN CHAT");
            }

        }
    }
};