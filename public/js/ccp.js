function verifica_data_valida (campo) { 

	dia = parseInt(campo.substring(0,2)); 
	mes = parseInt(campo.substring(3,5)); 
	ano = parseInt(campo.substring(6,10)); 
	
	
	situacao = true; 
	if ((dia < 1)||(dia < 1 || dia > 30) && (  mes == 4 || mes == 6 || mes == 9 || mes == 11 ) || dia > 31) { 
		situacao =  false; 
	} 
	
	if (mes < 1 || mes > 12 ) { 
		situacao = false; 
	} 
	
	if (mes == 2 && ( dia < 1 || dia > 29 || ( dia > 28 && (parseInt(ano / 4) != ano / 4)))) { 
		situacao = false; 
	} 
	
	if (dia == "") { 
		situacao = false; 
	} 
		
	if (mes == "") { 
		situacao = false; 
	} 
	
	if (ano == "") { 
		situacao = false; 
	} 

	return situacao;
}

function alphanumeric(inputtxt) {    
	var letters = /^[0-9a-zA-Z]+$/;   
	if(inputtxt.value.match(letters)) {   
		return true;   
	} else {   
		return false;   
	}   
} 

 function isNumberKey(evt) {
	 var charCode = (evt.which) ? evt.which : event.keyCode
	 if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	 return true;
}

function IsCEP(strCEP)  {
  
	if (strCEP.length<8)
	return false;
  
	re = /#@?$%~|00000000|11111111|22222222|33333333|44444444|55555555|66666666|77777777|88888888|99999999/gi;
    if(re.test(strCEP)){
	     return false;
   }else{
     return true;
   }
}


function checaCPF (CPF) {
	if (CPF.length != 11 || CPF == "00000000000" || CPF == "11111111111" ||
		CPF == "22222222222" ||	CPF == "33333333333" || CPF == "44444444444" ||
		CPF == "55555555555" || CPF == "66666666666" || CPF == "77777777777" ||
		CPF == "88888888888" || CPF == "99999999999" || CPF == "01234567890")
		return false;
	soma = 0;
	for (i=0; i < 9; i ++)
		soma += parseInt(CPF.charAt(i)) * (10 - i);
	resto = 11 - (soma % 11);
	if (resto == 10 || resto == 11)
		resto = 0;
	if (resto != parseInt(CPF.charAt(9)))
		return false;
	soma = 0;
	for (i = 0; i < 10; i ++)
		soma += parseInt(CPF.charAt(i)) * (11 - i);
	resto = 11 - (soma % 11);
	if (resto == 10 || resto == 11)
		resto = 0;
	if (resto != parseInt(CPF.charAt(10)))
		return false;
       
	return true;
 }


function echeck(str) {

	var at="@"
	var dot="."
	var lat=str.indexOf(at)
	var lstr=str.length
	var ldot=str.indexOf(dot)
	if (str.indexOf(at)==-1){
	   //alert("Invalid E-mail ID")
	   return false
	}

	if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr){
	   //alert("Invalid E-mail ID")
	   return false
	}

	if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr){
		//alert("Invalid E-mail ID")
		return false
	}

	 if (str.indexOf(at,(lat+1))!=-1){
		//alert("Invalid E-mail ID")
		return false
	 }

	 if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
		//alert("Invalid E-mail ID")
		return false
	 }

	 if (str.indexOf(dot,(lat+2))==-1){
		//alert("Invalid E-mail ID")
		return false
	 }
	
	 if (str.indexOf(" ")!=-1){
		//alert("Invalid E-mail ID")
		return false
	 }

	 return true					
}



function checkform_cadastro_newsletter (form){

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n"
	
	if (form.email.value == "") {
		mensagem = mensagem + 'Por favor informe o seu e-mail\n';
		form.email.style.backgroundColor='#FFFF99';
		continuar = false;
	}	else {
			if (echeck(form.email.value)==false){
				mensagem = mensagem + 'Preencha corretamente o endereco de e-mail\n';
				continuar = false;
			}
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}			
	
}


function checkform_cadastro (form){
	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n"
	
	if (form.nome.value == "") {
		mensagem = mensagem + 'Por favor informe seu nome\n';
		form.nome.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.sobrenome.value == "") {
		mensagem = mensagem + 'Por favor informe seu sobrenome\n';
		form.sobrenome.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.CPF.value == "") {
		mensagem = mensagem + 'Preencha o CPF\n';
		form.CPF.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		var tmp_CPF = form.CPF.value;
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace("-", "");
		//alert(tmp_CPF);
		if (checaCPF (tmp_CPF)==false){
			mensagem = mensagem +  'O CPF foi preenchido de forma incorreta\n';
			continuar = false;
		} 		
	}

	if (form.email.value == "") {
		mensagem = mensagem + 'Por favor informe o seu e-mail\n';
		form.email.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (echeck(form.email.value)==false){
			mensagem = mensagem + 'Preencha corretamente o endereco de e-mail\n';
			continuar = false;
		}
	}	
	
	if (form.genero.value == "") {
		mensagem = mensagem + 'Por favor informe o genero\n';
		form.genero.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.aniversario.value == "" || form.aniversario.value == "DD/MM/AAAA") {
		mensagem = mensagem + 'Preencha a data de nascimento\n';
		form.aniversario.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (verifica_data_valida(form.aniversario.value)==false){
			mensagem = mensagem + 'A data está num formato inválido.\n';
			form.aniversario.style.backgroundColor='#FFFF99';
			continuar = false;
		} 
	}
	
	if (form.ddd.value == "") {
		mensagem = mensagem + 'Preencha o DDD do telefone celular\n';
		form.ddd.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (form.ddd.value.length == 1){
			mensagem = mensagem + 'O DDD do telefone celular foi preenchido de forma incorreta\n';
			form.ddd.style.backgroundColor='#CCCCCC';
			continuar = false;
		}
	}
	
	
	if (form.telefone.value == "") {
		mensagem = mensagem + 'Preencha o numero do telefone celular\n';
		form.telefone.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (form.telefone.value.length < 8){
			mensagem = mensagem + 'O telefone celular informado não possui a quantidade de números correta\n';
			form.telefone.style.backgroundColor='#CCCCCC';
			continuar = false;
		} else {
			var str = form.telefone.value;
			var digito = str.charAt(0);
			if (digito == "6" || digito == "7" || digito == "8" || digito == "9"){
				//Nao faz nada
			} else {
				mensagem = mensagem + 'O telefone celular informado está incorreto\n';
				form.telefone.style.backgroundColor='#CCCCCC';
				continuar = false;
			}
		}
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
		
	
}	

function checkform_endereco (form) {

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n";
	
	if (form.CEP.value == "") {
		mensagem = mensagem + 'Preencha o CEP\n';
		form.CEP.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (IsCEP(form.CEP.value)) {
			// O CEP é válido;
		} else {
			mensagem = mensagem + 'O CEP esta preenchido de forma incorreta\n';
			form.CEP.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	}
	
	if (form.CEP.value == "0") {
		mensagem = mensagem + 'O CEP nao pode ser zero\n';
		form.CEP.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.endereco.value == "") {
		mensagem = mensagem + 'Preencha o endereço residencial\n';
		form.endereco.style.backgroundColor='#FFFF99';
		continuar = false;
	} 	
	
	if (form.numero.value == "") {
		mensagem = mensagem + 'Preencha o número do endereço residencial\n';
		form.numero.style.backgroundColor='#FFFF99';
		continuar = false;
	}
		
	if (form.numero.value == "0") {
		mensagem = mensagem + 'O número do endereço residencial não pode ser zero\n';
		form.numero.style.backgroundColor='#FFFF99';
		continuar = false;
	}
		
	if (form.bairro.value == "") {
		mensagem = mensagem + 'Preencha o bairro\n';
		form.bairro.style.backgroundColor='#FFFF99';
		continuar = false;
	} 
	
	if (form.cidade.value == "") {
		mensagem = mensagem + 'Escolha a cidade\n';
		form.cidade.style.backgroundColor='#FFFF99';
		continuar = false;
		} else {
			if (form.cidade.value == "Escolha a cidade") {
			mensagem = mensagem + 'A cidade precisa ser informada\n';
			form.cidade.style.backgroundColor='#FFFF99';
			continuar = false;
		} 
	}
		
	if (form.estado.value=="") {
		mensagem = mensagem + 'O estado precisa ser informado\n';
		form.estado.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}

}

function checkform_senha (form) {

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n";
	
	if (form.senha_atual.value == "") {
		mensagem = mensagem + 'Informe a sua senha atual\n';
		form.senha_atual.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.senha.value == "") {
		mensagem = mensagem + 'Informe a sua nova senha\n';
		form.senha.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (alphanumeric(form.senha)){
			//Nao faz nada
		} else {
			mensagem = mensagem + 'A nova senha deve possuir apenas letras ou números!\n';
			form.senha.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	}
		
	if (form.confirmar_senha.value == "") {
		mensagem = mensagem + 'Informe a confirmação da nova senha\n';
		form.confirmar_senha.style.backgroundColor='#FFFF99';
		continuar = false;
	}

	if (form.senha.value == form.confirmar_senha.value) {
		if (form.senha.value.length < 6) {
			mensagem = mensagem + 'A nova senha deve ter pelo menos 6 caracteres\n';
			form.senha.style.backgroundColor='#FFFF99';
			form.confirmar_senha.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	} else {
		mensagem = mensagem + 'A nova senha e a confirmação da senha devem ser iguais\n';
		form.senha.style.backgroundColor='#FFFF99';
		form.confirmar_senha.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
	
}	


function checkform_endereco_pagamento (form) {

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n";
	
	if (form.CEP.value == "") {
		mensagem = mensagem + 'Preencha o CEP\n';
		form.CEP.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (IsCEP(form.CEP.value)) {
			// O CEP é válido;
		} else {
			mensagem = mensagem + 'O CEP esta preenchido de forma incorreta\n';
			form.CEP.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	}
	
	if (form.CEP.value == "0") {
		mensagem = mensagem + 'O CEP nao pode ser zero\n';
		form.CEP.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.endereco.value == "") {
		mensagem = mensagem + 'Preencha o endereço residencial\n';
		form.endereco.style.backgroundColor='#FFFF99';
		continuar = false;
	} 	
	
	if (form.numero.value == "") {
		mensagem = mensagem + 'Preencha o número do endereço residencial\n';
		form.numero.style.backgroundColor='#FFFF99';
		continuar = false;
	}
		
	if (form.numero.value == "0") {
		mensagem = mensagem + 'O número do endereço residencial não pode ser zero\n';
		form.numero.style.backgroundColor='#FFFF99';
		continuar = false;
	}
		
	if (form.bairro.value == "") {
		mensagem = mensagem + 'Preencha o bairro\n';
		form.bairro.style.backgroundColor='#FFFF99';
		continuar = false;
	} 
	
	if (form.cidade.value == "") {
		mensagem = mensagem + 'Escolha a cidade\n';
		form.cidade.style.backgroundColor='#FFFF99';
		continuar = false;
		} else {
			if (form.cidade.value == "Escolha a cidade") {
			mensagem = mensagem + 'A cidade precisa ser informada\n';
			form.cidade.style.backgroundColor='#FFFF99';
			continuar = false;
		} 
	}
		
	if (form.estado.value=="") {
		mensagem = mensagem + 'O estado precisa ser informado\n';
		form.estado.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.aceite.checked==false) {
		mensagem = mensagem + 'Voce precisa aceitar os termos\n';
		continuar = false;
	}	
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}

}

function checkform_login (form) {

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n";
	
	if (form.CPF.value == "") {
		mensagem = mensagem + 'Preencha o CPF\n';
		form.CPF.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		var tmp_CPF = form.CPF.value;
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace("-", "");
		//alert(tmp_CPF);
		if (checaCPF (tmp_CPF)==false){
			mensagem = mensagem +  'O CPF foi preenchido de forma incorreta\n';
			continuar = false;
		} 		
	}
	
	if (form.senha.value == "") {
		mensagem = mensagem + 'Informe a sua senha\n';
		form.senha.style.backgroundColor='#FFFF99';
		continuar = false;
	} 
		
	if (form.senha.value.length < 6) {
		mensagem = mensagem + 'A  senha deve ter pelo menos 6 caracteres\n';
		form.senha.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
	
}	


function checkform_lembrar_senha (form) {

	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n";
	
	if (form.CPF.value == "") {
		mensagem = mensagem + 'Preencha o CPF\n';
		form.CPF.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		var tmp_CPF = form.CPF.value;
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace("-", "");
		//alert(tmp_CPF);
		if (checaCPF (tmp_CPF)==false){
			mensagem = mensagem +  'O CPF foi preenchido de forma incorreta\n';
			continuar = false;
		} 		
	}
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
	
}	


function checkform_novo_cadastro (form){
	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n"
	
	if (form.nome.value == "") {
		mensagem = mensagem + 'Por favor informe seu nome\n';
		form.nome.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.sobrenome.value == "") {
		mensagem = mensagem + 'Por favor informe seu sobrenome\n';
		form.sobrenome.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.CPF.value == "") {
		mensagem = mensagem + 'Preencha o CPF\n';
		form.CPF.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		var tmp_CPF = form.CPF.value;
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace(".", "");
		tmp_CPF = tmp_CPF.replace("-", "");
		//alert(tmp_CPF);
		if (checaCPF (tmp_CPF)==false){
			mensagem = mensagem +  'O CPF foi preenchido de forma incorreta\n';
			continuar = false;
		} 		
	}

	if (form.email.value == "") {
		mensagem = mensagem + 'Por favor informe o seu e-mail\n';
		form.email.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (echeck(form.email.value)==false){
			mensagem = mensagem + 'Preencha corretamente o endereco de e-mail\n';
			continuar = false;
		}
	}	
	
	
	if (form.aniversario.value == "" || form.aniversario.value == "DD/MM/AAAA") {
		mensagem = mensagem + 'Preencha a data de nascimento\n';
		form.aniversario.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (verifica_data_valida(form.aniversario.value)==false){
			mensagem = mensagem + 'A data está num formato inválido.\n';
			form.aniversario.style.backgroundColor='#FFFF99';
			continuar = false;
		} 
	}
	
	if (form.ddd.value == "") {
		mensagem = mensagem + 'Preencha o DDD do telefone celular\n';
		form.ddd.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (form.ddd.value.length == 1){
			mensagem = mensagem + 'O DDD do telefone celular foi preenchido de forma incorreta\n';
			form.ddd.style.backgroundColor='#CCCCCC';
			continuar = false;
		}
	}
	
	
	if (form.telefone.value == "") {
		mensagem = mensagem + 'Preencha o numero do telefone celular\n';
		form.telefone.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (form.telefone.value.length < 8){
			mensagem = mensagem + 'O telefone celular informado não possui a quantidade de números correta\n';
			form.telefone.style.backgroundColor='#CCCCCC';
			continuar = false;
		} else {
			var str = form.telefone.value;
			var digito = str.charAt(0);
			if (digito == "6" || digito == "7" || digito == "8" || digito == "9"){
				//Nao faz nada
			} else {
				mensagem = mensagem + 'O telefone celular informado está incorreto\n';
				form.telefone.style.backgroundColor='#CCCCCC';
				continuar = false;
			}
		}
	}
	
	if (form.senha.value == "") {
		mensagem = mensagem + 'Informe a sua nova senha\n';
		form.senha.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (alphanumeric(form.senha)){
			//Nao faz nada
		} else {
			mensagem = mensagem + 'A nova senha deve possuir apenas letras ou números!\n';
			form.senha.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	}
		
	if (form.confirmar_senha.value == "") {
		mensagem = mensagem + 'Informe a confirmação da nova senha\n';
		form.confirmar_senha.style.backgroundColor='#FFFF99';
		continuar = false;
	}

	if (form.senha.value == form.confirmar_senha.value) {
		if (form.senha.value.length < 6) {
			mensagem = mensagem + 'A nova senha deve ter pelo menos 6 caracteres\n';
			form.senha.style.backgroundColor='#FFFF99';
			form.confirmar_senha.style.backgroundColor='#FFFF99';
			continuar = false;
		}
	} else {
		mensagem = mensagem + 'A nova senha e a confirmação da senha devem ser iguais\n';
		form.senha.style.backgroundColor='#FFFF99';
		form.confirmar_senha.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.aceite.checked==false) {
		mensagem = mensagem + 'Voce precisa aceitar os termos\n';
		continuar = false;
	}	
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
		
	
}	




function checkform_informacoes (form){
	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n"
	
	if (form.nome.value == "") {
		mensagem = mensagem + 'Por favor informe seu nome\n';
		form.nome.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.telefone.value == "") {
		mensagem = mensagem + 'Por favor informe seu sobrenome\n';
		form.telefone.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.email.value == "") {
		mensagem = mensagem + 'Por favor informe o seu e-mail\n';
		form.email.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (echeck(form.email.value)==false){
			mensagem = mensagem + 'Preencha corretamente o endereco de e-mail\n';
			continuar = false;
		}
	}	
	
	if (form.tipo.value == "") {
		mensagem = mensagem + 'Por favor informe o tipo de contato\n';
		form.tipo.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.mensagem.value == "") {
		mensagem = mensagem + 'Por favor informe o tipo de mensagem\n';
		form.mensagem.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
		
	
}	


function checkform_contato (form){
	var continuar = true;
	var mensagem = "Ocorreram os seguintes erros:\n"
	
	if (form.nome.value == "") {
		mensagem = mensagem + 'Por favor informe seu nome\n';
		form.nome.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.telefone.value == "") {
		mensagem = mensagem + 'Por favor informe seu sobrenome\n';
		form.telefone.style.backgroundColor='#FFFF99';
		continuar = false;
	}
	
	if (form.email.value == "") {
		mensagem = mensagem + 'Por favor informe o seu e-mail\n';
		form.email.style.backgroundColor='#FFFF99';
		continuar = false;
	} else {
		if (echeck(form.email.value)==false){
			mensagem = mensagem + 'Preencha corretamente o endereco de e-mail\n';
			continuar = false;
		}
	}	
	
	if (form.tipo.value == "") {
		mensagem = mensagem + 'Por favor informe o tipo de contato\n';
		form.tipo.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	if (form.mensagem.value == "") {
		mensagem = mensagem + 'Por favor informe o tipo de mensagem\n';
		form.mensagem.style.backgroundColor='#FFFF99';
		continuar = false;
	}	
	
	
	if (continuar) {
		return true;
	} else {
		alert(mensagem);
		return false;
	}
		
	
}	
