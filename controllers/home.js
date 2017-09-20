var webservice_banners = require('./../servicos/banners.js');
var rp2 = require('request-promise'); 

module.exports = function (app){
	
	app.get("/home", function(req,res){
		var api_banners = new webservice_banners('');
		var consulta = api_banners.list().then(function (resultados) {
			var banners = [];
			if (JSON.stringify(resultados.dados) === "{}"){
				//Nao retornou banners
			} else {
				banners = resultados.dados.data;	
			}
			res.render("home/index", {banners:banners, shopping:''});
		}).catch(function (erro){
			res.render("home/index", {banners:[], shopping:''});
		});
		
		
	});
	
	app.get("/home/:nomedoshopping", function(req,res){
		var nomedoshopping = req.params.nomedoshopping;
		
		//Validar se o nome existe!
		var tmp = app.locals.nome_shopping(nomedoshopping);
		if (tmp==""){
			//Nao localizado
			res.redirect('/erro/404');
		} else {
			app.locals.shopping = nomedoshopping;
			
			app.locals.nome_do_shopping_barra_titulo = " | " + tmp ;
			
			var api_banners = new webservice_banners(nomedoshopping);
			var consulta = api_banners.list(nomedoshopping).then(function (resultados) {
				var banners = [];
				if (JSON.stringify(resultados.dados) === "{}"){
					//Nao retornou banners
				} else {
					banners = resultados.dados.data;	
				}
				res.render("home/index", {banners:banners, shopping:nomedoshopping});
				
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:nomedoshopping});
			});
		}
	});
	app.get("/banners", function(req,res){
		//Retorna JSON
	});
	
	
}
