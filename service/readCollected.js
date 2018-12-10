const redis = require('../redis')

function collectValue () {
  const {date, hour} = getTimeKey()
  const yesterday = getYesterday()

  console.log(date, hour)

  const map = new Map([
    ['up', 'ipsec:up'],
    ['mem', 'mem'],
    ['hourTransfer', `tr:${date}${hour}`],
    ['dayTransfer', `tr:${date}`],
    ['yesterdayTransfer', `tr:${yesterday}`],
    ['reduced', `transferReduced:${new Date().getDate()}`]
  ])

  // console.log('map: ', map)

  const readCollection = `
    local up=redis.call("get",ARGV[1])
    local mem=redis.call("get",ARGV[2])
    local hourTransfer=redis.call("get",ARGV[3])
    local dayTransfer=redis.call("get",ARGV[4])
    local sentFlag=redis.call("get",ARGV[6])
    if sentFlag then
      return {up,mem,hourTransfer,dayTransfer}
    else
      local yesterdayTransfer = redis.call("get",ARGV[5])
      return {up,mem,hourTransfer,dayTransfer,yesterdayTransfer}
    end
  `

  redis.defineCommand('readCollection', {
    numberOfKeys: 0,
    lua: readCollection
  });

  return new Promise((resolve, reject) => {
    redis.readCollection(...map.values(), (err, result) => {
      err ? reject(err) : resolve(result)
    });
  })
}

function getTimeKey () {
  let [date, hour] = new Date().toJSON().split('T')
  date = date.replace(/[-]/g, '')
  hour = hour.split(':')[0]
  return {date, hour}
}

function getYesterday () {
  return new Date(new Date().getTime() - 86400000).toJSON().split('T')[0].replace(/[-]/g, '')
}

exports.readCollected = async function () {
  try {
    const [up, mem, hour_transfer, transfer, yesterday_transfer] = await collectValue()
    const data = {up, mem, hour_transfer, transfer, yesterday_transfer}
    for (k in data) {
      if(!data[k]) delete data[k]
    }
    return {data, e: null}
  } catch (e) {
    return {e}
  }
}