var module = require('./lib')

async function getChannel() {
  let response = await module.fetch("http://api.xcommerce.dev/v1/channels/search?channel_type_id=2&status=1")
  let data = await response.json()
  return data
}

getChannel().then( data => {
  exports.lazada_channel = "test"
})
