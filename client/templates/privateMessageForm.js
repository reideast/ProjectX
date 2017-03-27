Template.privateMessageForm.onCreated(function() {
    const dataContext = this;
    dataContext.toUserID = dataContext.data._id;
    dataContext.roomID = false;

    dataContext.hasCheckedForExistingChat = false;
    dataContext.needToCreateChat = false;

    dataContext.msgDepend = new Deps.Dependency; // will let us set up a reactive context inside the template helper

    // set up the subscription
    this.autorun(() => {
        const chatSubscribeHandle = this.subscribe('chatrooms')
        // set up a reactive data context for boolean flags
        Tracker.autorun(() => {
            if (chatSubscribeHandle.ready()) {
                if (Meteor.userId()) {
                    var rooms = ChatRooms.find({ to: dataContext.data._id, from: Meteor.userId() });
                    dataContext.hasCheckedForExistingChat = true;
                    if( rooms.count() === 1 ) {
                        //room already exists
                        const id = rooms.fetch()[0]._id;
                        dataContext.roomID = id;
                        dataContext.needToCreateChat = false;
                    } else if( rooms.count() === 0 ) {
                        //no room exists, will create it ONLY if user submits a message
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
        // set up a manual Reactive context so this function changes when the collection is freshly created
        Template.instance().msgDepend.depend();

        if (Template.instance().hasCheckedForExistingChat && !Template.instance().needToCreateChat) {
            const result = ChatRooms.findOne({
                _id: Template.instance().roomID
            });
            if (result) {
                return result;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    },

    formatTime: function(myTime) {
        const time = new Date(myTime);
        return time.toString();
        // TODO: format nicer. use this as example of functions:
        // let dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + '-' + now.getHours() + '-' + now.getMinutes();
    },
});

Template.privateMessageForm.events = {
    'submit form' : function (event, template) {
        event.preventDefault();
        if (template.hasCheckedForExistingChat) {
            if (Meteor.user()) {

                // create mongo document if needed
                if (template.needToCreateChat) {
                    // create the document first, then insert the data
                    var newRoom = ChatRooms.insert(
                        {
                            to: template.toUserID,
                            from: Meteor.userId(),
                            messages: []
                        }
                    );
                    template.roomID = newRoom;
                    template.needToCreateChat = false;
                    template.msgDepend.changed(); // force update of reactive context in template helper
                }

                // insert message
                const messageInputBox = event.target.message;
                if (messageInputBox.value !== '') {
                    if (ChatRooms.findOne({ _id: template.roomID })) {
                        var de = ChatRooms.update(
                            { _id: template.roomID },
                            { $push: {
                                messages:{
                                    name: Meteor.user().profile.user.name,
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