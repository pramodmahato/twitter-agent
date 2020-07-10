const socketIO = require('socket.io')
const http = require('http')
const { v4: uuidV4 } = require('uuid');


var socket = { }

socket.activity_event = 'activity_event_' + uuid()

socket.init = function (server) {
  socket.io = socketIO(server)

  socket.io.on('connection', (s) => {
    console.log('Client connected')
    s.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })
}


module.exports = socket