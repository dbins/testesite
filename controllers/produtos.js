var webservice = require('./../servicos/deals.js');
var rp2 = require('request-promise'); 
var api = new webservice();
module.exports = function (app){
	
	app.get("/produtos/senhas", function(req,res){
		var dados_de_login = {
			"email": "feathers@example.com", 
			"password": "secret" 
		}
		var opcoes = {  
		  method: 'POST',
		  uri: 'https://concierge-api.appspot.com/authentication',
		  body: dados_de_login,
		  json: true // JSON stringifies the body automatically
		}
		
		rp2(opcoes).then(function (response) {
			console.log("sucesso");
		}).catch(function (err) {
			console.log("erro");
		});
	});
	
	app.get("/produtos", function(req,res){
		var marcas = app.get('marcas');
		var categorias = app.get('categorias');
		var consulta = api.list().then(function (resultados) {
			console.log(api.paginas);
			res.render("produtos/index", {resultados:resultados, categorias: categorias, marcas: marcas});
		}).catch(function (erro){
			res.render("produtos/index", {resultados:{}, categorias:{},marcas:{}});
		});
		
	});
	app.post("/produtos", function(req,res){
		res.render("produtos/index");
		
	});
	app.get("/produtos/:nomedoproduto", function(req,res){
		var nomedoproduto = req.params.nomedoproduto;
		var consulta = api.view(nomedoproduto).then(function (resultados) {
			res.render("produtos/produto", {resultados:resultados});
		}).catch(function (erro){
			res.render("produtos/produto", {resultados:{}});
		});
	});
	
	app.get("/produtos/favoritar/:nomedoproduto", function(req,res){
		var nomedoproduto = req.params.nomedoproduto;
		res.render("produtos/produto");
	});
	
	app.get("/produtos/desfavoritar/:nomedoproduto", function(req,res){
		var nomedoproduto = req.params.nomedoproduto;
		res.render("produtos/produto");
	});
	
	app.get("/produtos/pagina/:pagina", function(req,res){
		var pagina = req.params.pagina;
		var consulta = api.paginacao(pagina).then(function (resultados) {
		}).catch(function (erro){
			res.json({resultados:{}});
		});
		
	});
	

	
}
