var webservice_banners = require('./../servicos/banners.js');
var webservice_produtos = require('./../servicos/products.js');
var webservice_eventos = require('./../servicos/events.js');
var rp2 = require('request-promise'); 
var imagens_shopping = ["foto-shopping-granplaza.png","foto-shopping-tiete.png","foto-shopping-cerrado.png","foto-shopping-cidadesp.png","foto-shopping-cidadesp.png","foto-shopping-d.png"];
module.exports = function (app){
	
	app.get("/home", function(req,res){
		var lista_produtos = [];
		var api_produtos = new webservice_produtos('');
		if (req.session.favoritos_produtos){
			api_produtos.guardarFavoritos(req.session.favoritos_produtos);
		}
		
		var consulta = api_produtos.listGQL().then(function (resultados) {
			var lista_produtos = api_produtos.montarGQL(resultados);
			var api_banners = new webservice_banners('');
			var consulta = api_banners.listGQL().then(function (resultados2) {
				
				var banners = [];
				if (JSON.stringify(resultados.dados) === "{}"){
					//Nao retornou banners
				} else {
					banners = api_banners.montarGQL(resultados2);	
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
			var api_eventos = new webservice_eventos(nomedoshopping);
			var consulta = api_produtos.listGQL().then(function (resultados) {
				var lista_produtos = api_produtos.montarGQL(resultados);
				var api_banners = new webservice_banners(nomedoshopping);
				var consulta = api_banners.listGQL().then(function (resultados2) {
					var banners = [];
					if (JSON.stringify(resultados.dados) === "{}"){
						//Nao retornou banners
					} else {
						banners = api_banners.montarGQL(resultados2);	
					}
					var consulta_eventos = api_eventos.listGQL().then(function (resultados3) {
						var tmp_eventos = api_eventos.montarGQL(resultados3);	
						res.render("home/index", {banners:banners, eventos: tmp_eventos, shopping:nomedoshopping, produtos: lista_produtos, imagens_shopping: imagens_shopping});
					}).catch(function (erro3){
						res.render("home/index", {banners:[],  eventos: [], shopping:nomedoshopping, produtos: lista_produtos, imagens_shopping: imagens_shopping});
					});	
					
				}).catch(function (erro2){
					res.render("home/index", {banners:[],  eventos: [], shopping:nomedoshopping, produtos: lista_produtos, imagens_shopping: imagens_shopping});
				});	
		
			}).catch(function (erro){
				res.render("home/index", {banners:[], shopping:'', produtos: [], eventos: [], imagens_shopping: imagens_shopping});
			});		
			
		}
	});
	
	//Talvez nao vai ser utilizado!
	app.get("/banners", function(req,res){
		//Retorna JSON
	});
	
	
	app.get("/home_teste", function(req,res){
		var tamanho_pagina = 12;
		var pagina_atual = 1;
		var lista_produtos = [];
		var api_produtos = new webservice_produtos('');
		if (req.session.favoritos_produtos){
			api_produtos.guardarFavoritos(req.session.favoritos_produtos);
		}
		
		var consulta = api_produtos.listGQL().then(function (resultados) {
			var lista_produtos = api_produtos.montarGQL(resultados);
				req.session.lista_produtos =  lista_produtos;
				console.log(lista_produtos.length);
				var total_registros = lista_produtos.length;
				var total_paginas = Math.ceil(parseInt(total_registros) / parseInt(tamanho_pagina));
				console.log(total_paginas);
				
				var teste = api_produtos.retornarPaginaGQL(lista_produtos, pagina_atual, tamanho_pagina, total_paginas);
				res.render("home/teste", {banners:[], shopping:'', produtos:teste, eventos: [], imagens_shopping: imagens_shopping, total_paginas: total_paginas});
		}).catch(function (erro){
			res.render("home/teste", {banners:[], shopping:'', produtos: [], eventos: [], imagens_shopping: imagens_shopping, total_paginas: 0});
		});		
	});
	
	app.post("/home_pagina", function(req,res){
		var tamanho_pagina = 12;
		var pagina_atual = req.body.pagina;;
		var lista_produtos = req.session.lista_produtos;
		var api_produtos = new webservice_produtos('');
		var total_registros = lista_produtos.length;
		var total_paginas = Math.ceil(parseInt(total_registros) / parseInt(tamanho_pagina));
		var teste = api_produtos.retornarPaginaGQL(lista_produtos, pagina_atual, tamanho_pagina, total_paginas);
		res.json(teste);
	});
	
	
}
