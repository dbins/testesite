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

//cookie secure: true apenas no ambiente de producao! 
app.use(session({secret: 'ssshhhhh', name : 'sessmkId', resave: false, saveUninitialized: true, cookie: {sameSite: true, httpOnly: true,  expires: expirarCookie}}));

app.use(csrf({ cookie: true })); //TEM QUE FICAR AQUI 

// Tratar o erro de postar sem o token antes das rotas!
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  res.status(403)
  res.send('Operacao nao permitida');
})

//Criando token para todas as requisicoes
app.use(function(request,response,next){
	response.locals.csrfToken = request.csrfToken();
    next() 
})

app.use(express.static(__dirname + '/public'));

	
  
//Ativando o sistema de templates
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


//Definir variaveis globais de teste
var shoppings = [{"_id":"59c18501c171621ea44959b5","url_title":"grand_plaza_shopping","domain":"grandplazashopping.com.br","title":"Grand Plaza Shopping", "on": "https://d2dzv4u894anei.cloudfront.net/", "ingresso": "350"},{"_id":"59c18517c171621ea44959cb","url_title":"tiete_plaza_shopping","domain":"tieteplazashopping.com.br","title":"Tiete Plaza Shopping", "on": "https://tps-concierge.s3-sa-east-1.amazonaws.com/", "ingresso": "1295"},{"_id":"59c1852ec171621ea44959e1","url_title":"shopping_cerrado","domain":"shoppingcerrado.com.br","title":"Shopping Cerrado", "on": "https://s3-sa-east-1.amazonaws.com/sc-concierge/", "ingresso": "1389"},{"_id":"59c18559c171621ea4495a18","url_title":"shopping_metropolitano_barra","domain":"shoppingmetropolitanobarra.com.br","title":"Shopping Metropolitano Barra", "on": "https://smb-concierge.s3-us-west-2.amazonaws.com/", "ingresso": "1210"},{"_id":"59c18469c171621ea4495917","url_title":"shopping_cidade_sao_paulo","domain":"shoppingcidadesp.com.br","title":"Shopping Cidade São Paulo", "on": "", "ingresso": "1313"}, {"_id":"59c1853fc171621ea44959f7","url_title":"shopping_d","domain":"shoppingd.com.br","title":"Shopping D", "on": "", "ingresso": "154"}];



//Variaveis acessadas apenas dentro dos controllers!
app.set('shoppings', shoppings);

//Funcoes para padronizar nomes e caminho de imagens!
app.locals.nome_shopping = function (url_title) {
  var retorno = "";
  shoppings.forEach(function(item){
	  if (item.url_title == url_title){
		retorno = item.title;
	}
  });
  return retorno;
}

//As variaveis como app.locals podem ser acessadas pelos templates ejs!
app.locals.shoppings = shoppings;
app.locals.token_api = "";


//Transformando variaveis de sessao em variaveis locais
//As variaveis app.locals nao serao mais utilizadas
app.use((req, res, next) => {
	res.locals.shopping = '';
	res.locals.nome_do_shopping_barra_titulo = '';
	res.locals.usuario= '';
	res.locals.total_carrinho = '';
	Object.assign(res.locals, req.session);
	next();
});

//Definindo as rotas
consign()
  .include('controllers')
  .into(app);

//Tratando o erro de rota invalida
app.use(function(req, res, next){
    res.status(404).redirect('/erro/404');
});
//Tratando algum erro de processamento
app.use(function(req, res, next){
    res.status(500).redirect('/erro/500');
});


var port = process.env.PORT || 3000;
var server     =    app.listen(port,function(){
    console.log("Servidor ativado na porta " + port);
});