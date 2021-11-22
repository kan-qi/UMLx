

# UMLx
Authored by: Kan Qi

## Usage
When you start on your software project, would you wonder how much it costs, how long the project takes, or how many people to hire?
Those are hard questions to answer.
Why? There are just so many factors to consider and we don't know how much they influence the numbers.
Among the factors, the complexity of the software product is of course the most important one.
Then how do we evaluate the complexity of a software system?
Is it about the number of use cases of the software?
Is it about the number of transactions the system processes?
Or is it about the number of lines of code that we need to write?
As we think about it, we may realize those variables would all influence the result and the variables would influence each other.
Also, the more challenge part is that we don't know how much they would influence.
To solve these problems, our research work is divided into two parts.
First, we analyse the complexity of a software system from high-level to low-level based on different types of UML diagrams.
Second, we analyse the costs of real-world software projects to learn how the complexities influence the cost.
How do we "learn", we perform big data analysis and write machine learning algorithms.


## Developing
Project dictories:
data/: stores the UML diagrams collected from the selected projects, there might be more to be added in the future. The files with surfix .xml are exported from Enterprise Architect for the UML diagrams.
documents/: the documents about the system configuration, tutorials of system structure, or functionality explanations.
evaluators/: this folder contains high level analysis for the extracted information from UML diagrams. For example, to use the number of transactions to calculate Use Case Point. Each of the JS files is an Evaluator, which is used as a plugin to register in UMLEvaluator.js.
model_drawers/: include the methods to visualize the extracted models, for example, user-system interaction model, transaction, etc.
model_platforms/: this folder contains the low level operations to parse a specific format of the exported files for UML models. For example, ea/XMI2.1Parser.js parses the information from the xml files exported from Enterprise Architect.
public/: stores the uploaded data (the exported UML files) from the web portal, also the outputs from different analysis.
Rscript/: includes the R scripts for statistical analysis for the extracted information from UML models.
Temp/: store temporary files.
Views/: include templates for web pages, written with the Jade plugin of Nodejs.
UMLEstimator.js: used to receive commands for model calibration.
UMLEvaluator.js: the abstraction for the evaluators. It currently registers the evaluators under the evaluator/ folder, for example, COCOMOCalculator.js, UMLModelEvaluator.js, and UseCaseCalculator.js.
UMLFileManager.js: the UML model file manager module, which manages uploaded model files.
UMLModelExtractor.js: start the procedure for extracting user-system interaction model from UML diagrams.
UMLModelInfoManagerMongoDB.js: includes the database management functions, for example, querying model or diagram information.
UMLxServices.js: includes the Restful APIs to request the analytical data, including the Url access entries for the backend functionality.

### Programming languages:
Nodejs, Javascript, HTML, CSS, R scripts

### Dependencies

NodeJs  (with modules: multer, admzip, express,path,jade)
MongoDB
Graphviz 3.2.3
R 3.4
Android studio

#### Configuration
1.	Install nodejs:
   sudo apt update
   sudo apt install -y nodejs
2.	Install mongodb
   sudo apt update
   sudo apt install -y mongodb
3.	Install mvn
   sudo apt update
   sudo apt install maven
4.	Intall R:
   sudo apt-get install r-base
5. Install graphviz:
   sudo add-apt-repository universe
   sudo apt update
   sudo apt install graphviz  

6. Setup environmental variables: 
   export ANDROID_SDK=./facility_tools/Android_SDK
   export GatorRoot=./facility-tools/GATOR_Tool/gator-3.5
