var servicoEmail = require('./../servicos/emails.js');
var webservice = require('./../servicos/cep.js');
var servicoUsuario = require('./../servicos/usuarios.js');
var servicoLogin = require('./../servicos/logins.js');
var servicoPagarme = require('./../servicos/pagarme.js');
var servicoSales = require('./../servicos/salestransactions.js');
var servicoProdutoSales = require('./../servicos/salestransactionsproducts.js');
var moment = require('moment');
var objectid = require('objectid');
var crypto = require('crypto');
var servicoClearSale = require('./../servicos/clearsale.js');

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
		
		if(!req.session.carrinho)
			req.session.carrinho = [];
		
		var total = 0;
		for (index = 0; index < req.session.carrinho.length; ++index) {
			total += parseFloat((req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
			req.session.carrinho[index].total = (parseFloat(req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde)).toFixed(2);
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
		for (index = 0; index < req.session.carrinho.length; ++index) {
			total += parseFloat((req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
			req.session.carrinho[index].total = (parseFloat(req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde)).toFixed(2);
			
			var id = objectid();
			var tmp_itens = {};
			tmp_itens._id = id; 
			tmp_itens.mall = retornaIDShopping(app.get("shoppings"), req.session.carrinho[index].mall); //ID
			tmp_itens.store = "";//ID
			tmp_itens.product = req.session.carrinho[index].id;//ID
			tmp_itens.quantity = req.session.carrinho[index].qtde;
			tmp_itens.unity_price = req.session.carrinho[index].por;
			tmp_itens.total_price = req.session.carrinho[index].total;
			itens_carrinho.push(tmp_itens);
		}
		
		//Por enquanto gerar os itens aqui.
		//A ordem de gravar sera primeiro gerar os itens, depois gerar a transacao
		
		//Parcela minima 30 reais
		var parcelas = Math.floor((parseFloat(total) * 100)/3000);;
		
		if (parseInt(parcelas)>6){
			parcelas = 6; //Maximo de parcelas
		}
		
		//Valor fixo para testes
		//total = 100;
		var formapagamento= "credit_card";
		if ((parseFloat(total) * 100) >= 6000){
			formapagamento= "boleto,credit_card";
		}
		
		
		res.render("pagamento/confirmar", {cliente: req.session.cliente, endereco: req.session.endereco, carrinho: req.session.carrinho, total_carrinho:  parseFloat(total) * 100, total_exibir: parseFloat(total).toFixed(2), parcelas: parcelas, formapagamento: formapagamento});
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
		
		var envioEmail = new servicoEmail();
		envioEmail.finalizarCompra(req.session.cliente.email,{});
		
		
		//Ao chegar nesta parte, a transacao foi autorizada e capturada
		//Inserir o ClearSale aqui, ja que a captura nao vai ser na hora
		var api_clearsale = new servicoClearSale();
		var dadosCompra = [];
		for (index = 0; index < req.session.carrinho.length; ++index) {
			//Formato PAGARME
			var tmp_item = {};
			tmp_item.slug= req.session.carrinho[index].url_title;
			tmp_item.product= req.session.carrinho[index].produto;
			tmp_item.unity_price = FormataNumero(req.session.carrinho[index].por);
			tmp_item.quantity = req.session.carrinho[index].qtde;
			tmp_item.total_price = parseFloat(req.session.carrinho[index].total) * 1000;
			dadosCompra.push(tmp_item);	
		}		
		var fingerprint = req.session.fingerprint;
		var dados_pedido = {};
		dados_pedido.numero_pedido = req.session.id_marketplace; //ID SALESTRANSACTION
		dados_pedido.total = req.session.total_carrinho;
		dados_pedido.parcelas = req.session.parcelas;
		dados_pedido.tipo_pagamento = req.session.tipo_pagamento;
		var dados_cliente = req.session.cliente;
		
		//Apenas para padronizar para os cadastros com problema.
		if (dados_cliente.ddd){
			if (dados_cliente.ddd  === undefined){
				dados_cliente.ddd = "11";
			}
			if (dados_cliente.ddd  == 'undefined'){
				dados_cliente.ddd = "11";
			}
			
		}
		if (dados_cliente.telefone){
			if (dados_cliente.telefone  === undefined){
				dados_cliente.telefone = "111111111";
			}
			if (dados_cliente.telefone  == 'undefined'){
				dados_cliente.telefone = "111111111";
			}
		}
		if (dados_cliente.aniversario){
			if (dados_cliente.aniversario == null){ 
				dados_cliente.aniversario = "1970-01-01";
			}	
			if (dados_cliente.aniversario.length === 0){
				dados_cliente.aniversario = "1970-01-01";
			}
		} else {
			dados_cliente.aniversario = "1970-01-01";
		}
		
		api_clearsale.sendOrders(dados_cliente, dadosCompra, fingerprint, dados_pedido).then(function (resultados) {
			//Se for retorno APA, entao capturar...
			//Precisa capturar o retorno....
			req.session.carrinho = "";
			req.session.total_carrinho = 0; 
			//Gerar Token
			//Disparar e-mail
			//Gerar QRCode
			var min = 10000;
			var max = 50000;
			//var pedido = Math.floor(Math.random()*(max-min+1)+min);
			req.session.pgtk = Math.floor(Math.random()*(max-min+1)+min); //SOMENTE PARA TESTES
			
			
			
			var iddacompra = req.session.ultima_transacao;
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
				if (tmp_pedido.tipo=="Boleto"){
					res.render("pagamento/boleto", {pagarme: tmp_pedido, email: req.session.cliente.email, pedido: pedido, resultados: req.session.carrinho,moment: moment});
				} else {
					res.render("pagamento/finalizar", {pagarme: tmp_pedido, email: req.session.cliente.email, pedido: pedido, resultados: req.session.carrinho,moment: moment});
				}	
			}).catch(function (erro){
				//res.redirect("/erro/500");
			});
		}).catch(function (erro3){
			//
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
		var dados_cliente_pagarme = req.body.dados_transacao;
		
		var identificador = req.body.identificador;
		if (req.session.usuario){
			//Gravar a transacao, guardar o token e redirecionar
			req.session.pgtk = token_pagarme;
			req.session.tipo_pagamento = tipo_pagamento; 
			req.session.fingerprint = identificador;
			retorno = 1;
			
			
			//Transacoes Itens
			var array_itens = [];
			var total = 0;
			for (index = 0; index < req.session.carrinho.length; ++index) {
				
				var tmp_item = {};
				
				req.session.carrinho[index].total = (parseFloat(req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
				//Formato API
				//tmp_item.mall =  req.session.carrinho[index].mall;
				tmp_item.mall =  req.session.carrinho[index].mall;
				tmp_item.store = req.session.carrinho[index].loja;
				tmp_item.product = req.session.carrinho[index].url_title;
				//tmp_item.bought_at: Date,
				//tmp_item.delivered_at: Date,
				tmp_item.quantity = req.session.carrinho[index].qtde;
				tmp_item.unity_price = (parseFloat(req.session.carrinho[index].total) * 1000)/parseFloat(req.session.carrinho[index].qtde);
				tmp_item.total_price = parseFloat(req.session.carrinho[index].total) * 1000;
				tmp_item.bought_at = moment().format('YYYY-MM-DD');
				//approved_at: Date,
				//reversed_at: Date,
				//created_at: Date,
				//updated_at: Date, 	
				//removed_at: Date
				array_itens.push(tmp_item);
				total += parseFloat((req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
				
			}
			
			
			
			
			
			total = parseFloat(total) * 100;
			//total = FormataNumero(total);
			//Transacoes 
			var transacao = {};
			
			transacao.user = req.session.cliente.id;
			transacaostatus = 'WAITING_PAYMENT';
			transacao.source = 'SITE';
			//transacao.transaction_id: String, //ID NA PAGARME!
			transacao.order_number = "0";
			transacao.price = total;
			transacao.token = "0";
			transacao.token_pagarme = token_pagarme;
			transacao.status_pagarme = "paid"; //Alterar!
			//transacao.charge_back_details = "";
			//transacao.status_clear_sale = "";
			//transacao.clear_sale_id = "";
			//transacao.payment={};
			//transacao.sale_transaction_products = array_itens;    
			//transacao.created_at: Date,
			//transacao.updated_at: Date,	
			//transacao.removed_at: Date,
			transacao.total_price = total;
			//transacao.total_reversed: Number
			
			
			//Apenas para fins de testes, efetuar captura
			var apiPagarme = new servicoPagarme();
			var dados = {};
			var array_items = [];
			//var array_items_API = [];
			
			
			for (index = 0; index < req.session.carrinho.length; ++index) {
				//Formato PAGARME
				var tmp_item = {};
				tmp_item.id= req.session.carrinho[index].url_title;
				tmp_item.title= req.session.carrinho[index].produto;
				tmp_item.unit_price = FormataNumero(req.session.carrinho[index].por);
				tmp_item.quantity = req.session.carrinho[index].qtde;
				tmp_item.tangible = true;
				tmp_item.category = "";
				tmp_item.venue = "";
				tmp_item.date = moment().format('YYYY-MM-DD');
				array_items.push(tmp_item);	
				
				
				//Formato API
				//var tmp_item_API = {};
				//tmp_item_API.mall = "TEM QUE INSERIR O MALL DE VOLTA NO ENDPOINT DE PRODUTO";
				//tmp_item_API.product= req.session.carrinho[index].url_title;
				//tmp_item_API.store= req.session.carrinho[index].store;
				//tmp_item_API.unit_price= FormataNumero(req.session.carrinho[index].por);
				//tmp_item_API.quantity = req.session.carrinho[index].qtde;
				//tmp_item_API.total_price = FormataNumero(parseFloat(req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
				//tmp_item_API.bought_at = moment().format('YYYY-MM-DD');
				//array_items_API.push(tmp_item_API);	
			}
			
			
			dados.items = array_items;
			var objeto_metadata = {};
			objeto_metadata.id = 0;
			objeto_metadata.produtos = req.session.carrinho;
			dados.metadata = objeto_metadata;
			dados.split_rules = apiPagarme.montarSplitRules(req.session.carrinho);
			
			//Acrescentar no retorno Pagarme nossas informacoes.
			dados_cliente_pagarme.items = array_items;
			dados_cliente_pagarme.metadata = objeto_metadata;
			
			//Antes autorizava e capturava ao mesmo tempo, agora apenas autoriza.
			//Neste caso, o envio de dados depende do tipo de pagamento!
			//var consulta = apiPagarme.captura(token_pagarme, total, dados).then(function (resultados) {
			var consulta = apiPagarme.autorizaTransacao(total, dados_cliente_pagarme).then(function (resultados) {
				//Somente volta resposta depois da captura!
				req.session.ultima_transacao = resultados.dados.id;
				transacao.transaction_id = resultados.dados.id; //ID NA PAGARME!
				req.session.parcelas = resultados.dados.installments;
				
				//Gravar os itens
				var apiProdutosVendas = new servicoProdutoSales(app.locals.token_api);
				//Toda gravacao de item é uma promisse. Gerar um array e executar tudo de uma vez
				var array_promisses = [];
				for (index = 0; index < array_itens.length; ++index) {
					array_promisses.push(apiProdutosVendas.gravar(array_itens[index]));	
				}
				
				Promise.all(array_promisses)
				  .then(function(results) {
					  var tmp_array_itens = []
					  for (index = 0; index < results.length; ++index) {
						tmp_array_itens.push(results[index].id);
					  }
					  transacao.sale_transaction_products = tmp_array_itens; //TODOS OS ITENS DA COMPRA!
					  var apiVendas = new servicoSales(app.locals.token_api);
					  var gravar_vendas = apiVendas.gravar(transacao).then(function (resultados) {
						//NAO ESPERAR O RETORNO PORQUE E TESTE.
						//ALINHAR O OPERACIONAL CORRETO DEPOIS!
						//ID DO SALES TRANSACTION
						req.session.id_marketplace = resultados.id;
						return res.json(retorno);	
						
					   });
					}).catch((err) => {
						//problema....
					});
				//return res.json(retorno);	
			}).catch(function (erro){
				return res.json(retorno);	
			});
	
		} else {
			return res.json(retorno);	
		}
		
		
	});
	
	
}
