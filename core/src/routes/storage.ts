/**
 * @fileOverview Dummy data storage abstraction for both file storage
 * and progress. In real system this should be stored in high availabile
 * (or even fault tolerant, depending on requirements) DB.
 * @author ...
 * @version 1.0.0
 */

// Multer is used for file upload
const multer = require('multer')

// Path is used for file path manupulation
const path = require('path')

/** @constant {Number} MAX_FILE_SIZE Maximum file size in bytes  */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/** @constant {String} FILE_SAVE_LOCATION Location for saving file  */
const FILE_SAVE_LOCATION = 'videos'

/**
 * Dummy no-sql database implementation used for storing information on
 * uploaded files such as unique id, original file name and status.
 *  */
class DummyStorage {
  /**
   * Database simplification having unique file id as key and original
   * file name and status as file information. Status is simplified but
   * in real system it should contain each possible state for easier
   * progress tracking and troubleshooting.
   * @type Map<string, {name: string, status: string}>
   * @private
   */
  database: Map<string, { name: string, status: string, servicesLeft: number }>

  /**
   * Default class constructor
   */
  constructor () {
    this.database = new Map()
  }

  /**
   * Add enty to database.
   * @param {String} fileName unique file id
   * @param {String} originalFileName original file name user submitted
   * @param {String} state file processing state
   * @return {void} None
   */
  add (fileName: string, originalFileName: string, state: string, servicesLeft: number): void {
    this.database.set(fileName, { name: originalFileName, status: state, servicesLeft: servicesLeft })
  }

  /**
   * Update database entry
   * @param {String} fileName unique file id
   * @param {String} state file processing state
   * @return {void} None
   */
  update (fileName: string, state: string): void {
    const fileInfo = this.database.get(fileName)
    fileInfo.status = state
    fileInfo.servicesLeft = fileInfo.servicesLeft - 1
    this.database.set(fileName, fileInfo)
  }

  /**
   * Read database entry
   * @param {String} fileName unique file id
   * @return {{name: string, status: string}} file information
   */
  get (fileName: string): { name: string, status: string, servicesLeft: number } {
    return this.database.get(fileName)
  }

  /**
   * Get
   * @param {String} fileName unique file id
   * @return {{name: string, id: string}} files information
   */
  getVideos (): { name: string; id: string; }[] {
    const data: {name: string, id: string}[] = []

    this.database.forEach((value : {name: string; status:string; },
      key: string,
      map: Map<string, {name: string; status:string;}>) => {
      data.push({ name: value.name, id: key })
    })
    return data
  }

  /**
   * Checks if key fileName exists
   * @param {String} fileName unique file id
   * @return {boolean} true if file exists, false otherwise
   */
  has (fileName: string) : boolean {
    return this.database.has(fileName)
  }
}

/** @constant {DummyStorage} storage Singletone DummyStorage implementation. */
const storage = new DummyStorage()

/** @constant {multer.diskStorage} videoStorage video storage for saving file uploaded by user */
const videoStorage = multer.diskStorage({
  destination: FILE_SAVE_LOCATION, // Destination to store image
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    // file.fieldname is name of the field (image), path.extname get the uploaded file extension
  }
})

/** @constant {multer.diskStorage} uploadUpload multer stage for file uploaded by user */
const uploadUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter (req, file, cb) {
    if (!file.originalname.match(/\.(mp4|avi)$/)) {
      return cb(new Error('Please upload a video.'))
    }
    cb(undefined, true)
  }
})

/** @constant {multer.diskStorage} resultingVideoStorage video storage for saving file uploaded by processing services */
const resultingVideoStorage = multer.diskStorage({
  destination: FILE_SAVE_LOCATION, // Destination to store image
  filename: (req, file, cb) => {
    cb(null, file.originalname)
    // file.fieldname is name of the field (image), path.extname get the uploaded file extension
  }
})

/** @constant {multer.diskStorage} resultingVideoUpload multer stage for file uploaded by processing services */
const resultingVideoUpload = multer({
  storage: resultingVideoStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter (req, file, cb) {
    if (!file.originalname.match(/\.(mp4|avi)$/)) {
      return cb(new Error('Please upload a video.'))
    }
    cb(undefined, true)
  }
})

export { storage, uploadUpload, resultingVideoUpload }
