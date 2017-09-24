const rp = require('request-promise'); 

var ingressoAPI = function (shopping_selecionado) {
	this.url = "https://api-content.ingresso.com/v0";
	this.pagina = 1;
	this.id_cidade = 1;
	this.paginas = 0;
	this.id_shopping = shopping_selecionado;
	this.limite = 10;
	this.total_registros = 0;
	this.posicao = 0;
	this.metodo = "";
};

ingressoAPI.prototype.list = function(){
	
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/sessions/city/" + this.id_cidade + "/theater/" + this.id_shopping
		
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

ingressoAPI.prototype.categorias = function(resultados){
	var resposta = "";
	var categorias = [];
	var tmp = resultados;

	tmp.forEach(function(obj) {
		obj.movies.forEach(function(obj2) {
		obj2.genres.forEach(function(obj3) {
			if (categorias.indexOf(obj3)<0){
				categorias.push(obj3);
			}
		  });	
		});			
	});
	categorias.sort();
	resposta = {"resultado":"OK", "categorias":categorias};	
	return resposta;
}

ingressoAPI.prototype.filmes = function(resultados){
	var id_filmes = [];	
	var resposta = "";
	var filmes = [];	
	var tmp = resultados;

	tmp.forEach(function(obj) {
		obj.movies.forEach(function(obj2) {
			if (id_filmes.indexOf(obj2.id)<0){
				id_filmes.push(obj2.id);
				filmes.push(obj2);
			}
		});	
	});
	filmes.sort();
	resposta = {"dados":filmes};	
	return resposta;
}


ingressoAPI.prototype.datas = function(resultados){
	var resposta = "";
	var filmes = [];	
	var tmp = resultados;

	tmp.forEach(function(obj) {
		obj.movies.forEach(function(obj2) {
			var resultados_dia = {"date": obj.date, "dateFormatted": obj.dateFormatted, "dayOfWeek": obj.dayOfWeek, "id": obj2.id, "title": obj2.title, "urlKey": obj2.urlKey};
			filmes.push(resultados_dia);
		});	
	});
	resposta = {"dados":filmes};	
	return resposta;
}


ingressoAPI.prototype.view = function(registro){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/events/" + registro
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data), "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}

//Com base no filme, montar um retorno com as sessoes
ingressoAPI.prototype.sessoes = function(resultados, id_filme){
	var sessoes = [];
	var tmp = resultados;
	
	tmp.forEach(function(obj) {
		var rooms = [];
		obj.movies.forEach(function(obj2) {
			if (obj2.id == id_filme){
				rooms = obj2.rooms;
			}
		});
		var resultados_dia = {"date": obj.date, "dateFormatted": obj.dateFormatted, "dayOfWeek": obj.dayOfWeek, "rooms": rooms};
		sessoes.push(resultados_dia);
		
	});
	resposta = {"sessoes":sessoes};	
	return resposta;
	
}


module.exports = ingressoAPI;

