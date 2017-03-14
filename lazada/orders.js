var module = require('../module/lib')

exports.getOrdersUrl = (data) =>{
  const timestamp = encodeURIComponent(module.moment().format())
  //const uid = encodeURIComponent('nextcommerce.inc@gmail.com')
  const uid = encodeURIComponent(data.userId)
  //const apiKey = 'b75a2702207d4709e53d5d07a318be734fec56d4'
  const apiKey = data.apiKey
  var concated = 'Action=GetOrders&CreatedAfter=2014-02-25T23%3A46%3A11%2B00%3A00&Format=json&Timestamp='+ timestamp +'&UserID='+ uid +'&Version=1.0'
  const signature = module.createSignatureHash(concated, apiKey);
  const GET_ORDERS_URL = 'https://api.sellercenter.lazada.co.th?' + concated + '&Signature=' + signature
  return GET_ORDERS_URL
}
exports.getOrderItemsUrl = (data,id) =>{
  const timestamp = encodeURIComponent(module.moment().format())
  const uid = encodeURIComponent(data.userId)
  const apiKey = data.apiKey
  var concated = 'Action=GetOrderItems&Format=json&OrderId='+ id +'&Timestamp='+ timestamp +'&UserID='+ uid +'&Version=1.0'
  const signature = module.createSignatureHash(concated, apiKey);
  const GET_ITEMS_URL = 'https://api.sellercenter.lazada.co.th?' + concated + '&Signature=' + signature
  return GET_ITEMS_URL
}
/*
function orderItems(){
  var concated = 'Action=GetOrders&CreatedAfter=2014-02-25T23%3A46%3A11%2B00%3A00&Format=json&Timestamp='+ timestamp +'&UserID='+ uid +'&Version=1.0'

  const signature = module.createSignatureHash(concated, apiKey);
  const GET_ORDERS_URL = 'https://api.sellercenter.lazada.co.th?' + concated + '&Signature=' + signature
  module.request(GET_ORDERS_URL, function (error, response, body) {
    res = JSON.parse(body);
    //async function orders(){
      var orderId = '[';
      for(i in res.SuccessResponse.Body.Orders){
        if(i == (res.SuccessResponse.Body.Orders.length - 1)){
          orderId += res.SuccessResponse.Body.Orders[i].OrderId
        }else{
          orderId += res.SuccessResponse.Body.Orders[i].OrderId +","
        }
      }
      orderId += ']';
      const oid = encodeURIComponent(orderId)
      var concated = 'Action=GetMultipleOrderItems&Format=json&OrderIdList='+ oid +'&Timestamp='+ timestamp +'&UserID='+ uid +'&Version=1.0'
      const sign = module.createSignatureHash(concated, apiKey);
      const GET_ORDERS_URL = 'https://api.sellercenter.lazada.co.th?' + concated + '&Signature=' + sign
      module.request(GET_ORDERS_URL, function (error, response, body) {
        res = JSON.parse(body);
        async function orderItems(){
          return res.SuccessResponse.Body.Orders.OrderItems
        }
        orderItems().then( data => {
          exports.orderItems = data
          //console.log(data);
        })
      })
    //}
  });
}

function products(){
  var concated = 'Action=GetProducts&Filter=all&Format=json&Timestamp='+ timestamp +'&UserID='+ uid +'&Version=1.0'

  const signature = module.createSignatureHash(concated, apiKey);
  const GET_ORDERS_URL = 'https://api.sellercenter.lazada.co.th?' + concated + '&Signature=' + signature
  module.request(GET_ORDERS_URL, function (error, response, body) {
    res = JSON.parse(body);
    async function products(){
      return res.SuccessResponse.Body.Products
    }
    products().then( data => {
      exports.products = data
      //console.log(data);
    })
  });
}

products()
//orders()
orderItems()
*/
