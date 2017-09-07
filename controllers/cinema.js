module.exports = function (app){
	app.get("/cinema", function(req,res){
		res.render("cinema/index");
	});
	app.post("/cinema", function(req,res){
		res.render("cinema/index");
	});
	app.get("/cinema/filme/:nomedofilme", function(req,res){
		var nomedofilme = req.params.nomedofilme;
		res.render("cinema/filme");
	});
	
}
