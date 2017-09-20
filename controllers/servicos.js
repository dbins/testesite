var webservice = require('./../servicos/services.js');
var tmp_resultados = [];
module.exports = function (app){
	app.get("/servicos", function(req,res){
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			tmp_resultados = resultados.dados.data;
			res.render("servicos/index", {resultados:resultados.dados.data});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	app.post("/servicos", function(req,res){
		res.render("servicos/index", {resultados:tmp_resultados});
	});
	
}
