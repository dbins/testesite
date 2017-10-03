var nodemailer = require('nodemailer');

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

module.exports = emailAPI;

