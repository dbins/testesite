var webservice_banners = require('./../servicos/banners.js');
var webservice_produtos = require('./../servicos/products.js');
var rp2 = require('request-promise'); 

module.exports = function (app){
	
	app.get("/home", function(req,res){
		var api_produtos = new webservice_produtos('');
		var consulta = api_produtos.listGQL().then(function (resultados) {
			
			req.session.produtos = api_produtos.montarGQL(resultados);
			var api_banners = new webservice_banners('');
			var consulta = api_banners.list().then(function (resultados) {
				var banners = [];
				if (JSON.stringify(resultados.dados) === "{}"){
					//Nao retornou banners
				} else {
					banners = resultados.dados.data;	
				}
				res.render("home/index", {banners:banners, shopping:'', produtos: req.session.produtos });
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:'', produtos: req.session.produtos });
			});	
		}).catch(function (erro){
			res.render("home/index", {banners:[], shopping:'', produtos: req.session.produtos});
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
			req.session.shopping = nomedoshopping;
			req.session.nome_do_shopping_barra_titulo = " | " + tmp ;
			
			var api_produtos = new webservice_produtos(nomedoshopping);
			var consulta = api_produtos.list().then(function (resultados) {
				req.session.produtos = api_produtos.montar(resultados.dados.data);
				var api_banners = new webservice_banners(nomedoshopping);
				var consulta = api_banners.list(nomedoshopping).then(function (resultados) {
					var banners = [];
					if (JSON.stringify(resultados.dados) === "{}"){
						//Nao retornou banners
					} else {
						banners = resultados.dados.data;	
					}
					res.render("home/index", {banners:banners, shopping:nomedoshopping, produtos: req.session.produtos});
					
				}).catch(function (erro){
					res.render("home/index", {banners:[], shopping:nomedoshopping, produtos: req.session.produtos});
				});	
		
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:'', produtos: req.session.produtos});
			});		
			
		}
	});
	
	//Talvez nao vai ser utilizado!
	app.get("/banners", function(req,res){
		//Retorna JSON
	});
	
	
}
