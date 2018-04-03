# UML Parser using Java:

A UML Parser which converts given Java Source Code into
  1. UML Class Diagrams
  2. UML Sequence Diagrams

### Requirements:
- Internet connectivity ( For calling YUML RESTful APIs)
- Java JDK version 1.8
- Javaparser
- PlantUML
- Maven

### Instructions:

Program accepts input in the form of a .zip folder or a regular folder containing Java source code files or a simple folder. 

The program will check if the extension of the folder is "zip". and if it is, the program will uncompress it, and then perform further process, otherwise if the program is a regular folder container .java files, then the program will simply run normally.

Hence, the code will work as long as the provided fully qualified path is correct.

Input arguments:

1. Keyword string ("class", "seq"):

2. Path:
  - must be enclosed in double quotes.
  - Fully qualified path of the folder which contains all the .java source files. 

3. Name of output image file
  - One word string
  - Extension will be assigned as ".png" automatically.

#### Example:-
For the generation of the UML Class diagram from Java source code, run below command:
```
java -jar umlparser.jar class "\Users\akshaymishra\workspace\tests\uml-parser-test-1.zip" output
```
This creates “output.png” in the same folder as the input folder.

For the generation of the UML sequence diagram, additional 2 arguments are required:

4. Name of the class inside which the method resides that for which sequence diagram is to be  generated
Ex: BuildOrder

5. Name of the actual method for which the sequence diagram needs to be generated
  - Do not include parenthesis after the method name
  - Ex - getOrder

#### Example:- 

In order to generate a UML Class diagram from Java source code, run below command:
```
java -jar umlparser.jar seq "\Users\akshaymishra\workspace\tests\uml-parser-test-1.zip" Main main output
```
This creates “output.png” in the same folder as the input folder.


### Details of libraries and tools used:

Parsing Java Class: Javaparser https://github.com/javaparser/javaparser
For parsing the java code, an open source library called ‘Javaparser’ is used.
We access each java entity in the form of a ‘Compilation Unit’ and access multiple attributes, methods, fields using multiple available methods.


UML Class Diagram Generation: YUML https://yuml.me/diagram/plain/class/draw/
It is a free online tool for the generation of a UML diagrams and we are making an HTTP request through Java code. Using Javaparser, we generate something called ‘Abstract Syntax Tree’, which is fed to the YUML API. YUML generates and returns an image after converting that abstract syntax tree into a UML class diagram.

Sequence Generator: PlantUML  https://github.com/plantuml/plantuml 
We are using PlantUML for the generation of the sequence diagram. This is a free tool, and some of the features of this require Graphviz to be installed as a dependency

Maven:
Maven is used as a dependency management tool.
