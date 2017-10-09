var webservice = require('./../servicos/deals.js');
var moment = require('moment');

module.exports = function (app){
	
	
	app.get("/promocoes", function(req,res){
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			
			var promocoes = [];
			if (JSON.stringify(resultados.dados) === "{}"){
				//Nao retornou banners
			} else {
				promocoes = resultados.dados.data;
			}
			
			
			res.render("promocoes/index", {resultados:promocoes});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
		
	});
	app.post("/promocoes", function(req,res){
		var consulta = api.list().then(function (resultados) {
			res.render("promocoes/index", {resultados:resultados});
		}).catch(function (erro){
			res.render("promocoes/index", {resultados:{}});
		});
	});
	
	app.get("/promocoes/promocao/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		var api = new webservice(app.locals.shopping);
		//var consulta = api.view(nomedapromocao).then(function (resultados) {
		//	var consulta2 = api.list().then(function (resultados2) {
		//		if (typeof resultados.dados.info.title === undefined) {
					//res.status(500).redirect('/erro/500');
		//		} else {
					//res.render("promocoes/promocao", {resultados:resultados.dados, outros:resultados2.dados.data,moment: moment});
					res.render("promocoes/promocao", {resultados:{}, outros:{}	,moment: moment});
					
		//		}
				
		//	}).catch(function (erro){
		//		res.status(500).redirect('/erro/500');
		//	});
		//}).catch(function (erro){
		//	res.status(500).redirect('/erro/500');
		//});
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
