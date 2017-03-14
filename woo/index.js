var module = require('../module/lib')
var woo = require('./orders')

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
module.app.listen(3001)
console.log("app start at port 3001!!")
