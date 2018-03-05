import java.io.*;
import java.util.*;
import com.github.javaparser.ast.*;
import com.github.javaparser.ast.body.*;
import com.github.javaparser.ast.expr.MethodCallExpr;
import com.github.javaparser.ast.stmt.*;

import net.sourceforge.plantuml.SourceStringReader;

public class SequenceGenerator {	
		 //ATTRIBUTES
	     String yUML;
	     String in;
	     String out;
		 String method;
	     String className;
	     static HashMap<String, String> methodMapClass;
	     static ArrayList<CompilationUnit> compilationunits;
	     static HashMap<String, ArrayList<MethodCallExpr>> methodCalls;

	     
	    //GETTERS AND SETTERS 
	    public String getPumlCode() {
			return yUML;
		}

		public void setPumlCode(String pumlCode) {
			this.yUML = pumlCode;
		}

		public String getInPath() {
			return in;
		}

		public void setInPath(String inPath) {
			this.in = inPath;
		}

		public String getOutPath() {
			return out;
		}

		public void setOutPath(String outPath) {
			this.out = outPath;
		}

		public String getInFuncName() {
			return method;
		}

		public void setInFuncName(String inFuncName) {
			this.method = inFuncName;
		}

		public String getInClassName() {
			return className;
		}

		public void setInClassName(String inClassName) {
			this.className = inClassName;
		}

		public static HashMap<String, String> getMapMethodClass() {
			return methodMapClass;
		}

		public static void setMapMethodClass(HashMap<String, String> mapMethodClass) {
			SequenceGenerator.methodMapClass = mapMethodClass;
		}

		public static ArrayList<CompilationUnit> getCuArray() {
			return compilationunits;
		}

		public static void setCuArray(ArrayList<CompilationUnit> cuArray) {
			SequenceGenerator.compilationunits = cuArray;
		}

		public static HashMap<String, ArrayList<MethodCallExpr>> getMapMethodCalls() {
			return methodCalls;
		}

		public static void setMapMethodCalls(HashMap<String, ArrayList<MethodCallExpr>> mapMethodCalls) {
			SequenceGenerator.methodCalls = mapMethodCalls;
		}
	     
	    SequenceGenerator(String in, String className, String function,String out) {
	        this.in = in;
	        this.out = in + "/" + out + ".png";
	        this.className = className;
	        this.method = function;
	        methodMapClass = new HashMap<String, String>();
	        methodCalls = new HashMap<String, ArrayList<MethodCallExpr>>();
	        yUML = "@startuml\n";
	    }

	    public void start() throws Exception {
	    	
	        OutputStream png;
	        SourceStringReader reader;
	    	
	        compilationunits = UtilityHelper.getCuArray(in);
	        for (CompilationUnit compilationUnit : compilationunits) {
	            String className = "";
	            List<TypeDeclaration> typeDeclaration = compilationUnit.getTypes();
	            for(Node node : typeDeclaration) {
	            	searchClassesAndMethods(node, methodMapClass, methodCalls);
	            }
	        }
	        
	        for(String className1 : methodMapClass.values()) {
	        	System.out.println(className1);
	        }
	        
	        yUML = yUML + "actor user #red\n";
	        yUML = yUML + "user" + " -> " + className + " : " + method + "\n";
	        yUML = yUML + "activate " + methodMapClass.get(method) + "\n";
	        parse(method);
	        yUML = yUML + "@enduml";
	        	        	        
	        //GENERATE DIAGRAM
			try {
				 png = new FileOutputStream(out);
				 reader = new SourceStringReader(yUML);
				 reader.generateImage(png);
			} catch (FileNotFoundException e) {				
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			//GENERATED CODE
	        System.out.println("Code generated :\n" + yUML);
	    }
	    
	    private void searchClassesAndMethods(Node node, HashMap<String, String> methodMapClass, HashMap<String, ArrayList<MethodCallExpr>> methodCalls) {
	    	 if (node instanceof ClassOrInterfaceDeclaration) {
	                ClassOrInterfaceDeclaration classOrInterface = (ClassOrInterfaceDeclaration) node;
	                className = classOrInterface.getName();
	                for (BodyDeclaration bodyDeclaration : ((TypeDeclaration) classOrInterface).getMembers()) {
	                    if (bodyDeclaration instanceof MethodDeclaration) {
	                        MethodDeclaration methodDeclaration = (MethodDeclaration) bodyDeclaration;
	                        ArrayList<MethodCallExpr> methodCallExpressionList = new ArrayList<MethodCallExpr>();
	                        for (Object childrenNode : methodDeclaration.getChildrenNodes()) {
	                            if (childrenNode instanceof BlockStmt) {
	                                for (Object expressionStatement : ((Node) childrenNode).getChildrenNodes()) {
	                                    if (expressionStatement instanceof ExpressionStmt) {
	                                        if (((ExpressionStmt) (expressionStatement)).getExpression() instanceof MethodCallExpr) {
	                                            methodCallExpressionList.add( (MethodCallExpr) (((ExpressionStmt) (expressionStatement)).getExpression()));
	                                        }
	                                    }
	                                }
	                            }
	                        }
	                        methodCalls.put(methodDeclaration.getName(), methodCallExpressionList);
	                        methodMapClass.put(methodDeclaration.getName(), className);
	                    }
	                }
	                
	                for(Node childNode : node.getChildrenNodes()) {
	                	searchClassesAndMethods(childNode, methodMapClass, methodCalls);
	                }
	           }
	    }

	    private void parse(String callerMethod) {	    	
	        for (MethodCallExpr methodCallExpression : methodCalls.get(callerMethod)) {
	            
	        	String classCaller = methodMapClass.get(callerMethod), methodCalled = methodCallExpression.getName(), classCalled = methodMapClass.get(methodCalled);	            
	            if (methodMapClass.containsKey(methodCalled)) {
	                yUML = yUML + classCaller + " -> " + classCalled + " : " + methodCallExpression.toStringWithoutComments() + "\n";
	                yUML = yUML + "activate " + classCalled + "\n";
	                parse(methodCalled);
	                yUML = yUML + classCalled + " -->> " + classCaller + "\n";
	                yUML = yUML + "deactivate " + classCalled + "\n";
	            }
	        }	        
	    }	    	    
	  }
