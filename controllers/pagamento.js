var webservice = require('./../servicos/cep.js');
var moment = require('moment');

module.exports = function (app){
	app.get("/pagamento/dados", function(req,res){
		var endereco = [];
		var total = 0;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			total += parseFloat((app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
			app.get("carrinho")[index].total = (parseFloat(app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde)).toFixed(2);
		}
		total = parseFloat(total).toFixed(2);
		res.render("pagamento/dados", {endereco: endereco, total: total});
	});
	app.post("/pagamento/dados", function(req,res){
		//res.render("pagamento/dados");
		res.redirect("/pagamento/finalizar");
	});
	app.post("/pagamento/cep", function(req,res){
		//Retornar JSON
		var consulta = new webservice(req.body.cep).then(function (resultados) {
			res.json(resultados);
			console.log(resultados);
		}).catch(function (erro){
			console.log('erros');
			res.json({"zipcode":null,"street":null,"neighborhood":null,"city":null,"state":null});
		});
	});
	
	app.get("/pagamento/cartoes", function(req,res){
		res.render("pagamento/cartoes");
	});
	app.post("/pagamento/cartoes", function(req,res){
		res.render("pagamento/cartoes");
	});
	
	app.get("/pagamento/erro", function(req,res){
		//Se houver algum problema ao finalizar
		res.render("pagamento/erro");
	});
	
	app.get("/pagamento/finalizar", function(req,res){
		//Gerar Token
		//Disparar e-mail
		//Gerar QRCode
		var min = 10000;
		var max = 50000;
		var pedido = Math.floor(Math.random()*(max-min+1)+min);
		res.render("pagamento/finalizar", {pedido: pedido, resultados: app.get("carrinho"),moment: moment});
	});
	
	app.get("/pagamento/boleto", function(req,res){
		//Instrucoes do boleto
		res.render("pagamento/boleto");
	});
	
	app.get("/pagamento/boleto/gerar:iddacompra", function(req,res){
		//Instrucoes do boleto
		var iddacompra = req.params.iddacompra;
		res.render("pagamento/gerar_boleto");
	});
	
	app.get("/pagamento/finalizar", function(req,res){
		//Retonar pipe (imagem)
	});
}
