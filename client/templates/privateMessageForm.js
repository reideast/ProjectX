Template.privateMessageForm.onCreated(function() {
    const dataContext = this;
    dataContext.toUserID = dataContext.data._id;
    dataContext.conversationID = false;

    dataContext.hasCheckedForExistingConversation = false;
    dataContext.needToCreateConversation = false;

    dataContext.msgDepend = new Deps.Dependency; // will let us set up a reactive context inside the template helper

    // set up the subscription
    this.autorun(() => {
        const conversationSubscribeHandle = this.subscribe('privateMessages.all')
        // set up a reactive data context for boolean flags
        Tracker.autorun(() => {
            if (conversationSubscribeHandle.ready()) {
                if (Meteor.userId()) {
                    var conversations = PrivateMessages.find({ to: dataContext.data._id, from: Meteor.userId() });
                    dataContext.hasCheckedForExistingConversation = true;
                    if( conversations.count() === 1 ) {
                        // conversation already exists
                        const id = conversations.fetch()[0]._id;
                        dataContext.conversationID = id;
                        dataContext.needToCreateConversation = false;
                    } else if( conversations.count() === 0 ) {
                        //no conversation exists, will create it only if user submits a message
                        dataContext.needToCreateConversation = true;
                    } else {
                        console.log("ERROR: MORE THAN ONE CONVERSATION FOUND");
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

        if (Template.instance().hasCheckedForExistingConversation && !Template.instance().needToCreateConversation) {
            const result = PrivateMessages.findOne({
                _id: Template.instance().conversationID
            }, { sort: { "date": -1 } });
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
        if (template.hasCheckedForExistingConversation) {
            if (Meteor.user()) {

                // create mongo document if needed
                if (template.needToCreateConversation) {
                    // create the document first, then insert the data
                    var newConversation = PrivateMessages.insert(
                        {
                            to: template.toUserID,
                            from: Meteor.userId(),
                            messages: []
                        }
                    );
                    template.conversationID = newConversation;
                    template.needToCreateConversation = false;
                    template.msgDepend.changed(); // force update of reactive context in template helper
                }

                // insert message
                const messageInputBox = event.target.message;
                if (messageInputBox.value !== '') {
                    if (PrivateMessages.findOne({ _id: template.conversationID })) {
                        var de = PrivateMessages.update(
                            { _id: template.conversationID },
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
                console.log("ERROR: ONLY LOGGED IN USERS CAN SEND MESSAGES");
            }
        } else {
            // if not checked for existing conversation yet, then do nothing, and don't clear form
            console.log("Error: Subscriptions have not loaded yet, cannot send message");
        }
    }
}