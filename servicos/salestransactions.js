const rp = require('request-promise'); 

function salesAPI (token) {
	this.url = "https://concierge-api-v1.herokuapp.com";
	this.pagina = 1;
	this.paginas = 0;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.metodo = "sale-transactions";
	this.token = token;
	
};

const sleep = (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, (seconds * 1000));
    });
};


salesAPI.prototype.gravar = function(dados_da_transacao){
	var opcoes = {  
    	method: 'POST',
		uri: this.url + "/" + this.metodo,
		body: dados_da_transacao,
	    json: true,
	    headers: {
         'Authorization': this.token
		}
	}
	
	console.log('token utilizado');
	console.log(this.token);
	console.log('dados enviados');
	console.log(dados_da_transacao);
	
	return rp(opcoes).then((data, res) => {
		console.log('gravou transacao');
		console.log(data);
		resposta = {"resultado":"OK", "id": data.transaction_id};	
		return resposta;
	}).catch((err) => {
		console.log('nao gravou transacao');
		console.log(err.stack);
		resposta = {"resultado":"ERRO", "id": "0"};	
		return resposta;
	});
}

salesAPI.prototype.atualizar = function(transaction_id, dados_para_atualizar){
	var opcoes = {  
    	method: 'GET',
		uri: this.url + "/" + this.metodo + "?transaction_id=" +  transaction_id,
	    headers: {
         'Authorization': this.token
		}
	}
	return rp(opcoes).then((data, res) => {
		console.log('recuperou transacao transacao');
		console.log(data);
		var tmp_dados = JSON.parse(data);
		var dados_retornados = tmp_dados.data[0];
		//if (dados_para_atualizar.token){
		//	data.token = dados_para_atualizar.token;
		//}
		if (dados_para_atualizar.clearsale_id){
			dados_retornados.clearsale_id = dados_para_atualizar.clearsale_id;
		}
		
		
		
		var opcoes2 = {  
			method: 'PUT',
			uri: this.url + "/" + this.metodo + "/" + dados_retornados._id,
			body: dados_retornados,
			json: true,
			headers: {
			 'Authorization': this.token
			}
		}
		
		console.log(opcoes2);
		//resposta = {"resultado":"OK", "id": transaction_id};	
		//return resposta;
		
		return rp(opcoes2).then((data2, res) => {
			console.log('alterou transacao!');
			resposta = {"resultado":"OK", "id": transaction_id};	
			return resposta;
		}).catch((err2) => {
			console.log('nao alterou transacao');
			console.log(err2.stack);
			resposta = {"resultado":"ERRO", "id": "0"};	
			return resposta;
		});
		
	}).catch((err) => {
		console.log('nao retornou transacao');
		console.log(err.stack);
		resposta = {"resultado":"ERRO", "id": "0"};	
		return resposta;
	});
}


salesAPI.prototype.listGQL = function(usuario){
	var mall = "mall {_id,slug,domain, name, zipcode, address, number,neighborhood, city,description,created_at,updated_at,removed_at}";
	var store = " store {_id, cnpj, slug, fantasy_name, real_name, title,responsible_name, responsible_email, responsible_phone, on_stores_status, send_email, phone,description, suc, floor, tax, bank, agency,account, name, pagarme_id, accepted_at, created_at, updated_at, removed_at, category{slug name}}";
	var imagens = "images{path, type, order}";
	var product = " product {_id, sku, slug, name, standalone, short_description, long_description, start_at, end_at, approved_status, active, promotion, price, price_start, price_final, current_price, stock, color, size, created_at, updated_at, removed_at," + store + "," + mall + "," + imagens + "}";
	var salesItens  = "sale_transaction_products {_id, token, token_pagarme, status_pagarme, status_clearsale, chargeback_details, status, quantity, unity_price, total_price,  brought_at, delivered_at, approved_at, reversed_at, created_at, updated_at,removed_at," + product + "}";
	var sales = 'saleTransactions (user: "' + usuario  + '") {_id,bought_at,delivered_at, transaction_id, source, price, token, details, payment_type, pagarme_id, clearsale_id, token_pagarme, status_pagarme, status_clearsale,chargeback_details,created_at, updated_at, removed_at,  total_price, total_products total_reversed,' + salesItens + '}';
	
	var query = 'query={' + sales + '}';
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
		resposta = {"resultado":"OK", "dados": tmp.data.saleTransactions, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}



salesAPI.prototype.viewGQL = function(registro){
	var mall = "mall {_id,slug,domain, name, zipcode, address, number,neighborhood, city,description,created_at,updated_at,removed_at}";
	var store = " store {_id, cnpj, slug, fantasy_name, real_name, title,responsible_name, responsible_email, responsible_phone, on_stores_status, send_email, phone,description, suc, floor, tax, bank, agency,account, name, pagarme_id, accepted_at, created_at, updated_at, removed_at, category{slug name}}";
	var imagens = "images{path, type, order}";
	var product = " product {_id, sku, slug, name, standalone, short_description, long_description, start_at, end_at, approved_status, active, promotion, price, price_start, price_final, current_price, stock, color, size, created_at, updated_at, removed_at," + store + "," + mall + ", " + imagens + "}";
	var salesItens  = "sale_transaction_products {_id, token, token_pagarme, status_pagarme, status_clearsale, chargeback_details, status, quantity, unity_price, total_price,  brought_at, delivered_at, approved_at, reversed_at, created_at, updated_at,removed_at," + product + "}";
	var sales = 'saleTransactions (transaction_id: "' + registro  + '") {_id,bought_at,delivered_at, transaction_id, source, price, token, details, payment_type, pagarme_id, clearsale_id, token_pagarme, status_pagarme, status_clearsale,chargeback_details,created_at, updated_at, removed_at,  total_price, total_products total_reversed,' + salesItens + '}';
	
	var query = 'query={' + sales + '}';
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/graphql?" + query,
		headers: {
         'Content-Type': 'application/json'
		}
	}
	
	return rp(opcoes).then((data, res) => {
		console.log(data);
		var tmp = JSON.parse(data);
		resposta = {"resultado":"OK", "dados": tmp.data.saleTransactions[0], "status": "OK"};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

salesAPI.prototype.montarVendaCQL = function(resultado){
	var produtos = [];
	resultado.sale_transaction_products.forEach(function(obj) {
		var tmp_produto = obj.product;
		var nome_do_Shopping = tmp_produto.mall.name;
		var nome_da_Loja = tmp_produto.store.fantasy_name||tmp_produto.store.title||tmp_produto.store.real_name;
		var preco = 0;
		if (obj.total_price){
			preco =  parseFloat(obj.total_price/100).toFixed(2);
		}
		
		var imagem = "/imagens/lojas-padrao.jpg";
		for (i = 0; i < tmp_produto.images.length; i++) { 
			if (tmp_produto.images[i].type == "main"){
				imagem = tmp_produto.images[i].path;	
			}
		}
		
		var quantidade = obj.quantity;
		var imagens = ["/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg", "/imagens/lojas-padrao.jpg"];
		
		for (i = 0; i < tmp_produto.images.length; i++) { 
			imagens[i] = tmp_produto.images[i].path;	
		}
		
		var descricao = tmp_produto.long_description;
		var cor = "";
		var tamanho = "";
		if (tmp_produto.color){
			cor = tmp_produto.color;
		}
		if (tmp_produto.size){
			tamanho = tmp_produto.size;
		}
		
		var categoria = "";
		if (tmp_produto.store.category.slug){
			categoria = tmp_produto.store.category.slug;
		}
		
		var item = {"id": tmp_produto._id,"url_title": tmp_produto.slug, "imagem":imagem, "produto":tmp_produto.name, "quantidade":quantidade, "preco": preco, "shopping":nome_do_Shopping, "mall": tmp_produto.mall.slug, "loja": nome_da_Loja, "store": tmp_produto.store.slug, "tamanho": tamanho, "cor": cor, "descricao": descricao, "imagens": imagens, "categoria": categoria};
		produtos.push(item);
	});
	
	var total = 0;
	if (resultado.price){
		total = parseFloat(resultado.price/100).toFixed(2);
	}
	var item = {"id": resultado._id,"id_pagarme": resultado.pagarme_id, "tipo_pagamento": resultado.payment_type, "data":resultado.created_at, "valor":resultado.price, "token":resultado.token, "status": resultado.status_pagarme, "produtos": produtos};
	return item;
}

salesAPI.prototype.fazerDelay = function(id_transacao){
	 return sleep(5).then((data, res) => {
		var mall = "mall {_id,slug,domain, name, zipcode, address, number,neighborhood, city,description,created_at,updated_at,removed_at}";
		var store = " store {_id, cnpj, slug, fantasy_name, real_name, title,responsible_name, responsible_email, responsible_phone, on_stores_status, send_email, phone,description, suc, floor, tax, bank, agency,account, name, pagarme_id, accepted_at, created_at, updated_at, removed_at, category{slug name}}";
		var imagens = "images{path, type, order}";
		var product = " product {_id, sku, slug, name, standalone, short_description, long_description, start_at, end_at, approved_status, active, promotion, price, price_start, price_final, current_price, stock, color, size, created_at, updated_at, removed_at," + store + "," + mall + ", " + imagens + "}";
		var salesItens  = "sale_transaction_products {_id, token, token_pagarme, status_pagarme, status_clearsale, chargeback_details, status, quantity, unity_price, total_price,  brought_at, delivered_at, approved_at, reversed_at, created_at, updated_at,removed_at," + product + "}";
		var sales = 'saleTransactions (transaction_id: "' + id_transacao  + '") {_id,bought_at,delivered_at, transaction_id, source, price, token, details, payment_type, pagarme_id, clearsale_id, token_pagarme, status_pagarme, status_clearsale,chargeback_details,created_at, updated_at, removed_at,  total_price, total_products total_reversed,' + salesItens + '}';
		
		var query = 'query={' + sales + '}';
		var resposta = "";
		var opcoes = {  
			method: 'GET',
			uri: this.url + "/graphql?" + query,
			headers: {
			 'Content-Type': 'application/json'
			}
		}
		
		return rp(opcoes).then((data2, res2) => {
			console.log(data2);
			var tmp = JSON.parse(data2);
			resposta = {"resultado":"OK", "dados": tmp.data.saleTransactions[0], "status": "OK"};	
			return resposta;
		}).catch((err2) => {
			console.log(err2.stack);
			resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
			return resposta;
		});
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});

}


module.exports = salesAPI;

