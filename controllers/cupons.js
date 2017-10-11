var webservice = require('./../servicos/coupons.js');
var rp2 = require('request-promise'); 
var api = new webservice();

function ListarCategoriasMock(){
	var categorias = ["Artigos Esportivos","Artigos para o lar","Brinquedos & Presentes","Calçados, Bolsas e Acessórios","Empórios","Drogarias","Eletro-eletrônicos","Games","Joias & Bijuterias","Lazer", "Livrarias & Papelaria","Lojas de departamento","Moda Feminina","Moda Infantil","Moda Íntima","Moda Masculina","Moda Praia","Surfwear","Moda Unissex","Óculos", "Perfumarias & Cosméticos","Produtos Naturais e Suplementos","Saúde & Beleza","Serviços","Telefonía","Viagens & Turismo"];
	return categorias;
}

module.exports = function (app){
	app.get("/cupons", function(req,res){
		var api = new webservice(req.session.shopping);
		var consulta = api.list().then(function (resultados) {
			var categorias = ListarCategoriasMock();
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
