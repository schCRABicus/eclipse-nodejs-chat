var mapping = exports.mapping = {
	get : {
		'/index' : checkAuthentication
	},
	post : {

	}
};

function checkAuthentication(req, res, next){
	var session = req.session,
		user = null;

	if (session){
		user = session.user;
	}
	if (user){
		next();
	} else{
		res.redirect('/login');
	}
}