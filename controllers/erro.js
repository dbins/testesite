module.exports = function (app){

	app.get("/erro/404", function(req,res){
		res.render("erro/404");
	});
	
	app.get("/erro/500", function(req,res){
		res.render("erro/500");
	});
}
