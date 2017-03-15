var module = require('../module/lib')
var wooApi = require('woocommerce')
setInterval(processOrders, 300000);
async function getChannel() {
    let response = await module.fetch("http://api.xcommerce.co.th/v1/channels/search?channel_type_id=11&status=1")
    let data = await response.json()
    return data
}

async function getListId() {
    let response = await module.fetch("http://api.xcommerce.co.th/v1/orders/search?channel_id=11")
    let data = await response.json()
    return data
}

function processOrders(){
  getChannel().then( data => {
    for(resp in data){
      var cfg = {
        url: data[resp].channel_url,
        ssl: true,
        consumerKey: data[resp].channel_username,
        secret: data[resp].channel_password
      }
      var woo = new wooApi(cfg)
      var config = { tenant_id:data[resp].tenant_id, channel_type_id:data[resp].channel_type_id}
      orders(woo,config)
    }
  })
}


function orders(woo,config){
  woo.get('/orders',function(err,result){
    for(resp in result.orders){
      var orderData = mapOrder(result.orders[resp],config)
      operate(orderData)
    }
  })
}

function mapOrder(data,cfg){
  var detailData = []
  for(res in data["line_items"]){
    detailData.push(mapDetail(data["line_items"][res]))
  }
  var params = JSON.stringify(detailData)
  return {
    order_number: data['id'],
    tenant_id: cfg.tenant_id,
    customer_id: null,
    customer_address_id: null,
    bill_name: data["billing_address"]["first_name"] + " " + data["billing_address"]["last_name"],
    note: data["customer_note"],
    dt_created: new Date(data["created_at"]).getTime() / 1000,
    dt_modified: new Date(data["updated_at"]).getTime() / 1000,
    dt_process: new Date(data["completed_at"]).getTime() / 1000,
    order_status_id: null,
    total: parseFloat(data["total"]),
    main_discount: parseFloat(data["discount_total"]),
    sub_total: parseFloat(data['subtotal']),
    tax_type: null,
    vat_amount: parseFloat(data["total_tax"]),
    admin_id: null,
    channel_id: cfg.channel_type_id,
    channel_order_id: data['order_id'],
    channel_order_number: data['increment_id'],
    customer_platform: null,
    is_preorder: null,
    is_print_packinglist: null,
    is_print_ship_label: null,
    shipping_price_id: null,
    shipping_price: data["total_shipping"],
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
    ip_address: data["customer_ip"],
    sync_order_id: data['id'],
    sync_detail: params,
    sync_status: data["status"],
    sync_customer_telephone:data["customer"]["billing_address"]["phone"],
    sync_payment_method:data["payment_details"]["method_title"],
    sync_payment_date:new Date(data["date_paid"]).getTime() / 1000,
    sync_billing_address:data["customer"]["billing_address"]["address_1"]+" "+data["customer"]["billing_address"]["address_2"]+" "+data["customer"]["billing_address"]["city"],
    sync_billing_address_postcode:data["customer"]["billing_address"]["postcode"],
    sync_shipping_address:data["customer"]["shipping_address"]["address_1"]+" "+data["customer"]["shipping_address"]["address_2"]+" "+data["customer"]["shipping_address"]["city"],
    sync_shipping_address_postcode:data["customer"]["shipping_address"]["postcode"],
    sync_shipper:data["shipping_lines"][0]["method_title"],
    sync_shipping_type:data["shipping_lines"][0]["method_id"],
  }
}
function mapDetail(data){
  return {
    "product_id": data["id"],
    "product_sku": data["sku"],
    "product_name": data["name"],
    "product_qty": data["quantity"],
    "product_price": data["total"],
    "product_discount": null,
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
//}
/*module.app.use(module.pretty({ query: 'pretty' }))
module.app.get("/orders",function(reg,res){
  res.send(woo.orders)
})
module.app.get("/products",function(reg,res){
  res.send(woo.products)
})
module.app.get("/customers",function(reg,res){
  res.send(woo.customers)
})
module.app.listen(3001)
console.log("app start at port 3001!!")*/
