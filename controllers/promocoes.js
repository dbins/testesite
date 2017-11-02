var webservice = require('./../servicos/deals.js');
var moment = require('moment');

module.exports = function (app){
	
	
	app.get("/promocoes", function(req,res){
		var api = new webservice(req.session.shopping);
		var consulta = api.listGQL().then(function (resultados) {
			
			promocoes = api.montarGQL(resultados);	
			
			res.render("promocoes/index", {resultados:promocoes});
		}).catch(function (erro){
			console.log(erro.stack);
			res.status(500).redirect('/erro/500');
		});
		
	});
	
	//app.post("/promocoes", function(req,res){
	//	var consulta = api.list().then(function (resultados) {
	//		res.render("promocoes/index", {resultados:resultados});
	//	}).catch(function (erro){
	//		res.render("promocoes/index", {resultados:{}});
	//	});
	//});
	
	app.get("/promocoes/promocao/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		var api = new webservice(req.session.shopping);
		var consulta = api.viewGQL(nomedapromocao).then(function (resultados) {
			var consulta2 = api.listGQL().then(function (resultados2) {
				var outros = api.montarGQL(resultados2);	
				var resultado = api.montarViewGQL(resultados.dados)
				res.render("promocoes/promocao", {resultados:resultado, outros:outros,moment: moment});
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
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
