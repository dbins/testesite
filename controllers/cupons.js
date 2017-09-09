module.exports = function (app){
	app.get("/cupons", function(req,res){
		res.render("cupons/index");
	});
	app.get("/cupons/:iddocupom", function(req,res){
		var iddocupom = req.params.iddocupom;
		res.render("cupons/cupom");
	});
}
