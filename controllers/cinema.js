var webservice = require('./../servicos/movies.js');
var ingresso = require('./../servicos/ingresso.js');

var rp2 = require('request-promise'); 
var dados_temp = [];
var categorias_temp = [];
var resposta_completa = [];
var datas_temp = [];

function MonthAsString(monthIndex) {
    var d = new Date();
    var month = new Array();
    month[0] = "Janeiro";
    month[1] = "Fevereiro";
    month[2] = "Março";
    month[3] = "Abril";
    month[4] = "Maio";
    month[5] = "Junho";
    month[6] = "Julho";
    month[7] = "Agosto";
    month[8] = "Setembro";
    month[9] = "Outubro";
    month[10] = "Novembro";
    month[11] = "Dezembro";

    return month[monthIndex];
}

function DayAsString(dayIndex) {
    var weekdays = new Array(7);
    weekdays[0] = "Domingo";
    weekdays[1] = "Segunda";
    weekdays[2] = "Terça";
    weekdays[3] = "Quarta";
    weekdays[4] = "Quinta";
    weekdays[5] = "Sexta";
    weekdays[6] = "Sábado";

    return weekdays[dayIndex];
}

function retornaIDIngresso(shoppings, shopping){
	var retorno = 1313;
	shoppings.forEach(function(item){
	   if (item.url_title == shopping){
		  retorno = item.ingresso;
	   }
	});
	return retorno;
}

function retornaIDFilme(filmes, filme){
	var retorno = 0;
	filmes.forEach(function(item){
	   if (item.urlKey == filme){
		  retorno = item.id;
	   }
	});
	return retorno;
}



module.exports = function (app){
	app.get("/cinema", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		
		app.locals.id_do_shopping_ingresso =  retornaIDIngresso(app.locals.shoppings, app.locals.shopping);
		
		var api_ingresso = new ingresso(app.locals.id_do_shopping_ingresso);
		//var api = new webservice(app.locals.shopping);
		//var consulta = api.list().then(function (resultados) {
		var consulta = api_ingresso.list().then(function (resultados) {	
			//var consulta2 = api.categorias().then(function (resultados2) {
			var resultados2 = api_ingresso.categorias(resultados.dados);
			var resultados3 = api_ingresso.filmes(resultados.dados);
			var resultados4 = api_ingresso.datas(resultados.dados);
			
			
			resposta_completa = resultados.dados;
			//dados_temp = resultados.dados;
			categorias_temp = resultados2.categorias;
			dados_temp = resultados3.dados;
			datas_temp = resultados4.dados;
			
			//res.render("cinema/index", {resultados:resultados.dados.data, categorias:resultados2.categorias});
			res.render("cinema/index", {resultados:resultados3.dados, categorias:resultados2.categorias, banners: resultados3.dados});
		}).catch(function (erro){
			res.render("cinema/index", {resultados:{}, categorias: {}, banners: {}});
		});
	});
	
	app.post("/cinema", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		if (dados_temp.length>0){
			if (categorias_temp.length>0){
				//Isso vai ser filtrado na API
				//Filtrando manualmente para fins de teste de navegacao
				
				var results = [];
				var index;
				var entry;
				
				var nome_filme = req.body.filme;
				nome_filme =nome_filme.toUpperCase();
				var categoria_selecionada = req.body.categoria;
				var data_selecionada = req.body.data;
				
				if (data_selecionada != ""){
					data_selecionada = data_selecionada.slice(0, -5);
				}
				
				//Para trazer tudo se nao filtrar nada
				if (nome_filme == ""){
					if (categoria_selecionada ==""){
						if (data_selecionada ==""){
							results = dados_temp;
						}
					}	
				}
				
				//Apenas para testes
				for (index = 0; index < dados_temp.length; ++index) {
					item = dados_temp[index];
					
					if (nome_filme == ""){
						//Nao faz nada	
					} else {
						if (item && item.title && item.title.toUpperCase().indexOf(nome_filme) !== -1) {
							results.push(item);
						}
					}
					
					if (categoria_selecionada ==""){
						//Nao faz nada
					} else {
						item.genres.forEach(function(obj2) {
							if (obj2.indexOf(categoria_selecionada) !== -1){
								results.push(item);
							}
						});
					}
					
					if (data_selecionada == ""){
						//Nao faz nada
					} else {
						datas_temp.forEach(function(obj2) {
							if (obj2.dateFormatted == data_selecionada){
								if (obj2.urlKey == item.urlKey){
									results.push(item);
								}
							}
						});
					}
					
				}

				res.render("cinema/index", {resultados:results, categorias:categorias_temp, banners:dados_temp});
			} else {
				res.status(500).redirect('/erro/500');
			}
		} else {
			res.status(500).redirect('/erro/500');
		}
		
	});
	app.get("/cinema/filme/:nomedofilme", function(req,res){
		var nomedofilme = req.params.nomedofilme;
		var id_do_filme = retornaIDFilme(dados_temp, nomedofilme);
		
		var diasDeExibicao = [];

		for (var i = 0; i <= 7; i++) {
			var currentDate = new Date();
			currentDate.setDate(new Date().getDate() + i);
			//+ currentDate.getFullYear()
			diasDeExibicao.push({dia: DayAsString(currentDate.getDay()) , data: currentDate.getDate() + " de " + MonthAsString(currentDate.getMonth())});
		}
		
		//var api = new webservice(app.locals.shopping);
		app.locals.id_do_shopping_ingresso =  retornaIDIngresso(app.locals.shoppings, app.locals.shopping);
		var api_ingresso = new ingresso(app.locals.id_do_shopping_ingresso);
		
		//var consulta = api.view(nomedofilme).then(function (resultados) {
		var consulta = api_ingresso.view(id_do_filme).then(function (resultados) {
			//var consulta2 = api.list().then(function (resultados2) {
				
				var lista_sessoes = api_ingresso.sessoes(resposta_completa, id_do_filme);
				if (JSON.stringify(resultados.dados) === "{}"){
					res.status(500).redirect('/erro/500');
				} else {
					if (typeof resultados.title === undefined) {
						res.status(500).redirect('/erro/500');
					} else {
						res.render("cinema/filme", {resultados:resultados.dados, "em_cartaz": dados_temp, datas: diasDeExibicao, sessoes: lista_sessoes.sessoes});
					}	
				}
				
			//}).catch(function (erro){
			//	res.status(500).redirect('/erro/500');
			//});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
}