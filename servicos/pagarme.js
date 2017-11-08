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

pagarmeAPI.prototype.autorizaBoleto = function(valor, dados_do_cliente){
	var resposta = "";
	var dados_da_captura = {};
	dados_da_captura.amount =  valor;  //"100" //FIXO PARA TESTES!
	dados_da_captura.api_key = this.api_key;
	dados_da_captura.payment_method = "boleto";
	dados_da_captura.installments = dados_do_cliente.installments; //Parcelas!
	dados_da_captura.customer = dados_do_cliente.customer; //Retornados por API Pagarme
	
	var opcoes = {  
	    method: 'POST',
		uri: this.url + "/transactions",
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


pagarmeAPI.prototype.autorizaCartao = function(cardHash, valor, dados_do_cliente){
	var resposta = "";
	var dados_da_captura = {};
	dados_da_captura.amount =  valor;  //"100" //FIXO PARA TESTES!
	dados_da_captura.api_key = this.api_key;
	dados_da_captura.capture = "false"; //A captura deve ser feita em ate 5 dias...
	dados_da_captura.card_hash = cardHash;
	dados_da_captura.payment_method = "credit_card";
	dados_da_captura.installments = dados_do_cliente.installments; //Parcelas!
	dados_da_captura.customer = dados_do_cliente.customer; //Retornados por API Pagarme
	var opcoes = {  
	    method: 'POST',
		uri: this.url + "/transactions",
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


pagarmeAPI.prototype.autorizaTransacao = function(valor, dados_do_cliente){
	var resposta = "";
	var dados_da_captura = {};
	if (dados_do_cliente.payment_method=="boleto"){
		dados_da_captura.amount =  valor; 
		dados_da_captura.api_key = this.api_key;
		dados_da_captura.payment_method = "boleto";
		dados_da_captura.installments = dados_do_cliente.installments; //Parcelas!
		dados_da_captura.customer = dados_do_cliente.customer; //Retornados por API Pagarme		
		dados_da_captura.metadata = dados_do_cliente.metadata; //Nosso carrinho
	} else {
		dados_da_captura.amount =  valor; 
		dados_da_captura.api_key = this.api_key;	
		dados_da_captura.capture = "false"; //A captura deve ser feita em ate 5 dias...
		dados_da_captura.payment_method = "credit_card";
		dados_da_captura.card_hash = dados_do_cliente.card_hash;
		dados_da_captura.installments = dados_do_cliente.installments; //Parcelas!
		dados_da_captura.customer = dados_do_cliente.customer; //Retornados por API Pagarme
		dados_da_captura.metadata = dados_do_cliente.metadata; //Nosso carrinho
	}
	var opcoes = {  
	    method: 'POST',
		uri: this.url + "/transactions",
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


//Pode ser feito ate 5 dias depois da autorizacao...
pagarmeAPI.prototype.capturaTransacao = function(id_transacao){
	var resposta = "";
	var dados_da_captura = {};
	dados_da_captura.api_key = this.api_key;
	
	var opcoes = {  
	    method: 'POST',
		uri: this.url + "/transactions/" + id_transacao + "/capture",
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

pagarmeAPI.prototype.montarSplitRules = function(carrinho){
	var retorno = [];
	var lojas = [];
	var total_carrinho = 0;
	//No endpoint de stores precisa ter o recipient_id do lojista
	//No endpoint de stores precisa ter a informacao de qual o percentual da loja que vai ser retido por CCP (de 5,4%, 6% ou 6,4% no começo e 8% para os demais)
	
	
	for (index = 0; index < carrinho.length; ++index) {
		
		//Somar todo o carrinho
		total_carrinho = parseFloat(total_carrinho) + (parseFloat(carrinho[index].total) * 1000);
		var tmp_item = {};
		tmp_item.mall =  carrinho[index].mall;
		tmp_item.store = carrinho[index].loja;
		tmp_item.taxa = carrinho[index].taxa;
		tmp_item.id_pagarme = carrinho[index].pagarme;
		tmp_item.total_price = parseFloat(carrinho[index].total) * 1000;
		tmp_item.total_price = parseFloat(tmp_item.total_price) - (parseFloat(tmp_item.total_price) * 0.08);//Aplicar a taxa do lojista
		
		//Adicionar recipient_id e porcentagem a pagar ccp
		
		var novo = true;
		//Verificar se ja adicionou aquela loja
		for (z = 0; z < lojas.length; ++z) {
			var tmp_loja = lojas[z]
			if (tmp_loja.store == tmp_item.store && tmp_loja.mall == tmp_item.mall){
				novo = false;
				//Atualizar valor daquela loja
				//Sempre retirar a taxa de cada item
				lojas[z].total_price = parseFloat(lojas[z].total_price) + (parseFloat(tmp_item.total_price)- (parseFloat(tmp_item.total_price) * 0.08));
			}
		}
		if (novo){
			lojas.push(tmp_item);
		}
	}
	//Pegar o total da compra para calcular valor CCP
	//Tem que ser depois de montar o objeto já que cada lojista pode ter percentual diferente
	//O total price da loja vai ter que ser reduzido e a diferenca vai entrar no total que vai para CCP
	var total_ccp = 0;
	var total_lojistas = 0;
	for (index = 0; index < lojas.length; ++index) {
		//Reduzir total_price de acordo com percentual lojista
		total_lojistas += parseFloat(lojas[index].total_price)
	}
	total_ccp =  parseFloat(total_carrinho) - parseFloat(total_lojistas);
	
	
	//Total da CCP
	var tmp_ccp = {
		"recipient_id": "re_civb4o6zr003u3m6e8dezzja6", //FIXO
		"amount": total_ccp,
		"liable": true, //indica se o recebedor atrelado assumirá os riscos de chargeback da transação
		"charge_processing_fee": true //Vai pagar as taxas
	};
	retorno.push(tmp_ccp);
	//Depois de adicionar a conta CCP, adicionar os demais lojistas
	for (index = 0; index < lojas.length; ++index) {
		var tmp_loja = lojas[index];
		var tmp_pagarme = {
			"recipient_id": "re_civb4o6zr003u3m6e8dezzja6", //Vira do endpoitn do lojista e vai estar dentro de carrinho
			"amount": tmp_loja.total_price, //Subtrair da taxa da loja!
			"liable": true, //indica se o recebedor atrelado assumirá os riscos de chargeback da transação
			"charge_processing_fee": false //Vai pagar as taxas
		};	
		retorno.push(tmp_pagarme);
	}
	
	//"split_rules":[items de split]
	return retorno;
}			
	
module.exports = pagarmeAPI;

