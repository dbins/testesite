
module.exports = function(app){ 

  const callback_pagarme = function(req, res, next){   

    transaction = req.body.transaction;

    if(!transaction)
      return next();

    app.api.service('sale-transactions')
    .find({query:{transaction_id: transactions.tid}})
    .then(result => {

      if(!result.total){
        return res.json({'error': "Sale Transaction not found"});
      }

      if(result.total > 1)
        return res.json({'error': "Duplicated sale transaction"});

      let status = undefined;

      switch(transaction.status){

      case 'paid': 
        status = 'APPROVED_WAITING';
        break;

      case 'refused':
        status = 'DENIED';
        break;

      case 'pending_refund':
      case 'refunded':
        status = 'REVERSE';
        break;

      case 'processing':
      case 'authorized':
      case 'waiting payment':
        status = 'WAITING_PAYMENT';
        break;

      case 'approved_delivered': 
        status = 'APPROVED_DELIVERED';
        break;    

      default:
        res.json({'error': "Unknown sale transaction status"});
      }

      app.api.service('sale-transactions')
      .patch(result[0]._id, { status_pagarme: status })
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