var webservice = require('./../servicos/products.js');
var rp2 = require('request-promise'); 
var api = new webservice();
module.exports = function (app){
	
	app.get("/produtos", function(req,res){
		//var marcas = app.get('marcas');
		//var categorias = app.get('categorias');
		//var marcas = [];
		//var categorias = [];
		//var consulta = api.list().then(function (resultados) {
		//	res.render("produtos/index", {resultados:resultados, categorias: categorias, marcas: marcas});
		//}).catch(function (erro){
		//	res.render("produtos/index", {resultados:{}, categorias:{},marcas:{}});
		//});
		
	});
	app.post("/produtos", function(req,res){
		res.render("produtos/index");
		
	});
	
	//Alteracao
	//DOMINGO
	app.get("/produtos/:nomedoproduto", function(req,res){
		//Apenas para fins de testes!
		var nomedoproduto = req.params.nomedoproduto;
		//req.session.produto_selecionado = nomedoproduto;
		//var teste = {"id": "0","url_title": "", "desconto":"", "imagem":"", "marca":"", "produto":"", "de":"", "por": "", "shopping":""};
		//for (index = 0; index < app.get("produtos").length; ++index) {
		//	if (app.get("produtos")[index].url_title == nomedoproduto){
		//		tmp = app.get("produtos")[index];
		//	}
		//}
		//var consulta = api.view(nomedoproduto).then(function (resultados) {
		var consulta = api.viewGQL(nomedoproduto).then(function (resultados) {	
			var tmp = resultados.dados;
			//var teste = api.montarProduto(tmp);
			var teste = api.montarProdutoGQL(resultados.dados);
			var consulta2 = api.listGQLSegmentStore(resultados.dados.store.slug, resultados.dados.segments).then(function (resultados2) {
				var produto_pai = 'no_product';
				if (resultados.dados.parent === undefined || resultados.dados.parent === null){
					//Nao existe vinculo
					produto_pai = resultados.dados.slug;
				} else{
					produto_pai = resultados.dados.parent.slug;
				}
				var consulta3 = api.variation(produto_pai).then(function (resultados3) {	
					var tamanhos = api.montarAtributo(resultados3.dados, "TAMANHOS");
					var cores = api.montarAtributo(resultados3.dados, "CORES");
					
					if (tamanhos.length==0){
						tamanhos = api.montarAtributo(resultados.dados, "TAMANHOS");
					}
					if (cores.length==0){
						cores = api.montarAtributo(resultados.dados, "CORES");
					}
					//var tmp_relacionados = [];
					var tmp_relacionados = api.montarGQL(resultados2);
					res.render("produtos/produto", {resultados:resultados, relacionados: tmp_relacionados, teste: teste, tamanhos: tamanhos, cores: cores});
				}).catch(function (erro){
					res.redirect("/erro/500");
				});
			}).catch(function (erro){
				res.redirect("/erro/500");
			});
		}).catch(function (erro){
			res.redirect("/erro/500");
		});
	});
	
	app.post("/produtos/favoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		
		var adicionar = true;
		if (req.session.favoritos_produtos){
			for (index = 0; index < req.session.favoritos_produtos.length; ++index) {
				if (req.session.favoritos_produtos[index].id == nomedoproduto){
					adicionar = false;	
				}	
			}
		}
		var retorno = 0;
		if (adicionar){
			if(!req.session.favoritos_produtos){
				req.session.favoritos_produtos = [];
			}
			var consulta = api.viewGQL(nomedoproduto).then(function (resultados) {	
				
				var tmp_dados = resultados.dados;
				var tmp = api.montarProdutoGQL(tmp_dados);
				var tmp2 = req.session.favoritos_produtos;
				tmp2.push(tmp);
				req.session.favoritos_produtos = tmp2;
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
	
	app.post("/produtos/desfavoritar", function(req,res){
		var nomedoproduto = req.body.produto;
		var retorno = 0;
		if(req.session.favoritos_produtos){
			for (index = 0; index < req.session.favoritos_produtos.length; ++index) {
				if (req.session.favoritos_produtos[index].id == nomedoproduto){
					req.session.favoritos_produtos.splice(index, 1);
					retorno = 1;
				}
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
