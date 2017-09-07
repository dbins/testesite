module.exports = function (app){
	app.get("/login", function(req,res){
		res.render("login/index");
	});
	app.post("/login", function(req,res){
		res.render("login/index");
	});
	app.post("/login/cadastrar", function(req,res){
		res.render("login/index");
	});
	
}
