
Template.filmSubmission.helpers({
    uploadedFiles: function () {
        // console.log("********** LOGGING! **********");
        // var vids = Videos.find();
        // vids.forEach(function(item) {
        //     console.log(item);
        // });
        return Films.find();
    }
});

Template.filmSubmission.onCreated(function () {
    this.currentUpload = new ReactiveVar(false);
});

Template.filmSubmission.helpers({
    currentUpload: function () {
        return Template.instance().currentUpload.get();
    }
});

Template.filmSubmission.events({
    'submit #filmSubmissionForm': function(e) {
        e.preventDefault();

        console.log(e.target)
        console.log(e.target.filmTitle)
        console.log(e.target.filmTitle.value)

        let frm = e.target;
        let filmData = {
            title: frm.filmTitle.value,
            genre: frm.filmGenre.value,
            length: frm.filmLength.value,
            fileId: frm.filmFileOption.value,
            description: frm.filmDescription.value,
            termsAccepted: frm.filmTermsAccepted.checked
        };

          FlowRouter.go('profilePage');

        Meteor.call('filmSubmit', filmData, function(error, result) {
            if (error) {
                console.log("Film submission failed: " + error.reason);
                return "Film submission failed: " + error.reason;
            } else {
                console.log("Film has been submitted");
                return true;
            }
        });
    },
    'change #fileInput': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            // We upload only one file, in case
            // there was multiple files selected
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
                        // TODO: use salert package
                        console.log('Error during upload: ' + error.reason);
                    } else {
                        // TODO: use salert package
                        console.log('File "' + fileObj.name + '" successfully uploaded');
                    }
                    template.currentUpload.set(false);
                });

                uploadInstance.start();
            }
        }
    }
});

