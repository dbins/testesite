const rp = require('request-promise'); 

function  cepAPI (cep) {
	this.url = "https://api.pagar.me/1/zipcodes/";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + cep
	}
	return rp(opcoes).then((data, res) => {
		resposta = data;	
		return resposta;
	}).catch((err) => {
		resposta = '{"zipcode":null,"street":null,"neighborhood":null,"city":null,"state":null}';	
		return resposta;
	});
};

module.exports = cepAPI;

