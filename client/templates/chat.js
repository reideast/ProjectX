ChatRooms = new Meteor.Collection("chatrooms");

if (Meteor.isServer) {
    // Specify which collections are sent to the client
    Meteor.publish("chatrooms", function () {
        return ChatRooms.find({
            owner: this.userId
        });
    });
}
if (Meteor.isClient) {
    // Specify which collections from the server the client subscribes to
    Meteor.subscribe("chatrooms");
}

Template.sidebar.helpers({
    'onlusr':function(){
        return Meteor.users.find({ "status.online": true , _id: {$ne: Meteor.userId()} });
    }
});

Template.sidebar.events({
    'click .user':function(){
        Session.set('currentId',this._id);
        var res=ChatRooms.findOne({chatIds:{$all:[this._id,Meteor.userId()]}});
        if(res)
        {
            //already room exists
            Session.set("roomid",res._id);
        }
        else{
            //no room exists
            var newRoom= ChatRooms.insert({chatIds:[this._id , Meteor.userId()],messages:[]});
            Session.set('roomid',newRoom);
        }
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
    if (event.which == 13) { 
        if (Meteor.user())
        {
              var name = Meteor.user().username;
              var message = document.getElementById('message');
              console.log("Here I am");
    
              if (message.value !== '') {
                var de =ChatRooms.update({"_id":Session.get("roomid")},{$push:{messages:{
                 name: name,
                 text: message.value,
                 createdAt: Date.now()
                }}});
                 console.log("Here I am");
                document.getElementById('message').value = '';
                message.value = '';
              }
              console.log("Here I am too");
        }
        else
        {
          sAlert.error("login to chat");
        }
       
    }
  }
};