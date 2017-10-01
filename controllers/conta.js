var servicoUsuario = require('./../servicos/usuarios.js');
var servicoPagarme = require('./../servicos/pagarme.js');
var moment = require('moment');

module.exports = function (app){
	app.get("/compras", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var apiPagarme = new servicoPagarme();
		var consulta = apiPagarme.pedidos(req.session.cliente.CPF).then(function (resultados) {
			var tmp_pedidos = apiPagarme.montarPedidos(resultados.dados);
			//res.render("conta/compras", {resultados:app.get("pedidos")});
			res.render("conta/compras", {resultados:tmp_pedidos, moment:moment});
		}).catch(function (erro){
			res.redirect("erro/500");
		});
		
	});
	app.get("/compras/detalhes/:iddacompra", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Sempre pesquisar por id compra + usuario
		var iddacompra = req.params.iddacompra;
		var resultado = {};
		for (index = 0; index < app.get("pedidos").length; ++index) {
			if (app.get("pedidos")[index].pedido == iddacompra){
				resultado = app.get("pedidos")[index];	
			}
		}
		
		var apiPagarme = new servicoPagarme();
		var consulta = apiPagarme.verTransacao(iddacompra).then(function (resultados) {
			var tmp_pedido = apiPagarme.montarPedido(resultados.dados);
			if (req.session.cliente.CPF == tmp_pedido.cpf){
				//OK
			} else {
				res.redirect("/");
				return;
			}
			res.render("conta/detalhes_pedido", {resultados:tmp_pedido, moment: moment});
		}).catch(function (erro){
			res.redirect("/erro/500");
		});
		
		
	});
	
	app.get("/compras/detalhes/qrcode/:iddacompra", function(req,res){
		var qr = require('qr-image');  
		var iddacompra = req.params.iddacompra;
		var code = qr.image(iddacompra, { type: 'png' });  
		res.type('png');
		code.pipe(res);
	});
	
	app.get("/favoritos", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var total = app.get("favoritos_produtos").length + app.get("favoritos_promocoes") + app.get("favoritos_lojas") + app.get("favoritos_eventos");
		res.render("conta/favoritos", {total: total, produtos: app.get("favoritos_produtos"), promocoes: app.get("favoritos_promocoes"), lojas: app.get("favoritos_lojas"), eventos: app.get("favoritos_eventos")});
	});
	app.get("/favoritos/remove/:iddoobjeto", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var iddoproduto = req.params.iddoobjeto;
		res.render("conta/favoritos");
	});
	
	app.get("/favoritos/adicionar/:iddoobjeto", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		var iddoproduto = req.params.iddoobjeto;
		res.render("conta/favoritos");
	});
	
	app.get("/configuracoes", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		
		var cliente = {"cpf": "", "email": "", "nome": "", "sobrenome": "", "genero": "", "aniversario": "", "ddd": "", "telefone": ""};
		var endereco = {"rua":"", "numero":"", "complemento":"", "bairro":"", "cidade":"", "estado":"", "cep":""};
		if (req.session.cliente){
			endereco.rua = req.session.cliente.endereco;
			endereco.bairro = req.session.cliente.bairro;
			endereco.cidade = req.session.cliente.cidade;
			endereco.estado = req.session.cliente.estado;
			endereco.numero = req.session.cliente.numero;
			endereco.cep = req.session.cliente.cep;
			endereco.complemento = req.session.cliente.complemento;
			
			cliente.cpf = req.session.cliente.CPF;
			cliente.email = req.session.cliente.email;
			cliente.nome = req.session.cliente.nome;
			cliente.genero = req.session.cliente.genero;
			cliente.sobrenome = req.session.cliente.sobrenome;
			cliente.aniversario = req.session.cliente.aniversario;
			cliente.ddd = req.session.cliente.ddd;
			cliente.telefone = req.session.cliente.telefone;
					
		}	
		
		res.locals.csrfToken = req.csrfToken();
		res.render("conta/configuracoes", {cliente: cliente, endereco: endereco, carteira:app.get("cartoes")});
	});
	
	app.post("/configuracoes/dados", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Gravar os dados
		var dados_do_cliente = {};
		dados_do_cliente._id = req.session.cliente.id;
		
		dados_do_cliente.firstname = req.body.nome;
		dados_do_cliente.lastname = req.body.sobrenome;
		dados_do_cliente.middlename = "";
		dados_do_cliente.birthday = req.body.aniversario;
		//Alterar depois
		dados_do_cliente.gender = req.body.genero;
		//Nao vai alterar
		dados_do_cliente.cpf = req.session.cliente.CPF;
		dados_do_cliente.email = req.body.email;
		dados_do_cliente.ddd =  req.body.ddd;
		dados_do_cliente.phone = req.body.telefone;
		
		dados_do_cliente.address = req.session.cliente.endereco;
		dados_do_cliente.neighborhood = req.session.cliente.bairro;
		dados_do_cliente.city = req.session.cliente.cidade;
		dados_do_cliente.state = req.session.cliente.estado;
		dados_do_cliente.number = req.session.cliente.numero;
		dados_do_cliente.zipcode = req.session.cliente.cep;
		dados_do_cliente.complement = req.session.cliente.complemento;
		dados_do_cliente.password = req.session.cliente.senha2;
		
		dados_do_cliente.middlename = "";
		dados_do_cliente.country =  "BR";
		dados_do_cliente.opt_in = req.session.cliente.opt_in;
		dados_do_cliente.created_at = req.session.cliente.created_at;
		dados_do_cliente.favorite_events = req.session.cliente.favorite_events;
		dados_do_cliente.favorite_products = req.session.cliente.favorite_products;
		dados_do_cliente.favorite_stores = req.session.cliente.favorite_stores;
		
		//Tem que atualizar a session!
		req.session.cliente.nome = req.body.nome;
		req.session.cliente.sobrenome = req.body.sobrenome;
		req.session.cliente.aniversario = req.body.aniversario;
		req.session.cliente.email = req.body.email;
		req.session.cliente.ddd =  req.body.ddd;
		req.session.cliente.phone = req.body.telefone;
		
		if (app.locals.token_api == ""){
			//Sem token de app nao pode fazer isso
		} else {	
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.atualizar(dados_do_cliente).then(function (resultados) {
				//Sucesso
						
			}).catch(function (erro){
				//ERRO
			});
		}
		
		res.redirect('/configuracoes');
		
	});
	
	app.post("/configuracoes/endereco", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		
		var dados_do_cliente = {};
		dados_do_cliente._id = req.session.cliente.id;
		dados_do_cliente.firstname = req.session.cliente.nome;
		dados_do_cliente.lastname = req.session.cliente.sobrenome;
		dados_do_cliente.middlename = "";
		dados_do_cliente.birthday = req.session.cliente.aniversario;
		dados_do_cliente.gender = req.session.cliente.genero;
		dados_do_cliente.cpf = req.session.cliente.CPF;
		dados_do_cliente.address = req.body.endereco;
		dados_do_cliente.neighborhood = req.body.bairro;
		dados_do_cliente.city = req.body.cidade;
		dados_do_cliente.state = req.body.estado;
		dados_do_cliente.number = req.body.numero;
		dados_do_cliente.zipcode = req.body.CEP;
		dados_do_cliente.complement = req.body.complemento;
		dados_do_cliente.ddd =  req.session.cliente.ddd;
		dados_do_cliente.phone = req.session.cliente.telefone;
		dados_do_cliente.email = req.session.cliente.email;
		
		dados_do_cliente.password = req.session.cliente.senha2;
		
		dados_do_cliente.middlename = "";
		dados_do_cliente.country =  "BR";
		dados_do_cliente.opt_in = req.session.cliente.opt_in;
		dados_do_cliente.created_at = req.session.cliente.created_at;
		dados_do_cliente.favorite_events = req.session.cliente.favorite_events;
		dados_do_cliente.favorite_products = req.session.cliente.favorite_products;
		dados_do_cliente.favorite_stores = req.session.cliente.favorite_stores;
		
		//Tem que atualizar a session!
		req.session.cliente.endereco = req.body.endereco;
		req.session.cliente.bairro = req.body.bairro;
		req.session.cliente.cidade = req.body.cidade;
		req.session.cliente.estado = req.body.estado;
		req.session.cliente.numero = req.body.numero;
		req.session.cliente.cep = req.body.CEP;
		req.session.cliente.complemento = req.body.complemento;
		
		if (app.locals.token_api == ""){
			//Sem token de app nao pode fazer isso	
		} else {
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.atualizar(dados_do_cliente).then(function (resultados) {
				//Sucesso	
			}).catch(function (erro){
				//ERRO
			});
		}
		
		//Gravar os dados
		res.redirect('/configuracoes');
	});
	
	app.post("/configuracoes/carteira", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Gravar os dados
		res.redirect('/configuracoes');
	});
	
	app.post("/configuracoes/senha", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Gravar os dados
		
		var dados_do_cliente = {};
		dados_do_cliente._id = req.session.cliente.id;
		dados_do_cliente.firstname = req.session.cliente.nome;
		dados_do_cliente.lastname = req.session.cliente.sobrenome;
		dados_do_cliente.middlename = "";
		dados_do_cliente.birthday = req.session.cliente.aniversario;
		dados_do_cliente.gender = req.session.cliente.genero;
		dados_do_cliente.cpf = req.session.cliente.CPF;
		dados_do_cliente.address = req.session.cliente.endereco;
		dados_do_cliente.neighborhood = req.session.cliente.bairro;
		dados_do_cliente.city = req.session.cliente.cidade;
		dados_do_cliente.state = req.session.cliente.estado;
		dados_do_cliente.number = req.session.cliente.numero;
		dados_do_cliente.zipcode = req.session.cliente.cep;
		dados_do_cliente.complement = req.session.cliente.complemento;
		dados_do_cliente.ddd =  req.session.cliente.ddd;
		dados_do_cliente.phone = req.session.cliente.telefone;
		dados_do_cliente.email = req.session.cliente.email;
		
		//Bug ao atualizar a senha!
		//dados_do_cliente.password = req.session.cliente.senha2;
			
		dados_do_cliente.middlename = "";
		dados_do_cliente.country =  "BR";
        dados_do_cliente.opt_in = req.session.cliente.opt_in;
        dados_do_cliente.created_at = req.session.cliente.created_at;
        dados_do_cliente.favorite_events = req.session.cliente.favorite_events;
        dados_do_cliente.favorite_products = req.session.cliente.favorite_products;
        dados_do_cliente.favorite_stores = req.session.cliente.favorite_stores;
		if (app.locals.token_api == ""){
			//Sem token de app nao pode fazer isso
		} else {	
			var apiUsuario = new servicoUsuario(app.locals.token_api);
			var consulta = apiUsuario.atualizar(dados_do_cliente).then(function (resultados) {
				//Sucesso	
			}).catch(function (erro){
				//ERRO
			});
		}
		
		res.redirect('/configuracoes');
	});
	
	
}
