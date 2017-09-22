var servicoEmail = require('./../servicos/emails.js');

module.exports = function (app){
	app.get("/login", function(req,res){
		if (req.session.carrinho){
			if (req.session.carrinho == "OK"){
				res.redirect("/pagamento/dados");
				return;
			}
		}
		res.render("login/index");
	});
	app.post("/login", function(req,res){
		//res.render("login/index");
		req.session.usuario = "Bins";
		
		var cliente = {};
		cliente.CPF = "44444444444";
		cliente.email = "teste@teste.com.br";
		cliente.nome = "TESTE";
		cliente.sobrenome = "ADLIB";
		cliente.genero = "";
		cliente.aniversario = "01/04/1970";
		cliente.ddd ="11";
		cliente.telefone = "2345678";
		req.session.cliente = cliente;
		app.locals.usuario = "Bins";
		req.session.cpf = req.body.CPF;
		req.session.save(function (err) {
			if (err) return next(err)
			res.redirect("/pagamento/dados");
		});
		
	});
	app.post("/login/cadastrar", function(req,res){
		//res.render("login/index");
		var cliente = {};
		cliente.CPF = req.body.CPF;
		cliente.email = req.body.email;
		cliente.nome = req.body.nome;
		cliente.sobrenome = req.body.sobrenome;
		cliente.genero = req.body.genero;
		cliente.aniversario = req.body.aniversario;
		cliente.ddd = req.body.ddd;
		cliente.telefone = req.body.telefone;
		req.session.cliente = cliente;
		
		res.redirect("/pagamento/dados");
	});
	
	app.post("/login/lembrarsenha", function(req,res){
		console.log('estou aqui');
		var envioEmail = new servicoEmail();
		envioEmail.esqueceuSenha('bins.br@gmail.com',{});
		res.render("login/index");
	});
	
}
