ChatRooms = new Mongo.Collection("chatrooms");

if (Meteor.isServer) {
    Meteor.publish("chatrooms",function(){
        return ChatRooms.find({});
    });
    // Meteor.publish("onlusers",function(){
    //     return Meteor.users.find({"status.online":true},{username:1});
    // })
// } else {
//     Meteor.subscribe("chatrooms");
}
