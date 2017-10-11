var servicoEmail = require('./../servicos/emails.js');

module.exports = function (app){
	app.get("/termos", function(req,res){
		res.render("site/termos");
	});
	app.get("/perguntas", function(req,res){
		res.render("site/perguntas");
	});
	app.get("/contato", function(req,res){
		res.render("site/contato", {aviso: ''});
	});
	app.post("/contato", function(req,res){
		
		var envioEmail = new servicoEmail();
		var dados_email = '';
		dados_email += '<p>Informações recebidas atraves do formulário de contato do site</p>';
		dados_email += '<p>Nome:' + req.body.nome + "</p>";
		dados_email += '<p>Email:' + req.body.email + "</p>";
		dados_email += '<p>Telefone:' + req.body.telefone + "</p>";
		dados_email += '<p>Tipo de Atendimento:' + req.body.tipo + "</p>";
		dados_email += '<p>Mensagem:' + req.body.mensagem + "</p>";
					
		envioEmail.contatoSite('letonon@gmail.com', dados_email);
		
		res.render("site/contato", {aviso: 'OK'});
	});
	app.post("/novidades", function(req,res){
		res.render("site/novidades");
	});
	
	//Retorna JSON
	app.post("/busca", function(req,res){
		var produto = req.body.produto;
		var resultados = []
		if (produto != ""){
			if (req.session.produtos){
			if (req.session.produtos.length>0){
				req.session.produtos.forEach(function(resultado) {
					var str = resultado.produto.toLowerCase();
					var n = str.indexOf(produto.toLowerCase());
					if (n >=0){
						resultados.push(resultado);
					}
				});		
				
			}	
			}
		}
		res.json(resultados);
	});
	
	app.get("/newsletter", function(req,res){
		res.render("site/newsletter");
	});
	app.post("/newsletter", function(req,res){
		var email = req.body.email;
		res.render("site/newsletter");
	});
	
	app.get("/logout", function(req,res){
		req.session.destroy();
		res.redirect('/');
	});
	

	
	app.get("/", function(req,res){
		req.session.shopping = '';
		res.redirect('/home');
	});
	
	
}
