# UMLx System Tutorial:

## Source code structure
##### data/:
> Stores the UML diagrams collected from the selected projects, there might be more to be added in the future. The files with surfix .xml are exported from Enterprise Architect for the UML diagrams.
##### db_backup/:
> The backup of current database, which is based on MongoDB.
##### documents/:
> The documents about the system configuration, tutorials of system structure, or functionality explanations.
##### Diagram_profilers/:
> Includes the basic operations to analyse the parsed UML diagrams. For example, UseCaseProcess.js includes the methods to identify transactions and categorize transactions from robustness diagrams, sequence diagrams, etc. DomainModelProcess.js includes the operations to analyse class diagrams.
##### Drivers/:
> Includes the operations to deal with specific kinds of UML diagrams. The source code package is not currently used, since the operations are actually contained in Diagram_profilers.
##### Evaluators/:
> This folder contains high level analysis for the extracted information from UML diagrams. For example, to use the number of transactions to calculate Use Case Point. Each of the JS files is an Evaluator, which is used as a plugin to register in UMLEvaluator.js.
##### Model_platforms/:
> This folder contains the low level operations to parse a specific format of the exported files for UML models. For example, ea/XMI2.1Parser.js parses the information from the xml files exported from Enterprise Architect.
##### Node_modules/:
> Includes the installed nodejs plugins. We usually don’t touch the folder.
##### Public/:
> Stores the uploaded data (the exported UML files) from the web portal, also the outputs from different analysis.
##### Rscript/:
> Includes the R scripts for statistical analysis for the extracted information from UML models.
##### Temp/:
> Store temporary files.
##### Views/:
> Include templates for web pages, written with the Jade plugin of Nodejs.
##### UMLEstimator.js/:
> Used to calibrate effort estimation models.
##### UMLEvaluator.js/:
> The abstraction for the evaluators. It currently registers the evaluators including: COCOMOCalculator.js, UMLModelEvaluator.js, and UseCaseCalculator.js.
##### UMLFileManager.js/:
> The UML model file manager module, which manages uploaded model files.
##### UMLModelInfoManagerMongoDB.js:
> Includes the database management functions, for example, querying model or diagram information.
##### UMLxServices.js/:
> Includes the Restful APIs to request the analytical data, including the Url access entries for the backend functionality.

## Programming Language:
Nodejs, Javascript, HTML, CSS, R scripts

## Dependencies:
NodeJs  (with modules: multer, admzip, express,path,jade)
MongoDB

## Platform:
Windows or Mac OS or Linux

## Setting up:
1.	Install [mongoDB](https://docs.mongodb.com/manual/installation/)
2.	Start the mongodb and restore the backup data base, using: `mongorestore ./db_backup`
3.	Install [nodejs](https://nodejs.org/en/download/)
4.	Install nodejs packages using commands in terminal:`npm install`

5. Start mongodb:
    * Navigate to the database folder of MongoDB. The default folder for MongoDB installation is : `~/Documents/db`.
    * Using command to start mongoDB : `mongod –dbpath`
6. Start web service:
    * Navigate to your project root folder.
    * Using command to start UMLxServices: `npm start`
7.	Access: http://127.0.0.1:8081/ to load the home page.

> Notes: sometimes you may mess up the database for some reason. You can delete the mongodb and restore the backup database. This tutorial is just the skeleton of the process of setting up the project. There might be some variations for different operation systems and environments, or some of the instructions may not be very accurate. In those cases, you may need to do some researches for those steps.
