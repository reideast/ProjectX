console.log("DEBUG: ran email-verify-account.js");

Accounts.emailTemplates.siteName = "Junior Film Fleadh";
Accounts.emailTemplates.from     = "Junior Film Fleadh <admin@jff.com>";

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return "[Junior Film Fleadh] Please Verify Your Email Address";
  },
  text( user, url ) {
    let emailAddress   = user.emails[0].address,
        urlWithoutHash = url.replace( '#/', '' ),
        supportEmail   = "admin@jff.com",
        emailBody      = `To verify your email address (${emailAddress}) visit the following link:\n\n${urlWithoutHash}\n\n If you did not request this verification, please ignore this email. If you feel something is wrong, please contact our support team: ${supportEmail}.`;

    return emailBody;
  }
};
