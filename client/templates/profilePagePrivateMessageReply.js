Template.profilePagePrivateMessageReply.events = {
    'submit form' : function (event) {
        event.preventDefault();

        if (Meteor.user()) {
            const name = Meteor.user().profile.user.name;
            const messageInputBox = event.target.message;
            const roomid = this._id;
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
    }
}