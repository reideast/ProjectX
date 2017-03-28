Template.profilePage.onCreated(function() {
    let self = this;
    self.autorun(() => {
        self.subscribe('privateMessages.all');
        self.subscribe('users.all');
    });
});

Template.profilePage.helpers({
    privateMessageConversations: function() {
        if (Meteor.userId()) {
            return PrivateMessages.find({ to: Meteor.userId() });
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
    conversationDetails: function(userId) {
        return Users.findOne({ _id: userId });
    },
    optionsGenres: function() {
        let options = [
            { value: "Action/Adventure", selected: "" },
            { value: "Comedy", selected: "" },
            { value: "Coming of Age", selected: "" },
            { value: "Culinary", selected: "" },
            { value: "Dark Comedy", selected: "" },
            { value: "Documentary", selected: "" },
            { value: "Drama", selected: "" },
            { value: "Family Film", selected: "" },
            { value: "Fantasy", selected: "" },
            { value: "Galway is Film 2017", selected: "" },
            { value: "Horror", selected: "" },
            { value: "Human Rights", selected: "" },
            { value: "New Irish Cinema", selected: "" },
            { value: "Period Piece", selected: "" },
            { value: "Romance", selected: "" },
            { value: "SciFi", selected: "" },
            { value: "Silent Film", selected: "" },
            { value: "Thriller/Suspense", selected: "" },
            { value: "World Cinema", selected: "" },
            { value: "Women in Film", selected: "" },
        ];
        const self = this;
        options.forEach(function(item) {
            if (item.value == self.genre) {
                item.selected = "selected";
            }
        });
        return options;
    },
    optionsLength: function() {
        let options = [
            { value: "short", text: "Short Film", selected: "" },
            { value: "feature", text: "Feature Film", selected: "" },
        ];
        const self = this;
        options.forEach(function(item) {
            if (item.value == self.length) {
                item.selected = "selected";
            }
        });
        return options;
    },
    thumbRef: function() {
        if (this.fileId) {
            let film = Films.collection.findOne({ _id: this.fileId});
            return film;
        }
    }
});
Template.profilePage.events({
    'submit #filmEditForm': function(e) {
        e.preventDefault();

        let frm = e.target;
        let filmData = {
            title: frm.filmTitle.value,
            genre: frm.filmGenre.value,
            length: frm.filmLength.value,
            description: frm.filmDescription.value,
        };

        Meteor.call('filmUpdate', filmData, function(error, result) {
            if (error) {
                sAlert.error("Film update failed: " + error.reason);
            } else {
                sAlert.success("Film has been updated");
            }
        });
    }
});
