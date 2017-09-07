const rp = require('request-promise'); 

var dealsAPI = function () {
	this.url = "https://concierge-api.appspot.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.config();
};


dealsAPI.prototype.config = function(){
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/stores/?$limit=0"
	}
	return rp(opcoes).then((data, res) => {
		this.total_registros = JSON.parse(data).total;
		this.paginasAPI();
	}).catch((err) => {
		
	});	
}


dealsAPI.prototype.paginasAPI = function(){
	if (parseInt(this.total_registros)>0){
		if (parseInt(this.limite)>0){
			if (parseInt(this.total_registros) % parseInt(this.limite)==0){
				this.paginas = parseInt(this.total_registros) / parseInt(this.limite);
			} else {
				this.paginas = Math.ceil(parseInt(this.total_registros) / parseInt(this.limite));
			}
		}
	}
}

dealsAPI.prototype.list = function(){
	var resposta = "";
	return this.paginacao(1).then((data, res) => {
		resposta = data;	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO"};	
		return resposta;
	});
}	

dealsAPI.prototype.paginacao = function(pagina){
	if (parseInt(this.paginas) >= parseInt(pagina)){
		if (parseInt(pagina) ==1){
			this.posicao = 0;	
		} else {
			this.posicao = (parseInt(this.limite) * (parseInt(pagina)-1))-1;
		}
	}
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/stores?$skip=" + this.posicao
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO"};	
		return resposta;
	});
}

dealsAPI.prototype.view = function(registro){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/stores/" + registro
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO"};	
		return resposta;
	});
}
	

module.exports = function(){
    return new dealsAPI;
}