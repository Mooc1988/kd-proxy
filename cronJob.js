const CronJob = require('cron').CronJob
const command = require('./command')
const client = require('./udp/client')

const job = new CronJob({
  cronTime: '*/15 * * * * *',
  onTick: function () {
    // todo: delete demo code
    // let message = `{"type":"pay","up":"1","conn":"10","mem":"1024"}`
    // return client.send(message, function (err) {})
    command.getConn(function (err, res) {
      if (err) {
        let message = `hb:error`
        client.send(message, function (err) {
        })
        return
      }
      let {up, connecting, mem} = res
      let nodeType = process.env.NODE_TYPE
      let message = `{"type":"${nodeType}","up":${up},"conn":${connecting},"mem":${mem}}`
      client.send(message, function (err) {

      })
    })
  },
  start: false,
})
job.start()
module.exports = job
