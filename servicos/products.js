const rp = require('request-promise'); 

//2017-10-22 - O MODEL NAO POSSUI O CAMPO GROUP

var produtosAPI = function (shopping_selecionado) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.config();
	this.metodo = "products";
	this.favoritos = [];
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
//AQUI TEVE ALTERACAO
produtosAPI.prototype.listGQL = function(){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = `parent{slug}`;
	const q_cheapest =  `cheapest {_id,slug,name,price, stock,color, size,images{path, type, order}}`;
	
    // const q_group = `group{slug name}`;
	const q_group = '';
	var q_filtro_mall = '';
	
	if (this.api_nome_do_shopping != ''){
		q_filtro_mall = ',mall:"' + this.api_nome_do_shopping + '"';
	}
	
	
    const q_images= `images{path, type, order}`;
	var query = `query={products(parent:null ${q_filtro_mall}){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price ${q_store} ${q_mall} ${q_group} ${q_parent}  ${q_images}  ${q_cheapest}}}`;
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
		var resultados = this.prepararResultado(tmp.data.products);
		resposta = {"resultado":"OK", "dados": resultados, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}
//FOI ALTERADO
produtosAPI.prototype.viewGQL = function(registro){
	
	//var query = 'query={product(id:"' + registro  + '"){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price store{slug, real_name, fantasy_name, floor, title, category{slug,name}} mall{_id, slug, domain, name}  images{path, type, order} group{slug,name}}}';
	var query = 'query={product(id:"' + registro  + '"){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price color size store{slug, real_name, fantasy_name, floor, title, category{slug,name}} mall{_id, slug, domain, name} parent{slug} images{path, type, order}}}';
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
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		//var tmp_nome = obj.mall;
		//var tmp_loja = obj.store;
		//var nome_do_Shopping = tmp_nome.replace(/_/g, ' ');
		//var nome_da_Loja = tmp_loja.replace(/_/g, ' ');
		var nome_do_Shopping = "";
		var nome_da_Loja = "";
		var store = "";
		var promocao = "NAO";
		
		if (obj.promotion){
			if (obj.promotion ==true){
				promocao = "SIM";
			}
		}
		if (obj.store){
			store = obj.store;
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
		var imagem = "/imagens/sapato.jpg";
		var desconto = classe_atual.produtoDesconto(obj);
		var favorito = classe_atual.produtoFavorito(obj.slug);
		
		var item = {"id": obj._id,"url_title": obj.slug, "desconto":desconto, "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall, "loja": nome_da_Loja, "estoque": obj.stock, "tamanho": obj.size, "cor": obj.color, "promocao": promocao, "store": store, "favorito": favorito};
		retorno.push(item);
		
	});
	return retorno;
}

//Foi alterado
produtosAPI.prototype.montarGQL = function(resultados){
	var retorno = [];
	//var tmp = resultados.dados;
	var tmp = resultados.dados.filter(p => !!p.store);
	var classe_atual = this;
	
	tmp.forEach(function(obj) {
		
		var nome_do_Shopping = obj.mall.name;
		var nome_da_Loja = obj.store.real_name||obj.store.title||obj.store.fantasy_name;
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
		
		var categoria = "";
		if (obj.store.category.slug){
			categoria = obj.store.category.slug;
		}
		var cor = "";
		var tamanho = "";
		if (obj.color){
			cor = obj.color;
		}
		if (obj.size){
			tamanho = obj.size;
		}
		var desconto = classe_atual.produtoDesconto(obj);
		var favorito = classe_atual.produtoFavorito(obj.slug);
		var item = {"id": obj._id,"url_title": obj.slug, "desconto":desconto, "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall.slug, "loja": nome_da_Loja, "store": obj.store.slug, "estoque": obj.stock, "tamanho": tamanho, "cor": cor, "categoria": categoria, "favorito": favorito};
		retorno.push(item);
		
	});
	return retorno;
}

//Alteracao
produtosAPI.prototype.montarProduto = function(obj){
	//var tmp_nome = obj.mall;
	var tmp_loja = obj.store;
	//var nome_do_Shopping = tmp_nome.replace(/_/g, ' ');
	var nome_do_Shopping = "";
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
	var imagem = "/imagens/lojas-padrao.jpg";
	for (i = 0; i < obj.images.length; i++) { 
		if (obj.images[i].type == "main"){
			imagem = obj.images[i].path;	
		}
	}
	var categoria = "";
	var desconto = classe_atual.produtoDesconto(obj);
	var favorito = classe_atual.produtoFavorito(obj.slug);
	var item = {"id": obj._id,"url_title": obj.slug, "desconto":desconto, "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall, "loja": nome_da_Loja, "store": obj.store, "estoque": obj.stock, "tamanho": obj.size, "cor": obj.color, "descricao": obj.long_description, "categoria": categoria, "favorito": favorito};
	return item;
}

//Foi alterado
produtosAPI.prototype.montarProdutoGQL = function(obj){
	var nome_do_Shopping = obj.mall.name;
	var nome_da_Loja = obj.store.real_name||obj.store.title||obj.store.fantasy_name;
		
		
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
	for (i = 0; i < obj.images.length; i++) { 
		if (obj.images[i].type == "main"){
			imagem = obj.images[i].path;	
		}
	}
	
	var imagens = ["/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg"];
	
	for (i = 0; i < obj.images.length; i++) { 
		imagens[i] = obj.images[i].path;	
	}
	
	var cor = "";
	var tamanho = "";
	if (obj.color){
		cor = obj.color;
	}
	if (obj.size){
		tamanho = obj.size;
	}
	
	var categoria = "";
	if (obj.store.category.slug){
		categoria = obj.store.category.slug;
	}
	var desconto = this.produtoDesconto(obj);
	var favorito = this.produtoFavorito(obj.slug);
	var item = {"id": obj._id,"url_title": obj.slug, "desconto":desconto, "imagem":imagem, "marca":"Arezzo", "produto":obj.name, "de":preco_inicial, "por": preco_final, "shopping":nome_do_Shopping, "mall": obj.mall.slug, "loja": nome_da_Loja, "store": obj.store.slug, "estoque": obj.stock, "tamanho": tamanho, "cor": cor, "descricao": obj.long_description, "imagens": imagens, "categoria": categoria, "favorito": favorito};
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

//Mais alteracao
produtosAPI.prototype.listGQLStore = function(store){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = `parent{slug}`;
	const q_cheapest =  `cheapest {_id,slug,name,price, stock,color, size,images{path, type, order}}`;
    //const q_group = `group{slug name}`;
	const q_group = '';
    const q_images= `images{path, type, order}`;
	var query = `query={products(store: "` + store + `", parent:null){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price ${q_store} ${q_mall} ${q_group}${q_parent}   ${q_images} ${q_cheapest}}}`;
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

//Mais alteracao
produtosAPI.prototype.listGQLSegment = function(segment){
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = `parent{slug}`;
	const q_cheapest =  `cheapest {_id,slug,name,price,price_start, price_final, stock,color, size,images{path, type, order}}`;
    //const q_group = `group{slug name}`;
	const q_group = '';
    const q_images= `images{path, type, order}`;
	var query = `query={products(segments: ["` + segment + `"], parent:null){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price ${q_store} ${q_mall} ${q_group} ${q_parent}  ${q_images} ${q_cheapest}}}`;
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


produtosAPI.prototype.listGQLSegmentStore = function(store, array_segments){
	for (i = 0; i < array_segments.length; i++) { 
		array_segments[i] = '"' + array_segments[i] + '"';
	};
	
	const q_store = `store{slug, real_name, fantasy_name, floor, title,  category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = `parent{slug}`;
	const q_cheapest =  `cheapest {_id,slug,name,price,price_start, price_final, stock,color, size,images{path, type, order}}`;
    //const q_group = `group{slug name}`;
	const q_group = '';
    const q_images= `images{path, type, order}`;
	var query = `query={products(store: "` + store + `", parent:null, segments:  [` + array_segments+ `]){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price ${q_store} ${q_mall} ${q_group} ${q_parent}  ${q_images} ${q_cheapest}}}`;
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
		var tmp_produtos = this.prepararResultado(tmp.data.products);
		resposta = {"resultado":"OK", "dados": tmp_produtos, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}


produtosAPI.prototype.search = function(produto){
	const q_store = `store{slug, real_name, fantasy_name, floor, title, category{slug name}}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = `parent{slug}`;
    //const q_group = `group{slug name}`;
	const q_group = '';
    const q_images= `images{path, type, order}`;
	const q_cheapest =  `cheapest {_id,slug,name,price,price_start, price_final, stock,color, size,images{path, type, order}}`;
	var query = `query={products(name: "/` + produto + `/", parent:null){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price ${q_store} ${q_mall} ${q_group} ${q_parent} ${q_images} ${q_cheapest}}}`;
	
	
	
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

//FOI INSERIDO HOJE
produtosAPI.prototype.grupo = function(grupo){
	var criterio = '';
	if (typeof this.api_nome_do_shopping !== undefined) {
		if (this.api_nome_do_shopping != ''){
			criterio = '&mall=' + this.api_nome_do_shopping;
		}
	}
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/" + this.metodo + "?group=" + grupo + criterio
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}


produtosAPI.prototype.montarAtributo = function(resultados, tipo){
	var retorno = [];
	var imagens = ["/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg"];
	
	if (Array.isArray(resultados)){
		resultados.forEach(function(obj) {
			if (obj.stock != null  &&  obj.stock > 0){
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
				for (i = 0; i < obj.images.length; i++) { 
					imagens[i] = obj.images[i].path;	
				}
				if (tipo == "TAMANHOS"){
					if (obj.size != null && obj.size != ""){
						if (obj.color != null && obj.color != ""){
							var atributo = {"atributo": "TAMANHO", "tamanho":obj.size, "cor":obj.color, "estoque": obj.stock, "slug": obj.slug, "nome": obj.name, "de":preco_inicial, "por": preco_final, "imagens": imagens};
							retorno.push(atributo);
						}
					}
				}
				//A cor vai ser a chave para selecionar os produtos vinculados!
				if (tipo == "CORES"){
					
					if (obj.color != null && obj.color != ""){
						//var atributo = {"atributo": "COR", "tamanho":obj.size, "cor":obj.color, "estoque": obj.stock, "slug": obj.slug, "nome": obj.name, "de":preco_inicial, "por": preco_final, "imagens": imagens};
						var atributo = {"atributo": "COR", "cor":obj.color};
						var existe = false;
						for (i = 0; i < retorno.length; i++) { 
							if (retorno[i].cor==obj.color){
								existe = true;
							}
						}
						if (!existe){
							retorno.push(atributo);
						}
					}
				}
			}
		});
	} else {
		if (resultados.stock != null  &&  resultados.stock > 0){
			var preco_inicial = 0;
			var preco_final = 0;
			if (resultados.price_start){
				if (resultados.price_final){
					preco_inicial = parseFloat(resultados.price_start/100).toFixed(2);
					preco_final = parseFloat(resultados.price_final/100).toFixed(2);
				}
			} else {
				preco_inicial = parseFloat(resultados.price/100).toFixed(2);
				preco_final = parseFloat(resultados.price/100).toFixed(2);
			}
			for (i = 0; i < resultados.images.length; i++) { 
				imagens[i] = resultados.images[i].path;	
			}
			if (tipo == "TAMANHOS"){
				if (resultados.size != null && resultados.size != ""){
					if (resultados.color != null && resultados.color != ""){
						var atributo = {"atributo": "TAMANHO", "tamanho":resultados.size, "cor":resultados.color, "estoque": resultados.stock, "slug": resultados.slug, "nome": resultados.name, "de":preco_inicial, "por": preco_final, "imagens": imagens};
						retorno.push(atributo);
					}
				}
				
			}
			//A cor vai ser a chave para selecionar os produtos vinculados!
			if (tipo == "CORES"){
				if (resultados.color != null && resultados.color != ""){
					var atributo = {"atributo": "COR", "cor":resultados.color};
					retorno.push(atributo);
				}
			}
		}
	};
	return retorno;
}



produtosAPI.prototype.variation = function(produto){
	
	const q_store = `store{slug, real_name, fantasy_name, floor, title}`;
	const q_mall  = `mall{_id, slug, domain, name}`;
	const q_parent  = "";
    const q_images= `images{path, type, order}`;
	const q_cheapest =  `cheapest {_id,slug,name,price,price_start, price_final, stock,color, size,images{path, type, order}}`;
	var query = `query={products(parent: "` + produto + `"){ _id slug name short_description long_description start_at end_at approved_status active promotion segments stock price_start price_final price color size ${q_store} ${q_mall} ${q_parent}  ${q_images} ${q_cheapest}}}`;
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

produtosAPI.prototype.prepararResultado = function(resultados){
	//Remover produtos sem estoque
	var retorno = [];
	resultados.forEach(function(obj) {
		if (obj.cheapest != null){
			if (obj.cheapest.stock != null && obj.cheapest.stock > 0){
				//Mover as imagens do mais barato para o produto pai, apenas para exibicao
				obj.images = obj.cheapest.images;
				//Mover os valores
				obj.price = obj.cheapest.price;
				obj.price_start = obj.cheapest.price_start;
				obj.price_final = obj.cheapest.price_final;
				obj.slug = obj.cheapest.slug;
				//obj.name = obj.cheapest.name;
				retorno.push(obj);
			}
		} else {
			if (obj.stock != null && obj.stock > 0){
				retorno.push(obj);
			}
		}
	});
	return retorno;
}


produtosAPI.prototype.guardarFavoritos = function(favoritos){
	this.favoritos = favoritos;
}

produtosAPI.prototype.produtoFavorito = function(produto){
	var retorno = "NAO";
	if (this.favoritos){
		for (index = 0; index < this.favoritos.length; ++index) {
			if (this.favoritos[index].id == produto){
				retorno = "SIM";	
			}	
		}
	}
	return retorno;
}

produtosAPI.prototype.produtoDesconto = function(dados){
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
	if (dados.price_final){
		if (dados.price_final != null && dados.price_final != ""){
			preco_final = dados.price_final;
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

module.exports = produtosAPI;

