var servicoAutenticar = require('./../servicos/autenticacao.js');
var webservice = require('./../servicos/malls.js');
var servicoEmail = require('./../servicos/emails.js');
module.exports = function (app){
	app.get("/informacoes", function(req,res){
		res.render("informacoes/index");
	});
	app.get("/informacoes/:nomedoshopping", function(req,res){
		var autentica = new servicoAutenticar();
		var nomedoshopping = req.params.nomedoshopping;
		//Validar se o nome existe!
		var tmp = app.locals.nome_shopping(nomedoshopping);
		if (tmp==""){
			//Nao localizado
			res.redirect('/erro/404');
		} else {
			//Gerar o token para acesso API	
			var consulta = autentica.config().then(function (resultados) {
				app.locals.token_api = resultados.dados;
				var api = new webservice(app.locals.token_api);
				
				//Apenas para testes enquanto monta API
				var codigodoshopping = "596457feeafb690011507034";
				var consulta2 = api.consultar(codigodoshopping).then(function (resultados2) {
					res.render("informacoes/index", {resultados: resultados2.dados, aviso: ''});
				}).catch(function (erro){
					res.redirect("/erro/404");
				});
			}).catch(function (erro){
				//
			});
		}
	});
	app.post("/informacoes", function(req,res){
		//Formulario de contato
		var nomedoshopping = req.params.nomedoshopping;
		res.render("informacoes/index");
	});
	
	app.post("/informacoes/:nomedoshopping", function(req,res){
		//Formulario de contato
		var autentica = new servicoAutenticar();
		var nomedoshopping = req.params.nomedoshopping;
		//Validar se o nome existe!
		var tmp = app.locals.nome_shopping(nomedoshopping);
		if (tmp==""){
			//Nao localizado
			res.redirect('/erro/404');
		} else {
			//Gerar o token para acesso API	
			var consulta = autentica.config().then(function (resultados) {
				app.locals.token_api = resultados.dados;
				var api = new webservice(app.locals.token_api);
				
				//Apenas para testes enquanto monta API
				var codigodoshopping = "596457feeafb690011507034";
				var consulta2 = api.consultar(codigodoshopping).then(function (resultados2) {
					var envioEmail = new servicoEmail();
					var dados_email = '';
					dados_email += '<p>Informações recebidas atraves do formulário de contato do site ' + nomedoshopping + '</p>';
					dados_email += '<p>Nome:' + req.body.nome + "</p>";
					dados_email += '<p>Email:' + req.body.email + "</p>";
					dados_email += '<p>Telefone:' + req.body.telefone + "</p>";
					dados_email += '<p>Tipo de Atendimento:' + req.body.tipo + "</p>";
					dados_email += '<p>Mensagem:' + req.body.mensagem + "</p>";
					
					envioEmail.contatoInformacoes('letonon@gmail.com', dados_email);
					
					res.render("informacoes/index", {resultados: resultados2.dados, aviso: 'OK'});
				}).catch(function (erro){
					res.redirect("/erro/404");
				});
			}).catch(function (erro){
				//
			});
		}
	});
}
