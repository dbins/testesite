var webservice = require('./../servicos/stores.js');
var webservice_produtos = require('./../servicos/products.js');
var webservice_categorias = require('./../servicos/categories.js');

var dados_temporarios;


module.exports = function (app){
	
	//ALTERACAO
	app.get("/lojas", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		//var api = new webservice(req.session.shopping);
		var api = new webservice(req.session.shopping);
		var api_categorias = new webservice_categorias();
		var consulta = api.listGQL().then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				var categorias = api_categorias.montarCategorias(resultados2.dados.data);
				var tmp_resultados = api.montarGQL(resultados);
				res.render("lojas/index", {resultados:tmp_resultados, categorias: categorias});	
			}).catch(function (erro2){
				console.log(erro2.stack);
				res.status(500).redirect('/erro/500');
			});
			
		}).catch(function (erro){
			console.log(erro.stack);
			res.status(500).redirect('/erro/500');
		});
		
	});
	
	
	//AQUI TEVE ALTERACAO
	app.get("/lojas/loja-online", function(req,res){
		var api_produtos = new webservice_produtos(req.session.shopping);
		var api_categorias = new webservice_categorias();
		//var consulta = api_produtos.list().then(function (resultados) {
		var consulta = api_produtos.listGQL().then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				var categorias = api_categorias.montarCategorias(resultados2.dados.data);
				dados = api_produtos.montarGQL(resultados);
				res.render("lojas/online", {produtos: dados, categorias: categorias});
				
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});		
			
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});		
	});
	
	app.get("/lojas/loja-online/:segmento", function(req,res){
		var segmento = req.params.segmento;
		var api_categorias = new webservice_categorias();
		var api_produtos = new webservice_produtos(req.session.shopping);
		//var consulta = api_produtos.segmento(segmento).then(function (resultados) {
		var consulta = api_produtos.listGQLSegment(segmento).then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				//dados = api_produtos.montar(resultados.dados.data);
				dados = api_produtos.montarGQL(resultados);
				var categorias = api_categorias.montarCategorias(resultados2.dados.data);
				res.render("lojas/online", {produtos: dados, categorias: categorias});
			}).catch(function (erro2){
				res.status(500).redirect('/erro/500');
			});		
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});		
	});
	

	
	app.post("/lojas/loja-online/:segmento", function(req,res){
		var segmento = req.params.segmento;
		var api_categorias = new webservice_categorias();
		var api_produtos = new webservice_produtos(req.session.shopping);
		var consulta = api_produtos.listGQLSegment(segmento).then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				var categorias = api_categorias.montarCategorias(resultados2.dados.data);
				//dados = api_produtos.montar(resultados.dados.data);
				dados = api_produtos.montarGQL(resultados);
				res.render("lojas/online", {produtos: dados, categorias: categorias});
			}).catch(function (erro2){
				res.status(500).redirect('/erro/500');
			});		
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});		
	});

	app.get("/lojas/loja/:nomedaloja", function(req,res){
		var api = new webservice(req.session.shopping);
		var nomedaloja = req.params.nomedaloja;
		var consulta = api.viewGQL(nomedaloja).then(function (resultados) {
			if (typeof resultados.dados.fantasy_name === undefined) {
				res.status(500).redirect('/erro/500');
			} else {
				var api_produtos = new webservice_produtos(req.session.shopping);
				//var consulta2 = api_produtos.list().then(function (resultados2) {
				var consulta2 = api_produtos.listGQLStore(nomedaloja).then(function (resultados2) {	
					//var produtos = api_produtos.montar(resultados2.dados.data);
					var produtos = api_produtos.montarGQL(resultados2);
					
					var dados_loja = api.montarLojaGQL(resultados.dados);
					console.log(dados_loja);
					
					res.render("lojas/loja", {resultados:dados_loja, produtos: produtos});
				}).catch(function (erro2){
					res.status(500).redirect('/erro/500');
				});	
				
			}
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.get("/lojas/promocoes/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		//Retornar JSON
	});
	
	app.post("/lojas/favoritar", function(req,res){
		var api = new webservice(req.session.shopping);
		var nomedaloja = req.body.loja;
		var adicionar = true;
		if (req.session.favoritos_lojas){
			for (index = 0; index < req.session.favoritos_lojas.length; ++index) {
				if (req.session.favoritos_lojas[index].id == nomedaloja){
					adicionar = false;	
				}	
			}
		}
		var retorno = 0;
		if (adicionar){
			if(!req.session.favoritos_lojas){
				req.session.favoritos_lojas = [];
			}
			var consulta = api.viewGQL(nomedaloja).then(function (resultados) {	
				
				var tmp_dados = resultados.dados;
				var tmp = api.montarProdutoGQL(tmp_dados);
				var tmp2 = req.session.favoritos_lojas;
				tmp2.push(tmp);
				req.session.favoritos_lojas = tmp2;
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
	
	app.post("/lojas/desfavoritar", function(req,res){
		var nomedaloja = req.body.loja;
		var retorno = 0;
		if(req.session.favoritos_lojas){
			for (index = 0; index < req.session.favoritos_lojas.length; ++index) {
				if (req.session.favoritos_lojas[index].id == nomedaloja){
					req.session.favoritos_lojas.splice(index, 1);
					retorno = 1;
				}
			}
		}
		res.json({resultado:retorno});
	});
	
}
