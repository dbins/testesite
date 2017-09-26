var servicoEmail = require('./../servicos/emails.js');
var webservice = require('./../servicos/cep.js');
var servicoUsuario = require('./../servicos/usuarios.js');
var servicoLogin = require('./../servicos/logins.js');
var moment = require('moment');
var objectid = require('objectid');
var crypto = require('crypto');

function retornaIDShopping(shoppings, shopping){
	var retorno = 0;
	shoppings.forEach(function(item){
	   if (item.url_title== shopping){
		  retorno = item._id;
	   }
	});
	return retorno;
}

module.exports = function (app){
	app.get("/pagamento/dados", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var endereco = {"rua":"", "numero":"", "complemento":"", "bairro":"", "cidade":"", "estado":"", "cep":""};
		if (req.session.cliente){
			endereco.rua = req.session.cliente.endereco;
			endereco.bairro = req.session.cliente.bairro;
			endereco.cidade = req.session.cliente.cidade;
			endereco.estado = req.session.cliente.estado;
			endereco.numero = req.session.cliente.numero;
			endereco.cep = req.session.cliente.cep;
			endereco.complemento = req.session.cliente.complemento;
		}	
		
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
		
		
		var dados_do_cliente = {};
		var id = objectid();
		dados_do_cliente._id = id;
		dados_do_cliente.firstname = req.session.cliente.nome;
		dados_do_cliente.lastname = req.session.cliente.sobrenome;
		dados_do_cliente.middlename = "";
		dados_do_cliente.birthday = req.session.cliente.aniversario;
		dados_do_cliente.gender = req.session.cliente.genero;
		dados_do_cliente.cpf = req.session.cliente.CPF;
		dados_do_cliente.address = req.session.endereco.rua;
		dados_do_cliente.neighborhood = req.session.endereco.bairro;
		dados_do_cliente.city = req.session.endereco.cidade;
		dados_do_cliente.state = req.session.endereco.estado;
		dados_do_cliente.number = req.session.endereco.numero;
		dados_do_cliente.zipcode = req.session.endereco.cep;
		dados_do_cliente.complement = req.session.endereco.complemento;
		dados_do_cliente.ddd =  req.session.cliente.ddd;
		dados_do_cliente.phone = req.session.cliente.telefone;
		dados_do_cliente.email = req.session.cliente.email;
		//A senha é criptograda automaticamente pelo servico!
		dados_do_cliente.password = req.session.cliente.senha;
		//Por enquanto gravar o usuário aqui
		if (req.session.cliente.novo){
			if (app.locals.token_api == ""){
				//Houve um erro, nao houve comunicacao para gerar token
			} else {
				//Gravar o usuario novo:
				dados_do_cliente.country = "BR";
				dados_do_cliente.opt_in = "true";	
				//dados_do_cliente.password = crypto.createHash('md5').update(req.session.cliente.senha).digest("hex");
				
				
				var apiUsuario = new servicoUsuario(app.locals.token_api);
				var apiLogin = new servicoLogin(app.locals.token_api);
				//Gravar o usuario para poder fazer compras
				var consulta = apiUsuario.gravar(dados_do_cliente).then(function (resultados) {
					//SUCESSO
					//Gravar o usuario para poder fazer login!
					//Acho que nao precisa mais
					//var consulta2 = apiLogin.gravar(dados_do_cliente).then(function (resultados2) {
						//SUCESSO
					//}).catch(function (erro2){
						//ERRO
					//});
				}).catch(function (erro){
					//ERRO
				});
				
			}
		} else {
			//Fazer o update
			dados_do_cliente._id = req.session.cliente.id;
			dados_do_cliente.password = req.session.cliente.senha2;
			
			dados_do_cliente.middlename = "";
			dados_do_cliente.country =  "BR";
            dados_do_cliente.opt_in = req.session.cliente.opt_in;
            dados_do_cliente.created_at = req.session.cliente.created_at;
            dados_do_cliente.favorite_events = req.session.cliente.favorite_events;
            dados_do_cliente.favorite_products = req.session.cliente.favorite_products;
            dados_do_cliente.favorite_stores = req.session.cliente.favorite_stores;
			
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.atualizar(dados_do_cliente).then(function (resultados) {
				//Sucesso	
			}).catch(function (erro){
				//ERRO
			});
			
		}
		res.redirect("/pagamento/cartoes");
	});
	app.post("/pagamento/cep", function(req,res){
		//Retornar JSON
		var consulta = new webservice(req.body.cep).then(function (resultados) {
			res.json(resultados);
		}).catch(function (erro){
			res.json({"zipcode":null,"street":null,"neighborhood":null,"city":null,"state":null});
		});
	});
	
	app.get("/pagamento/cartoes", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		
		var itens_carrinho = [];
		var total = 0;
		for (index = 0; index < app.get("carrinho").length; ++index) {
			total += parseFloat((app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
			app.get("carrinho")[index].total = (parseFloat(app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde)).toFixed(2);
			
			var id = objectid();
			var tmp_itens = {};
			tmp_itens._id = id; 
			tmp_itens.mall = retornaIDShopping(app.get("shoppings"), app.get("carrinho")[index].mall); //ID
			tmp_itens.store = "";//ID
			tmp_itens.product = app.get("carrinho")[index].id;//ID
			tmp_itens.quantity = app.get("carrinho")[index].qtde;
			tmp_itens.unity_price = app.get("carrinho")[index].por;
			tmp_itens.total_price = app.get("carrinho")[index].total;
			itens_carrinho.push(tmp_itens);
		}
		
		//Por enquanto gerar os itens aqui.
		//A ordem de gravar sera primeiro gerar os itens, depois gerar a transacao
		
		
		//Valor fixo para testes
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
