var csrf = require('csurf');
var morgan = require("morgan");
var winston = require('winston');
var cookieParser = require("cookie-parser");
var bodyParser  = require("body-parser");
var express  = require('express');
var helmet = require('helmet')
var session = require('express-session');
var consign = require('consign');
var app = express();

var expirarCookie = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hora
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
	  handleExceptions: true,
      json: false,
      colorize: true,
    })
  ]
});
logger.level = 'info';
logger.stream = { 
  write: function(message, encoding){ 
    logger.info(message); 
  } 
}; 

//app.use(require("morgan")("combined", { "stream": logger.stream }));
app.use(morgan('{"remote_addr": ":remote-addr", "remote_user": ":remote-user", "date": ":date[clf]", "method": ":method", "url": ":url", "http_version": ":http-version", "status": ":status", "result_length": ":res[content-length]", "referrer": ":referrer", "user_agent": ":user-agent", "response_time": ":response-time"}', {stream: logger.stream}));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); 
app.use(csrf({ cookie: true }))
app.use(session({secret: 'ssshhhhh', name : 'sessmkId', resave: true, saveUninitialized: true, cookie: {secure: true, httpOnly: true, expires: expirarCookie}}));
app.use(express.static(__dirname + '/public'));
consign()
  .include('controllers')
  .into(app);	
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('shopping', 'TESTE');

app.use(function(req, res, next){
    res.status(404).render('erro/404');
});

var port = process.env.PORT || 3000;
var server     =    app.listen(port,function(){
    console.log("Servidor ativado na porta " + port);
});