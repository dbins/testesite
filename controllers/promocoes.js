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
	
	app.post("/promocoes/favoritar", function(req,res){
		var nomedapromocao = req.body.promocao;
		var api = new webservice(req.session.shopping);
		var adicionar = true;
		if (req.session.favoritos_promocoes){
			for (index = 0; index < req.session.favoritos_promocoes.length; ++index) {
				if (req.session.favoritos_promocoes[index].id == nomedapromocao){
					adicionar = false;	
				}	
			}
		}
		var retorno = 0;
		if (adicionar){
			if(!req.session.favoritos_promocoes){
				req.session.favoritos_promocoes = [];
			}
			var consulta = api.viewGQL(nomedapromocao).then(function (resultados) {	
				
				var tmp_dados = resultados.dados;
				var tmp = api.montarViewGQL(tmp_dados);
				var tmp2 = req.session.favoritos_promocoes;
				tmp2.push(tmp);
				req.session.favoritos_promocoes = tmp2;
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
	
	app.post("/promocoes/desfavoritar", function(req,res){
		var nomedapromocao = req.body.promocao;
		var retorno = 0;
		if(req.session.favoritos_promocoes){
			for (index = 0; index < req.session.favoritos_promocoes.length; ++index) {
				if (req.session.favoritos_promocoes[index].id == nomedapromocao){
					req.session.favoritos_promocoes.splice(index, 1);
					retorno = 1;
				}
			}
		}
		res.json({resultado:retorno});
	});
}
