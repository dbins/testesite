var servicoEmail = require('./../servicos/emails.js');
var webservice = require('./../servicos/cep.js');
var moment = require('moment');

module.exports = function (app){
	app.get("/pagamento/dados", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
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
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//res.render("pagamento/dados");
		var endereco = {};
		var cliente = {}
		
		endereco.rua = req.body.endereco;
		endereco.numero = req.body.numero;
		endereco.complemento = req.body.complemento;
		endereco.bairro = req.body.bairro;
		endereco.cidade = req.body.cidade;
		endereco.estado = req.body.estado;
		endereco.cep = req.body.CEP;
		req.session.endereco = endereco;
		res.redirect("/pagamento/cartoes");
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
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var total = 0;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			total += parseFloat((app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
			app.get("carrinho")[index].total = (parseFloat(app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde)).toFixed(2);
		}
		console.log(total);
		total = 100;
		res.render("pagamento/confirmar", {cliente: req.session.cliente, endereco: req.session.endereco, carrinho: app.get("carrinho"), total_carrinho: total});
	});
	app.post("/pagamento/cartoes", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		res.render("pagamento/cartoes");
	});
	
	app.get("/pagamento/erro", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Se houver algum problema ao finalizar
		res.render("pagamento/erro");
	});
	
	app.get("/pagamento/finalizar", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		
		//var envioEmail = new servicoEmail();
		//envioEmail.finalizarCompra('bins.br@gmail.com',{});
		
		req.session.carrinho = "";
		app.locals.total_carrinho = 0; 
		//Gerar Token
		//Disparar e-mail
		//Gerar QRCode
		var min = 10000;
		var max = 50000;
		var pedido = Math.floor(Math.random()*(max-min+1)+min);
		res.render("pagamento/finalizar", {pedido: pedido, resultados: app.get("carrinho"),moment: moment});
	});
	
	app.get("/pagamento/boleto", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Instrucoes do boleto
		res.render("pagamento/boleto");
	});
	
	app.get("/pagamento/boleto/gerar:iddacompra", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Instrucoes do boleto
		var iddacompra = req.params.iddacompra;
		res.render("pagamento/gerar_boleto");
	});
	
	
}
