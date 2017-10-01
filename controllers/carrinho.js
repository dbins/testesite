module.exports = function (app){
	app.get("/carrinho", function(req,res){
		
		var total = 0;
		
		for (index = 0; index < app.get("carrinho").length; ++index) {
			total += parseFloat((app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
			app.get("carrinho")[index].total = (parseFloat(app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde)).toFixed(2);
		}
		total = parseFloat(total).toFixed(2);
		app.locals.total_carrinho = app.get("carrinho").length;
		res.render("carrinho/index", {resultados:app.get("carrinho"), total: total});
	});
	
	app.post("/carrinho", function(req,res){
		//res.render("carrinho/index");
		req.session.carrinho = "OK";
		res.redirect("/login");
	});
	
	app.post("/carrinho/add", function(req,res){
		
		var produto = req.body.produto;
		var adicionar = true;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			if (app.get("carrinho")[index].id == produto){
				adicionar = false;
			}
		}
		if (adicionar){
			for (index = 0; index < app.get("produtos").length; ++index) {
				if (app.get("produtos")[index].id == produto){
					var tmp = app.get("produtos")[index];
					tmp.qtde = 1;
					app.get("carrinho").push(tmp);
				}
			}
		}
		
		res.redirect("/carrinho");
	});
	
	app.get("/carrinho/add/:iddoproduto", function(req,res){
		
		var produto = req.params.iddoproduto;
		var adicionar = true;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			if (app.get("carrinho")[index].id == produto){
				adicionar = false;
			}
		}
		if (adicionar){
			for (index = 0; index < app.get("produtos").length; ++index) {
				if (app.get("produtos")[index].id == produto){
					var tmp = app.get("produtos")[index];
					tmp.qtde = 1;
					app.get("carrinho").push(tmp);
				}
			}
		}
		
		res.redirect("/carrinho");
	});
	
	
	
	app.get("/carrinho/remove/:iddocarrinho", function(req,res){
		var iddocarrinho = req.params.iddocarrinho;
		var index = app.get("carrinho").indexOf(iddocarrinho);
		app.get("carrinho").splice(index, 1);
		res.redirect("/carrinho");
	});
	app.get("/carrinho/altera/:iddocarrinho/:qtde", function(req,res){
		var iddocarrinho = req.params.iddocarrinho;
		var qtde = req.params.qtde;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			if (app.get("carrinho")[index].id == iddocarrinho){
				app.get("carrinho")[index].qtde = qtde;
			}
		}
		res.redirect("/carrinho");
	});
	app.get("/carrinho/finalizar", function(req,res){
		res.render("carrinho/finalizar");
	});
	
}
