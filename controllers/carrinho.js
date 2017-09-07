module.exports = function (app){
	app.get("/carrinho", function(req,res){
		res.render("carrinho/index");
	});
	app.post("/carrinho", function(req,res){
		res.render("carrinho/index");
	});
	app.post("/carrinho/add", function(req,res){
		res.render("carrinho/index");
	});
	app.get("/carrinho/remove/:iddoproduto", function(req,res){
		var iddoproduto = req.params.iddoproduto;
		res.render("carrinho/index");
	});
	app.get("/carrinho/finalizar", function(req,res){
		res.render("carrinho/finalizar");
	});
	
}
