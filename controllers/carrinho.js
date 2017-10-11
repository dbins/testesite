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
		var adicionar = true;
		for (index = 0; index < req.session.carrinho.length; ++index) {
			if (req.session.carrinho[index].url_title == produto){
				adicionar = false;
			}
		}
		if (adicionar){
			var consulta = api.view(produto).then(function (resultados) {
				var tmp = resultados.dados;
				var produto_adicionado = api.montarProduto(tmp);
				produto_adicionado.qtde = 1;
				req.session.carrinho.push(produto_adicionado);
				res.redirect("/carrinho");
			}).catch(function (erro){
				res.redirect("erro/500");
			});
		} else {
			res.redirect("/carrinho");
		}
	});
	
	app.get("/carrinho/add/:iddoproduto", function(req,res){
			
			var produto = req.params.iddoproduto;
			var consulta = api.view(produto).then(function (resultados) {
				var tmp = resultados.dados;
				var produto_adicionado = api.montarProduto(tmp);
				var adicionar = true;
			
				
				if(!req.session.carrinho)
					req.session.carrinho = [];
				
				for (index = 0; index < req.session.carrinho.length; ++index) {
					if (req.session.carrinho[index].url_title == produto){
						adicionar = false;
					}
				}
				if (adicionar){
					produto_adicionado.qtde = 1;
					req.session.carrinho.push(produto_adicionado);
					res.redirect("/carrinho");
					return;	
				} else {
					res.redirect("/carrinho");
					return;	
				}
			}).catch(function (erro){
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
	
	
	
	app.get("/carrinho/remove/:iddocarrinho", function(req,res){
		var iddocarrinho = req.params.iddocarrinho;
		var index = req.session.carrinho.indexOf(iddocarrinho);
		req.session.carrinho.splice(index, 1);
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
