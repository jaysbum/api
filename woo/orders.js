var module = require('../module/lib')

async function orders(){
  return await module.woo.get('/orders')
}
async function products(){
  return await module.woo.get('/products')
}
async function wpcustomers(){
  return await module.woo.get('/customers')
}
async function customers(){
  let orders = await module.woo.get('/orders')
  let o = []
  for(res in orders.orders){
    o.push(orders.orders[res].customer)
  }
  return o
}
orders().then( data => {
  exports.orders = data
})
products().then( data => {
  exports.products = data
})
customers().then( data => {
  exports.customers = data
})
