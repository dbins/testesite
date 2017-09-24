var webservice = require('./../servicos/stores.js');
var dados_temporarios;
function ListarCategorias(dados, shopping){
	var categorias = []
	dados.forEach(function(obj) {
		
		if (categorias.indexOf(obj.info.category)<0){
			if (shopping == ''){
				categorias.push(obj.info.category);
			} else {
				if (shopping == obj.mall){
					categorias.push(obj.info.category);
				}
			}
		}
	});
	categorias.sort();
	return categorias;
}

module.exports = function (app){
	
	app.get("/lojas", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			var categorias = ListarCategorias(resultados.dados.data, app.locals.shopping);
			dados_temporarios = resultados.dados.data;
			if (typeof categorias === undefined) {
				res.status(500).redirect('/erro/500');
			} else {
				res.render("lojas/index", {resultados:resultados.dados.data, categorias: categorias});	
			}
			
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
		
	});
	app.post("/lojas", function(req,res){
		res.render("lojas/index");
	});
	
	app.get("/lojas/online", function(req,res){
		res.render("lojas/online");
	});
	
	app.post("/lojas/online", function(req,res){
		res.render("lojas/online");
	});

	app.get("/lojas/loja/:nomedaloja", function(req,res){
		var api = new webservice(app.locals.shopping);
		var nomedaloja = req.params.nomedaloja;
		var consulta = api.view(nomedaloja).then(function (resultados) {
			if (typeof resultados.dados.info.title === undefined) {
				res.status(500).redirect('/erro/500');
			} else {
				res.render("lojas/loja", {resultados:resultados.dados});
			}
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.get("/lojas/promocoes/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		//Retornar JSON
	});
	
	app.get("/lojas/favoritar/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		res.render("lojas/loja");
	});
	
	app.get("/lojas/desfavoritar/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		res.render("lojas/loja");
	});
	
}