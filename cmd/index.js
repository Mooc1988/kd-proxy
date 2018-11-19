const redis = require('../redis')
const {fetch} = require('../lib')

const register = async function ({uuid, region, token}) {
  try {
    let cached = await redis.exists('meta')
    if (cached) return
    await redis.hset('meta', 'uuid', uuid)
    await redis.hset('meta', 'region', region)
    await redis.hset('meta', 'token', token)
  }catch (e) {
    return e
  }
}

const fetchTransfer = async function ({token, uuid}) {
  // todo: delete the demo code
   uuid = '10521254'
   token = 'd9ea60aaaf0925429f7de399fc47f99f9cdf7ec8f4462036b8924d66623b30ff'
  const opt = {
    uri: `https://api.linode.com/v4/linode/instances/${uuid}/stats`,
    headers: {'Authorization': `Bearer ${token}`},
  }

  try {
    const res = await fetch(opt)
    if (!res.data || !res.data.netv4 || !res.data.netv4.out)
      return {e: new Error('node service err: invalidate fetched res from platform')}
    const latestHour = res.data.netv4.out.slice(275)
    return {e: null, out: (latestHour.reduce((t, c)=> {return t + c[1] * 300}, 0) / 8000000000).toFixed(2)}
  } catch (e) {
    return {e}
  }

}

module.exports = {register, fetchTransfer}