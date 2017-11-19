var webservice = require('./../servicos/products.js');
var api = new webservice();
module.exports = function (app){
	app.get("/carrinho", function(req,res){
		
		var total = 0;
		if(!req.session.carrinho)
			req.session.carrinho = [];
		
		for (index = 0; index < req.session.carrinho.length; ++index) {
			total += parseFloat((req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
			req.session.carrinho[index].total = (parseFloat(req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde)).toFixed(2);
		}
		total = parseFloat(total).toFixed(2);
		req.session.total_carrinho = req.session.carrinho.length;
		res.render("carrinho/index", {resultados:req.session.carrinho, total: total});
	});
	
	app.post("/carrinho", function(req,res){
		//res.render("carrinho/index");
		res.redirect("/login");
	});
	
	app.post("/carrinho/add", function(req,res){
		
		var produto = req.body.produto;
		var quantidade = 1;
		if (req.body.quantidade){
			if (!req.body.quantidade ==""){
				quantidade = req.body.quantidade;
			}
		}
		var shopping_carrinho = "";
		
		var adicionar = true;
		if(!req.session.carrinho)
			req.session.carrinho = [];
		
		for (index = 0; index < req.session.carrinho.length; ++index) {
			shopping_carrinho = req.session.carrinho[index].mall;
			if (req.session.carrinho[index].url_title == produto){
				adicionar = false;
			}
		}
		if (adicionar){
			//console.log(adicionar, produto);
			
			//var consulta = api.view(produto).then(function (resultados) {
			var consulta = api.viewGQL(produto).then(function (resultados) {	
				var tmp = resultados.dados;
				//var produto_adicionado = api.montarProduto(tmp);
				var produto_adicionado = api.montarProdutoGQL(tmp);
				if (shopping_carrinho == "" ||  shopping_carrinho == produto_adicionado.mall){
					produto_adicionado.qtde = quantidade;
					req.session.carrinho.push(produto_adicionado);
					res.redirect("/carrinho");
				} else {
					res.render("carrinho/erro");
				}
			}).catch(function (erro){
				console.log("/carrinho/add (POST)");
				console.log(erro.stack);
				res.redirect("erro/500");
			});
		} else {
			res.redirect("/carrinho");
		}
	});
	
	app.get("/carrinho/add/:iddoproduto", function(req,res){
			var shopping_carrinho = "";
			var produto = req.params.iddoproduto;
			//var consulta = api.view(produto).then(function (resultados) {
			var consulta = api.viewGQL(produto).then(function (resultados) {		
				var tmp = resultados.dados;
				//var produto_adicionado = api.montarProduto(tmp);
				var produto_adicionado = api.montarProdutoGQL(tmp);
				
				var adicionar = true;
			
				
				if(!req.session.carrinho)
					req.session.carrinho = [];
				
				for (index = 0; index < req.session.carrinho.length; ++index) {
					shopping_carrinho = req.session.carrinho[index].mall;
					if (req.session.carrinho[index].url_title == produto){
						adicionar = false;
					}
				}
				
				if (adicionar){
					if (shopping_carrinho == "" || shopping_carrinho == produto_adicionado.mall){
						produto_adicionado.qtde = 1;
						req.session.carrinho.push(produto_adicionado);
						res.redirect("/carrinho");
						return;	
					} else {
						res.render("carrinho/erro");
					}
					
				} else {
					res.redirect("/carrinho");
					return;	
				}
			}).catch(function (erro){
				console.log("erro /carrinho/add/" + produto);
				console.log(erro.stack);
				res.redirect("erro/500");
				//res.redirect("erro/500");
				//return;
			});
			
			//for (index = 0; index < app.get("produtos").length; ++index) {
			//	if (app.get("produtos")[index].id == produto){
			//		var tmp = app.get("produtos")[index];
			//		tmp.qtde = 1;
			//		req.session.carrinho.push(tmp);
			//	///////}
			//}
		
		
	});
	
	app.get("/carrinho/add/:iddoproduto/:qtde", function(req,res){
			var shopping_carrinho = "";
			var produto = req.params.iddoproduto;
			var quantidade = req.params.qtde;
			//var consulta = api.view(produto).then(function (resultados) {
			var consulta = api.viewGQL(produto).then(function (resultados) {		
				var tmp = resultados.dados;
				//var produto_adicionado = api.montarProduto(tmp);
				var produto_adicionado = api.montarProdutoGQL(tmp);
				
				var adicionar = true;
			
				
				if(!req.session.carrinho)
					req.session.carrinho = [];
				
				for (index = 0; index < req.session.carrinho.length; ++index) {
					shopping_carrinho = req.session.carrinho[index].mall;
					if (req.session.carrinho[index].url_title == produto){
						adicionar = false;
					}
				}
				
				if (adicionar){
					if (shopping_carrinho == "" || shopping_carrinho == produto_adicionado.mall){
						produto_adicionado.qtde = quantidade;
						req.session.carrinho.push(produto_adicionado);
						res.redirect("/carrinho");
						return;
					} else {
						res.render("carrinho/erro");
					}					
				} else {
					res.redirect("/carrinho");
					return;	
				}
			}).catch(function (erro){
				console.log("/carrinho/add/" + produto + "/" + quantidade);
				console.log(erro.stack);
				res.redirect("erro/500");
			});
		
	});
	
	
	
	app.get("/carrinho/remove/:iddocarrinho", function(req,res){
		var iddocarrinho = req.params.iddocarrinho;
		//var index = req.session.carrinho.indexOf(iddocarrinho);
		for (index = 0; index < req.session.carrinho.length; ++index) {
			if (req.session.carrinho[index].id == iddocarrinho){
				req.session.carrinho.splice(index, 1);		
			}
		}	
		res.redirect("/carrinho");
	});
	app.get("/carrinho/altera/:iddocarrinho/:qtde", function(req,res){
		var iddocarrinho = req.params.iddocarrinho;
		var qtde = req.params.qtde;
		for (index = 0; index < req.session.carrinho.length; ++index) {
			if (req.session.carrinho[index].id == iddocarrinho){
				req.session.carrinho[index].qtde = qtde;
			}
		}
		res.redirect("/carrinho");
	});
	app.get("/carrinho/finalizar", function(req,res){
		res.render("carrinho/finalizar");
	});
	
}
