import { Meteor } from 'meteor/meteor'; // Disable these if not needed
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery'; // TODO: is this necessary on all pages that use jQuery?
// TODO: need to import Bert?

// Load template itself
import './filmSubmission.html';
// Load templates used inside this template
import '../components/footer.js'; // TODO remove this once template-ized
import '../../api/filmManagement/users/users.js';
import '../../api/filmManagement/films/films.js';

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
    },


    optionsGenres: function() {
        // TODO: move select-option code to a component template
        return [
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
    },
    optionsLength: function() {
        return [
            { value: "short", text: "Short Film", selected: "" },
            { value: "feature", text: "Feature Film", selected: "" },
        ];
    },
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
                Bert.alert("Film submission failed: " + error.reason, 'danger', 'growl-top-right');
            } else {
                Bert.alert("Film has been submitted", 'success', 'growl-top-right');
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
                    if (error) {
                        Bert.alert('Error during upload: ' + error.reason, 'danger', 'growl-top-right');
                    } else {
                        Bert.alert('File "' + fileObj.name + '" successfully uploaded', 'success', 'growl-top-right');
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
    },
    'click .resend-verification-link' ( event, template ) {
        Meteor.call( 'sendVerificationLink', ( error, response ) => {
            if ( error ) {
                Bert.alert( error.reason, 'danger' );
            } else {
                let email = Meteor.user().emails[ 0 ].address;
                Bert.alert( `Verification sent to ${ email }!`, 'success', 'growl-top-right' );
            }
        });
    }
});
