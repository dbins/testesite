var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

function emailAPI () {
	this.remetente = "contato@dbins.com.br";
	this.transporte = nodemailer.createTransport({
	  host: 'smtp.dbins.com.br',
	  tls: { rejectUnauthorized: false, 
	 ciphers: 'SSLv3'
	  },
	  port: '587',
	  secure: false,
	   secureConnection: false,
	  auth: {
		user: 'contato@dbins.com.br',
		pass: 'bins01041970'
	  } 
	});
}

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

emailAPI.prototype.esqueceuSenha = function(destinatario, dados){
	var email = {
	  from: this.remetente,
	  to: destinatario,
	  subject: 'Esqueceu senha',
	  html: 'Aqui vai o texto do esqueci minha senha.'
	  //attachments: [{ // 
		//	filename: 'boleto.pdf', // 
		//	path: 'servidor/boletos/boleto_gerado1234.pdf' // 
	  //}]
	};

	this.transporte.sendMail(email, function(err){
	  if(err) {
		return 2;
	  }	else {
		return 1; //OK
	  }	
	});
};

emailAPI.prototype.finalizarCompra = function(destinatario, dados){
	var email = {
	  from: this.remetente,
	  to: destinatario,
	  subject: 'Compra Concluida senha',
	  html: 'Aqui vai o texto da compra concluida.'
	};

	this.transporte.sendMail(email, function(err){
	  if(err) {
		//Tratar erro
		return 2;
	  }	else {
		return 1; //OK
	  }	
	});
};

emailAPI.prototype.contatoInformacoes = function(destinatario, dados){
	var email = {
	  from: this.remetente,
	  to: destinatario,
	  subject: 'Formulario de Informações do Shopping',
	  html: dados
	};

	this.transporte.sendMail(email, function(err){
	  if(err) {
		//Tratar erro
		return 2;
	  }	else {
		return 1; //OK
	  }	
	});
};

emailAPI.prototype.contatoSite = function(destinatario, dados){
	var email = {
	  from: this.remetente,
	  to: destinatario,
	  subject: 'Formulario de Contato do Site',
	  html: dados
	};

	this.transporte.sendMail(email, function(err){
	  if(err) {
		//Tratar erro
		return 2;
	  }	else {
		return 1; //OK
	  }	
	});
};

emailAPI.prototype.pagamentoBoleto = function(destinatario, dados){
	var transporte = this.transporte;
	var remetente = this.remetente;
	readHTMLFile(__dirname + '/emails/boleto-pagamento-aguardando-pagamento.html', function(err, html) {
		var template = handlebars.compile(html);
		var substituir = {
			 nome: dados.nome,
			 tabela: dados.tabela
		};
		var htmlEmail = template(substituir);
		var email = {
		  from: remetente,
		  to: destinatario,
		  subject: 'ON Stores - Confirmacao de pedido de compra',
		   html : htmlEmail
		};
		transporte.sendMail(email, function (err, response) {
			 if(err) {
				return 2;
			}	else {
				return 1; //OK
			}	
		});
	});
	
};

emailAPI.prototype.pagamentoCartaoAguardando = function(destinatario, dados){
	var transporte = this.transporte;
	var remetente = this.remetente;
	readHTMLFile(__dirname + '/emails/aguardando-aprovacao.html', function(err, html) {
		var template = handlebars.compile(html);
		var substituir = {
			 nome: dados.nome,
			 tabela: dados.tabela
		};
		var htmlEmail = template(substituir);
		var email = {
		  from: remetente,
		  to: destinatario,
		  subject: 'ON Stores - Confirmacao de pedido de compra',
		   html : htmlEmail
		};
		transporte.sendMail(email, function (err, response) {
			 if(err) {
				return 2;
			}	else {
				return 1; //OK
			}	
		});
	});
	
};

emailAPI.prototype.pagamentoCartaoCaptura = function(destinatario, dados){
	var transporte = this.transporte;
	var remetente = this.remetente;
	readHTMLFile(__dirname + '/emails/pagamento-aprovado.html', function(err, html) {
		var template = handlebars.compile(html);
		var substituir = {
			 nome: dados.nome,
			 tabela: dados.tabela
		};
		var htmlEmail = template(substituir);
		var email = {
		  from: remetente,
		  to: destinatario,
		  subject: 'ON Stores - Confirmacao de pedido de compra',
		   html : htmlEmail
		};
		transporte.sendMail(email, function (err, response) {
			 if(err) {
				return 2;
			}	else {
				return 1; //OK
			}	
		});
	});
	
};

emailAPI.prototype.pagamentoCartaoReprovado = function(destinatario, dados){
	var transporte = this.transporte;
	var remetente = this.remetente;
	readHTMLFile(__dirname + '/emails/pagamento-reprovada.html', function(err, html) {
		var template = handlebars.compile(html);
		var substituir = {
			 nome: dados.nome,
			 tabela: dados.tabela
		};
		var htmlEmail = template(substituir);
		var email = {
		  from: remetente,
		  to: destinatario,
		  subject: 'ON Stores - Seu pedido de compra foi reprovado',
		   html : htmlEmail
		};
		transporte.sendMail(email, function (err, response) {
			 if(err) {
				return 2;
			}	else {
				return 1; //OK
			}	
		});
	});
	
};

module.exports = emailAPI;

