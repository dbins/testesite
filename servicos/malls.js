const rp = require('request-promise'); 

function mallsAPI (token) {
	this.url = "https://api.onstores.com.br";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.metodo = "configs";
	this.token = token;
};

mallsAPI.prototype.consultar = function(mall){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "/" + mall,
		headers: {
        'Authorization': this.token
		}
	}
	return rp(opcoes).then((data, res) => {
		var dados = JSON.parse(data);
		resposta = {"resultado":"OK", "dados": dados};	
		return resposta;
	}).catch((err) => {
		//Tratar erro ao chamar a pagina
	});
}


module.exports = mallsAPI;

