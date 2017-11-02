const rp = require('request-promise'); 

function servicesAPI (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.config();
	this.metodo = "services";
	this.api_nome_do_shopping = '';
	if (shopping_selecionado !== undefined){
		if (shopping_selecionado != ''){
			this.api_nome_do_shopping = shopping_selecionado;
		}
	}
};


servicesAPI.prototype.config = function(){
	var criterio = '';
	if (typeof this.api_nome_do_shopping !== undefined) {
		if (this.api_nome_do_shopping != ''){
			criterio = '&mall=' + this.api_nome_do_shopping;
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


servicesAPI.prototype.paginasAPI = function(){
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

servicesAPI.prototype.list = function(){
	var resposta = "";
	return this.paginacao(1).then((data, res) => {
		resposta = data;	
		return resposta;
		
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 3", "dados":{}};	
		return resposta;
	});
}	

servicesAPI.prototype.paginacao = function(pagina){
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

servicesAPI.prototype.view = function(registro){
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


servicesAPI.prototype.listGQL = function(){
	var q_filtro_mall = '';
	
	if (this.api_nome_do_shopping != ''){
		q_filtro_mall = '(mall:"' + this.api_nome_do_shopping + '")';
	}
	
	const q_mall  = `mall{_id, slug, domain, name}`;
    const q_images= `image{path, type, order}`;
	var query = `query={services ${q_filtro_mall}{ _id slug title description floor  phone ${q_mall} ${q_images}}}`;
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/graphql?" + query,
		headers: {
         'Content-Type': 'application/json'
		}
	}
	console.log(this.url + "/graphql?" + query);
	return rp(opcoes).then((data, res) => {
		var tmp = JSON.parse(data);
		var resultados = tmp.data.services;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

servicesAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	var tmp = resultados.dados;
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		
		var slug_shopping = "";
		if (obj.mall){
			slug_shopping = obj.mall;
		}
		
		var imagem = "/imagens/lojas-padrao.jpg";
		if (obj.image){
			imagem = obj.image.path;	
		}
		
		var piso = "";
		if (obj.floor){
			piso = obj.floor;
		}
		var favorito = "NAO";
		var item = {"id": obj._id,"url_title": obj.slug, "titulo":obj.title, "descricao":obj.description, "telefone":obj.phone, "mall": slug_shopping,"favorito": favorito,"piso": piso, "imagem": imagem};
		retorno.push(item);
		
	});
	return retorno;
}

servicesAPI.prototype.viewGQL = function(registro){
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_images= `image{path, type, order}`;
	var query = `query={service(id:"${registro}")){ _id slug title description phone floor ${q_mall} ${q_images}}}`;
	
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/graphql?" + query,
		headers: {
         'Content-Type': 'application/json'
		}
	}
	
	return rp(opcoes).then((data, res) => {
		var tmp = JSON.parse(data);
		resposta = {"resultado":"OK", "dados": tmp.data.product, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}


module.exports = servicesAPI;

