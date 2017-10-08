var webservice = require('./../servicos/products.js');
var rp2 = require('request-promise'); 
var api = new webservice();
module.exports = function (app){
	
	app.get("/produtos", function(req,res){
		var marcas = app.get('marcas');
		var categorias = app.get('categorias');
		var consulta = api.list().then(function (resultados) {
			res.render("produtos/index", {resultados:resultados, categorias: categorias, marcas: marcas});
		}).catch(function (erro){
			res.render("produtos/index", {resultados:{}, categorias:{},marcas:{}});
		});
		
	});
	app.post("/produtos", function(req,res){
		res.render("produtos/index");
		
	});
	app.get("/produtos/:nomedoproduto", function(req,res){
		//Apenas para fins de testes!
		var nomedoproduto = req.params.nomedoproduto;
		req.session.produto_selecionado = nomedoproduto;
		//var teste = {"id": "0","url_title": "", "desconto":"", "imagem":"", "marca":"", "produto":"", "de":"", "por": "", "shopping":""};
		//for (index = 0; index < app.get("produtos").length; ++index) {
		//	if (app.get("produtos")[index].url_title == nomedoproduto){
		//		tmp = app.get("produtos")[index];
		//	}
		//}
		
		var consulta = api.view(nomedoproduto).then(function (resultados) {
		//var consulta = api.viewGQL(nomedoproduto).then(function (resultados) {	
			var tmp = resultados.dados;
			var teste = api.montarProduto(tmp);
			//var teste = api.montarProdutoGQL(resultados.dados);
			res.render("produtos/produto", {resultados:resultados, relacionados: app.get("produtos"), teste: teste});
		}).catch(function (erro){
			res.redirect("erro/500");
		});
	});
	
	app.post("/produtos/favoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		var tmp = {};
		for (index = 0; index < app.get("produtos").length; ++index) {
			if (app.get("produtos")[index].id == nomedoproduto){
				tmp= app.get("produtos")[index];
			}
		}
		var adicionar = true;
		for (index = 0; index < app.get("favoritos_produtos").length; ++index) {
			if (app.get("favoritos_produtos")[index].id == nomedoproduto){
				adicionar = false;	
			}	
		}
		var retorno = 0;
		if (adicionar){
			var tmp2 = app.get("favoritos_produtos")
			tmp2.push(tmp);
			app.set("favoritos_produtos", tmp2);
			retorno = 1;
		}
		res.json({resultado:retorno});
	});
	
	app.post("/produtos/desfavoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		var retorno = 0;
		for (index = 0; index < app.get("produtos").length; ++index) {
			if (app.get("produtos")[index].id == nomedoproduto){
				var tmp2 = app.get("favoritos_produtos")
				tmp2.splice(index, 1);
				app.set("favoritos_produtos", tmp2);
				retorno = 1;
			}
		}
		res.json({resultado:retorno});
	});
	
	app.get("/produtos/pagina/:pagina", function(req,res){
		var pagina = req.params.pagina;
		var consulta = api.paginacao(pagina).then(function (resultados) {
		}).catch(function (erro){
			res.json({resultados:{}});
		});
		
	});
	

	
}
