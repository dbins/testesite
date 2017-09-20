module.exports = function (app){
	app.get("/login", function(req,res){
		res.render("login/index");
	});
	app.post("/login", function(req,res){
		//res.render("login/index");
		req.session.usuario = "Bins";
		console.log('****');
		console.log('valor guardado na sessao:');
		console.log(req.session.usuario);
		app.locals.usuario = req.session.usuario;
		req.session.save();
		res.redirect("/pagamento/dados");
	});
	app.post("/login/cadastrar", function(req,res){
		//res.render("login/index");
		res.redirect("/pagamento/dados");
	});
	
	app.post("/login/lembrarsenha", function(req,res){
		res.render("login/index");
	});
	
}
