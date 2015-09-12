
// These two lines are required to initialize Express in Cloud Code.
express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');
app = express();

    // Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body
app.use(express.cookieParser('YOUR_SIGNING_SECRET')); //TODO: understand this before the app goes live.
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
    res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.post('/hello', function (req, res) {
    Parse.User.logIn(req.body.username, req.body.password).then(function() {
        // Login succeeded, redirect to homepage.
        // parseExpressCookieSessio  n will automatically set cookie.
        res.redirect('/main');
    },
    function(error) {
        // Login failed, redirect back to login form.
        console.log("DELETEME: LOGIN ERROR", error);
        console.log(error);
        res.redirect('/hello');
    });
});

app.get('/signup', function(req, res) {
    res.render('signup');
});

app.post('/signup', function (req, res) {
    var newUser = new Parse.User();
    newUser.set("username", req.body.username);
    newUser.set("password", req.body.password);
    newUser.signUp(null, {
        success: function(user) {
            res.redirect('/main');
        },
        error: function(user, error) {
            console.log("DELETEME: Some error happened");
            console.log(error);
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
        }
    });
});
app.get('/main', function(req, res) {
    var currentUser = Parse.User.current();

    if (currentUser) {
        res.render('main');
    } else {
        res.redirect('/hello');
    }
});

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
