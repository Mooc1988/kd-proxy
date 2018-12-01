const CronJob = require('cron').CronJob;
const redis = require('../redis')
const {fetchTransfer, fetchTransfer30Days} = require('../cmd')

exports.cacheTransfer = new CronJob('*/5 * * * *', async function() {
  try {
    let uuid = await redis.hget('meta', 'uuid')
    let token = await redis.hget('meta', 'token')

    if (!uuid || !token) return console.error(`sendTransfer err: uuid: ${uuid}, token: ${token}`)
    const {e, out} = await fetchTransfer({token, uuid})
    if (e) return console.error(e)

    await redis.set('transfer', out, 'EX', 600)
    console.log('cached transfer: ', out)

  } catch (e) {
    console.error(e)
  }
})

exports.cacheTransfer30Days = new CronJob('0 */2 * * *', async function() {
  try {
    let uuid = await redis.hget('meta', 'uuid')
    let token = await redis.hget('meta', 'token')

    if (!uuid || !token) return console.error(`sendTransfer err: uuid: ${uuid}, token: ${token}`)
    const {e, out} = await fetchTransfer30Days({token, uuid})
    if (e) return console.error(e)

    await redis.set('long_transfer', out, 'EX', 10800)
    console.log('cached long_transfer: ', out)

  } catch (e) {
    console.error(e)
  }
})