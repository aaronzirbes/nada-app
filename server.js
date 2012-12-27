var express =   require('express');
var http =      require('http');
var https =     require('https');
var qs =        require('querystring');
var request =   require('request');
var async =     require('async');
var ejslocals = require('ejs-locals');
var mongoose =  require('mongoose');
var connect =   require('connect');
var uuid =      require('node-uuid');
var _ =         require('underscore');
var app = express();
var memStore = express.session.MemoryStore
var db = mongoose.createConnection('localhost', 'nadaapp');


/**
 * Load the servers models into Mongoose
 */
require(__dirname + "/models/User.js").loadModel(mongoose, db);

app.configure('all', function() {

    app.engine('ejs', ejslocals);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.set('view options', {
        open: '<%',
        close: '%>'
    });

    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: uuid.v4(),
        key: 'sid',
        maxAge: new Date(Date.now() + 60000*10),
        cookie: { maxAge: 60000*10, path: '/', httpOnly: true },
        store : memStore({ reapInterval: 60000*10 })
    }));

    console.log(uuid.v4());

    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));

    app.use(app.router);
    app.set('port', 3000);
});

function clientErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.send(500, { error: 'Something blew up!' });
    } else {
        next(err);
    }
}

function errorHandler(err, req, res, next) {
    res.status(500);
    console.log('Ohs nos');
    res.render(err);
}

/**
 * Controllers for sections of the website
 */
require("./controllers/IndexController.js").init(app, db);
require("./controllers/AuthController.js").init(app, db);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
    console.log(app.routes);
});