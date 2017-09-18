var webservice = require('./../servicos/movies.js');
var rp2 = require('request-promise'); 
var dados_temp = [];
var categorias_temp = [];
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


module.exports = function (app){
	app.get("/cinema", function(req,res){
		res.locals.csrfToken = req.csrfToken();
		var api = new webservice(app.locals.shopping);
		var consulta = api.list().then(function (resultados) {
			var consulta2 = api.categorias().then(function (resultados2) {
				dados_temp = resultados.dados.data;
				categorias_temp = resultados2.categorias;
				res.render("cinema/index", {resultados:resultados.dados.data, categorias:resultados2.categorias});
			}).catch(function (erro){
				res.render("cinema/index", {resultados:{}, categorias: {}});
			});
		}).catch(function (erro){
			res.render("cinema/index", {resultados:{}, categorias: {}});
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
				
				//Apenas para testes
				for (index = 0; index < dados_temp.length; ++index) {
					item = dados_temp[index];
					
					if (nome_filme == ""){
						//Nao faz nada
						if (categoria_selecionada ==""){
							//Nao faz nada
						} else {
							item.genres.forEach(function(obj2) {
								if (obj2.indexOf(categoria_selecionada) !== -1){
									results.push(item);
								}
							});
						}
					} else {
						if (item && item.title && item.title.toUpperCase().indexOf(nome_filme) !== -1) {
							results.push(item);
						}
					}
				}

				res.render("cinema/index", {resultados:results, categorias:categorias_temp});
			} else {
				res.status(500).redirect('/erro/500');
			}
		} else {
			res.status(500).redirect('/erro/500');
		}
		
	});
	app.get("/cinema/filme/:nomedofilme", function(req,res){
		var nomedofilme = req.params.nomedofilme;
		
		var diasDeExibicao = [];

		for (var i = 0; i <= 7; i++) {
			var currentDate = new Date();
			currentDate.setDate(new Date().getDate() + i);
			//+ currentDate.getFullYear()
			diasDeExibicao.push({dia: DayAsString(currentDate.getDay()) , data: currentDate.getDate() + " de " + MonthAsString(currentDate.getMonth())});
		}
		
		var api = new webservice(app.locals.shopping);
		var consulta = api.view(nomedofilme).then(function (resultados) {
			var consulta2 = api.list().then(function (resultados2) {
				console.log('filme');
				console.log(resultados.dados);
				
				if (JSON.stringify(resultados.dados) === "{}"){
					res.status(500).redirect('/erro/500');
				} else {
					if (typeof resultados.title === undefined) {
						res.status(500).redirect('/erro/500');
					} else {
						res.render("cinema/filme", {resultados:resultados.dados, "em_cartaz": resultados2.dados.data, datas: diasDeExibicao});
					}	
				}
				
			}).catch(function (erro){
				res.status(500).redirect('/erro/500');
			});
		}).catch(function (erro){
			res.status(500).redirect('/erro/500');
		});
	});
	
}
