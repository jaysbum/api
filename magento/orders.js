var module = require('../module/lib')
//var module = require('./index')

module.magento.login(function(err, sessId) {
  module.magento.salesOrder.list({ filters: { created_at: { gteq: '2017-02-25 16:00:01' }}},function(err, result) {
    async function orders(){
      return result
    }
    orders().then( data => {
      exports.orders = data
    })
  })
  module.magento.customer.list(function(err, result) {
    async function customers(){
      return result
    }
    customers().then( data => {
      exports.customers = data
    })
  })
  module.magento.salesOrder.list({ filters: { status: { eq: "pending" }}},function(err, result) {
    async function detail(){
      let out = []
      for(res in result){
        let detail = await module.magento.salesOrder.info({ orderIncrementId: result[res].increment_id },function(err, res) {

        })
      }
      return detail
    }
    detail().then( data => {
      exports.detail = data
    })
  })
  module.magento.catalogProduct.list(function(err, result) {
    async function products(){
      return result
    }
    products().then( data => {
      exports.products = data
    })
  })
})
