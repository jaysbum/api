var module = require('../module/lib')
var lazada = require('./orders')
setInterval(processOrders, 120000);
async function getChannel() {
    let response = await module.fetch("http://api.xcommerce.co.th/v1/channels/search?channel_type_id=2&status=1")
    let data = await response.json()
    return data
}
function processOrders(){
getChannel().then( data => {
  for(resp in data){
    var config = { userId:data[resp].channel_username, apiKey:data[resp].channel_password, tenant_id:data[resp].tenant_id, channel_type_id:data[resp].channel_type_id}
    orders(config)
  }
})
}
/* Orders */
async function getOrders(config) {
    let response = await module.fetch(lazada.getOrdersUrl(config))
    let data = await response.json()
    return data.SuccessResponse.Body.Orders
}
/* Order Items */
async function getOrderItems(config,id) {
    let response = await module.fetch(lazada.getOrderItemsUrl(config,id))
    let detail = await response.json()
    return detail.SuccessResponse.Body.OrderItems
}

function orders(config){
  getOrders(config).then( data => {
    module.http.get('http://api.xcommerce.co.th/v1/orders/search?tenant_id='+ config.tenant_id +'&channel_id='+config.channel_type_id,function(response){
      if(response.statusCode == 404){
        for(resp in data){
            operate(data[resp],config)
        }
      }else{
        for(resp in data){
          if(!(data[resp]['Statuses'][0]=='delivered' || data[resp]['Statuses'][0] == "canceled" || data[resp]['Statuses'][0] == "returned")){
            operate(data[resp],config)
          }
        }
      }
    })
  })
}

function mapOrder(data,cfg){
  return {
    order_number: data['OrderNumber'],
    tenant_id: cfg.tenant_id,
    customer_id: null,
    customer_address_id: null,
    bill_name: data['CustomerFirstName'] +" " + data['CustomerLastName'],
    note: null,
    dt_created: new Date(data["CreatedAt"]).getTime() / 1000,
    dt_modified: new Date(data["UpdatedAt"]).getTime() / 1000,
    dt_process: new Date(data["UpdatedAt"]).getTime() / 1000,
    order_status_id: null,
    total: parseFloat(data['Price']),
    main_discount: null,
    sub_total: null,
    tax_type: null,
    vat_amount: null,
    admin_id: null,
    channel_id: cfg.channel_type_id,
    channel_order_id: data['OrderId'],
    channel_order_number: data['OrderNumber'],
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
    ip_address: null,
    sync_order_id: data['OrderId'],
    sync_detail: null,
    sync_status: data['Statuses'][0],
    sync_customer_telephone:data['AddressBilling']["Phone"],
    sync_payment_method:data['PaymentMethod'],
    sync_payment_date:null,
    sync_billing_address:data['AddressBilling']["Address1"] + " " + data['AddressBilling']["Address2"],
    sync_billing_address_postcode:data['AddressBilling']["PostCode"],
    sync_shipping_address:data['AddressShipping']["Address1"] + " " + data['AddressShipping']["Address2"],
    sync_shipping_address_postcode:data['AddressShipping']["PostCode"],
    sync_shipper:"Kerry Express",
    sync_shipping_type:"Flat rate",
  }
}
function mapDetail(data){
  return {
    "product_id": null,
    "product_sku": data["Sku"],
    "product_name": data["Name"],
    "product_qty": null,
    "product_price": data["ItemPrice"],
    "product_discount": data["ItemPrice"] - data["PaidPrice"],
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
function operate(data,config){
  module.http.get('http://api.xcommerce.co.th/v1/orders/'+ data.OrderId,function(response){
    var orderData = mapOrder(data,config)
    if(response.statusCode == 200){
      PutData(orderData,data.OrderId)
    }else{
      PostData(orderData)
    }
    /// insert orderItems from firstPost
    getOrderItems(config,data.OrderId).then( detail => {
      var detailData = []
      for(res in detail){
        detailData.push(mapDetail(detail[res]))
      }
      var params = { "sync_detail" : JSON.stringify(detailData) }
      PutData(params,data.OrderId)
    })
    /// end insert
  })
}
