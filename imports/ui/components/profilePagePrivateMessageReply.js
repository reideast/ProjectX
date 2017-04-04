import { Meteor } from 'meteor/meteor'; // Disable these if not needed
import { Template } from 'meteor/templating';
// import { FlowRouter } from 'meteor/kadira:flow-router';

// Load template itself
import './profilePagePrivateMessageReply.html';
import '../../api/filmManagement/privateMessages/privateMessages.js';

Template.profilePagePrivateMessageReply.events = {
    'submit form' : function (event) {
        event.preventDefault();

        if (Meteor.user()) {
            const name = Meteor.user().profile.user.name;
            const messageInputBox = event.target.message;
            const roomid = this._id;
            if (messageInputBox.value !== '') {
                if (PrivateMessages.findOne({ _id: roomid })) {
                    var de = PrivateMessages.update(
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
            console.log("ERROR: ONLY LOGGED IN USERS CAN SEND MESSAGES");
        }
    }
}