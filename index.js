const net = require('net')
const command = require('./command')
const client = require('./udp/client')
const PORT = 56789

console.info('Server is running on port ' + PORT)
const server = net.createServer()

//监听连接事件
server.on('connection', async function (socket) {

  //监听数据接收事件
  socket.on('data', async function (data) {
    console.log('on data')
    let arr = data.toString().split(':')
    let [flag, cmd] = arr
    if (flag !== 'cmd') {
      socket.end(`invalid cmd`)
      return
    }

    if (cmd === 'registerV2') {
      let [ , , uuid, region, token] = arr
      if (!uuid || !region || !token) {
        console.error(`register error: invalidate params: ${data}`)
        socket.end('fail')
        return
      }
      let e = await command.registerV2({uuid, region, token})
      if (e) {
        console.error(e)
        socket.end('fail')
      } else {
        socket.end('ok')
      }
      return
    }

    if (cmd === 'register') {
      let name = arr[2]
      // let exp = arr[3]
      let exp = 60 * 60 * 12 * 3 // 3 day
      command.register(name, exp, function (err, password) {
        if (err) {
          console.error(err)
          socket.end('fail')
        } else {
          socket.end(password)
        }
      })
      return
    }

    if (cmd === 'ping') {
      socket.end('ok')
      return
    }

    if (cmd === 'clean') {
      command.clean(function (err) {
        if (err) {
          console.error(err)
          socket.end('fail')
        } else {
          socket.end('ok')
        }
      })
      return
    }

    if (cmd === 'restart') {
      command.restart(function (err) {
        if (err) {
          console.error(err)
          socket.end('fail')
        } else {
          socket.end('ok')
        }
      })
      return
    }

    if (cmd === 'script') {
      let file = arr[2]
      command.executeScript(file, function (err) {
        if (err) {
          socket.end('fail')
        } else {
          socket.end('ok')
        }
      })
    }
  })

  //监听连接断开事件
  socket.on('end', function () {
    console.log('Client disconnected.')
  })

  socket.on('close', function () {
    console.log('close ... ')
  })
})

//TCP服务器开始监听特定端口
server.listen(PORT)

// 统计重启次数
process.on('SIGINT', function () {
  client.send('event:restart', function () {
    process.exit(0)
  })
})

process.on('message', function (msg) {
  console.log('msg is ', msg)
})

require('./cronJob')
