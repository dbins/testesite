const rp = require('request-promise'); 

var dealssAPI = function (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	//this.config();
	this.metodo = "deals";
	this.favoritos = [];
	this.api_nome_do_shopping = '';
	if (shopping_selecionado !== undefined){
		if (shopping_selecionado != ''){
			this.api_nome_do_shopping = shopping_selecionado;
		}
	}
};


dealssAPI.prototype.config = function(){
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


dealssAPI.prototype.paginasAPI = function(){
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

dealssAPI.prototype.list = function(){
	var resposta = "";
	return this.paginacao(1).then((data, res) => {
		resposta = data;	
		return resposta;
		
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 3", "dados":{}};	
		return resposta;
	});
}	

dealssAPI.prototype.paginacao = function(pagina){
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

dealssAPI.prototype.view = function(registro){
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

dealssAPI.prototype.listGQL = function(){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	var q_filtro_mall = '';
	
	if (this.api_nome_do_shopping != ''){
		q_filtro_mall = ',mall:"' + this.api_nome_do_shopping + '"';
	}
	
	
    const q_images= `image{path, type, order}`;
	var query = `query={events(type:DEAL ${q_filtro_mall}){ _id slug title short_description detailed_descrition start_at stop_at  ${q_store} ${q_mall} ${q_images}}}`;
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
		var resultados = tmp.data.events;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

dealssAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	var tmp = resultados.dados;
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		
		var nome_do_Shopping = "";
		var slug_shopping = "";
		if (obj.mall){
			var nome_do_Shopping = obj.mall.name;
			slug_shopping = obj.mall.slug;
		}
		
		var slug_loja = "";
		var nome_da_Loja = "";
		if (obj.store){
			nome_da_Loja = obj.store.real_name||obj.store.title||obj.store.fantasy_name;
			slug_loja = obj.store.slug;
		}
		
		var imagem = "/imagens/lojas-padrao.jpg";
		if (obj.image){
			imagem = obj.image.path;	
		}
		
		var categoria = "";
		if (obj.store){
		if (obj.store.category.slug){
			categoria = obj.store.category.slug;
			}
		}
		var favorito = "NAO";
		var item = {"id": obj._id,"url_title": obj.slug, "imagem":imagem, "nome":obj.title, "shopping":nome_do_Shopping, "mall": slug_shopping, "loja": nome_da_Loja, "store": slug_loja, "categoria": categoria, "favorito": favorito};
		retorno.push(item);
		
	});
	return retorno;
}

dealssAPI.prototype.viewGQL = function(registro){
	
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	var q_filtro_mall = '';

	
    const q_images= `image{path, type, order}`;
	var query = `query={event(id:"${registro}"){ _id slug title short_description detailed_descrition start_at stop_at  ${q_store} ${q_mall} ${q_images}}}`;
	
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
		resposta = {"resultado":"OK", "dados": tmp.data.event, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

dealssAPI.prototype.montarViewGQL = function(obj){
	var nome_do_Shopping = "";
	var slug_shopping = "";
	if (obj.mall){
		var nome_do_Shopping = obj.mall.name;
		slug_shopping = obj.mall.slug;
	}
		
	var slug_loja = "";
	var nome_da_Loja = "";
	if (obj.store){
		nome_da_Loja = obj.store.real_name||obj.store.title||obj.store.fantasy_name;
		slug_loja = obj.store.slug;
	}
		
	var descricao_resumida = obj.short_description;
	var descricao_detalhada = obj.detailed_descrition;
	var imagem = "/imagens/lojas-padrao.jpg";
	if (obj.image){
		imagem = obj.image.path;	
	}
	
	var data_inicial = "";
	if (obj.start_at){
		data_inicial = obj.start_at;
	}
	var data_final = "";
	if (obj.stop_at){
		data_final = obj.stop_at;
	}	
	
	var data_final = "";
	var categoria = "";
	if (obj.store){
		if (obj.store.category.slug){
			categoria = obj.store.category.slug;
		}
	}
	var favorito = this.promocaoFavorito(obj.slug);
	var item = {"id": obj._id,"url_title": obj.slug, "imagem":imagem, "nome":obj.title, "shopping":nome_do_Shopping, "mall": slug_shopping, "loja": nome_da_Loja, "store": slug_loja, "categoria": categoria, "favorito": favorito, "descricao_resumida":descricao_resumida, "descricao_detalhada":descricao_detalhada, "data_inicial":data_inicial, "data_final":data_final};
	return item;
}


dealssAPI.prototype.guardarFavoritos = function(favoritos){
	this.favoritos = favoritos;
}

dealssAPI.prototype.promocaoFavorito = function(promocao){
	var retorno = "NAO";
	if (this.favoritos){
		for (index = 0; index < this.favoritos.length; ++index) {
			if (this.favoritos[index].url_title == promocao){
				retorno = "SIM";	
			}	
		}
	}
	return retorno;
}



module.exports = dealssAPI;

