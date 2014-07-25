var assert     = require('assert'),
	Browser    = require('zombie'),
	app        = require('../app'),
    fixtures   = require('./fixtures.js'),
    couchdb    = require('../lib/couchdb'),
    dbName     = 'users',
    db         = couchdb.use(dbName)
;

before(function(done) {
	app.start(3000, done);
});

after(function(done) {
	app.server.close(done);
});

describe('Users', function () {

	describe('Signup Form', function() {

		before(function(done) {
			db.get(fixtures.user.email, function(err, doc) {
				if (err && err.satus_code === 404)
					return done();
				if (err) throw err;
				db.destroy(doc._id, doc._rev, done);
			});
		});	

		it('should load the signup form', function(done) {
			Browser.visit("http://localhost:3000/users/new", function(err, browser) {
				if (err) throw err;
				console.log("VISIT IS DONE");
				assert.ok(browser.success, 'page loaded');
				assert.equal(browser.text('h1'), 'New User');

				var form = browser.query('form');
				assert(form, 'form exists');
				assert.equal(form.method, 'POST', 'uses POST method');
				assert.equal(form.action, '/users', 'posts to /users');

				assert(browser.query(
					'input[type=email]#email', form), 
					'has email input');
				assert(browser.query(
					'input[type=password]#password', form), 
					'has password input');

				assert(browser.query(
					'input[type=submit]', form), 
					'has submit button');
				done();
			});
		});

		it("should submit", function(done) {
  			Browser.visit("http://localhost:3000/users/new", function(err, browser) {
    			if (err) throw err;

			    browser
					.fill('E-mail', fixtures.user.email)
					.fill('Password', fixtures.user.password)
					.pressButton('Submit', function(err) {
						if (err) throw err;
						assert.equal(browser.text('h1'), 'Thank you!');
						assert(browser.query('a[href="/session/new"]'),
						  'has login link');
						done();
					});

			});
		});

	});
});
