module.exports = function (app){
	app.get("/pagamento/dados", function(req,res){
		res.render("pagamento/dados");
	});
	app.post("/pagamento/dados", function(req,res){
		res.render("pagamento/dados");
	});
	app.post("/pagamento/cep", function(req,res){
		//Retornar JSON
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
		res.render("pagamento/finalizar");
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
