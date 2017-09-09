var cookieParser = require("cookie-parser");
var bodyParser  = require("body-parser");
var express  = require('express');
var session = require('express-session');
var consign = require('consign');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); 
app.use(session({secret: 'ssshhhhh', resave: true, saveUninitialized: true}));
app.use(express.static(__dirname + '/public'));
consign()
  .include('controllers')
  .into(app);	
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('shopping', 'TESTE');
var port = process.env.PORT || 3000;
var server     =    app.listen(port,function(){
    console.log("Servidor ativado na porta " + port);
});