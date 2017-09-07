module.exports = function (app){
	app.get("/informacoes", function(req,res){
		res.render("informacoes/index");
	});
	app.post("/informacoes", function(req,res){
		//Formulario de contato
		res.render("informacoes/index");
	});
}
