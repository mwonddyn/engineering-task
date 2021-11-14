import express = require('express')
import path = require('path')
import uploadRouter = require('./routes/upload.js')

const port = process.env.PORT || 3000
const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', uploadRouter)

app.listen(port, () => {
  console.log('Server running on port: ' + port + '.')
})
