var webservice = require('./../servicos/events.js');
var moment = require('moment');

module.exports = function (app){

	
	app.get("/eventos", function(req,res){
		var api = new webservice(req.session.shopping);	
		var consulta = api.listGQL().then(function (resultados) {
			var eventos = api.montarGQL(resultados);	
			res.render("eventos/index", {resultados:eventos, shoppings: app.locals.shoppings});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
		
	});
	app.post("/eventos", function(req,res){
		res.render("eventos/index");
	});
	
	app.get("/eventos/evento/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		var api = new webservice(req.session.shopping);
		var consulta = api.viewGQL(nomedoevento).then(function (resultados) {
			var consulta2 = api.listGQL().then(function (resultados2) {
				var outros = api.montarGQL(resultados2);	
				var resultado = api.montarViewGQL(resultados.dados)
				res.render("eventos/evento", {resultados:resultado, outros:outros,moment: moment});
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.post("/eventos/favoritar", function(req,res){
		var nomedoevento = req.body.evento;
		var api = new webservice(req.session.shopping);
		var adicionar = true;
		if (req.session.favoritos_eventos){
			for (index = 0; index < req.session.favoritos_eventos.length; ++index) {
				if (req.session.favoritos_eventos[index].id == nomedoevento){
					adicionar = false;	
				}	
			}
		}
		var retorno = 0;
		if (adicionar){
			if(!req.session.favoritos_eventos){
				req.session.favoritos_eventos = [];
			}
			var consulta = api.viewGQL(nomedoevento).then(function (resultados) {	
				
				var tmp_dados = resultados.dados;
				var tmp = api.montarViewGQL(tmp_dados);
				var tmp2 = req.session.favoritos_eventos;
				tmp2.push(tmp);
				req.session.favoritos_eventos = tmp2;
				retorno = 1;
				req.session.save(function (err) {
					if (err) return next(err)
				});			
			}).catch(function (erro){
				retorno = 2;
			});
		}
		res.json({resultado:retorno});
	});
	
	app.post("/eventos/desfavoritar", function(req,res){
		var nomedoevento = req.body.evento;
		var retorno = 0;
		if(req.session.favoritos_eventos){
			for (index = 0; index < req.session.favoritos_eventos.length; ++index) {
				if (req.session.favoritos_eventos[index].id == nomedoevento){
					req.session.favoritos_eventos.splice(index, 1);
					retorno = 1;
				}
			}
		}
		res.json({resultado:retorno});
	});
	
}
