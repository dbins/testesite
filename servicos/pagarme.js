const rp = require('request-promise'); 

var pagarmeAPI = function () {
	this.url = "https://api.pagar.me/1";
	this.api_key = "ak_test_EhzfPXYgAt8N9FAblqarhrpd181Tgu";
};

pagarmeAPI.prototype.captura = function(token, valor, dados_da_captura){
	var resposta = "";
	dados_da_captura.amount =  valor;  //"100" //FIXO PARA TESTES!
	dados_da_captura.api_key = this.api_key;
	
	var opcoes = {  
	    method: 'POST',
		uri: this.url + "/transactions/" + token + "/capture",
		body: dados_da_captura,
	    json: true
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": data, "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

pagarmeAPI.prototype.pedidos = function(cpf){
	var dados_pesquisa = {
			
		//Para retornar apenas alguns campos
		//Objeto transaction
		//"_source": ["date_created", "card_holder_name", "id", "nsu", "amount", "customer", "metadata"],
		
		"query":{"filtered": {"query": {"match_all": {}},
		  "filter": {
			"term": { "customer.document_number": cpf }
		  }
		}
	  }
	  
	  //Para ordenar os resultados
	  ,"sort": [
			{"id":   { "order": "desc" }},
			{"_score": { "order": "desc" }}
		]
	  
	};
	
	var opcoes = {  
	  method: 'GET',
	  uri: 'https://api.pagar.me/1/search',
	  qs: {
		api_key: this.api_key,
		type: "transaction", //Objeto da API PAGARME 
		query : JSON.stringify(dados_pesquisa)
	  }
	} 
	//Objetos da API que podem ser pesquisados
	//customer https://docs.pagar.me/v2013-03-01/reference#objeto-cliente
	//recipient https://docs.pagar.me/v2013-03-01/reference#objeto-recebedor-1
	//bank_account https://docs.pagar.me/v2013-03-01/reference#objeto-conta-bancária
	//transaction https://docs.pagar.me/v2013-03-01/reference#objeto-transaction
	//card https://docs.pagar.me/v2013-03-01/reference#objeto-cartão
	//transfer https://docs.pagar.me/v2013-03-01/reference#objeto-transferência

	
	return rp(opcoes).then((data) => {
		var tmp = JSON.parse(data);
		//console.log(tmp.hits.hits);
		var resposta = {"resultado":"OK", "dados": tmp.hits.hits};	
		return resposta;
	}).catch((err) => {
		//var codigo_erro = err.statusCode;
		//var detalhes_erro = err.message;
		//var resposta = {
		//	"resultado":"erro",
		//	"codigo": codigo_erro,
		//	"detalhes":detalhes_erro
		//}
		//return resposta;
		//Tratar o erro na pagina que fez a chamada!
	});
}	


pagarmeAPI.prototype.montarPedidos = function(resultados){
	var pedidos = [];
	resultados.forEach(function(obj) {
		var item = {"pedido":obj._source.id, "tid":obj._source.id, "nsu":obj._source.id, "data":obj._source.date_created, "valor": obj._source.amount, "tipo": obj._source.payment_method};
		pedidos.push(item);
		
	});
	return pedidos;
}


pagarmeAPI.prototype.montarPedido = function(resultado){
	var array_items = [];
	var dados_site = resultado.metadata;
	if (dados_site.produtos !== undefined){
		dados_site.produtos.forEach(function(obj) {
			array_items.push(obj);
		});
	}
	var bandeira = "";
	var cartao_comeco = "";
	var cartao_fim = "";
	var tipo = "";
	if (resultado.payment_method=="credit_card"){
		tipo = "Cartão de Crédito";
	} else {
		tipo = "Boleto";
	}
	
	if (resultado.card){
		bandeira = resultado.card.brand;
		cartao_comeco = resultado.card.first_digits;
		cartao_fim = resultado.card.last_digits;
	}
	
	var boleto_barcode = "";
	var boleto_link = "";
	var boleto_vencimento = "";
	
	if (resultado.boleto_url){
		boleto_link = resultado.boleto_url;
	}
	if (resultado.boleto_barcode){
		boleto_barcode = resultado.boleto_barcode;
	}
	if (resultado.boleto_expiration_date){
		boleto_vencimento = resultado.boleto_expiration_date;
	}
	
	var item = {"cpf": resultado.customer.document_number, "pedido":resultado.id, "tid":resultado.id, "nsu":resultado.id, "data":resultado.date_created, "valor": resultado.amount, "tipo": tipo, "items": array_items, "status": resultado.status, "cartao_comeco": cartao_comeco, "cartao_fim": cartao_fim, "bandeira":bandeira, boleto_barcode: boleto_barcode, boleto_link: boleto_link, boleto_vencimento : boleto_vencimento};
	return item;
}


pagarmeAPI.prototype.verTransacao = function(id_transacao){
	var opcoes = {  
	  method: 'GET',
	  uri: 'https://api.pagar.me/1/transactions/' + id_transacao,
	  qs: {
		api_key: this.api_key
	  }
	  
	}
	return rp(opcoes).then((data) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data), "status": "OK"};	
		return resposta;
	}).catch((err) => {
		//var codigo_erro = err.statusCode;
		//var detalhes_erro = err.message;
		//var resposta = {
		//	"resultado":"erro",
		//	"codigo": codigo_erro,
		//	"detalhes":detalhes_erro
		//}
		//res.status(500).json(resposta);	
		//O erro sera tratado pela pagina que fez a chamada!
	});
}
	
module.exports = pagarmeAPI;

