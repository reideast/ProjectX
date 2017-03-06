Template.filmSubmission.helpers({
    uploadedFiles: function () {
        // console.log("********** LOGGING! **********");
        // var vids = Videos.find();
        // vids.forEach(function(item) {
        //     console.log(item);
        // });
        return Videos.find();
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
    'change #fileInput': function (e, template) {
        if (e.currentTarget.files && e.currentTarget.files[0]) {
            // We upload only one file, in case
            // there was multiple files selected
            var file = e.currentTarget.files[0];
            if (file) {
                var uploadInstance = Videos.insert({
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
                        alert('Error during upload: ' + error.reason);
                    } else {
                        // TODO: use salert package
                        alert('File "' + fileObj.name + '" successfully uploaded');
                    }
                    template.currentUpload.set(false);
                });


                uploadInstance.start();
            }
        }
    }
});