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
                        console.log("from sessions:");
                        console.log(Session.get('roomid'));
                    } else if( rooms.count() === 0 ) {
                        //no room exists
                        var newRoom = ChatRooms.insert(
                            {
                                // _id: toUserID, // CHANGED: commented out, so ID will be auto-generated
                                to: toUserID,
                                from: Meteor.userId(),
                                messages: [
                                    {
                                        "name": "test dude",
                                        "text": "dude's msg",
                                        "createdAt": Date.now()
                                    }
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

Template.sidebar.helpers({
    'onlusr':function(){
        return Meteor.users.find({ "status.online": true , _id: {$ne: Meteor.userId()} });
    }
});

Template.sidebar.events({
    'click .user':function(){
        Session.set('currentId',this._id);
    }
});

Template.messages.helpers({
    'msgs':function(){
        var result=ChatRooms.findOne({_id:Session.get('roomid')});
        if(result){
            return result.messages;
        }
    }
});

Template.input.events = {
    'keydown input#message' : function (event) {
        console.log("1");

        if (event.which == 13) {
            console.log("2");
            if (Meteor.user())
            {
                console.log("3");
                var name = Meteor.user().profile.user.name; // CHANGED to profile.user.name
                console.log(Meteor.user());
                console.log(name);
                var message = document.getElementById('message').value; // CHANGED TO value
                console.log(message);
                var roomid = Session.get("roomid")
                console.log(roomid);

                console.log("4");
                if (message.value !== '') {
                    console.log("5");
                    if (ChatRooms.findOne({ _id: roomid })) { // CHANGED: how the update works
                        var de = ChatRooms.update(
                            { _id: roomid },
                            {
                                $push: {
                                    messages:{
                                        name: name,
                                        text: message,
                                        createdAt: Date.now()
                                    }
                                }
                            }
                        );
                    }
                    console.log(de);
                    console.log("6");
                    document.getElementById('message').value = '';
                    message.value = '';
                }
            }
            else
            {
                alert("login to chat");
            }

        }
    }
};