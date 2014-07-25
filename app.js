var flatiron = require('flatiron'),
    path = require('path'),
    nstatic = require('node-static');
    app = flatiron.app;

app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

var file = new nstatic.Server(__dirname + '/public/');

app.use(flatiron.plugins.http, {
	before: [
		function (req, res) {
			var found = app.router.dispatch(req, res);
			if(!found) {
				file.serve(req, res);
			}
		}
	]
});

app.router.path('/users', require('./routes/users'));

app.start(3000);
