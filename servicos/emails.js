var nodemailer = require('nodemailer');

function emailAPI () {
	this.remetente = "contato@adlibdigital.com.br";
	this.transporte = nodemailer.createTransport({
	  host: 'email-ssl.com.br',
	  tls: { rejectUnauthorized: false },
	  port: '465',
	  secure: true,
	  auth: {
		user: 'contato@adlibdigital.hospedagemdesites.ws',
		pass: 'Tad48305'
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

	
	// Pronto, basta enviar!
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
	  to: email,
	  subject: 'Compra Concluida senha',
	  html: 'Aqui vai o texto do compra concluida.'
	  //attachments: [{ // 
		//	filename: 'boleto.pdf', // 
		//	path: 'servidor/boletos/boleto_gerado1234.pdf' // 
	  //}]
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

