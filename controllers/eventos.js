module.exports = function (app){

	app.get("/eventos", function(req,res){
		res.render("eventos/index");
	});
	app.post("/eventos", function(req,res){
		res.render("eventos/index");
	});
	app.get("/eventos/evento/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		res.render("eventos/evento");
	});
	
	app.get("/eventos/favoritar/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		res.render("eventos/evento");
	});
	
	app.get("/eventos/desfavoritar/:nomedoevento", function(req,res){
		var nomedoevento = req.params.nomedoevento;
		res.render("eventos/evento");
	});
	
}
