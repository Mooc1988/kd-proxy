const CronJob = require('cron').CronJob;
const client = require('../udp/client')
const {readCollected} = require('../service/readCollected')

exports.heartBeat = new CronJob('*/15 * * * * *', async function() {
  let {data, e} = await readCollected()
  if (e) console.error('readCollected error: ', e)
  let message = JSON.stringify(Object.assign({up:-1}, data))
  client.send(message, err => {if (err) console.error('send udp error: ', err)})
})