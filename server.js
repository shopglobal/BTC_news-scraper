/* BTC_news-scraper
*=======NHJ======== */

//Dependencies:
var express = require("express");
var mongoose = require("mongoose");
var Promise = require("bluebird");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var path = require("path");
var methodOverride = require("method-override");


mongoose.Promise = Promise;
Promise.promisifyAll(mongoose);


//Initialize Express
var app = express();
var PORT = process.env.PORT || 8080;

//Middleware
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(__dirname + '/public'));
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: __dirname + "/views/layouts"}));
app.set("view engine", "handlebars");


//Database configuration for Mongoose
/*  ==== PRODUCTION  ==== */
mongoose.connect("mongodb://heroku_61r5kd5m:c63jhjs6ndeh07q6igunp3fk0p@ds153689.mlab.com:53689/heroku_61r5kd5m");
// mongoose.connect("mongodb://localhost/btcnews");
// mongoose.set("debug", true);
var db = mongoose.connection;

db.once("open", function(){
  console.log("Mongoose connected and ready to rock.")
  require("./app/routes/control.js")(app);
});




app.listen(PORT, function(){
  console.log("App running on PORT: ", PORT);
})
