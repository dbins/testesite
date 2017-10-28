var webservice_banners = require('./../servicos/banners.js');
var webservice_produtos = require('./../servicos/products.js');
var rp2 = require('request-promise'); 
var imagens_shopping = ["foto-shopping-granplaza.png","foto-shopping-tiete.png","foto-shopping-cerrado.png","foto-shopping-cidadesp.png","foto-shopping-cidadesp.png","foto-shopping-d.png"];
module.exports = function (app){
	
	app.get("/home", function(req,res){
		var lista_produtos = [];
		var api_produtos = new webservice_produtos('');
		var consulta = api_produtos.listGQL().then(function (resultados) {
			
			var lista_produtos = api_produtos.montarGQL(resultados);
			var api_banners = new webservice_banners('');
			var consulta = api_banners.list().then(function (resultados) {
				var banners = [];
				if (JSON.stringify(resultados.dados) === "{}"){
					//Nao retornou banners
				} else {
					banners = resultados.dados.data;	
				}
				res.render("home/index", {banners:banners, shopping:'', produtos: lista_produtos, imagens_shopping: imagens_shopping });
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:'', produtos: lista_produtos, imagens_shopping: imagens_shopping });
			});	
		}).catch(function (erro){
			res.render("home/index", {banners:[], shopping:'', produtos: lista_produtos, imagens_shopping: imagens_shopping});
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
			var consulta = api_produtos.listGQL().then(function (resultados) {
				var lista_produtos = api_produtos.montarGQL(resultados);
				var api_banners = new webservice_banners(nomedoshopping);
				var consulta = api_banners.list(nomedoshopping).then(function (resultados) {
					var banners = [];
					if (JSON.stringify(resultados.dados) === "{}"){
						//Nao retornou banners
					} else {
						banners = resultados.dados.data;	
					}
					res.render("home/index", {banners:banners, shopping:nomedoshopping, produtos: lista_produtos, imagens_shopping: imagens_shopping});
					
				}).catch(function (erro){
					res.render("home/index", {banners:[], shopping:nomedoshopping, produtos: lista_produtos, imagens_shopping: imagens_shopping});
				});	
		
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:'', produtos: [], imagens_shopping: imagens_shopping});
			});		
			
		}
	});
	
	//Talvez nao vai ser utilizado!
	app.get("/banners", function(req,res){
		//Retorna JSON
	});
	
	
}
