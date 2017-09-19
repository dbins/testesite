module.exports = function (app){
	app.get("/termos", function(req,res){
		res.render("site/termos");
	});
	app.get("/perguntas", function(req,res){
		res.render("site/perguntas");
	});
	app.get("/contato", function(req,res){
		res.render("site/contato");
	});
	app.post("/contato", function(req,res){
		res.render("site/contato");
	});
	app.post("/novidades", function(req,res){
		res.render("site/novidades");
	});
	app.post("/busca", function(req,res){
		res.render("site/busca");
	});
	
	app.get("/newsletter", function(req,res){
		res.render("site/newsletter");
	});
	app.post("/newsletter", function(req,res){
		res.render("site/newsletter");
	});
	
	app.get("/logout", function(req,res){
		app.locals.usuario = "";
		req.session.destroy();
		res.redirect('/');
	});
	

	
	app.get("/", function(req,res){
		console.log('vou apagar o nome do shopping');
		app.locals.shopping = '';
		res.redirect('/home');
	});
	
	
}
