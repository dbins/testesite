const rp = require('request-promise'); 

function usuariosAPI (token) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.metodo = "users";
	this.token = token;
};

usuariosAPI.prototype.verificar = function(cpf){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "?cpf=" + cpf,
		headers: {
        'Authorization': this.token
		}
	}
	
	return rp(opcoes).then((data, res) => {
		
		var dados = JSON.parse(data);
		if (dados.data.length == 0){
			resposta = {"resultado":"NAO_LOCALIZADO"};	
		} else {
			resposta = {"resultado":"OK"};	
		}
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO"};	
		return resposta;
	});
}

usuariosAPI.prototype.consultar = function(cpf){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "?cpf=" + cpf,
		headers: {
        'Authorization': this.token
		}
	}
	
	return rp(opcoes).then((data, res) => {
		console.log('verificando se o usuario existe....');
		console.log(data);
		var dados = JSON.parse(data);
		if (dados.data.length == 0){
			resposta = {"resultado":"NAO_LOCALIZADO", "dados": []};	
		} else {
			resposta = {"resultado":"OK", "dados": dados};	
		}
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO", "dados": []};	
		return resposta;
	});
}

usuariosAPI.prototype.gravar = function(dados_do_cliente){
	var opcoes = {  
    	method: 'POST',
		uri: this.url + "/" + this.metodo,
		body: dados_do_cliente,
	    json: true,
	    headers: {
         'Authorization': this.token
		}
	}
	console.log(dados_do_cliente);
	return rp(opcoes).then((data, res) => {
		console.log(data);
		//var dados = JSON.parse(data);
		//if (dados.data.length == 0){
		//	resposta = {"resultado":"NAO_LOCALIZADO", "id": "0"};	
		//} else {
			resposta = {"resultado":"OK", "id": data._id};	
		//}
		return resposta;
	}).catch((err) => {
		console.log('erro atualizar');
		console.log(err.stack);
		resposta = {"resultado":"ERRO", "id": "0"};	
		return resposta;
	});
}

usuariosAPI.prototype.atualizar = function(dados_do_cliente){
	var opcoes = {  
    	method: 'PUT',
		uri: this.url + "/" + this.metodo + "/" + dados_do_cliente._id,
		body: dados_do_cliente,
	    json: true,
	    headers: {
         'Authorization': this.token
		}
	}
	
	console.log(this.url + "/" + this.metodo + "/" + dados_do_cliente._id);
	console.log(dados_do_cliente);
	return rp(opcoes).then((data, res) => {
		var dados = data;
		console.log('sucesso atualizar');
		console.log(data);
		resposta = {"resultado":"OK", "id": data._id};	
		return resposta;
	}).catch((err) => {
		console.log('erro atualizar');
		console.log(err.stack);
		resposta = {"resultado":"ERRO", "id": "0"};	
		return resposta;
	});
}

module.exports = usuariosAPI;

