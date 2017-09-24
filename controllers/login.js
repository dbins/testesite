var servicoEmail = require('./../servicos/emails.js');
var servicoUsuario = require('./../servicos/usuarios.js');
var servicoLogin = require('./../servicos/logins.js');
var crypto = require('crypto');


module.exports = function (app){
	var servicoAutenticar = require('./../servicos/autenticacao.js');
	//Token para o site poder consultar a API
		var autentica = new servicoAutenticar();
		
		//Gerar o token para acesso API	
		var consulta = autentica.config().then(function (resultados) {
			app.locals.token_api = resultados.dados;
		}).catch(function (erro){
		
		});
		
	app.get("/login", function(req,res){
		
		//Apenas para validar o conceito de autenticacao!
		//var autentica = new servicoAutenticar();
		//var consulta = autentica.config().then(function (resultados) {
		//	var consulta2 = autentica.users().then(function (resultados2) {
			
		//	}).catch(function (erro){
			
		//	});
		//}).catch(function (erro){
			
		//});
		if (req.session.carrinho){
			if (req.session.carrinho == "OK"){
				if (req.session.usuario){
					res.redirect("/pagamento/dados");
					return;
				}
			}
		}
		res.render("login/index", {mensagem: ""});
	});
	app.post("/login", function(req,res){
		//res.render("login/index");
		
		
		if (app.locals.token_api == ""){
			//Houve um erro, nao houve comunicacao para gerar token
		} else {
			//Verificar se o usuario existe
			var apiLogin = new servicoLogin(app.locals.token_api);
			//var apiUsuario = new servicoUsuario(app.locals.token_api);
			//var consulta = apiUsuario.consultar(req.body.CPF).then(function (resultados) {
			var consulta = apiLogin.consultar(req.body.CPF).then(function (resultados) {	
				
				
				if (resultados.resultado == "NAO_LOCALIZADO"){
					//Definir mensagem de erro
					res.render("login/index", {mensagem: "Cliente não localizado"});
					return;
				}
				if (resultados.resultado == "ERRO"){
					//Definir mensagem de erro
					res.render("login/index", {mensagem: "Houve um erro ao efetuar esta operação"});
					return;
				}
				if (resultados.resultado == "OK"){
					//Verificar se a senha existe
					var dados = resultados.dados.data[0];
					var senha = crypto.createHash('md5').update(req.body.senha).digest("hex");
					if (dados.password == senha){
						req.session.usuario = dados.firstname;
						var cliente = {};
						cliente.CPF = dados.cpf;
						if (dados.email){
							cliente.email = dados.email;
						} else {
							cliente.email = "";
						}
						cliente.nome = dados.firstname;
						cliente.sobrenome = dados.lastname;
						cliente.genero = dados.gender;
						cliente.aniversario = dados.birthday;
						cliente.ddd ="11";
						cliente.telefone = "91111111";
						
						cliente.endereco = dados.address;
						cliente.bairro = dados.neighborhood;
						cliente.cidade = dados.city;
						cliente.estado = dados.state;
						cliente.pais = "BR";
						cliente.numero = dados.number;
						cliente.cep = dados.zipcode;
						cliente.complemento = dados.complement;
						
						req.session.cliente = cliente;
						
						var tmp1 = dados.firstname;
						var tmp2 = dados.lastname;
						app.locals.usuario = dados.firstname + ' ' +  dados.lastname;
						app.locals.letras = tmp1.substring(0,1) + tmp2.substring(0,1);
						req.session.cpf = dados.cpf;
						req.session.save(function (err) {
						if (err) return next(err)
							res.redirect("/pagamento/dados");
						});
					} else {
						res.render("login/index", {mensagem: "O login ou a senha informada não foram localizadas"});
						return;
					}
				}
				
			}).catch(function (erro){
				res.render("login/index", {mensagem: "Houve um erro ao efetuar esta consulta"});
			});
			
		}
		
		
	});
	app.post("/login/cadastrar", function(req,res){
		//res.render("login/index");
		//Gravando o cliente na sessao para gravar antes de finalizar a compra
		var cliente = {};
		cliente.CPF = req.body.CPF;
		cliente.email = req.body.email;
		cliente.nome = req.body.nome;
		cliente.sobrenome = req.body.sobrenome;
		cliente.genero = req.body.genero;
		cliente.aniversario = req.body.aniversario;
		cliente.ddd = req.body.ddd;
		cliente.telefone = req.body.telefone;
		cliente.senha = req.body.senha;
		cliente.novo = "SIM";
		
		//Dados que serao capturados na etapa seguinte!
		cliente.endereco = "";
		cliente.bairro = "";
		cliente.cidade = "";
		cliente.estado = "";
		cliente.pais = "BR";
		cliente.numero = "";
		cliente.cep = "";
		cliente.complemento = "";
		
		req.session.cliente = cliente;
		req.session.usuario = req.body.nome + " " + req.body.sobrenome; 
		
		res.redirect("/pagamento/dados");
	});
	
	app.post("/login/validar", function(req,res){
		
		var CPF = req.body.CPF;
		if (app.locals.token_api == ""){
			//Houve um erro, nao houve comunicacao para gerar token
		} else {
			//Verificar se o usuario existe
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.verificar(req.body.CPF).then(function (resultados) {
				res.json(resultados);
			}).catch(function (erro){
				res.json({"resultado": "ERRO"});
			});
		}
		
	});
	
	app.post("/login/lembrarsenha", function(req,res){
		if (app.locals.token_api == ""){
			//Houve um erro, nao houve comunicacao para gerar token
		} else {
			//Verificar se o usuario existe
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.verificar(req.body.CPF).then(function (resultados) {
				if (resultados.resultado == "NAO_LOCALIZADO"){
					//Definir mensagem de erro
					res.redirect("/login");
					return;
				}
				if (resultados.resultado == "ERRO"){
					//Definir mensagem de erro
					res.redirect("/login");
					return;
				}
				if (resultados.resultado == "OK"){
					var envioEmail = new servicoEmail();
					envioEmail.esqueceuSenha('bins.br@gmail.com',{});
					res.redirect("/login");
				}
				
			}).catch(function (erro){
			
			});
		}
		
	});
	
}