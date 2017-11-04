var webservice = require('./../servicos/coupons.js');
var webservice_categorias = require('./../servicos/categories.js');
var rp2 = require('request-promise'); 
var api = new webservice();

module.exports = function (app){
	app.get("/cupons", function(req,res){
		var api = new webservice(req.session.shopping);
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
}
