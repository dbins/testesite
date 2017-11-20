const rp = require('request-promise'); 

var couponsAPI = function (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	//this.config();
	this.metodo = "coupons";
	this.api_nome_do_shopping = '';
	if (shopping_selecionado !== undefined){
		if (shopping_selecionado != ''){
			this.api_nome_do_shopping = shopping_selecionado;
		}
	}
};


couponsAPI.prototype.config = function(){
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


couponsAPI.prototype.paginasAPI = function(){
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

couponsAPI.prototype.list = function(){
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

couponsAPI.prototype.paginacao = function(pagina){
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

couponsAPI.prototype.view = function(registro){
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

couponsAPI.prototype.listGQL = function(){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	
	var q_filtro_mall = '';
	
	if (this.api_nome_do_shopping != ''){
		q_filtro_mall = '(mall:"' + this.api_nome_do_shopping + '")';
	}
	
	
    const q_images= `image{path, type, order}`;
	var query = `query={coupons ${q_filtro_mall}{ _id slug title short_description detailed_descrition start_at stop_at approved_status active promotion price_start price_end price url ${q_store} ${q_mall}  ${q_images} }}`;
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
		var resultados = tmp.data.coupons;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

couponsAPI.prototype.listGQLStore = function(loja){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
    var q_filtro_store = '(store:"' + loja + '")';
    const q_images= `image{path, type, order}`;
	var query = `query={coupons ${q_filtro_store}{ _id slug title short_description detailed_descrition start_at stop_at approved_status active promotion price_start price_end price url ${q_store} ${q_mall}  ${q_images} }}`;
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
		var resultados = tmp.data.coupons;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

couponsAPI.prototype.viewGQL = function(registro){
	
	var query = 'query={coupon(id:"' + registro  + '"){ _id slug title short_description detailed_descrition start_at stop_at approved_status active promotion price_start price_end price url store{slug, real_name, fantasy_name, floor, title, category{slug,name}} mall{_id, slug, domain, name} image{path, type, order}}}';
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
		resposta = {"resultado":"OK", "dados": tmp.data.coupon, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}


couponsAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	//var tmp = resultados.dados;
	var tmp = resultados.dados.filter(p => !!p.store);
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		
		var nome_do_Shopping = "";
		var nome_da_Loja = "";
		var slug_Shopping = "";
		var slug_Loja = "";
		
		if (obj.mall){
			nome_do_Shopping = obj.mall.name;
			slug_Shopping = obj.mall.slug;
		}
		if (obj.store){
			nome_da_Loja = obj.store.fantasy_name||obj.store.title||obj.store.real_name;
			slug_Loja = obj.store.slug;
		}
		
		var preco_inicial = 0;
		var preco_final = 0;
		if (obj.price_start){
			if (obj.price_end){
				preco_inicial = parseFloat(obj.price_start/100).toFixed(2);
				preco_final = parseFloat(obj.price_end/100).toFixed(2);
			}
		} else {
			preco_inicial = parseFloat(obj.price/100).toFixed(2);
			preco_final = parseFloat(obj.price/100).toFixed(2);
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
		var url = "";
		if (obj.url){
			url = obj.url;
		}
		
		var desconto = classe_atual.cupomDesconto(obj);
		var favorito = "NAO";
		var item = {"id": obj._id,"url_title": obj.slug, "promocao":obj.promotion, "desconto":desconto, "imagem":imagem, "cupom":obj.title, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "descricao": obj.detailed_descrition, "mall": slug_Shopping, "loja": nome_da_Loja, "store": slug_Loja,  "categoria": categoria, "favorito": favorito, "url": url};
		retorno.push(item);
		
	});
	return retorno;
}

couponsAPI.prototype.montarCupomGQL = function(obj){
	
	var nome_do_Shopping = "";
	var nome_da_Loja = "";
	var slug_Shopping = "";
	var slug_Loja = "";
		
	if (obj.mall){
		nome_do_Shopping = obj.mall.name;
		slug_Shopping = obj.mall.slug;
	}
	if (obj.store){
		nome_da_Loja = obj.store.fantasy_name||obj.store.title||obj.store.real_name;
		slug_Loja = obj.store.slug;
	}
			
	var preco_inicial = 0;
	var preco_final = 0;
	if (obj.price_start){
		if (obj.price_final){
			preco_inicial = parseFloat(obj.price_start/100).toFixed(2);
			preco_final = parseFloat(obj.price_final/100).toFixed(2);
		}
	} else {
		preco_inicial = parseFloat(obj.price/100).toFixed(2);
		preco_final = parseFloat(obj.price/100).toFixed(2);
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
	
	var url = "";
	if (obj.url){
		url = obj.url;
	}
	
	var desconto = this.cupomDesconto(obj);
	var favorito = "NAO";
	var item = {"id": obj._id,"url_title": obj.slug, "promocao":obj.promotion, "desconto":desconto, "imagem":imagem, "cupom":obj.title, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": slug_Shopping, "loja": nome_da_Loja, "store": slug_Loja, "descricao": obj.detailed_descrition, "categoria": categoria, "favorito": favorito, "url": url};
	return item;
}

couponsAPI.prototype.cupomDesconto = function(dados){
	var retorno = 0;
	var preco = 0;
	var preco_inicial = 0;
	var preco_final = 0;
	if (dados.price){
		if (dados.price != null && dados.price != ""){
			preco = dados.price;	
		}
	}
	if (dados.price_start){
		if (dados.price_start != null && dados.price_start != ""){
			preco_inicial = dados.price_start;	
		}
	}
	if (dados.price_end){
		if (dados.price_end != null && dados.price_end != ""){
			preco_final = dados.price_end;
		}
	}
	
	if (parseFloat(preco) == parseFloat(preco_final)){
		//Nao faz nada
	} else {
		if (parseFloat(preco_inicial) == parseFloat(preco_final)){
			//Nao faz nada
		} else {	
			if (parseFloat(preco)>0){
				if (parseFloat(preco) > parseFloat(preco_final)){
					var porcento = 	parseFloat(preco/100);	
					retorno = 	(parseFloat(preco) - parseFloat(preco_final)) / parseFloat(porcento);
					retorno = parseInt(retorno);			
				}
			}
			if (parseFloat(preco_inicial)>0){
				if (parseFloat(preco_inicial) >  parseFloat(preco_final)){
					var porcento = 	parseFloat(preco_inicial/100);	
					retorno = 	(parseFloat(preco_inicial) - parseFloat(preco_final)) / parseFloat(porcento);
					retorno = parseInt(retorno);
				}
			}
		}
	}
	return retorno;
}

couponsAPI.prototype.listaLojas = function(resultados){
	var retorno = [];
	//var tmp = resultados.dados;
	var tmp = resultados.dados.filter(p => !!p.store);
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		
		var nome_do_Shopping = "";
		var nome_da_Loja = "";
		var slug_Shopping = "";
		var slug_Loja = "";
		
		if (obj.mall){
			nome_do_Shopping = obj.mall.name;
			slug_Shopping = obj.mall.slug;
		}
		if (obj.store){
			nome_da_Loja = obj.store.fantasy_name||obj.store.title||obj.store.real_name;
			slug_Loja = obj.store.slug;
		}
		var adicionar = true;
		retorno.forEach(function(obj2) {
			if (obj2.mall==slug_Shopping){
				if (obj2.store==slug_Loja){
					adicionar = false;
				}	
			}
		});
		
		if (adicionar){
			var item = {"shopping":nome_do_Shopping, "mall": slug_Shopping, "loja": nome_da_Loja, "store": slug_Loja};
			retorno.push(item);
		}
	});
	return retorno;
}

couponsAPI.prototype.listGQLShopping = function(shopping){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
    var q_filtro_store = '(mall:"' + shopping + '")';
    const q_images= `image{path, type, order}`;
	var query = `query={coupons ${q_filtro_store}{ _id slug title short_description detailed_descrition start_at stop_at approved_status active promotion price_start price_end price url ${q_store} ${q_mall}  ${q_images} }}`;
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
		var resultados = tmp.data.coupons;
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

module.exports = couponsAPI;

