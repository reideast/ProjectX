Template.filmSubmission.helpers({
    uploadedFiles: function () {
        // console.log("********** LOGGING! **********");
        // var vids = Videos.find();
        // vids.forEach(function(item) {
        //     console.log(item);
        // });

        let loggedInUser = Users.findOne({});
        console.log('loggedInUser=');
        console.log(loggedInUser);
        if (loggedInUser && loggedInUser.uploadedFile) {
            return Films.find({ _id: loggedInUser.uploadedFile.filmId });
        } else {
            return null;
        }

        // TODO: search Users collection for this user's uploadedFile: {}
        // TODO: only show this file!
        // let usr = Meteor.userId();
        // Tracker.flush();
        // Template.instance().subscribe('files.films.userUploaded', usr);
        // console.log("helper uploadedFiles has run:");
        // Template.instance().uploadDepend.depend();
        // Tracker.flush();
        // console.log(Template.instance().uploadedFilm.fetch());
        // return Template.instance().uploadedFilm;
    },
    currentUpload: function () {
        return Template.instance().currentUpload.get();
    }
});

Template.filmSubmission.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);

    // this.uploadDepend = new Tracker.Dependency();

    // this.uploadedFilm = undefined;

    // let self = this;
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

Template.filmSubmission.events({
    'submit #filmSubmissionForm': function(e) {
        e.preventDefault();

        // console.log(e.target)
        // console.log(e.target.filmTitle)
        // console.log(e.target.filmTitle.value)

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
                // return "Film submission failed: " + error.reason;
            } else {
                sAlert.success("Film has been submitted");
                // return true;
            }
        });
    },
    'change #fileInput': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            // We upload only one file, in case there was multiple files selected
            var file = e.currentTarget.files[0];
            if (file) {
                var uploadInstance = Films.insert({
                    file: file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic'
                }, false);

                uploadInstance.on('start', function() {
                    template.currentUpload.set(this);
                });

                uploadInstance.on('end', function(error, fileObj) {
                    if (error) {
                        sAlert.error('Error during upload: ' + error.reason);
                        template.hasUploaded = false;
                    } else {
                        sAlert.success('File "' + fileObj.name + '" successfully uploaded');
                        // template.uploadDepend.changed();
                        template.hasUploaded = true;
                    }
                    template.currentUpload.set(false);
                    template.testEnableSubmit();
                });

                uploadInstance.start();
            }
        }
    },
    'change #filmTermsAccepted': function(e, template) {
        if (e.currentTarget.checked) {
            template.hasAcceptedTerms = true;
            template.testEnableSubmit();
        } else {
            template.hasAcceptedTerms = false;
            template.testEnableSubmit();
        }
    }
});
