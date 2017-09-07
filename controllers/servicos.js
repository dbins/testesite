module.exports = function (app){
	app.get("/servicos", function(req,res){
		res.render("servicos/index");
	});
	app.post("/servicos", function(req,res){
		res.render("servicos/index");
	});
	app.get("/servicos:nomedoservico", function(req,res){
		var nomedoservico = req.params.nomedoservico;
		res.render("servicos/servico");
	});
}
