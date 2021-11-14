import path = require('path')
const router = require('express').Router()
import { Dispatcher } from './dispatcher'
import { storage, uploadUpload, resultingVideoUpload } from './storage'

const dispatcher = new Dispatcher()

const filesPath = '../../videos'

/**
 * Serves index file
 * @return {String} index page
 */
router.get('/', function (req, res) : void {
  res.sendFile(path.join(__dirname, '/../public/index.html'))
})

/**
 * Received uploaded file and pushes it for processing.
 * @return {String} Response on status
 */
router.post('/start', uploadUpload.single('file'), (req, res) => {
  console.log('Upload video called for file: ' + req.file.originalname + ', file id: ' + req.file.filename + ', file path: ' + req.file.path)

  // Dispatch file for processing
  dispatcher.processFile(req.file.path, req.file.filename, req.file.originalname)

  // This should be localized string
  res.status(200).send({ upload_status: 'Success', video_id: req.file.filename })
}, (error, req, res, next) => { res.status(400).send({ error: error.message }) }
)

/**
 * Reads and returns all file names and ids
 * @return {{ name: string; id: string; }[]} Uploaded files and names
 */
router.get('/files', function (req, res) {
  console.log('Client requested list of all files.')

  const data = storage.getVideos()

  res.status(200).send(data)
})

/**
 * Reads and returns file status for fileId
 * @return {{ id: string; status: string;}} Uploaded files and names
 */
router.get('/files/:fieldId/status', function (req, res) {
  const fieldId = req.params.fieldId
  console.log('Client requests status for file with id ' + fieldId)

  if (!storage.has(fieldId)) {
    res.status(404).send()
    return
  }

  let link = ''
  if (storage.get(fieldId).status === 'Done') {
    // This should be parametrized, stored as formatable string
    link = 'http://localhost:3000/download/' + fieldId
  }

  const r = { id: fieldId, status: {data: storage.get(fieldId), link: link}}
  res.status(200).send(r)
})

/**
 * Reads and returns file status for fileId
 * @return {{ name: string; id: string; }[]} Uploaded files and names
 */
router.get('/download/:fieldId', function (req, res) {
  const fieldId = req.params.fieldId
  console.log('Client requests download for file with id ' + fieldId)

  if (!storage.has(fieldId)) {
    res.status(404).send()
    return
  }

  const fp = path.join(__dirname, filesPath, fieldId)

  res.download(fp)
})

/**
 * Called by processing microservices once they finish processing. In real project,
 * this would not exist if each microservice writes resulting video directly to
 * storage.
 * @return {String} Response
 */
router.post('/update', resultingVideoUpload.single('file'), (req, res) => {
  res.status(200).send()
}, (error, req, res, next) => { res.status(400).send({ error: error.message }) }
)

module.exports = router
