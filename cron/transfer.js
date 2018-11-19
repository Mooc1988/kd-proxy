const CronJob = require('cron').CronJob;
const {fetchTransfer, fetchTransfer30Days} = require('../cmd')
const redis = require('../redis')
const client = require('../udp/client')


exports.sendTransfer = new CronJob('*/1 * * * *', async function() {
  try {
    const uuid = await redis.hget('meta', 'uuid')
    const token = await redis.hget('meta', 'token')
    if (!uuid || !token) return console.error(`sendTransfer err: uuid: ${uuid}, token: ${token}`)
    const {e, out} = await fetchTransfer({token, uuid})
    if (e) return console.error(e)
    let msg = `{"action":"transfer","out":"${out}","uuid":"${uuid}"}`
    console.log(msg)
    client.send(msg,  e => { e && console.error(e)})
  } catch (e) {
    console.error(e)
  }
})

exports.sendTransfer30Days = new CronJob('*/1 * * * *', async function() {
  try {
    const uuid = await redis.hget('meta', 'uuid')
    const token = await redis.hget('meta', 'token')
    if (!uuid || !token) return console.error(`sendTransfer err: uuid: ${uuid}, token: ${token}`)
    const {e, out} = await fetchTransfer30Days({token, uuid})
    if (e) return console.error(e)
    let msg = `{"action":"transfer","fields":"long_transfer","out":"${out}","uuid":"${uuid}"}`
    console.log(msg)
    client.send(msg,  e => { e && console.error(e)})
  } catch (e) {
    console.error(e)
  }
})