const rp = require('request-promise'); 

function autenticacaoAPI () {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.token = "";
	this.metodo = "authentication";
	this.metodo_users = "users";
};


autenticacaoAPI.prototype.config = function(){
	//if (app.locals.tokenAPI == ""){
		//var dados_usuario = {
		//	"level": "app",
		//	"strategy":  "local", 
		//	"email": "bins.br@gmail.com", 
		//	"password": "124345678"
		//};
		
		//Alterado 07-10-17
		//var dados_usuario = {
		//	"level": "app",
		//	"strategy":  "local", 
		//	"email": "concierge_mobile@adlib.com.br", 
		//	"password": "VaiPlaneta!"
		//};
		var dados_usuario = {
			"level": "app",
			"strategy": "local", 
			"user": "concierge_frontend@adlib.com.br", 
			"password": "8902de078cc1aa843c0b91b5f6e2aed9c5c15272e1adf6264fb0ec9cf35df421"
		};
		
		var opcoes = {  
		  method: 'POST',
		  uri: this.url + "/" + this.metodo,
		  body: dados_usuario,
		  json: true // JSON stringifies the body automatically
		}
		
		
		return rp(opcoes).then((data) => {
			this.token = data.accessToken;
			var resposta = {"resultado":"OK", "dados":data.accessToken};
			return resposta;
			
		}).catch((err) => {
			var resposta = {"resultado":"ERRO DE COMUNICACAO 1", "token":""};
			return resposta;
		});
	//} else {
	//	this.token = data.accessToken;;
	//}
};

autenticacaoAPI.prototype.users = function(){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo_users + "?$skip=" + this.posicao,
		headers: {
        'Authorization': this.token
		}
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
};



autenticacaoAPI.prototype.validarUsuario = function(email, senha){
		
		var dados_usuario = {
			"level": "user",
			"strategy":  "local", 
			"email": email, 
			"password": senha
		};
		
		var opcoes = {  
		  method: 'POST',
		  uri: this.url + "/" + this.metodo,
		  body: dados_usuario,
		  json: true // JSON stringifies the body automatically
		}
		
		
		return rp(opcoes).then((data) => {
			this.token = data.accessToken;
			var resposta = {"token" : data.accessToken};
			return resposta;
			
		}).catch((err) => {
			//A pagina vai tratar o erro
		});
};

module.exports = autenticacaoAPI;


