var webservice = require('./../servicos/services.js');

module.exports = function (app){
	app.get("/servicos", function(req,res){
		var api = new webservice(req.session.shopping);
		var consulta = api.listGQL().then(function (resultados) {
			var tmp_resultados = api.montarGQL(resultados);
			res.render("servicos/index", {resultados:tmp_resultados});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	app.post("/servicos", function(req,res){
		res.render("servicos/index", {resultados:tmp_resultados});
	});
	
}
