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

function montarTabelaPedido(carrinho){
	var retorno = '';
	for (index = 0; index < carrinho.length; ++index) {
		//carrinho[index].por
		retorno += '<tr>';
        retorno += '    <td width="19%">' + carrinho[index].produto + '</td>';
        retorno += '    <td width="20%">' + carrinho[index].shopping + '</td>';
        retorno += '    <td width="12%">' + carrinho[index].loja + '</td>';
        retorno += '    <td width="11%">' + carrinho[index].cor + '</td>';
        retorno += '    <td width="10%">Tam ' + carrinho[index].tamanho + '</td>';
        retorno += '    <td width="16%">' + carrinho[index].qtde + ' Unidade(s)</td>';
        retorno += '    <td width="12%">R$' + carrinho[index].total + '</td>';
        retorno += '</tr>';
		retorno += '<tr>';
        retorno += '    <td colspan="7"><div style="border-bottom:1px #ddd solid; width:100%; height:2px"></div></td>';
        retorno += ' </tr>';
	}
	
	return retorno;
}

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
					console.log(erro.stack);
					//ERRO
				});
				
			}
		} else {
			//Fazer o update
			dados_do_cliente._id = req.session.cliente.id;
			//dados_do_cliente.password = req.session.cliente.senha2;
			//dados_do_cliente.password = req.session.cliente.senha;
			
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
				console.log(erro.stack);
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
			console.log(erro.stack);
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
	
	//Este endpoint vai capturar a transacao que foi enviada para a ClearSale por /pagamento/finalizar
	app.get("/pagamento/concluido", function(req,res){
		console.log('estou no pagamento concluido!');
		console.log(req.session.id_marketplace);
		
		//Fazer a captura, em caso de sucesso, avisar ClearSale!
		var api_clearsale = new servicoClearSale();
		var apiPagarme = new servicoPagarme();
		var iddacompra = req.session.ultima_transacao;
		var pedido = iddacompra;
		
		var total = 0;
		for (index = 0; index < req.session.carrinho.length; ++index) {
			total += parseFloat((req.session.carrinho[index].por) * parseFloat(req.session.carrinho[index].qtde));
		}
		total = parseFloat(total) * 100;
		
		if (req.session.tipo_pagamento =="credit_card"){
			var dados_captura = {};
			dados_captura.amount = total;
			
			//O bloco abaixo vai precisar ficar dentro do IF para fazer captura
			//Apenas para simular aprovacao ClearSale...
			req.session.status_clearsale = "APA";
			
			if (req.session.status_clearsale == "APA"){
				//Mover a programacao de captura
				//dados_captura.split_rules = apiPagarme.montarSplitRules(req.session.carrinho);
				apiPagarme.capturaTransacao(iddacompra, dados_captura).then(function (resultados2) {
					var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
						//Verificar resultados.dados.status, por enquanto nos testes retorna PAID.
						//Se houver problema na captura, temos que mandar para outro lugar!
						
						var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
						if (req.session.cliente.CPF == tmp_pedido.cpf){
								//OK
						} else {
							res.redirect("/");
							return;
						}
						
						console.log('dados do pedido na Pagarme');
						console.log(tmp_pedido);
						
						//Status da transacao na Pagarme:
						//processing - Transação está processo de autorização.
						//authorized - Transação foi autorizada. Cliente possui saldo na conta e este valor foi reservado para futura captura, que deve acontecer em até 5 dias para transações criadas com api_key. Caso não seja capturada, a autorização é cancelada automaticamente pelo banco emissor, e o status da transação permanece authorized.
						//paid - Transação paga. Foi autorizada e capturada com sucesso, e para boleto, significa que nossa API já identificou o pagamento de seu cliente.
						//refunded - Transação estornada completamente.
						//waiting_payment - Transação aguardando pagamento (status válido para boleto bancário).
						//pending_refund - Transação do tipo boleto e que está aguardando para confirmação do estorno solicitado.
						//refused - Transação recusada, não autorizada.
						//chargedback - Transação sofreu chargeback. Mais em nossa central de ajuda
						
						//Gerar o token, atualizar sales transaction....
						var dados_atualizados = {};
						dados_atualizados.status_pagarme = tmp_pedido.status;
						//dados_atualizados.clearsale_id = req.session.id_clearsale;
						//dados_atualizados.status_clearsale = req.session.status_clearsale;
						var apiVendas = new servicoSales(req.session.token_usuario);
						//apiVendas.atualizar(req.session.id_marketplace, dados_atualizados);
						
						if (tmp_pedido.status.toUpperCase() == "PAID"){
							//Vamos devolver para a ClearSale como APROVADO! 
							//26 PAGAMENTO APROVADO
							//27 PAGAMENTO REPROVADO
							api_clearsale.UpdateOrderStatus(req.session.id_marketplace, 26, "");
							//Retirar da fila!
							api_clearsale.SetOrderAsReturned(req.session.id_marketplace);
								
							//Apagando o carrinho!
							var dados_carrinho = req.session.carrinho;
							req.session.carrinho = "";
							req.session.total_carrinho = 0; 
							req.session.id_clearsale = "";
							
							
							
							//ESSE E O EMAIL PARA QUANDO HOUVER CAPTURA
							var envioEmail = new servicoEmail();
							var dados_email ={};
							dados_email.nome = req.session.cliente.nome;
							dados_email.tabela = montarTabelaPedido(dados_carrinho);
							dados_email.pedido = "";
							dados_email.token = "";
							dados_email.data = "";
							dados_email.hora = "";
							dados_email.loja = "";
							dados_email.shopping = "";
							dados_email.QRCODE = "";
							envioEmail.pagamentoCartaoCaptura(req.session.cliente.email,dados_email);
							
							
							//Gerar o token, atualizar sales transaction....
							//var token_sales = (Math.floor(Math.random()*900000) + 100000);
							//req.session.token_sales = token_sales;
							//var dados_atualizados = {};
							//dados_atualizados.status_pagarme = "paid";
							//dados_atualizados.clearsale_id = req.session.id_clearsale;
							//dados_atualizados.status_clearsale = req.session.status_clearsale;
							//var apiVendas = new servicoSales(app.locals.token_api);
							//apiVendas.atualizar(req.session.id_marketplace, dados_atualizados);
							
							if (tmp_pedido.tipo=="Boleto"){
								res.render("pagamento/boleto", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
							} else {
								res.render("pagamento/finalizar", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
								//res.render("pagamento/aguardando", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
							}		
							
						} else {
							//Se a transacao foi cartao, autorizou e nao retornou paid, algo ocorreu...
							//Dos status ClearSale, o unico de erro que se aplica ao cartao nesta etapa seria o refused, os demais se referem a etapas anteriores ou futuras do processo de compra....
							//Status da transacao na Pagarme:
							if (tmp_pedido.status.toUpperCase() == "REFUSED"){
								//ESSE E O EMAIL SE HOUVER PROBLEMA NA CAPTURA
								var envioEmail = new servicoEmail();
								var dados_email ={};
								dados_email.nome = req.session.cliente.nome;
								dados_email.tabela = montarTabelaPedido(dados_carrinho);
								envioEmail.pagamentoCartaoReprovado(req.session.cliente.email,dados_email);
								res.render("pagamento/erro");
							} else {
								//Demais status...
								res.render("pagamento/erro");
							}
							
							
						}
						
					}).catch(function (erro){
						console.log('*** 1 ****');
						console.log(erro.stack);
						res.redirect("/erro/500");
					});
				}).catch(function (erro2){
					console.log('*** 2 ****');
					console.log(erro2.stack);
					res.redirect("/erro/500");
				});
			} else {
				//Ir para a programacao de aguardando...
				var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
					//Verificar resultados.dados.status, por enquanto nos testes retorna PAID.
					//Se houver problema na captura, temos que mandar para outro lugar!
					
					var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
					if (req.session.cliente.CPF == tmp_pedido.cpf){
							//OK
					} else {
						res.redirect("/");
						return;
					}
					
					//Nao vai haver retorno para ClearSale porque nao houve pagamento...
					//Apagando o carrinho!
					var dados_carrinho = req.session.carrinho;
					req.session.carrinho = "";
					req.session.total_carrinho = 0; 
					req.session.id_clearsale = "";
					
					//ESSE E O EMAIL PARA QUANDO NAO HOUVER CAPTURA
					var envioEmail = new servicoEmail();
					var dados_email ={};
					dados_email.nome = req.session.cliente.nome;
					dados_email.tabela = montarTabelaPedido(dados_carrinho);
					envioEmail.pagamentoCartaoAguardando(req.session.cliente.email,dados_email);
					
					if (tmp_pedido.tipo=="Boleto"){
						res.render("pagamento/boleto", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
					} else {
						res.render("pagamento/aguardando", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
					}	
				}).catch(function (erro){
					console.log('*** 3 ****');
					console.log(erro.stack);
					res.redirect("/erro/500");
				});
				
			}
		
		} else {
			//Boleto nao tem captura!
			var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
				var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
				if (req.session.cliente.CPF == tmp_pedido.cpf){
						//OK
				} else {
					res.redirect("/");
					return;
				}
				
				//Vamos devolver para a ClearSale como APROVADO! (por enquanto)
				//26 PAGAMENTO APROVADO
				//27 PAGAMENTO REPROVADO
				
				//Desativado - No caso do boleto, somente volta como aprovado se Callback Pagarme der OK
				//api_clearsale.UpdateOrderStatus(req.session.id_marketplace, 26, "");
				//Retirar da fila!
				//api_clearsale.SetOrderAsReturned(req.session.id_marketplace);
				
				//Apagando o carrinho!
				var dados_carrinho = req.session.carrinho;
				req.session.carrinho = "";
				req.session.total_carrinho = 0; 
				req.session.id_clearsale = "";
				
				var envioEmail = new servicoEmail();
				var dados_email ={};
				dados_email.nome = req.session.cliente.nome;
				dados_email.tabela = montarTabelaPedido(dados_carrinho);
				envioEmail.pagamentoBoleto(req.session.cliente.email,dados_email);
					
				if (tmp_pedido.tipo=="Boleto"){
					res.render("pagamento/boleto", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
				} else {
					res.render("pagamento/finalizar", {pagarme: tmp_pedido, nome: req.session.cliente.nome, email: req.session.cliente.email, pedido: pedido, resultados: dados_carrinho,moment: moment});
				}	
			}).catch(function (erro){
				console.log(erro.stack);
				res.redirect("/erro/500");
			});
		}
	});
	
	app.get("/pagamento/finalizar", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		
		//var envioEmail = new servicoEmail();
		//envioEmail.finalizarCompra(req.session.cliente.email,{});
		
		
		//Ao chegar nesta parte, a transacao foi autorizada e capturada
		//Inserir o ClearSale aqui, ja que a captura nao vai ser na hora
		var api_clearsale = new servicoClearSale();
		var dadosCompra = [];
		var total_carrinho = 0;
		for (index = 0; index < req.session.carrinho.length; ++index) {
			//Domingo
			total_carrinho = parseFloat(total_carrinho) + (parseFloat(req.session.carrinho[index].total) * 100);
			//Formato PAGARME
			var tmp_item = {};
			tmp_item.slug= req.session.carrinho[index].url_title;
			tmp_item.product= req.session.carrinho[index].produto;
			tmp_item.unity_price = FormataNumero(req.session.carrinho[index].por);
			tmp_item.quantity = req.session.carrinho[index].qtde;
			tmp_item.total_price = parseFloat(req.session.carrinho[index].total) * 100;
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
			//req.session.carrinho = "";
			//req.session.total_carrinho = 0; 
			//Gerar Token
			//Disparar e-mail
			//Gerar QRCode
		
			//ID na ClearSale (???)
			req.session.id_clearsale = resultados.id;
			req.session.status_clearsale = resultados.status;

			//Novidade!
			//Guardando o retorno ClearSale!
			var dados_atualizados = {};
			dados_atualizados.clearsale_id = req.session.id_clearsale;
			dados_atualizados.status_clearsale = req.session.status_clearsale;
			var apiVendas = new servicoSales(req.session.token_usuario);
			//apiVendas.atualizar(req.session.id_marketplace, dados_atualizados);
		
			
			//Para estes dois status, consultar de novo...	
			if (resultados.status=="AMA" || resultados.status=="NVO"){
				console.log('fazendo uma nova consulta');
				api_clearsale.GetOrderStatus(req.session.id_marketplace).then(function (resultados) {
					console.log('segunda consulta ClearSale...');
					//TUDO MUDOU PARA OUTRA ROTA!
					res.redirect("/pagamento/concluido");
				}).catch(function (erro4){
					console.log(erro4.stack);
					res.redirect("/erro/500");
				});						
					
			}
			
			var min = 10000;
			var max = 50000;
			//var pedido = Math.floor(Math.random()*(max-min+1)+min);
			req.session.pgtk = Math.floor(Math.random()*(max-min+1)+min); //SOMENTE PARA TESTES
			
			//Movido para outra rota...
			//var iddacompra = req.session.ultima_transacao;
			//var pedido = iddacompra;
			//var apiPagarme = new servicoPagarme();
			//var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
			//	var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
			//	if (req.session.cliente.CPF == tmp_pedido.cpf){
			//		//OK
			//	} else {
			//		res.redirect("/");
			//		return;
			//	}
			//	if (tmp_pedido.tipo=="Boleto"){
			//		res.render("pagamento/boleto", {pagarme: tmp_pedido, email: req.session.cliente.email, pedido: pedido, resultados: req.session.carrinho,moment: moment});
			//	} else {
			//		res.render("pagamento/finalizar", {pagarme: tmp_pedido, email: req.session.cliente.email, pedido: pedido, resultados: req.session.carrinho,moment: moment});
			//	}	
			//}).catch(function (erro){
			//	res.redirect("/erro/500");
			//});
			
			//TUDO MUDOU PARA OUTRA ROTA!
			//res.redirect("/pagamento/concluido");
		}).catch(function (erro3){
			console.log(erro3.stack);
			res.redirect("/erro/500");
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
		var retorno =  0; //O - Nao esta logado * 1 - Sucesso ao gravar - 2 - Problema ao gravar
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
			//transacao.order_number = "0";
			transacao.price = total;
			//transacao.token = "0";
			//transacao.token_pagarme = token_pagarme;
			//transacao.status_pagarme = "paid"; //Alterar!
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
			//Fazer o split na autorizacao (????)
			
			//Acrescentar no retorno Pagarme nossas informacoes.
			dados_cliente_pagarme.items = array_items;
			dados_cliente_pagarme.metadata = objeto_metadata;
			dados_cliente_pagarme.split_rules = apiPagarme.montarSplitRules(req.session.carrinho);
			dados_cliente_pagarme.aniversario = req.session.cliente.aniversario;
			dados_cliente_pagarme.postback_url = "https://concierge-front.herokuapp.com/callback/pagarme";
			
			//Antes autorizava e capturava ao mesmo tempo, agora apenas autoriza.
			//Neste caso, o envio de dados depende do tipo de pagamento!
			//var consulta = apiPagarme.captura(token_pagarme, total, dados).then(function (resultados) {
			var consulta = apiPagarme.autorizaTransacao(total, dados_cliente_pagarme).then(function (resultados) {
				//Somente volta resposta depois da captura!
				req.session.ultima_transacao = resultados.dados.id;
				//transacao.transaction_id = resultados.dados.id; //ID NA PAGARME!
				transacao.pagarme_id = resultados.dados.id; //ID NA PAGARME!
				req.session.parcelas = resultados.dados.installments;
				transacao.status_pagarme = resultados.dados.status;
				transacao.status = "WAITING_PAYMENT";
				
				//Gravar os itens
				//var apiProdutosVendas = new servicoProdutoSales(app.locals.token_api);
				var apiProdutosVendas = new servicoProdutoSales(req.session.token_usuario);
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
					  //var apiVendas = new servicoSales(app.locals.token_api);
					  var apiVendas = new servicoSales(req.session.token_usuario);
					  var gravar_vendas = apiVendas.gravar(transacao).then(function (resultados) {
						//NAO ESPERAR O RETORNO PORQUE E TESTE.
						//ALINHAR O OPERACIONAL CORRETO DEPOIS!
						//ID DO SALES TRANSACTION
						req.session.id_marketplace = resultados.id;
						if (resultados.id == 0){
							retorno = 2;
							
						}
						console.log('GRAVOU A TRANSACAO...');
						console.log(resultados);
						return res.json({"retorno": retorno});	
						
					   });
					}).catch((err) => {
						retorno = 2;
						console.log('pagamento gravar erro');
						console.log(err.stack);
						return res.json({"retorno": retorno});	
						//problema....
					});
				//return res.json(retorno);	
			}).catch(function (erro){
				retorno = 2;
				console.log(erro.stack);
				return res.json({"retorno": retorno});	
			});
	
		} else {
			return res.json({"retorno": retorno});	
		}
		
		
	});
	
	app.get("/pagamento/aviso/erro", function(req,res){
		//if (!req.session.usuario){
			//res.redirect("/");
			//return;
		//}
		res.render("pagamento/erro");
	});

	app.get("/pagamento/qrcode", function(req,res){
		var qr = require('qr-image');  
		if (req.session.token_sales){
			var iddacompra = req.session.token_sales;
			var code = qr.image(iddacompra, { type: 'png' });  
			res.type('png');
			code.pipe(res);
		}
	});
	
	app.get("/pagamento/teste1", function(req,res){
		var apiPagarme = new servicoPagarme();
		apiPagarme.listarPostbacks(2424079).then(function (resultados) {
			apiPagarme.enviarUltimoPostback(2424079, resultados.dados).then(function (resultados2) {
				console.log(resultados2);
				console.log('sucesso');
			}).catch((err2) => {
				console.log('erro2');
				console.log(err2.stack);
			});		
		}).catch((err) => {
			console.log('erro1');
			console.log(err.stack);
		});	
	});
	
	app.get("/pagamento/teste2", function(req,res){
		var apiVendas = new servicoSales(app.locals.token_api);
		apiVendas.viewGQL(2424079).then(function (resultados) {
			console.log(resultados);
			var compra = apiVendas.montarVendaCQL(resultados.dados);
			console.log(compra);
		}).catch((err) => {
			console.log('erro1');
			console.log(err.stack);
		});	
	});	
	
	app.get("/pagamento/teste3", function(req,res){
		var apiVendas = new servicoSales(app.locals.token_api);
		apiVendas.listGQL("59f3d9499a7ca4002ce5ace6").then(function (resultados) {
			console.log(resultados);
		}).catch((err) => {
			console.log('erro');
			console.log(err.stack);
		});	
	});	
}
