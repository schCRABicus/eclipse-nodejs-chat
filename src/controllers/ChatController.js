var util = require('util');
var mapping = exports.mapping = {
    get : {
       '/index' : showMain
    },
    post : {
    
    }
};

function showMain(req, res){
    util.log("showing main page");
	res.render(
		'index.html',
		{
			user : req.session.user
		}
	);
}