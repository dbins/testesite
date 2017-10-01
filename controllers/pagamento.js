var servicoEmail = require('./../servicos/emails.js');
var webservice = require('./../servicos/cep.js');
var servicoUsuario = require('./../servicos/usuarios.js');
var servicoLogin = require('./../servicos/logins.js');
var servicoPagarme = require('./../servicos/pagarme.js');
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

function FormataNumero(numero){
	var tmp = numero;
	tmp = tmp.toString();
	tmp = tmp.replace(/,/g, '');
	tmp = tmp.replace(/./g, '');
	return tmp;
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
		//total = 100;
		res.render("pagamento/confirmar", {cliente: req.session.cliente, endereco: req.session.endereco, carrinho: app.get("carrinho"), total_carrinho:  parseFloat(total) * 100, total_exibir: parseFloat(total).toFixed(2)});
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
		//var pedido = Math.floor(Math.random()*(max-min+1)+min);
		app.locals.pgtk = Math.floor(Math.random()*(max-min+1)+min); //SOMENTE PARA TESTES
		
		
		
		var iddacompra = app.get("ultima_transacao");
		var pedido = iddacompra;
		var apiPagarme = new servicoPagarme();
		var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
			var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
			if (req.session.cliente.CPF == tmp_pedido.cpf){
				//OK
			} else {
				res.redirect("/");
				return;
			}
			res.render("pagamento/finalizar", {pagarme: tmp_pedido, email: req.session.cliente.email, pedido: pedido, resultados: app.get("carrinho"),moment: moment});
		}).catch(function (erro){
			//res.redirect("/erro/500");
		});
		
		
		
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
	
	app.post("/pagamento/gravar", function(req,res){
		var retorno =  0;
		var token_pagarme = req.body.token;
		var tipo_pagamento = req.body.tipo;
		if (req.session.usuario){
			//Gravar a transacao, guardar o token e redirecionar
			app.locals.pgtk = token_pagarme;
			retorno = 1;
			
			
			//Transacoes Itens
			var array_itens = [];
			var total = 0;
			for (index = 0; index < app.get("carrinho").length; ++index) {
				
				var tmp_item = {};
				
				app.get("carrinho")[index].total = (parseFloat(app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
				
				tmp_item.mall =  app.get("carrinho")[index].mall;
				tmp_item.store = app.get("carrinho")[index].loja;
				tmp_item.product = app.get("carrinho")[index].url_title;
				//tmp_item.bought_at: Date,
				//tmp_item.delivered_at: Date,
				tmp_item.quantity = app.get("carrinho")[index].qtde;
				tmp_item.unity_price = FormataNumero(app.get("carrinho")[index].por);
				tmp_item.total_price = FormataNumero(app.get("carrinho")[index].total);
				//approved_at: Date,
				//reversed_at: Date,
				//created_at: Date,
				//updated_at: Date, 	
				//removed_at: Date
				array_itens.push(tmp_item);
				total += parseFloat((app.get("carrinho")[index].por) * parseFloat(app.get("carrinho")[index].qtde));
				
			}
			total = parseFloat(total) * 100;
			//total = FormataNumero(total);
			//Transacoes 
			var transacao = {};
			
			transacao.user = req.session.cliente.id;
			transacaostatus = 'WAITING_PAYMENT';
			transacao.source = 'SITE';
			//transacao.transaction_id: String,
			transacao.order_number = "";
			transacao.price = total;
			transacao.token = "";
			transacao.token_pagarme = "";
			transacao.status_pagarme = "";
			transacao.charge_back_details = "";
			transacao.status_clear_sale = "";
			transacao.clear_sale_id = "";
			transacao.payment={};
			transacao.sale_transaction_products = array_itens;    
			//transacao.created_at: Date,
			//transacao.updated_at: Date,	
			//transacao.removed_at: Date,
			transacao.total_price = total;
			//transacao.total_reversed: Number
			
			
			//Apenas para fins de testes, efetuar captura
			var apiPagarme = new servicoPagarme();
			var dados = {};
			var array_items = [];
			
			
			
			for (index = 0; index < app.get("carrinho").length; ++index) {
				var tmp_item = {};
				tmp_item.id= app.get("carrinho")[index].url_title;
				tmp_item.title= app.get("carrinho")[index].produto;
				tmp_item.unit_price= FormataNumero(app.get("carrinho")[index].por);
				tmp_item.quantity = app.get("carrinho")[index].qtde;
				tmp_item.tangible = true;
				tmp_item.category = "";
				tmp_item.venue = "";
				tmp_item.date = moment().format('YYYY-MM-DD');
				array_items.push(tmp_item);	
			}		
			dados.items = array_items;
			var objeto_metadata = {};
			objeto_metadata.id = 0;
			objeto_metadata.produtos = app.get("carrinho");
			dados.metadata = objeto_metadata;
			var consulta = apiPagarme.captura(token_pagarme, total, dados).then(function (resultados) {
				//Somente volta resposta depois da captura!
				app.set('ultima_transacao', resultados.dados.id);
				return res.json(retorno);	
			}).catch(function (erro){
				return res.json(retorno);	
			});
	
		} else {
			return res.json(retorno);	
		}
		
		
	});
	
	
}
