module.exports = function (app){
	app.get("/compras", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		res.render("conta/compras", {resultados:app.get("pedidos")});
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
		console.log(resultado);
		res.render("conta/detalhes_pedido", {resultados:resultado});
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
		res.render("conta/favoritos");
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
		res.locals.csrfToken = req.csrfToken();
		res.render("conta/configuracoes", {carteira:app.get("cartoes")});
	});
	
	app.post("/configuracoes/dados", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
		}
		//Gravar os dados
		res.redirect('/configuracoes');
	});
	
	app.post("/configuracoes/endereco", function(req,res){
		if (!req.session.usuario){
			res.redirect("/");
			return;
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
		res.redirect('/configuracoes');
	});
	
	
}
