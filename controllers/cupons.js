var webservice = require('./../servicos/coupons.js');
var webservice_categorias = require('./../servicos/categories.js');
var rp2 = require('request-promise'); 
var api = new webservice();

module.exports = function (app){
	app.get("/cupons", function(req,res){
		var api = new webservice(req.session.shopping);
		if (req.session.favoritos_cupons){
			api.guardarFavoritos(req.session.favoritos_cupons);
		}
		var consulta = api.listGQL().then(function (resultados) {
			var api_categorias = new webservice_categorias();
			var categorias = api_categorias.All().then(function (resultados2) {
				var lista_categorias = api_categorias.montarCategorias(resultados2.dados.data);
				var cupons = api.montarGQL(resultados);
				var lojas = api.listaLojas(resultados);
				res.render("cupons/index", {resultados:cupons, categorias: lista_categorias, lojas: lojas});	
			}).catch(function (erro2){
				res.status(500).redirect('/erro/500');
			});
			
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.get("/cupons/:iddocupom", function(req,res){
		var api = new webservice(req.session.shopping);
		var iddocupom = req.params.iddocupom;
		var consulta = api.viewGQL(iddocupom).then(function (resultados) {	
			var cupom = api.montarCupomGQL(resultados.dados);
			var consulta2 = api.listGQLStore(resultados.dados.store.slug).then(function (resultados2) {
				var tmp_relacionados = api.montarGQL(resultados2);
				res.render("cupons/cupom",{resultado:cupom, relacionados: tmp_relacionados});	
			}).catch(function (erro2){
				res.redirect("/erro/500");
			});	
			
		}).catch(function (erro){
			res.redirect("/erro/500");
		});
		
		
		
	});
	
	app.post("/cupons/favoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		
		var adicionar = true;
		if (req.session.favoritos_cupons){
			for (index = 0; index < req.session.favoritos_cupons.length; ++index) {
				if (req.session.favoritos_cupons[index].id == nomedoproduto){
					adicionar = false;	
				}	
			}
		}
		var retorno = 0;
		if (adicionar){
			if(!req.session.favoritos_cupons){
				req.session.favoritos_cupons = [];
			}
			var consulta = api.viewGQL(nomedoproduto).then(function (resultados) {	
				
				var tmp_dados = resultados.dados;
				var tmp = api.montarCupomGQL(tmp_dados);
				var tmp2 = req.session.favoritos_cupons;
				tmp2.push(tmp);
				req.session.favoritos_cupons = tmp2;
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
	
	app.post("/cupons/desfavoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		var retorno = 0;
		if(req.session.favoritos_cupons){
			for (index = 0; index < req.session.favoritos_cupons.length; ++index) {
				if (req.session.favoritos_cupons[index].id == nomedoproduto){
					req.session.favoritos_cupons.splice(index, 1);
					retorno = 1;
				}
			}
		}
		res.json({resultado:retorno});
	});
	
}
