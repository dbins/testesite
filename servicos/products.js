const rp = require('request-promise'); 

var produtosAPI = function (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.config();
	this.metodo = "products";
	this.api_nome_do_shopping = '';
	if (shopping_selecionado !== undefined){
		if (shopping_selecionado != ''){
			this.api_nome_do_shopping = shopping_selecionado;
		}
	}
};


produtosAPI.prototype.config = function(){
	var criterio = '';
	if (typeof this.api_nome_do_shopping !== undefined) {
		if (this.api_nome_do_shopping != ''){
			//criterio = '&mall=' + this.api_nome_do_shopping;
		}
	}
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "/?$limit=0" + criterio
	}
	return rp(opcoes).then((data, res) => {
		this.total_registros = JSON.parse(data).total;
		this.paginasAPI();
	}).catch((err) => {
		
	});	
}


produtosAPI.prototype.paginasAPI = function(){
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

produtosAPI.prototype.list = function(){
	var resposta = "";
	return this.paginacao(1).then((data, res) => {
		resposta = data;	
		return resposta;
		
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 3", "dados":{}};	
		return resposta;
	});
}	

produtosAPI.prototype.paginacao = function(pagina){
	if (parseInt(this.paginas) >= parseInt(pagina)){
		if (parseInt(pagina) ==1){
			this.posicao = 0;	
		} else {
			this.posicao = (parseInt(this.limite) * (parseInt(pagina)-1))-1;
		}
	}
	
	var criterio = '';
	if (typeof this.api_nome_do_shopping !== undefined) {
		if (this.api_nome_do_shopping != ''){
			criterio = '&mall=' + this.api_nome_do_shopping;
		}
	}
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "?$skip=" + this.posicao + criterio
		
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

produtosAPI.prototype.view = function(registro){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "/" + registro
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data), "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

produtosAPI.prototype.montar = function(resultados){
	var retorno = [];
	var tmp = resultados;
	
	tmp.forEach(function(obj) {
		var tmp_nome = obj.mall;
		var tmp_loja = obj.store;
		var nome_do_Shopping = tmp_nome.replace(/_/g, ' ');
		var nome_da_Loja = tmp_loja.replace(/_/g, ' ');
		var item = {"id": obj._id,"url_title": obj.slug, "desconto":"0", "imagem":"sapato.jpg", "marca":"Arezzo", "produto":obj.name, "de":parseFloat(obj.price_start/100).toFixed(2), "por": parseFloat(obj.price_final/100).toFixed(2), "shopping":nome_do_Shopping, "mall": obj.mall, "loja": nome_da_Loja};
		retorno.push(item);
		
	});
	return retorno;
}


produtosAPI.prototype.segmento = function(segmento){
	var criterio = '';
	if (typeof this.api_nome_do_shopping !== undefined) {
		if (this.api_nome_do_shopping != ''){
			criterio = '&mall=' + this.api_nome_do_shopping;
		}
	}
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "?segment=" + segmento + criterio
	}
	console.log(this.url + "/" + this.metodo + "?segment=" + segmento + criterio);
	return rp(opcoes).then((data, res) => {
		console.log(data);
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		console.log('erro');
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

module.exports = produtosAPI;

