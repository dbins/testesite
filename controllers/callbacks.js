
module.exports = function(app){ 

  const callback_pagarme = function(req, res, next){   

	transaction = req.body.transaction;
	console.log(transaction);
    if(!transaction)
      return next();

    app.api.service('sale-transactions')
    .find({query:{transaction_id: transaction.id}})
    .then(result => {

      console.log({query:{transaction_id: transaction.id}}, result);
      
      if(!result.total){
        return res.json({'error': "Sale Transaction not found"});
      }

      if(result.total > 1)
        return res.json({'error': "Duplicated sale transaction"});

      let status = undefined;

      const data = {};
      switch(transaction.status){

      case 'paid': 
        data.status_pagarme = 'APPROVED_WAITING';
        data.token = `${(Math.floor(Math.random()*900000) + 100000)}`;
        console.log("PAGO! data ")
        break;

      case 'refused':
    	  data.status_pagarme = 'DENIED';
        break;

      case 'pending_refund':
      case 'refunded':
    	  data.status_pagarme = 'REVERSE';
        break;

      case 'processing':
      case 'authorized':
      case 'waiting payment':
    	  data.status_pagarme = 'WAITING_PAYMENT';
        break;

      case 'approved_delivered': 
    	  data.status_pagarme = 'APPROVED_DELIVERED';
        break;    

      default:
        res.json({'error': "Unknown sale transaction status"});
      	console.log("Status pagarme não conhecido", data);
      }

      app.api.service('sale-transactions')
      .patch(result.data[0]._id, data )
      .then(result => {console.log("Mudança no callback",data, result);return result; })
      .then(result => res.json({status: 'ok'}))
      .catch(e => res.json({'error':'Cannot save sale transaction to the API'}));

    });
  }


  const callback_clearsale = function(req, res, next){

    if(!req.body.code || req.body.type)
      return next();

    app.api.service('sale-transactions')
    .find({query:{transaction_id: req.body.code}})
    .then(result => {

      if(!result.total)
        return res.json({'error': "Sale Transaction not found"});

      if(result.total > 1)
        return res.json({'error': "Duplicated sale transaction"});

      const transaction = result.data[0]; 
      const status = req.body.type;

      transaction.status_clearsale = status;

      app.api.service('sale-transactions')
      .update(transaction)
      .then(result => res.json({status: 'ok'}))
      .catch(e => res.json({'error':'Cannot save sale transaction to the API'}));

    });
  }

  app.post('/callback/pagarme', callback_pagarme);
  app.post('/callback/clearsale', callback_clearsale);

};