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
//app.use(morgan('{"remote_addr": ":remote-addr", "remote_user": ":remote-user", "date": ":date[clf]", "method": ":method", "url": ":url", "http_version": ":http-version", "status": ":status", "result_length": ":res[content-length]", "referrer": ":referrer", "user_agent": ":user-agent", "response_time": ":response-time"}', {stream: logger.stream}));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser()); 
app.use(session({secret: 'ssshhhhh', name : 'sessmkId', resave: true, saveUninitialized: true, cookie: {secure: true, sameSite: true, httpOnly: true,  ephemeral: true, expires: expirarCookie}}));


app.use(csrf({ cookie: true })); //TEM QUE FICAR AQUI 

// Tratar o erro de postar sem o token antes das rotas!
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  res.status(403)
  res.send('Operacao nao permitida');
})


app.use(function(request,response,next){
	response.locals.csrfToken = request.csrfToken();
    next() 
})

app.use(express.static(__dirname + '/public'));
consign()
  .include('controllers')
  .into(app);	
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//Definir variaveis globais de teste
var carrinho = [];
var marcas  = [{"title": "Arezzo"}, {"title": "Empório Colombo"}, {"title": "Zoomp"}, {"title": "Fascynios"}];
var categorias = [{ "url_title" : "shoes", "title" : "Calçados" },{ "url_title" : "healthcare", "title" : "Saúde e Beleza" },{ "url_title" : "toysgifts", "title" : "Brinquedos e presentes" },{ "url_title" : "library", "title" : "Livrarias, Papelarias e Gráficas" }];
var shoppings = [{"_id":"59b039b6ad89e0f9883aab50","url_title":"grand_plaza_shopping","domain":"grandplazashopping.com.br","title":"Grand Plaza Shopping", "on": "https://d2dzv4u894anei.cloudfront.net/"},{"_id":"59b039d9ad89e0f9883aab56","url_title":"tiete_plaza_shopping","domain":"tieteplazashopping.com.br","title":"Tiete Plaza Shopping", "on": "https://tps-concierge.s3-sa-east-1.amazonaws.com/"},{"_id":"59b039ecad89e0f9883aab65","url_title":"shopping_cerrado","domain":"shoppingcerrado.com.br","title":"Shopping Cerrado", "on": "https://s3-sa-east-1.amazonaws.com/sc-concierge/"},{"_id":"59b039fdad89e0f9883aab69","url_title":"shopping_metropolitano_barra","domain":"shoppingmetropolitanobarra.com.br","title":"Shopping Metropolitano Barra", "on": "https://smb-concierge.s3-us-west-2.amazonaws.com/"},{"_id":"0","url_title":"shopping_cidade_sao_paulo","domain":"shoppingcidadesp.com.br","title":"Shopping Cidade São Paulo", "on": ""}];

app.set('shoppings', shoppings);
app.set('categorias', categorias);
app.set('marcas', marcas);
app.set('carrinho', carrinho);
app.locals.caminho_imagem = function (url_title) {
  var retorno = "";
  shoppings.forEach(function(item){
	  if (item.url_title == url_title){
		retorno = item.on;
	}
  });
  return retorno;
}

app.locals.nome_shopping = function (url_title) {
  var retorno = "";
  shoppings.forEach(function(item){
	  if (item.url_title == url_title){
		retorno = item.title;
	}
  });
  return retorno;
}

app.locals.shopping = '';
app.locals.nome_do_shopping = '';
app.locals.shoppings = shoppings;
app.locals.nome_do_shopping_barra_titulo = "";


//Tratando o erro de rota invalida
app.use(function(req, res, next){
    res.status(404).redirect('/erro/404');
});

app.use(function(req, res, next){
    res.status(500).redirect('/erro/500');
});


var port = process.env.PORT || 3000;
var server     =    app.listen(port,function(){
    console.log("Servidor ativado na porta " + port);
});