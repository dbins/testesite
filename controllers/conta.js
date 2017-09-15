module.exports = function (app){
	app.get("/compras", function(req,res){
		res.render("conta/compras");
	});
	app.get("/compras/detalhes/:iddacompra", function(req,res){
		var iddoproduto = req.params.iddacompra;
		res.render("conta/detalhes_pedido");
	});
	
	app.get("/favoritos", function(req,res){
		res.render("conta/favoritos");
	});
	app.get("/favoritos/remove/:iddoobjeto", function(req,res){
		var iddoproduto = req.params.iddoobjeto;
		res.render("conta/favoritos");
	});
	
	app.get("/configuracoes", function(req,res){
		res.render("conta/configuracoes");
	});
	
	app.post("/configuracoes/dados", function(req,res){
		res.render("conta/configuracoes");
	});
	
	app.post("/configuracoes/endereco", function(req,res){
		res.render("conta/configuracoes");
	});
	
	app.post("/configuracoes/carteira", function(req,res){
		res.render("conta/configuracoes");
	});
	
	app.post("/configuracoes/senha", function(req,res){
		res.render("conta/configuracoes");
	});
	
	
}
