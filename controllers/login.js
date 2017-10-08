var servicoEmail = require('./../servicos/emails.js');
var servicoUsuario = require('./../servicos/usuarios.js');
var servicoLogin = require('./../servicos/logins.js');
var objectid = require('objectid');
//var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');


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
			//var apiLogin = new servicoLogin(app.locals.token_api);
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.consultar(req.body.CPF).then(function (resultados) {
			//var consulta = apiLogin.consultar(req.body.CPF).then(function (resultados) {	
				
				
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
					//var senha = crypto.createHash('md5').update(req.body.senha).digest("hex");
					//console.log(senha);
					//if (dados.password == senha){
					
					//console.log(dados.password);
					//bcrypt.compare(req.body.senha, dados.password, (err, result) => {
					//	if (err) {
					//	   console.log('bcrypt - error - ', err);
					//	} else {
					//	   console.log('bcrypt - result - ', result);
					//	}
					// });
						
					//if (bcrypt.compareSync(req.body.senha, dados.password)){
						
					
					//Aguardar a senha voltar a funcionar
					//var consulta = autentica.validarUsuario(dados.email, req.body.senha).then(function (resultados) {
						
						//User o token do usuario
						app.locals.tokenUsuario = resultados.token;
						
						req.session.usuario = dados.firstname;
						var cliente = {};
						cliente.CPF = dados.cpf;
						if (dados.email){
							cliente.email = dados.email;
						} else {
							cliente.email = "";
						}
						cliente.id = dados._id;
						cliente.nome = dados.firstname;
						cliente.sobrenome = dados.lastname;
						cliente.genero = dados.gender;
						cliente.aniversario = dados.birthday;
						cliente.ddd = dados.ddd;
						cliente.telefone = dados.phone;
						cliente.senha = req.body.senha;
						cliente.senha2 = dados.password;
						
						cliente.endereco = dados.address;
						cliente.bairro = dados.neighborhood;
						cliente.cidade = dados.city;
						cliente.estado = dados.state;
						cliente.pais = "BR";
						cliente.numero = dados.number;
						cliente.cep = dados.zipcode;
						cliente.complemento = dados.complement;
						
						//Quando cria o registro estes dados nao sao informados
						//Mas para atualizar voce precisa devolver senao o servico apaga :-(
						
						cliente.opt_in = dados.opt_in;
						cliente.created_at = dados.created_at;
						cliente.favorite_events = dados.favorite_events;
						cliente.favorite_products = dados.favorite_products;
						cliente.favorite_stores = dados.favorite_stores;
						
						req.session.cliente = cliente;
						var tmp1 = dados.firstname;
						var tmp2 = dados.lastname;
						app.locals.usuario = dados.firstname + ' ' +  dados.lastname;
						app.locals.letras = tmp1.substring(0,1) + tmp2.substring(0,1);
						req.session.cpf = dados.cpf;
						req.session.save(function (err) {
						if (err) return next(err)
							
							if (app.locals.total_carrinho ==0){
								res.render("login/redirecionar");
							} else {
								res.redirect("/pagamento/dados");
							}
						});
					//}).catch(function (erro){
					//	res.render("login/index", {mensagem: "O login ou a senha informada não foram localizadas"});
					//	return;
					//});
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
		var id = objectid(); //Nao gera id automatico ao gravar
		cliente.id = id;
		cliente.CPF = req.body.CPF;
		cliente.email = req.body.email;
		cliente.nome = req.body.nome;
		cliente.sobrenome = req.body.sobrenome;
		cliente.genero = req.body.genero;
		cliente.aniversario = req.body.aniversario;
		cliente.ddd = req.body.ddd;
		cliente.telefone = req.body.telefone;
		cliente.senha = req.body.senha;
		//cliente.novo = "SIM";
		
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
		
		//Alteracao. Precisa gravar agora, pois pode ocorrer o caso do cliente se cadastrar sem tem carrinho
		if (app.locals.token_api == ""){
			//Houve um erro, nao houve comunicacao para gerar token
		} else {
			//Gravar o usuario novo:
			var dados_do_cliente = {};
			dados_do_cliente._id = id;
			dados_do_cliente.firstname = req.body.nome;
			dados_do_cliente.lastname = req.body.sobrenome;
			dados_do_cliente.middlename = "";
			dados_do_cliente.birthday = req.body.aniversario;
			dados_do_cliente.gender = req.body.genero;
			dados_do_cliente.cpf = req.session.cliente.CPF;
			dados_do_cliente.address = "";
			dados_do_cliente.neighborhood = "";
			dados_do_cliente.city = "";
			dados_do_cliente.state = "";
			dados_do_cliente.number = "";
			dados_do_cliente.zipcode = "";
			dados_do_cliente.complement = "";
			dados_do_cliente.ddd =  req.body.ddd;
			dados_do_cliente.phone = req.body.telefone;
			dados_do_cliente.email = req.body.email;
			//A senha é criptograda automaticamente pelo servico!
			dados_do_cliente.password =  req.body.senha;
			dados_do_cliente.country = "BR";
			dados_do_cliente.opt_in = "true";	
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.gravar(dados_do_cliente).then(function (resultados) {
				
				var tmp1 = dados_do_cliente.firstname;
				var tmp2 = dados_do_cliente.lastname;
				app.locals.usuario = dados_do_cliente.firstname + ' ' +  dados_do_cliente.lastname;
				app.locals.letras = tmp1.substring(0,1) + tmp2.substring(0,1);
						
				//SUCESSO
				if (app.locals.total_carrinho ==0){
					res.render("login/redirecionar");
				} else {
					res.redirect("/pagamento/dados");
				}
			}).catch(function (erro){
				//ERRO
			});
		}
		
		//res.redirect("/pagamento/dados");
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
					var consulta2 = apiUsuario.consultar(req.body.CPF).then(function (resultados2) {
						var envioEmail = new servicoEmail();
						var tmp = resultados2.dados.data;
						var email = tmp[0].email;
						envioEmail.esqueceuSenha(email,{});
						res.redirect("/login");
					}).catch(function (erro2){
						res.redirect("/login");
					});
				}
			}).catch(function (erro){
			
			});
		}
		
	});
	
}
