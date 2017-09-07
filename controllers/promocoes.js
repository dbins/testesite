module.exports = function (app){
	app.get("/promocoes", function(req,res){
		res.render("promocoes/index");
	});
	app.post("/promocoes", function(req,res){
		res.render("promocoes/index");
	});
	
	app.get("/promocoes/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
	
	app.get("/promocoes/favoritar/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
	
	app.get("/promocoes/desfavoritar/:nomedapromocao", function(req,res){
		var nomedapromocao = req.params.nomedapromocao;
		res.render("promocoes/promocao");
	});
}
