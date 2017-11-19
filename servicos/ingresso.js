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
	
	//Rever este trecho e refatorar
	if (shopping_selecionado == 1210){
		this.id_cidade = 2;
	}
	if (shopping_selecionado == 1389){
		this.id_cidade = 15;
	}
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


ingressoAPI.prototype.viewURL = function(registro){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/events/url-key/" + registro
	}
	
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data), "status": "OK"};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 1", "dados":{}};	
		return resposta;
	});
}


//Filmes em cartaz
ingressoAPI.prototype.emCartaz = function(){
	
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/templates/nowplaying"
		
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}

ingressoAPI.prototype.filmesCartaz = function(resultados){
	var id_filmes = [];	
	var resposta = "";
	var filmes = [];	
	tmp = resultados;
	tmp.forEach(function(obj) {
		if (id_filmes.indexOf(obj.id)<0){
			id_filmes.push(obj.id);
			filmes.push(obj);
		}
	});
	filmes.sort();
	resposta = {"dados":filmes};	
	return resposta;
}

ingressoAPI.prototype.listFilmeSessoes = function(cidade, shopping, filme){
	
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: this.url + "/sessions/city/" + cidade + "/theater/" + shopping
		
	}
	return rp(opcoes).then((data, res) => {
		var sessoes = [];
		var tmp = JSON.parse(data);
		tmp.forEach(function(obj) {
			var rooms = [];
			obj.movies.forEach(function(obj2) {
				if (obj2.id == filme){
					rooms = obj2.rooms;
				}
			});
			var resultados_dia = {"shopping":shopping, "date": obj.date, "dateFormatted": obj.dateFormatted, "dayOfWeek": obj.dayOfWeek, "rooms": rooms};
			sessoes.push(resultados_dia);
		});
		
		resposta = {"resultado":"OK", "shopping": shopping, "sessoes": sessoes};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "shopping": "","sessoes":[]};	
		return resposta;
	});
}

ingressoAPI.prototype.montarSessoes = function(resultados, datas, shopping_selecionado){
	var sessoes = [];	
	
	for (var i = 0; i <datas.length; i++) {
		var tmp = []
		var tmp_shopping = [];
		//Para dia vai ter um objeto para cada shopping
		for (var x = 0; x <resultados.length; x++) {
			var tmp_sessoes = [];
			var tmp1 = resultados[x].sessoes;
			for (var w = 0; w <tmp1.length; w++) {
				if (datas[i].data_ymd == tmp1[w].date){
					tmp_sessoes.push(tmp1[w].rooms);
				}
				
			}
			if (resultados[x].shopping !=""){
				if (shopping_selecionado == ''){
					
					tmp_shopping.push({shopping: resultados[x].shopping, nome: this.nomeShopping(resultados[x].shopping), sessoes: tmp_sessoes});
				} else {
					if (shopping_selecionado == resultados[x].shopping){
						
						tmp_shopping.push({shopping: resultados[x].shopping, nome: this.nomeShopping(resultados[x].shopping), sessoes: tmp_sessoes});
					}
				}
			}			
		}
		var tmp_dia = {data_ymd: datas[i].data_ymd, dia: datas[i].dia , data: datas[i].data, shopping: tmp_shopping};
		sessoes.push(tmp_dia);
	}
	//console.log(sessoes[0].shopping[3]);
	//console.log(sessoes[6]);
	for (var x = 0; x <sessoes.length; x++) { //CADA DIA
		var tmp = sessoes[x].shopping;
		for (var y = 0; y < tmp.length; y++) { //CADA SHOPPING
			var tmp1 = tmp[y].sessoes;
			for (var z = 0; z < tmp1.length; z++) {	
				//console.log(tmp1[z]); //SALAS E HORARIOS!
			}
		}
	}
	return sessoes;
}

ingressoAPI.prototype.nomeShopping = function(id_ingresso){
	var retorno = '';
	switch (id_ingresso) {
    case '154':
        retorno = "Shopping D";
        break;
    case '350':
        retorno = "Grand Plaza Shopping";
        break;
    case '1210':
        retorno = "Shopping Metropolitano Barra";
        break;
    case '1295':
        retorno = "Tiete Plaza Shopping";
        break;
    case '1313':
        retorno = "Shopping Cidade São Paulo";
        break;
    case '1389':
        retorno = "Shopping Cerrado";
        break;
	}
	return retorno;
}	

ingressoAPI.prototype.listarFilmesNOVO = function(id_filme){
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: "http://www.dbins.com.br/ferramentas/ingresso/filme.php?filme=" + id_filme
		
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		console.log(err.stack);
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":[]};	
		return resposta;
	});	
}

ingressoAPI.prototype.montarSessoesNOVO = function(resultados, datas, shopping_selecionado){
	var sessoes = [];	
	for (var i = 0; i <datas.length; i++) {
		
		var tmp = []
		var tmp_shopping = [];
		//console.log(resultados.length);
		//Para dia vai ter um objeto para cada shopping
		for (var x = 0; x <resultados.length; x++) {
			//console.log('cada registro');
			var tmp_resultados = resultados[x];
			if (datas[i].data_ymd == tmp_resultados.data){
				var tmp_shopping2 = tmp_resultados.shopping;
				//console.log(tmp_resultados.shopping);
				tmp_resultados.shopping.forEach(function(obj) {
					if (shopping_selecionado != ''){
						if (shopping_selecionado == obj.shopping){
							tmp_shopping.push(obj);
						}
					} else {
						tmp_shopping.push(obj);
					}
				});
			}
		}
		var tmp_dia = {data_ymd: datas[i].data_ymd, dia: datas[i].dia , data: datas[i].data, shopping:tmp_shopping};
		sessoes.push(tmp_dia);
	}
	//console.log(sessoes[0]);
	//console.log(sessoes[0].shopping[0].sessoes[0]);
	return sessoes;
}

ingressoAPI.prototype.listNOVO = function(){
	
	
	var filtro = "";
	if (this.id_shopping != ""){
		filtro = "?shopping=" + this.id_shopping;
	}
	var resposta = "";
	var opcoes = {  
	    method: 'GET',
		uri: "http://www.dbins.com.br/ferramentas/ingresso/filmes.php" + filtro
		
	}
	return rp(opcoes).then((data, res) => {
		resposta = {"resultado":"OK", "dados": JSON.parse(data)};	
		return resposta;
	}).catch((err) => {
		resposta = {"resultado":"ERRO DE COMUNICACAO 2", "dados":{}};	
		return resposta;
	});
}


ingressoAPI.prototype.filmesNOVO = function(resultados){
	var id_filmes = [];	
	var resposta = "";
	var filmes = [];	
	var tmp = resultados;

	tmp.forEach(function(obj) {
		filmes.push(obj);
	});
	resposta = {"dados":filmes};	
	return resposta;
}


ingressoAPI.prototype.categoriasNOVO = function(resultados){
	var resposta = "";
	var categorias = [];
	var tmp = resultados;
	tmp.forEach(function(obj) {
		var tmp_array = obj.categorias.split("|");
		for (var i = 0; i < tmp_array.length; i++) {
			if (categorias.indexOf(tmp_array[i])<0){
				categorias.push(tmp_array[i]);
			}
		};			
	});
	categorias.sort();
	resposta = {"resultado":"OK", "categorias":categorias};	
	return resposta;
}


module.exports = ingressoAPI;

