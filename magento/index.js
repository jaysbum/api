var module = require('../module/lib')
var magento = require('./orders')
var MagentoAPI = require('magento')
setInterval(processOrders, 120000);
async function getChannel() {
    let response = await module.fetch("http://api.xcommerce.co.th/v1/channels/search?channel_type_id=11&status=1")
    let data = await response.json()
    return data
}

function processOrders(){
  getChannel().then( data => {
    for(resp in data){
      var cfg = {
        host: data[resp].channel_url,
        port: 80,
        path: '/api/xmlrpc/',
        login: data[resp].channel_username,
        pass: data[resp].channel_password
      }
      var magento = new MagentoAPI(cfg)
      var config = { tenant_id:data[resp].tenant_id, channel_type_id:data[resp].channel_type_id}
      //console.log(magento.orders);
      orders(magento,config)
    }
  })
}

function orders(magento,config){
  module.magento.login(function(err, sessId) {
    module.magento.salesOrder.list({ filters: { created_at: { gteq: '2017-03-01 00:00:01' }}},function(err, result) {
      for(resp in result){
        module.magento.salesOrder.info({ orderIncrementId: result[resp].increment_id },function(err, res) {
          var orderData = mapOrder(res,config)
          operate(orderData)
        })
      }
    })
  })
}

function mapOrder(data,cfg){
  var detailData = []
  for(res in data["items"]){
    detailData.push(mapDetail(data["items"][res]))
  }
  var params = JSON.stringify(detailData)
  return {
    order_number: data['increment_id'],
    tenant_id: cfg.tenant_id,
    customer_id: null,
    customer_address_id: null,
    bill_name: data['customer_firstname'] +" " + data['customer_lastname'],
    note: null,
    dt_created: new Date(data["created_at"]).getTime() / 1000,
    dt_modified: new Date(data["updated_at"]).getTime() / 1000,
    dt_process: new Date(data["updated_at"]).getTime() / 1000,
    order_status_id: null,
    total: parseFloat(data['grand_total']),
    main_discount: parseFloat(data['discount_amount']),
    sub_total: parseFloat(data['subtotal']),
    tax_type: null,
    vat_amount: parseFloat(data['tax_amount']),
    admin_id: null,
    channel_id: cfg.channel_type_id,
    channel_order_id: data['order_id'],
    channel_order_number: data['increment_id'],
    customer_platform: null,
    is_preorder: null,
    is_print_packinglist: null,
    is_print_ship_label: null,
    shipping_price_id: null,
    shipping_price: null,
    payment_type_id: null,
    note_in_receipt: null,
    note_in_ship_label: null,
    status_sync: null,
    vat_type_id: null,
    customer_id_number: null,
    payment_slip_image: null,
    payment_date: null,
    payment_confirm_status: null,
    payment_ref_code: null,
    cod_price: null,
    cod_receive_price: null,
    shipper_id: null,
    store_id: null,
    channel_account_name: null,
    tenant_bank_account_id: null,
    status: null,
    ip_address: data['remote_ip'],
    sync_order_id: data['increment_id'],
    sync_detail: params,
    sync_status: data['status'],
    sync_customer_telephone:data['billing_address']['telephone'],
    sync_payment_method:data['payment']['method'],
    sync_payment_date:null,
    sync_billing_address:data['billing_address']['street']+' '+data['billing_address']['city']+' '+data['billing_address']['region'],
    sync_billing_address_postcode:data['billing_address']['postcode'],
    sync_shipping_address:data['shipping_address']['street']+' '+data['shipping_address']['city']+' '+data['shipping_address']['region'],
    sync_shipping_address_postcode:data['shipping_address']['postcode'],
    sync_shipper:null,
    sync_shipping_type:null,
  }
}
function mapDetail(data){
  return {
    "product_id": data["item_id"],
    "product_sku": data["sku"],
    "product_name": data["name"],
    "product_qty": data["qty_ordered"],
    "product_price": data["price"],
    "product_discount": data["discount_amount"],
  }
}
function PostData(data) {
  var post_data = module.querystring.stringify(data);
  var post_options = {
      host: 'api.xcommerce.co.th',
      port: '80',
      path: '/v1/orders',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };
  var post_req = module.http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Post Response: ' + chunk);
      });
  });
  post_req.write(post_data);
  post_req.end();

}
function PutData(data,id) {
  var post_data = module.querystring.stringify(data);
  var post_options = {
      host: 'api.xcommerce.co.th',
      port: '80',
      path: '/v1/orders/' + id,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data)
      }
  };
  var post_req = module.http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Put Response: ' + chunk);
      });
  });
  post_req.write(post_data);
  post_req.end();

}
function operate(data){
  module.http.get('http://api.xcommerce.co.th/v1/orders/'+ data.sync_order_id,function(response){
    if(response.statusCode == 200){
      PutData(data,data.sync_order_id)
    }else{
      PostData(data)
    }
  })
}
/*
module.app.use(module.pretty({ query: 'pretty' }))
module.app.get("/orders",function(reg,res){
  res.send(woo.orders)
})
module.app.get("/products",function(reg,res){
  res.send(woo.products)
})
module.app.get("/customers",function(reg,res){
  res.send(woo.customers)
})
module.app.get("/detail",function(reg,res){
  res.send(woo.detail)
})
module.app.listen(3002)
console.log("app start at port 3002!!")
*/
