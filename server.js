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
var carrinho = [];
var produtos = [];
var favoritos_produtos = [];
var favoritos_promocoes = [];
var favoritos_lojas = [];
var favoritos_eventos = [];
var marcas  = [{"title": "Arezzo"}, {"title": "Empório Colombo"}, {"title": "Zoomp"}, {"title": "Fascynios"}];
var categorias = [{ "url_title" : "shoes", "title" : "Calçados" },{ "url_title" : "healthcare", "title" : "Saúde e Beleza" },{ "url_title" : "toysgifts", "title" : "Brinquedos e presentes" },{ "url_title" : "library", "title" : "Livrarias, Papelarias e Gráficas" }];
var shoppings = [{"_id":"59c18501c171621ea44959b5","url_title":"grand_plaza_shopping","domain":"grandplazashopping.com.br","title":"Grand Plaza Shopping", "on": "https://d2dzv4u894anei.cloudfront.net/", "ingresso": "350"},{"_id":"59c18517c171621ea44959cb","url_title":"tiete_plaza_shopping","domain":"tieteplazashopping.com.br","title":"Tiete Plaza Shopping", "on": "https://tps-concierge.s3-sa-east-1.amazonaws.com/", "ingresso": "1295"},{"_id":"59c1852ec171621ea44959e1","url_title":"shopping_cerrado","domain":"shoppingcerrado.com.br","title":"Shopping Cerrado", "on": "https://s3-sa-east-1.amazonaws.com/sc-concierge/", "ingresso": "1389"},{"_id":"59c18559c171621ea4495a18","url_title":"shopping_metropolitano_barra","domain":"shoppingmetropolitanobarra.com.br","title":"Shopping Metropolitano Barra", "on": "https://smb-concierge.s3-us-west-2.amazonaws.com/", "ingresso": "1210"},{"_id":"59c18469c171621ea4495917","url_title":"shopping_cidade_sao_paulo","domain":"shoppingcidadesp.com.br","title":"Shopping Cidade São Paulo", "on": "", "ingresso": "1313"}, {"_id":"59c1853fc171621ea44959f7","url_title":"shopping_d","domain":"shoppingd.com.br","title":"Shopping D", "on": "", "ingresso": "154"}];


var pedidos = [];
//var pedidos = [{"pedido":"12345567", "data":"23/08/2017", "valor": "150,00"},{"pedido":"12345568", "data":"27/08/2017", "valor": "250,00"},{"pedido":"12345569", "data":"29/08/2017", "valor": "90,00"},{"pedido":"12345570", "data":"30/08/2017", "valor": "270,00"},{"pedido":"12345571", "data":"03/09/2017", "valor": "950,00"}];
var cartoes = [{"nome":"Obi Wan Kenobi", "comeco":"5548", "fim":"2593"},{"nome":"Anakin Skywalker", "comeco":"5540", "fim":"3513"},{"nome":"Han Solo", "comeco":"1248", "fim":"2190"}];
//var produtos = [{"id": "1","desconto":"30", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Oxford Feminino Facinelli", "de":"35.40", "por": "20.00", "shopping":"Shopping Cerrado"},{"id": "2","desconto":"20", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Manchester Feminino Facinelli", "de":"55.40", "por": "20.00", "shopping":"Shopping Cidade São Paulo"},{"id": "3","desconto":"30", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Cleveland Feminino Facinelli", "de":"75.40", "por": "20.00", "shopping":"Shopping Cerrado"},{"id": "4","desconto":"50", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Houston Feminino Facinelli", "de":"35.40", "por": "20.00", "shopping":"Shopping Cerrado"},{"id": "5","desconto":"40", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Indianapolis Feminino Facinelli", "de":"35.40", "por": "20.00", "shopping":"Shopping D"}];

//var carrinho = [{"id": "1", "desconto":"30", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Oxford Feminino Facinelli", "de":"35.10", "por": "22.50", "qtde": "1", "total": "20", "shopping":"Shopping Cerrado"},{"id": "2", "desconto":"20", "imagem":"chapeu2.jpg", "marca":"Arezzo", "produto":"Chapeu Feminino", "de":"55.40", "por": "30.00", "qtde": "1", "total": "30", "shopping":"Shopping Cidade São Paulo"},{"id": "3", "desconto":"10", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":"Sapato Cleveland Feminino Facinelli", "de":"75.40", "por": "50.00", "qtde": "1", "total": "50", "shopping":"Shopping D"}];


//Variaveis acessadas apenas dentro dos controllers!
app.set('shoppings', shoppings);
app.set('categorias', categorias);
app.set('marcas', marcas);
app.set('carrinho', carrinho);
app.set('pedidos', pedidos);
app.set('cartoes', cartoes);
app.set('produtos', produtos);

app.set('favoritos_produtos', favoritos_produtos);
app.set('favoritos_promocoes', favoritos_promocoes);
app.set('favoritos_lojas', favoritos_lojas);
app.set('favoritos_eventos', favoritos_eventos);
app.set('ultima_transacao', 0);

app.locals.produtos = produtos;
app.locals.tokenAPI = "";
app.locals.tokenUsuario = "";
app.locals.total_carrinho = 0;

//Funcoes para padronizar nomes e caminho de imagens!
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

//As variaveis como app.locals podem ser acessadas pelos templates ejs!
app.locals.usuario = '';
app.locals.letras = '';
app.locals.shopping = '';
app.locals.nome_do_shopping = '';
app.locals.shoppings = shoppings;
app.locals.nome_do_shopping_barra_titulo = "";
app.locals.id_do_shopping_ingresso = "1313";
app.locals.token_api = "";
app.locals.pgtk = "";


//Transformando variaveis de sessao em variaveis locais
//As variaveis app.locals nao serao mais utilizadas
app.use((req, res, next) => {
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