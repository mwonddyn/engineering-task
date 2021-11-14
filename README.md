# Introductions
Microservices example.

# Setup instructions
* Install private docker network for all microservices:
> docker network create --driver=bridge --subnet=172.20.0.0/16 private-net

This approach was chosen as it seamed easiest to automate for access points network resolution.
## Build docker images
Docker images are built with following commands executed from root repository folder:
> docker build --tag python-scan ./scan -f ./scan/Dockerfile
>
> docker build --tag python-edit ./edit -f ./edit/Dockerfile
>
> docker build --tag python-prepare ./edit -f ./prepare/Dockerfile
>
> docker build --tag python-finish ./finish -f ./finish/Dockerfile
>
> docker build --tag node-core ./core -f ./core/Dockerfile

## Run containers
Containers are run with following commands:
> docker run -d --net=private-net --ip=172.20.0.3 python-scan
>
> docker run -d --net=private-net --ip=172.20.0.4 python-edit
>
> docker run -d --net=private-net --ip=172.20.0.5 python-prepare
>
> docker run -d --net=private-net --ip=172.20.0.6 python-finish
>
> docker run -d  --net=private-net -p 3000:3000 node-core

For easier debug, node-core container can be executed with one of following commands
> docker run --net=private-net -p 3000:3000 -v C:\path_to_repository\microservices\core:/home/root -it node /bin/bash
>
> docker run --net=private-net -p 3000:3000 -it node-core /bin/bash

## Testing
Postman collection of requests is provided in testing folder for verification purposes. Once imported to postman user should re-select file for upload in Body tab.

# Discussion
The solutions is just an illustration missing key features:
* Appropriate tests (unit, component, performance, load...)
* Security features
  * Data encryption - network and storage
  * Identity management
  * Authentication (multi factor), authorization, identity management
  * Session management
* Proper logging, tracing, error handling
* Documentation generation
* Localization
* Push notifications
* request-promise-native and request modules are depricated
* etc.

## Design decisions
Production solution architecture would include some key differences to ensure seamless operation:
* All services should support elastic load handling
* Distributed, reliable data storage solution
* Using service bus or reliable message queueing service for forwarding data such as Kafka, ...
* Active system monitoring for load and issues tracking
