$(document).ready(function() {
		  
	  $("#lupa").click(function(event){
		  event.preventDefault();
		  $("#busca").fadeToggle();
		});
		$("#conta").click(function(event){
		  event.preventDefault();
		  $("#conta2").toggle();
		}); 

		$(window).scroll(function() {
				if($(this).scrollTop() != 0) {
					$('#toTop').fadeIn();	
				} else {
					$('#toTop').fadeOut();
				}
				
			if ($(this).scrollTop() > 0.5){  
				$('header').addClass("efect");
			  }
			  else{
				$('header').removeClass("efect");
			  }
				
		});
		
		$('#toTop').click(function() {
			$('body,html').animate({scrollTop:0},500);
		});	

		
		//$("#info").stick_in_parent();
		
		//Galeria de fotos
			$('.galery:gt(0)').hide();	
			$('.buttons').on('click', function(e) {
				$('.galery').fadeOut(1);
				$('.' + $(e.target).attr('id') ).fadeIn(800);
			});
			
		//Mapas
			$('.maps:gt(0)').hide();	
			$('.buttons').on('click', function(e) {
				$('.maps').fadeOut(1);
				$('.' + $(e.target).attr('id') ).fadeIn(800);
			});
			
	
			 $('.favoritos:gt(0)').hide();	
				$('.buttons').on('click', function(e) {
					$('.favoritos').fadeOut(1);
					$('.' + $(e.target).attr('id') ).fadeIn(800);
				});
				
				//$('.favoritos:gt(0)').hide();	
					//$('.buttons').on('click', function(e) {
						//$('.favoritos').fadeOut(1);
						//$('.' + $(e.target).attr('id') ).fadeIn(800);
					//});
			
			$("#owl-demo").owlCarousel({
			  navigation : true,
			  slideSpeed : 300,
			  paginationSpeed : 800,
			  singleItem : true,
			  autoPlay: 2000,
			  stopOnHover:true	
			  });
			  
			  $("#owl-demo2").owlCarousel({
			  navigation : true,
			  slideSpeed : 300,
			  paginationSpeed : 800,
			  singleItem : true,
			  autoPlay: 2000,
			  stopOnHover:true	
			  });
			  
			  $('.fancybox').fancybox({
				  	width: '100%',
					minheight: '100%',
					margin: [0, 0, 0, 0],
					topRatio    : 0
				  });
				  
				  
			  
		function favoritar_produto(produto, event){
				event.preventDefault();
				$.ajax({
				  type: 'POST',
				  url: '/produtos/favoritar/',
				  dataType : 'json',
				  data: { 
					'produto': produto, 
					'_csrf': '<%= csrfToken %>'
				  },
				  success: function (response) {
					alert('Produto selecionado com sucesso!');
					return false;
				  },
				  error: function () {
					//
				  }
			   });
			}
			
			function remover_produto(produto, event){
				event.preventDefault();
				$.ajax({
				  type: 'POST',
				  url: '/produtos/desfavoritar/',
				  dataType : 'json',
				  data: { 
					'produto': produto, 
					'_csrf': '<%= csrfToken %>'
				  },
				  success: function (response) {
					$("#lk" +  produto).remove();
					alert('Produto removido com sucesso!');
				  },
				  error: function () {
					//
				  }
			   });
			}	
			
			$('#campobusca').on('keyup', function(e) {
			 if (e.which !== 32) {
				var value = $(this).val();
				var noWhitespaceValue = value.replace(/\s+/g, '');
				var noWhitespaceCount = noWhitespaceValue.length;
				if (noWhitespaceCount > 3) {
				   pesquisar_produto(value);
				}
			}
			});
			
			function pesquisar_produto(produto){
		$.ajax({
		  type: 'POST',
		  url: '/busca',
		  dataType : 'json',
		  data: { 
			'produto': produto, 
			'_csrf': '<%= csrfToken %>'
		  },
		  success: function (response) {
		    var retorno = '';
			$.each(response, function( index, value ) {
				var item = value;
				
                retorno += '<a href="/produtos/' + item.url_title + '" class="prods">';
                retorno += '        <section>';
                retorno += '            <div class="favs">';
                retorno += '                <span>' + item.desconto + ' %</span>';
                retorno += '                <button value="" id=""></button>';
                retorno += '            </div>';
                retorno += '            <img src="/imagens/' + item.imagem + ' " title="' +   item.produto + '" class="img">';
                retorno += '            <h2>' + item.marca + '</h2>';
                retorno += '            <h3>' + item.produto + '</h3>';
                retorno += '            <div class="valor">';
                retorno += '                <span>De R$ ' + item.de + '</span>';
                retorno += '                <span>Por ' + item.por + '</span>';
                retorno += '            </div>';
                retorno += '       </section>';
                retorno += '   </a>';
				
			});
			$("#result").html(retorno);
		  },
		  error: function () {
			$("#result").html('');
		  }
	   });
	}


	 $("#btn_login").fancybox({
		type : 'iframe',
		width: '100%',
		padding : 0,
		afterClose: function() {
			location.reload();
		}});
		
	$("#btn_carrinho").fancybox({
		type : 'iframe',
		width: '100%',
		padding : 0,
		afterClose: function() {
			location.reload();
		}});	
		
	$("#btn_sacola").fancybox({
		type : 'iframe',
		width: '100%',
		padding : 0,
		afterClose: function() {
			location.reload();
		}});
			//$('.ink:gt(0)').hide();	
			//$('.lateral').on('click', function(e) {
				//$('.ink').fadeOut(1);
				//$('.' + $(e.target).attr('id') ).fadeIn(800);
			//});
			
			//fancybox para o site
			

			

});



