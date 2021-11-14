import fs = require('fs')
import request = require('request-promise-native')
import { storage } from './storage'

/**
 * Component responsible for driving the processing and progress tracking.
 * In reality, this could be implemented as pipeline and in that case
 * each service would write results in storage and enqueue work item to
 * next processing stage untill the processing is done which reduces
 * complexity.
 */
export class Dispatcher {
  /**
   * Order and access points of processing services. In reality this would
   * be received from configuration service or some discovery service.
   * @type Array<{service: String, url: string}>
   * @private
   */
  private processingPipeline: Array<{ name: string, url: string }>

  /**
   * Default class constructor that initializes processing pipeline.
   */
  public constructor () {
    this.processingPipeline = [{ name: 'Scan', url: 'http://172.20.0.3:5000/uploader' },
      { name: 'Edit', url: 'http://172.20.0.4:5000/uploader' },
      { name: 'Prepare', url: 'http://172.20.0.5:5000/uploader' },
      { name: 'Finish', url: 'http://172.20.0.6:5000/uploader' }]
  }

  /**
   * Add enty to database.
   * @param {String} filePath file path
   * @param {String} fileName unique file id
   * @param {String} originalName original file name user submitted
   * @return {void} None
   */
  public async processFile (filePath: string, fileName: string, originalName: string) {
    // Update file status
    storage.add(fileName, originalName, 'VIDEO RECEIVED', this.processingPipeline.length)

    for (let i = 0; i < this.processingPipeline.length; i++) {
      await this.sendPostRequest(filePath, fileName, this.processingPipeline[i].url, this.processingPipeline[i].name)
    }
  }

  /**
   * Add enty to database.
   * @param {String} filePath file path
   * @param {String} fileName unique file id
   * @param {String} restUrl target service url
   * @param {String} serviceName target service name
   * @return {Promise} None
   */
  private sendPostRequest (filePath: string, fileName: string, restUrl: string, serviceName: string) {
    const options = {
      url: restUrl,
      method: 'POST',
      formData: {
        file: fs.createReadStream(filePath)
      }
    }

    return request(options, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        console.log(err)
        storage.update(fileName, 'Error at stage: ' + serviceName)
        return
      }

      console.log('File ' + fileName + ' received from service: ' + serviceName)
      if (this.isLastService(serviceName)) {
        storage.update(fileName, 'Done')
      } else {
        storage.update(fileName, serviceName)
      }
    })
  }

  /**
   * Checks if this service is the last one in the row.
   * @param {String} serviceName service name to check
   * @return {boolean} True if service is the last one, false otherwise.
   */
  private isLastService (serviceName: string): boolean {
    return serviceName === this.processingPipeline[this.processingPipeline.length - 1].name
  }
}
