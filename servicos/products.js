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

produtosAPI.prototype.listGQL = function(){
	
	var query = 'query={products{slug name,short_description,long_description, start_at, end_at, relationship, status, promotion,segment, stock, price_start,price_final,price, images{path, type, order}, store{slug, fantasy_name, floor, title},mall{_id, slug, domain, name}}}';
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
		
		resposta = {"resultado":"OK", "dados": tmp.data.products, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

produtosAPI.prototype.viewGQL = function(registro){
	
	var query = 'query={product(id:"' + registro + '"){slug name,short_description,long_description, start_at, end_at, relationship, status, promotion,segment, stock, price_start,price_final,price, sizes, colors, images{path, type, order}, store{slug, fantasy_name, floor, title},mall{_id, slug, domain, name}}}';
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

produtosAPI.prototype.montar = function(resultados){
	var retorno = [];
	var tmp = resultados;
	
	tmp.forEach(function(obj) {
		//var tmp_nome = obj.mall;
		//var tmp_loja = obj.store;
		//var nome_do_Shopping = tmp_nome.replace(/_/g, ' ');
		//var nome_da_Loja = tmp_loja.replace(/_/g, ' ');
		var nome_do_Shopping = "";
		var nome_da_Loja = "";
		
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
		var imagem = "/imagens/sapato.jpg";
		
		var item = {"id": obj._id,"url_title": obj.slug, "desconto":"0", "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall, "loja": nome_da_Loja, "estoque": obj.stock, "tamanho": obj.size, "cor": obj.color};
		retorno.push(item);
		
	});
	return retorno;
}

produtosAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	var tmp = resultados.dados;
	
	
	tmp.forEach(function(obj) {
		var nome_do_Shopping = obj.mall.name;
		var nome_da_Loja = obj.store.title;
		
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
		var imagem = "/imagens/sapato.jpg";
		for (i = 0; i < obj.images.length; i++) { 
			if (obj.images[i].type == "main"){
				imagem = obj.images[i].path;	
			}
		}
		
		var item = {"id": obj._id,"url_title": obj.slug, "desconto":"0", "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall.slug, "loja": nome_da_Loja, "store": obj.store.slug, "estoque": obj.stock, "tamanho": "", "cor": ""};
		retorno.push(item);
		
	});
	return retorno;
}

produtosAPI.prototype.montarProduto = function(obj){
	var tmp_nome = obj.mall;
	var tmp_loja = obj.store;
	var nome_do_Shopping = tmp_nome.replace(/_/g, ' ');
	var nome_da_Loja = tmp_loja.replace(/_/g, ' ');
		
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
	var imagem = "sapato.jpg";
	
	var item = {"id": obj._id,"url_title": obj.slug, "desconto":"0", "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall, "loja": nome_da_Loja, "store": obj.store, "estoque": obj.stock, "tamanho": obj.size, "cor": obj.color, "descricao": obj.long_description};
	return item;
}

produtosAPI.prototype.montarProdutoGQL = function(obj){
	var nome_do_Shopping = obj.mall.name;
	var nome_da_Loja = obj.store.title;
		
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
	var imagem = "";
	for (i = 0; i < obj.images.length; i++) { 
		if (obj.images[i].type == "main"){
			imagem = obj.images[i].path;	
		}
	}
		
	var item = {"id": obj._id,"url_title": obj.slug, "desconto":"0", "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall.slug, "loja": nome_da_Loja, "store": obj.store.slug, "estoque": obj.stock, "tamanho": obj.size, "cor": obj.color, "descricao": obj.long_description};
	return item;
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
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

module.exports = produtosAPI;

