const rp = require('request-promise'); 

function storesAPI (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	//this.config();
	this.metodo = "stores";
	this.favoritos = [];
	this.api_nome_do_shopping = '';
	if (shopping_selecionado !== undefined){
		if (shopping_selecionado != ''){
			this.api_nome_do_shopping = shopping_selecionado;
		}
	}
};


storesAPI.prototype.config = function(){
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
		console.log(err.stack);
	});	
}


storesAPI.prototype.paginasAPI = function(){
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

storesAPI.prototype.list = function(){
	var resposta = "";
	return this.paginacao(1).then((data, res) => {
		resposta = data;	
		return resposta;
		
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 3", "dados":{}};	
		return resposta;
	});
}	

storesAPI.prototype.paginacao = function(pagina){
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
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

storesAPI.prototype.view = function(registro){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "/" + registro
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data), "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

storesAPI.prototype.listGQL = function(){
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_category  = `category {_id, slug, name}`;
	var q_filtro_mall = '';
	if (this.api_nome_do_shopping != ''){
		q_filtro_mall = '(mall:"' + this.api_nome_do_shopping + '")';
	}
	
	
    const q_images= `images{path, type, order}`;
	const q_logo= `logo {path, type, order}`;
	const q_image= `image {path, type, order}`;
	var query = `query={stores ${q_filtro_mall}{ _id slug real_name fantasy_name title phone description floor pagarme_id tax on_stores_status ${q_mall}  ${q_category} ${q_images} ${q_image} ${q_logo}}}`;
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
		var resultados = tmp.data.stores;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

storesAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	var tmp = resultados.dados;
	var classe_atual = this;
	
	//Somente listar lojas aprovadas
	tmp.forEach(function(obj) {
		if (obj.on_stores_status == "ACTIVE"){
			var nome_do_Shopping = "";
			var nome_da_Loja = "";
			var slug_Shopping = "";
			var slug_Loja = "";
				
			if (obj.mall){
				nome_do_Shopping = obj.mall.name;
				slug_Shopping = obj.mall.slug;
			}
			nome_da_Loja = obj.fantasy_name||obj.title||obj.real_name;
			slug_Loja = obj.slug;
			
			var logo = "/imagens/lojas-padrao.jpg";
			var imagem = "/imagens/lojas-padrao.jpg";
			var img_principal = false;
			for (i = 0; i < obj.images.length; i++) { 
				if (obj.images[i].type == "main"){
					img_principal = true;
					imagem = obj.images[i].path;	
				}
			}
			if (!img_principal){
				for (i = 0; i < obj.images.length; i++) { 
					if (i == 0){
						imagem = obj.images[i].path;	
					}
				}	
			}
			
			if (obj.logo){
				logo = obj.logo.path;
			}
			
			var categoria = "";
			if (obj.category){
				categoria = obj.category.slug;
			}
			var favorito = "NAO";
			var item = {"id": obj._id,"url_title": obj.slug, "imagem":imagem,  "loja":nome_da_Loja, "shopping":nome_do_Shopping, "mall": slug_Shopping, "loja": nome_da_Loja, "store": slug_Loja, "categoria": categoria, "favorito": favorito, "logo": logo};
			retorno.push(item);
		}	
	});
	return retorno;
}

storesAPI.prototype.viewGQL = function(registro){
	
	var query = 'query={store(id:"' + registro  + '"){ _id slug real_name fantasy_name title phone description floor pagarme_id tax on_stores_status category{slug,name} mall{_id, slug, domain, name} images{path, type, order} image{path, type, order} logo{path, type, order}}}';
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
		resposta = {"resultado":"OK", "dados": tmp.data.store, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

storesAPI.prototype.montarLojaGQL = function(obj){
	var nome_do_Shopping = "";
	var nome_da_Loja = "";
	var slug_Shopping = "";
	var slug_Loja = "";
		
	if (obj.mall){
		nome_do_Shopping = obj.mall.name;
		slug_Shopping = obj.mall.slug;
	}
	nome_da_Loja = obj.fantasy_name||obj.title||obj.real_name;
	slug_Loja = obj.slug;
	
	
	var imagem = "/imagens/lojas-padrao.jpg";
	var logo = "/imagens/lojas-padrao.jpg";
	var img_principal = false;
	for (i = 0; i < obj.images.length; i++) { 
		if (obj.images[i].type == "main"){
			img_principal = true;
			imagem = obj.images[i].path;	
		}
	}
	if (!img_principal){
		for (i = 0; i < obj.images.length; i++) { 
			if (i == 0){
				imagem = obj.images[i].path;	
			}
		}	
	}
	
	if (obj.logo){
		logo = obj.logo.path;
	}
	
	var telefone = obj.phone;  
	var piso = obj.floor;
	var descricao = "";
	if (obj.description){
		var descricao = obj.description;
	}
	var categoria = "";
	if (obj.category){
		categoria = obj.category.slug;
	}
	var favorito = this.lojaFavorito(obj.slug);
	var item = {"id": obj._id,"url_title": obj.slug, "imagem":imagem,  "loja":nome_da_Loja, "shopping":nome_do_Shopping, "mall": slug_Shopping, "loja": nome_da_Loja, "store": slug_Loja, "categoria": categoria, "favorito": favorito, "telefone": telefone, "piso": piso, "descricao": descricao, "logo": logo};
	return (item);
}

storesAPI.prototype.guardarFavoritos = function(favoritos){
	this.favoritos = favoritos;
}

storesAPI.prototype.lojaFavorito = function(loja){
	var retorno = "NAO";
	if (this.favoritos){
		for (index = 0; index < this.favoritos.length; ++index) {
			if (this.favoritos[index].url_title == loja){
				retorno = "SIM";	
			}	
		}
	}
	return retorno;
}


module.exports = storesAPI;

