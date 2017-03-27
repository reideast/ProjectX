Template.privateMessageForm.onCreated(function() {
    // console.log("this=");
    // console.log(this);
    const dataContext = this;
    dataContext.toUserID = dataContext.data._id;
    dataContext.roomID = false;

    dataContext.hasCheckedForExistingChat = false;
    dataContext.needToCreateChat = false;

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
                if (Meteor.userId()) {
                    var rooms = ChatRooms.find({ to: dataContext.data._id, from: Meteor.userId() });
                    console.log("found a room that already exists? count=" + rooms.count());
                    dataContext.hasCheckedForExistingChat = true;
                    if( rooms.count() === 1 ) {
                        //already room exists
                        const id = rooms.fetch()[0]._id;
                        dataContext.roomID = id;
                        dataContext.needToCreateChat = false;
                        console.log("also, found a room! id=" + dataContext.roomID);
                    } else if( rooms.count() === 0 ) {
                        //no room exists
                        dataContext.needToCreateChat = true;
                    } else {
                        console.log("ERROR: MORE THAN ONE CHATROOM");
                    }
                }
            }
        });
    });
});

Template.privateMessageForm.helpers({
    'msgs': function() {
        Tracker.autorun(() => {
            let a = Template.instance().hasCheckedForExistingChat;
            let b = Template.instance().needToCreateChat;
            console.log("1");
            console.log(Template.instance().hasCheckedForExistingChat);
            console.log(Template.instance().needToCreateChat);
            if (Template.instance().hasCheckedForExistingChat && !Template.instance().needToCreateChat) {
                console.log("2");
                const result = ChatRooms.findOne({
                    _id: Template.instance().roomID
                });
                if (result) {
                    return result.messages; // note: returns an array
                }
            } else {
                return undefined;
            }
        });
    }
});

Template.privateMessageForm.events = {
    // 'keydown input#message' : function (event) {
    'submit form' : function (event, template) {
        event.preventDefault();
        if (template.hasCheckedForExistingChat) {
            if (Meteor.user()) {
                if (template.needToCreateChat) {
                    // create the document first, then insert the data
                    var newRoom = ChatRooms.insert(
                        {
                            // _id: toUserID, // commented out, so ID will be auto-generated
                            to: template.toUserID,
                            from: Meteor.userId(),
                            messages: []
                        }
                    );
                    template.roomID = newRoom;
                    template.needToCreateChat = false;
                }
                const name = Meteor.user().profile.user.name;
                const messageInputBox = event.target.message;
                const roomid = template.roomID;
                if (messageInputBox.value !== '') {
                    if (ChatRooms.findOne({ _id: roomid })) {
                        var de = ChatRooms.update(
                            { _id: roomid },
                            { $push: {
                                messages:{
                                    name: name,
                                    text: messageInputBox.value,
                                    createdAt: Date.now()
                                }
                            }}
                        );
                    }

                    // reset form
                    messageInputBox.value = '';
                }
            } else {
                console.log("ERROR: ONLY LOGGED IN USERS CAN CHAT");
            }
        } else {
            // if not checked for existing chat yet, then do nothing, and don't clear form
            console.log("Error: Subscriptions have not loaded yet, cannot send message");
        }
    }
}