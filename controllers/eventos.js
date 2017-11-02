var webservice = require('./../servicos/events.js');
var moment = require('moment');

module.exports = function (app){

	
	app.get("/eventos", function(req,res){
		var api = new webservice(req.session.shopping);	
		var consulta = api.listGQL().then(function (resultados) {
			var eventos = api.montarGQL(resultados);	
			res.render("eventos/index", {resultados:eventos, shoppings: app.locals.shoppings});
		}).catch(function (erro){
			console.log(erro.stack);
			res.status(500).redirect('/erro/500');
		});
		
	});
	app.post("/eventos", function(req,res){
		res.render("eventos/index");
	});
	
	app.get("/eventos/evento/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		var api = new webservice(req.session.shopping);
		var consulta = api.view(nomedoevento).then(function (resultados) {
			var consulta2 = api.list().then(function (resultados2) {
				
				if (typeof resultados.dados.name === undefined) {
					res.status(500).redirect('/erro/500');
				} else {
					res.render("eventos/evento", {resultados:resultados.dados, outros:resultados2.dados.data,moment: moment});
				}
				
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.get("/eventos/favoritar/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		res.render("eventos/evento");
	});
	
	app.get("/eventos/desfavoritar/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		res.render("eventos/evento");
	});
	
}
