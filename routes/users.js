var fs  	= require('fs'),
	couchdb = require('../lib/couchdb'),
	dbName  = 'users',
	db      = couchdb.use(dbName),
	Plates  = require('plates'),
	layout  = require('../templates/layout');

var templates = {
	'new' 	: fs.readFileSync(__dirname + '/../templates/users/new.html', 'utf8'),
	'show' 	: fs.readFileSync(__dirname + '/../templates/users/show.html', 'utf8')
};

function insert(doc, key, callback) {
	console.log("function insert: ", key);
	var tried = 0, lastError;

	(function doInsert() {
		tried++;
		if (tried >= 2) {
			return callback(lastError);
		}
		db.insert(doc, key, function(err) {
			if(err) {
				lastError = err;
				if (err.status_code === 404) {
					console.log('status_code 404 no db')
					couchdb.db.create(dbName, function(err) {
						console.log("create_db");
						if (err) {
							return callback(err);
						}
						doInsert();
					});
				} else {
					console.log(err);
					return callback(err);
				}
			}
			callback.apply({}, arguments);
		});
	}());
}

function render(user) {
	var map = Plates.Map();
	map.where('id').is('email').use('email').as('value');
	map.where('id').is('password').use('password').as('value');
	return Plates.bind(templates['new'], user || {}, map);
}

module.exports = function() {
	this.get('/new', function () {
		this.res.writeHead(200, {'Content-Type': 'text/html'});
		this.res.end(layout(render(), 'New User'));
	});

	this.post('/', function() {
    
	    var res = this.res,
	        user = this.req.body;

	    if (! user.email || ! user.password) {
	      return this.res.end(layout(templates['new'],
	        'New User', {error: 'Incomplete User Data'}));
	    }
	    console.log('calling insert user');
	    insert(user, this.req.body.email, function(err) {
	    	console.log("insert callback, is there error? - ", err);
			if (err) {
				if (err.status_code === 409) {
					console.log("status code 409.");
				  return res.end(layout(render(user), 'New User', {
				    error: 'We already have a user with that email address.'}));
				}
				console.error(err.trace);
				res.writeHead(500, {'Content-Type': 'text/html'});
				return res.end(err.message);
			}
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(layout(templates['show'], 'Registration Complete'));
			console.log('done insert user');
		});
	    
	});
};