var templatesDir   = __dirname.replace("/services", "/emailTemplates"),
    emailTemplates = require('email-templates'),
	nodemailer     = require('nodemailer'),

	email = {
		template : "simple",
		user : "schcrabicusforapps@gmail.com",
		pass : "passforschcrabicusforapps"
	};

/**
 *
 * @param o  Email options
 */
exports.sendEmail = function(o, cb){
	var transport,
		locals;

	emailTemplates(templatesDir, function(err, template) {
		if (err) {
			cb(err, null);
		} else {
			// Prepare nodemailer transport object
			transport = nodemailer.createTransport("SMTP", {
				service: "Gmail",
			    auth: {
					user: email.user,
					pass: email.pass
			    }
			});

			// Users object with formatted email function
			locals = {
			    email: o.email || "unknown",
			    name: o.name || "unknown",
				message : o.message || "nothing"
			};

			// Send a single email
			template(email.template, locals, function(err, html, text) {
			    if (err) {
				    cb(err, null);
			    } else {
					transport.sendMail({
							from: locals.email,
							to: email.user,
							subject: 'New message from ' + locals.email,
							html: html,
							text: text
						}, function(err, responseStatus) {
						    if (err) {
							    cb(err, null);
						    } else {
							    cb(null, responseStatus.message);
						    }
						}
					);
			    }
			});
		}
	});
}