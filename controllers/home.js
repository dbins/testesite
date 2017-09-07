module.exports = function (app){
	app.get("/home", function(req,res){
		
		res.render("home/index");
	});
	app.get("/home:nomedoshopping", function(req,res){
		var nomedoshopping = req.params.nomedoshopping;
		res.render("home/index");
	});
	app.get("/banners", function(req,res){
		//Retorna JSON
	});
	
}
