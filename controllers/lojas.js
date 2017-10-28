var webservice = require('./../servicos/stores.js');
var webservice_produtos = require('./../servicos/products.js');
var webservice_categorias = require('./../servicos/categories.js');

var dados_temporarios;

function ListarCategoriasMock(){
	var categorias = ["Artigos Esportivos","Artigos para o lar","Brinquedos & Presentes","Calçados, Bolsas e Acessórios","Empórios","Drogarias","Eletro-eletrônicos","Games","Joias & Bijuterias","Lazer", "Livrarias & Papelaria","Lojas de departamento","Moda Feminina","Moda Infantil","Moda Íntima","Moda Masculina","Moda Praia","Surfwear","Moda Unissex","Óculos", "Perfumarias & Cosméticos","Produtos Naturais e Suplementos","Saúde & Beleza","Serviços","Telefonía","Viagens & Turismo"];
	return categorias;
}

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
	
	//ALTERACAO
	app.get("/lojas", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		//var api = new webservice(req.session.shopping);
		var api = new webservice(req.session.shopping);
		var api_categorias = new webservice_categorias();
		var consulta = api.list().then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				//var categorias = ListarCategorias(resultados.dados.data, req.session.shopping);
				//var categorias = ListarCategoriasMock();
				var categorias = api_categorias.montarCategorias(resultados2.dados.data);
				dados_temporarios = resultados.dados.data;
				if (typeof categorias === undefined) {
					res.status(500).redirect('/erro/500');
				} else {
					res.render("lojas/index", {resultados:resultados.dados.data, categorias: categorias});	
					
				}
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});
			
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
		
	});
	app.post("/lojas", function(req,res){
		
		//Aplicar os filtros!
		var api = new webservice(req.session.shopping);
		var consulta = api.list().then(function (resultados) {
			//var categorias = ListarCategorias(resultados.dados.data, req.session.shopping);
			var categorias = ListarCategoriasMock();
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
	
	//AQUI TEVE ALTERACAO
	app.get("/lojas/loja-online", function(req,res){
		var api_produtos = new webservice_produtos(req.session.shopping);
		var api_categorias = new webservice_categorias();
		//var consulta = api_produtos.list().then(function (resultados) {
		var consulta = api_produtos.listGQL().then(function (resultados) {
			var consulta2 = api_categorias.All().then(function (resultados2) {
				//dados = api_produtos.montar(resultados.dados.data);
				//var categorias = ListarCategoriasMock();
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
		var api_produtos = new webservice_produtos(req.session.shopping);
		//var consulta = api_produtos.segmento(segmento).then(function (resultados) {
		var consulta = api_produtos.listGQLSegment(segmento).then(function (resultados) {
			//dados = api_produtos.montar(resultados.dados.data);
			dados = api_produtos.montarGQL(resultados);
			var categorias = ListarCategoriasMock();
			res.render("lojas/online", {produtos: dados, categorias: categorias});
		}).catch(function (erro){
			console.log(erro);
			res.status(500).redirect('/erro/500');
		});		
	});
	
	app.post("/lojas/loja-online", function(req,res){
		//Como vai carregar tudo na tela e filtrar por AJAX, esta rota vai precisar ser excluida....
		res.render("lojas/online");
	});
	
	app.post("/lojas/loja-online/:segmento", function(req,res){
		var segmento = req.params.segmento;
		var api_produtos = new webservice_produtos(req.session.shopping);
		var consulta = api_produtos.listGQLSegment(segmento).then(function (resultados) {
			var categorias = ListarCategoriasMock();
			//dados = api_produtos.montar(resultados.dados.data);
			dados = api_produtos.montarGQL(resultados);
			res.render("lojas/online", {produtos: dados, categorias: categorias});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});		
	});

	app.get("/lojas/loja/:nomedaloja", function(req,res){
		var api = new webservice(req.session.shopping);
		var nomedaloja = req.params.nomedaloja;
		var consulta = api.view(nomedaloja).then(function (resultados) {
			if (typeof resultados.dados.fantasy_name === undefined) {
				res.status(500).redirect('/erro/500');
			} else {
				var api_produtos = new webservice_produtos(req.session.shopping);
				//var consulta2 = api_produtos.list().then(function (resultados2) {
				var consulta2 = api_produtos.listGQLStore(nomedaloja).then(function (resultados2) {	
					//var produtos = api_produtos.montar(resultados2.dados.data);
					var produtos = api_produtos.montarGQL(resultados2);
					res.render("lojas/loja", {resultados:resultados.dados, produtos: produtos});
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
	
	app.get("/lojas/favoritar/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		res.render("lojas/loja");
	});
	
	app.get("/lojas/desfavoritar/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		res.render("lojas/loja");
	});
	
}
