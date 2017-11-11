var webservice = require('./../servicos/movies.js');
var ingresso = require('./../servicos/ingresso.js');

var rp2 = require('request-promise'); 
var categorias_temp = [];
var resposta_completa = [];

function pad(str) {
  const resto = 2 - String(str).length;
  return '0'.repeat(resto > 0 ? resto : '0') + str;
}

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
	var retorno = '';
	if (shoppings){
		shoppings.forEach(function(item){
		   if (item.url_title == shopping){
			  retorno = item.ingresso;
		   }
		});
	}
	return retorno;
}

function retornaIDIngresso2(shoppings, shopping){
	var retorno =1313;
	if (shoppings){
		shoppings.forEach(function(item){
		   if (item.url_title == shopping){
			  retorno = item.ingresso;
		   }
		});
	}
	return retorno;
}

function retornaIDFilme(filmes, filme){
	var retorno = 0;
	if (filmes){
		filmes.forEach(function(item){
		   if (item.urlKey == filme){
			  retorno = item.id;
		   }
		});
	}
	return retorno;
}



module.exports = function (app){
	
	app.get("/cinema", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		
		req.session.id_do_shopping_ingresso =  retornaIDIngresso2(app.locals.shoppings, req.session.shopping);
		
		var api_ingresso = new ingresso(req.session.id_do_shopping_ingresso);
		//var api = new webservice(req.session.shopping);
		//var consulta = api.list().then(function (resultados) {
		var consulta = api_ingresso.list().then(function (resultados) {	
			//var consulta2 = api.categorias().then(function (resultados2) {
			var resultados2 = api_ingresso.categorias(resultados.dados);
			var resultados3 = api_ingresso.filmes(resultados.dados);
			var resultados4 = api_ingresso.datas(resultados.dados);
			
			
			
			//Colando as datas na resposta :-)
			for (index = 0; index < resultados3.dados.length; ++index) {
				var tmp_datas=[];
				item = resultados3.dados[index];
				resultados4.dados.forEach(function(obj2) {
					if (obj2.urlKey == item.urlKey){
						var tmp_data_item = obj2.date.split("-").reverse().join("");
						tmp_datas.push(tmp_data_item);
					}
				});
				var string_datas = tmp_datas.join("|");
				
				resultados3.dados[index].datas = string_datas;
			}
			
			
			resposta_completa = resultados.dados;
			//req.session.dados_temp = resultados.dados;
			categorias_temp = resultados2.categorias;
			//req.session.dados_temp = resultados3.dados;
			//req.session.datas_temp = resultados4.dados;
			
			//res.render("cinema/index", {resultados:resultados.dados.data, categorias:resultados2.categorias});
			res.render("cinema/index", {resultados:resultados3.dados, categorias:resultados2.categorias, banners: resultados3.dados});
		}).catch(function (erro){
			res.render("cinema/index", {resultados:{}, categorias: {}, banners: {}});
		});
	});
	
	//NAO VAI EXISTIR ESTA ROTA - O FILTRO VAI SER POR POST
	//app.post("/cinema", function(req,res){
		//res.locals.csrfToken = req.csrfToken();
		//if (req.session.dados_temp.length>0){
			//if (categorias_temp.length>0){
				//Isso vai ser filtrado na API
				//Filtrando manualmente para fins de teste de navegacao
				
				//var results = [];
				//var index;
				//var entry;
				
				//var nome_filme = req.body.filme;
				//nome_filme =nome_filme.toUpperCase();
				//var categoria_selecionada = req.body.categoria;
				//var data_selecionada = req.body.data;
				
				//if (data_selecionada != ""){
				//	data_selecionada = data_selecionada.slice(0, -5);
				//}
				
				//Para trazer tudo se nao filtrar nada
				//if (nome_filme == ""){
				//	if (categoria_selecionada ==""){
				//		if (data_selecionada ==""){
				//			results = req.session.dados_temp;
				//		}
				//	}	
				//}
				
				//Apenas para testes
				//for (index = 0; index < req.session.dados_temp.length; ++index) {
				//	item = req.session.dados_temp[index];
				//	
				//	if (nome_filme == ""){
				//		//Nao faz nada	
				//	} else {
				//		if (item && item.title && item.title.toUpperCase().indexOf(nome_filme) !== -1) {
				//			results.push(item);
				//		}
				//	}
				//	
				//	if (categoria_selecionada ==""){
				//		//Nao faz nada
				//	} else {
				//		item.genres.forEach(function(obj2) {
				//			if (obj2.indexOf(categoria_selecionada) !== -1){
				//				results.push(item);
				//			}
				//		});
				//	}
					
				//	if (data_selecionada == ""){
				//		//Nao faz nada
				//	} else {
				//		req.session.datas_temp.forEach(function(obj2) {
				//			if (obj2.dateFormatted == data_selecionada){
				//				if (obj2.urlKey == item.urlKey){
				//					results.push(item);
				//				}
				//			}
				//		});
				//	}
					
				//}

				//res.render("cinema/index", {resultados:results, categorias:categorias_temp, banners:req.session.dados_temp});
			//} else {
			//	res.status(500).redirect('/erro/500');
			//}
		//} else {
		//	res.status(500).redirect('/erro/500');
		//}
		
	//});
	
	app.get("/cinema/filme/:nomedofilme", function(req,res){
		req.session.id_do_shopping_ingresso =  retornaIDIngresso(app.locals.shoppings, req.session.shopping);
		var nomedofilme = req.params.nomedofilme;
		// TODO: Os dados do filme precisam vir direto da API pois os crawlers indexarão a url e os usuários  
		// poderão acessar o filme diretamente sem passar pela lista de filmes, e então verão um erro ou o dado cacheado.
		
		//var id_do_filme = retornaIDFilme(req.session.dados_temp, nomedofilme);
		
		var diasDeExibicao = [];

		for (var i = 0; i <= 7; i++) {
			var currentDate = new Date();
			currentDate.setDate(new Date().getDate() + i);
			//+ currentDate.getFullYear()
			diasDeExibicao.push({data_ymd: currentDate.getFullYear() + '-' +  pad(currentDate.getMonth()+1) + '-' + pad(currentDate.getDate()) , dia: DayAsString(currentDate.getDay()) , data: currentDate.getDate() + " de " + MonthAsString(currentDate.getMonth())});
		}
		
		//var api = new webservice(req.session.shopping);
		//app.locals.id_do_shopping_ingresso =  retornaIDIngresso(app.locals.shoppings, req.session.shopping);
		var api_ingresso = new ingresso(req.session.id_do_shopping_ingresso);
		
		var consulta = api_ingresso.viewURL(nomedofilme).then(function (resultados) {
			
			id_do_filme = resultados.dados.id;
		//var consulta = api_ingresso.view(id_do_filme).then(function (resultados) {
			//var consulta2 = api.list().then(function (resultados2) {
				//var lista_sessoes = api_ingresso.sessoes(resposta_completa, id_do_filme);
				if (JSON.stringify(resultados.dados) === "{}"){
					res.status(500).redirect('/erro/500');
				} else {
					if (typeof resultados.title === undefined) {
						res.status(500).redirect('/erro/500');
					} else {
						
						var consulta2 = api_ingresso.emCartaz().then(function (resultados2) {	
							var resultados3 = api_ingresso.filmesCartaz(resultados2.dados);
							//req.session.dados_temp = resultados3.dados;
							
							//api_ingresso.todasAsSessoesDoFilme(app.locals.shoppings, id_do_filme);
							//api_ingresso.listFilme(1,1313);
							var array_promisses = [];
							app.locals.shoppings.forEach(function(item){
								var id_cidade = 1;	
								if ( item.ingresso == 1210){
									id_cidade = 2;
								}
								if ( item.ingresso == 1389){
									id_cidade = 15;
								}
								array_promisses.push(api_ingresso.listFilmeSessoes(id_cidade, item.ingresso, id_do_filme));		
							});
							
							api_ingresso.listarFilmesNOVO(id_do_filme).then(function(novos_resultados) {
								
								var novas_sessoes = api_ingresso.montarSessoesNOVO(novos_resultados.dados, diasDeExibicao, req.session.id_do_shopping_ingresso);
								res.render("cinema/filme", {resultados:resultados.dados, "em_cartaz": resultados3.dados, datas: diasDeExibicao, sessoes: novas_sessoes});
								 
							}).catch((err) => {
								console.log(err.stack);
								//problema....
							});
							
							
							//Promise.all(array_promisses).then(function(results) {
							//  var tmp_array_itens = []
							// for (index = 0; index < results.length; ++index) {
						//		tmp_array_itens.push(results[index]);
							//  }
							  
							 // var novas_sessoes = api_ingresso.montarSessoes(tmp_array_itens, diasDeExibicao, req.session.id_do_shopping_ingresso);
							  //imprimir as sessoes na view
							//  res.render("cinema/filme", {resultados:resultados.dados, "em_cartaz": resultados3.dados, datas: diasDeExibicao, sessoes: novas_sessoes});
							  
							//}).catch((err) => {
							//	//problema....
							//});
							
							
							
							//res.render("cinema/filme", {resultados:resultados.dados, "em_cartaz": resultados3.dados, datas: diasDeExibicao, sessoes: lista_sessoes.sessoes});
						}).catch(function (erro){
							res.status(500).redirect('/erro/500');
						});	
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
