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
			  
			  $('.fancybox').fancybox({
				  	width: '100%',
					minheight: '100%',
					margin: [0, 0, 0, 0],
					topRatio    : 0
				  });
			  

			
			//$('.ink:gt(0)').hide();	
			//$('.lateral').on('click', function(e) {
				//$('.ink').fadeOut(1);
				//$('.' + $(e.target).attr('id') ).fadeIn(800);
			//});
			
			//fancybox para o site
			
			

});


