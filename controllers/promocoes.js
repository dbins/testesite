var webservice = require('./../servicos/deals.js');

module.exports = function (app){
	
	
	app.get("/promocoes", function(req,res){
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			res.render("promocoes/index", {resultados:resultados.dados.data});
		}).catch(function (erro){
			console.log('erro');
			res.render("promocoes/index", {resultados:{}});
		});
		
	});
	app.post("/promocoes", function(req,res){
		var consulta = api.list().then(function (resultados) {
			res.render("promocoes/index", {resultados:resultados});
		}).catch(function (erro){
			console.log('erro');
			res.render("promocoes/index", {resultados:{}});
		});
	});
	
	app.get("/promocoes/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
	
	app.get("/promocoes/favoritar/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
	
	app.get("/promocoes/desfavoritar/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
}
