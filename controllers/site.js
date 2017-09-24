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
	
	//Retorna JSON
	app.post("/busca", function(req,res){
		var produto = req.body.produto;
		var resultados = []
		if (produto != ""){
			if (app.get("produtos").length>0){
				app.get("produtos").forEach(function(resultado) {
					var str = resultado.produto.toLowerCase();
					var n = str.indexOf(produto.toLowerCase());
					if (n >=0){
						resultados.push(resultado);
					}
				});		
				
			}	
		}
		res.json(resultados);
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
		app.locals.shopping = '';
		res.redirect('/home');
	});
	
	
}
