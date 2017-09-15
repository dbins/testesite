module.exports = function (app){

	app.get("/erro/404", function(req,res){
		res.render("erros/404");
	});
}
