import time
import random
import requests
from flask import Flask, render_template, request

app = Flask(__name__)
PORT = 3000

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file():
   """
   Main upload and 'processing' method that receives
   uploaded file, sleeps for random period and returns
   the file unchanged.
   """
   if request.method == 'POST':
      # Print client IP for easier troubleshooting 
      print('Visitor IP: ' + request.remote_addr)

      # Retrive and save the file to the disk
      f = request.files['file']
      f.save(f.filename)
      
      process_file()

      # prepare request data
      file, test_url = prepare_response(f.filename, request.remote_addr, PORT)
      test_response = requests.post(test_url, files = file)
      
      print('Response value: ' + str(test_response) + '.')
      
      # Videti sta ovde tacno vracati,
      # Ugraditi obrade gresaka
      return 'file uploaded successfully'
		
def prepare_response(filename, remote_addr, port):
    """
    Prepare response data
    """
    file = {'file': (filename, open(filename, 'rb'))}
    test_url = "http://" + remote_addr + ':' + str(port) + '/update'
    
    return file, test_url
    
def process_file():
    """
    Emulate processing duration. Processing time is in seconds.
    """
    MINIMUM_PROCESSING_TIME = 10
    MAXIMUM_PROCESSING_TIME = 120

    processing_time = random.randint(MINIMUM_PROCESSING_TIME, MAXIMUM_PROCESSING_TIME)
    print('Sleeping for: ' + str(processing_time) + 's.')
    time.sleep(processing_time)
    
if __name__ == '__main__':
   app.run(debug = True)