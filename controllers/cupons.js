var webservice = require('./../servicos/coupons.js');
var rp2 = require('request-promise'); 
var api = new webservice();

module.exports = function (app){
	app.get("/cupons", function(req,res){
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			var categorias = [];
			if (typeof categorias === undefined) {
				res.status(500).redirect('/erro/500');
			} else {
				res.render("cupons/index", {resultados:resultados.dados.data, categorias: categorias});	
			}
			
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
	app.post("/cupons", function(req,res){
		res.render("cupons/index");
	});
	
	app.get("/cupons/:iddocupom", function(req,res){
		var iddocupom = req.params.iddocupom;
		res.render("cupons/cupom");
	});
}
