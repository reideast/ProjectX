Template.filmSubmission.onCreated(function () {
    this.currentUpload = new ReactiveVar(false); // holds the progress bar info

    // let usr = Meteor.userId();
    let self = this;
    self.autorun(function() {
        self.subscribe('users.loggedIn');
        self.subscribe('files.films.all');
    });
});
Template.filmSubmission.onRendered(function() {
    this.hasAcceptedTerms = false;
    this.hasUploaded = false;
    this.testEnableSubmit = function() {
        if (this.hasAcceptedTerms && this.hasUploaded) {
            $('#filmSubmit').prop('disabled', false).removeClass('disabled');
        } else {
            $('#filmSubmit').prop('disabled', true).addClass('disabled');
        }
    };
    this.testEnableSubmit(); // call it now to set the submit button to disabled
});

Template.filmSubmission.helpers({
    uploadedFile: function () {
        let loggedInUser = Users.findOne({ _id: Meteor.userId() });
        if (loggedInUser && loggedInUser.uploadedFile) {
            if (Template.instance().testEnableSubmit) { // if template has been displayed
                Template.instance().hasUploaded = true;
                Template.instance().testEnableSubmit();
            }
            return Films.findOne({ _id: loggedInUser.uploadedFile.filmId });
        } else {
            if (Template.instance().testEnableSubmit) {
                Template.instance().hasUploaded = false;
                Template.instance().testEnableSubmit();
            }
            return null;
        }
    },

    thumbRef: function() {
        // the data context ("this") of this function is set by {{#with uploadedFile}} which is the result of a FIlms.findOne()
        return Films.collection.findOne({ _id: this._id });
    },

    currentUpload: function () {
        return Template.instance().currentUpload.get(); // used to show progress bar
    }
});

Template.filmSubmission.events({
    'submit #filmSubmissionForm': function(e) {
        e.preventDefault();

        let frm = e.target;
        let filmData = {
            title: frm.filmTitle.value,
            genre: frm.filmGenre.value,
            length: frm.filmLength.value,
            fileId: frm.filmFileOption.value,
            description: frm.filmDescription.value,
            termsAccepted: frm.filmTermsAccepted.checked
        };

        Meteor.call('filmSubmit', filmData, function(error, result) {
            if (error) {
                sAlert.error("Film submission failed: " + error.reason);
            } else {
                sAlert.success("Film has been submitted");
                // TODO: router route to new own Profile page
                // TODO: ok to move {{> sAlert }} to master template?

		// TODO: verify this works (I added it during the diff/merge)
          	FlowRouter.go('profilePage');
            }
        });
    },
    'change #fileInput': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) { // upload only one file
            let file = e.currentTarget.files[0];
            if (file) {
                // add to collection (but don't start upload yet)
                var uploadInstance = Films.insert({
                    file: file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic'
                }, false);

                uploadInstance.on('start', function() {
                    template.currentUpload.set(this);
                });

                uploadInstance.on('end', function(error, fileObj) {
                    template.currentUpload.set(false);
                    if (error) {
                        sAlert.error('Error during upload: ' + error.reason);
                    } else {
                        sAlert.success('File "' + fileObj.name + '" successfully uploaded');
                    }
                    template.currentUpload.set(false);
                });

                // start upload!
                uploadInstance.start();

                // disable submission button until uploadedFile helper allows it
                template.hasUploaded = false;
                template.testEnableSubmit();
            } // else if user hasn't selected a file in the dialog box, do nothing
        }
    },
    'change #filmTermsAccepted': function(e, template) {
        template.hasAcceptedTerms = e.currentTarget.checked;
        template.testEnableSubmit();
    }
});
