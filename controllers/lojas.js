module.exports = function (app){
	app.get("/lojas", function(req,res){
		res.render("lojas/index");
	});
	app.post("/lojas", function(req,res){
		res.render("lojas/index");
	});

	app.get("/lojas/:nomedaloja", function(req,res){
		var nomedaloja = req.params.nomedaloja;
		res.render("lojas/loja");
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
