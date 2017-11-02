const rp = require('request-promise'); 

function usuariosAPI (token) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.metodo = "sale-transaction-products";
	this.token = token;
};


usuariosAPI.prototype.gravar = function(dados_da_transacao){
	var opcoes = {  
    	method: 'POST',
		uri: this.url + "/" + this.metodo,
		body: dados_da_transacao,
	    json: true,
	    headers: {
         'Authorization': this.token
		}
	}
	return rp(opcoes).then((data, res) => {
		var resposta = {"id": data._id};	
		return resposta;
	}).catch((err) => {
		var resposta = {"id": "0"};	
		return resposta;
	});
}

module.exports = usuariosAPI;

