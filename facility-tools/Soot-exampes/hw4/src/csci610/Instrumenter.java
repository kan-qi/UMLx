package csci610;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.reflect.Modifier;
import java.util.Iterator;

import soot.ArrayType;
import soot.Body;
import soot.Local;
import soot.LongType;
import soot.RefType;
import soot.Scene;
import soot.SootClass;
import soot.SootField;
import soot.SootMethod;
import soot.SourceLocator;
import soot.Unit;
import soot.jimple.AssignStmt;
import soot.jimple.IntConstant;
import soot.jimple.InvokeExpr;
import soot.jimple.InvokeStmt;
import soot.jimple.JasminClass;
import soot.jimple.Jimple;
import soot.jimple.LongConstant;
import soot.jimple.ReturnStmt;
import soot.jimple.ReturnVoidStmt;
import soot.jimple.Stmt;
import soot.jimple.StringConstant;
import soot.jimple.internal.JIfStmt;
import soot.jimple.toolkits.annotation.logic.Loop;
import soot.options.Options;
import soot.toolkits.graph.LoopNestTree;
import soot.util.Chain;
import soot.util.JasminOutputStream;

public class Instrumenter {

	public static void main(String[] args) throws IOException {
//		if (args.length !=3) {
//			System.err.println("Expected 3 arguments: (1) soot class path (2) input class name (3) transformed class path ");
//			System.exit(-1);
//		}
		
//		String sootClassPath = args[0];
//		String className= args[1];
//		String transformedClassPath = args[2];
		
		String className = "csci610.InstrumentingTest";
		String sootClassPath = ".";
		String transformedClassPath = "results";
			
		sootClassPath = Scene.v().getSootClassPath() + File.pathSeparator + sootClassPath;
		Scene.v().setSootClassPath(sootClassPath);
		Options.v().set_keep_line_number(true);
		SootClass sootClass = Scene.v().loadClassAndSupport(className);
		Scene.v().loadNecessaryClasses();
		sootClass.setApplicationClass();
		
//
//		processClass(sootClass);
//		printGraph(System.out);
		
		for(SootMethod m: sootClass.getMethods()) {
			m.retrieveActiveBody();
		}
		
		
		Body body  = sootClass.getMethodByName("main").retrieveActiveBody();
		Chain<Unit> units = body.getUnits();
		
		SootField loopsCounter = new SootField("loopsCount", LongType.v(), Modifier.STATIC);
		sootClass.addField(loopsCounter);
		
		

		
		LoopNestTree loopNestTree = new LoopNestTree(body);
        for (Loop loop : loopNestTree.descendingSet()) {
//            System.out.println("Found a loop with head: " + loop.getHead());
            
            Stmt s = loop.getHead();
            
            if(!(s instanceof JIfStmt)){
            	continue;
            }
            
            Stmt t = ((JIfStmt)s).getTarget();
            

    		Local loopsLocal = Jimple.v().newLocal("loops", LongType.v());
    		body.getLocals().add(loopsLocal);
            
            
			AssignStmt asgCounterField= Jimple.v().newAssignStmt(loopsLocal, Jimple.v().newStaticFieldRef(loopsCounter.makeRef()));
			
			units.insertBefore(asgCounterField, t);
			((JIfStmt)s).setTarget(asgCounterField);
			
			AssignStmt addtoLocal = Jimple.v().newAssignStmt(loopsLocal, Jimple.v().newAddExpr(loopsLocal, LongConstant.v(1)));
			units.insertBefore(addtoLocal, t);
			
			AssignStmt updateField = Jimple.v().newAssignStmt(Jimple.v().newStaticFieldRef(loopsCounter.makeRef()), loopsLocal);
			units.insertBefore(updateField, t);
        }
        

		Iterator iter = units.snapshotIterator();
        while(iter.hasNext()) {
			Stmt s = (Stmt)iter.next();
			
			if(s instanceof InvokeStmt){
				InvokeStmt invokeStmt = (InvokeStmt) s;
				InvokeExpr expr = invokeStmt.getInvokeExpr();
				SootMethod method = expr.getMethod();
				if(method.toString().equals("<java.lang.StringBuffer: java.lang.StringBuffer append(java.lang.String)>")){
					Local loopsToPrint = Jimple.v().newLocal("loopsToPrint", LongType.v());
		    		body.getLocals().add(loopsToPrint);
					AssignStmt asgCounterField= Jimple.v().newAssignStmt(loopsToPrint,Jimple.v().newStaticFieldRef(loopsCounter.makeRef()));
					units.insertBefore(asgCounterField, invokeStmt);
					
					Local loopsArgs = Jimple.v().newLocal("loopsArgs", ArrayType.v(RefType.v("java.lang.Long"), 1));
					body.getLocals().add(loopsArgs);
					AssignStmt loopsArgsAssign = Jimple.v().newAssignStmt(loopsArgs, Jimple.v().newNewArrayExpr(RefType.v("java.lang.Long"), IntConstant.v(1)));
					units.insertBefore(loopsArgsAssign, invokeStmt);
					
					SootMethod longV = Scene.v().getMethod("<java.lang.Long: java.lang.Long valueOf(long)>");
					
					Local loopsToPrintObject = Jimple.v().newLocal("loopsToPrintObject", RefType.v("java.lang.Long"));
					body.getLocals().add(loopsToPrintObject);
					AssignStmt asgObjectArgs= Jimple.v().newAssignStmt(loopsToPrintObject,Jimple.v().newStaticInvokeExpr(longV.makeRef(), loopsToPrint));
					units.insertBefore(asgObjectArgs, invokeStmt);
					
					
					AssignStmt loopsArgSetValue = Jimple.v().newAssignStmt(Jimple.v().newArrayRef(loopsArgs, IntConstant.v(0)), loopsToPrintObject);
					units.insertBefore(loopsArgSetValue, invokeStmt);
					
			        Local ref = Jimple.v().newLocal("ref", RefType.v("java.io.PrintStream"));
					body.getLocals().add(ref);
					
					AssignStmt initOut = Jimple.v().newAssignStmt(ref, Jimple.v().newStaticFieldRef(Scene.v().getField("<java.lang.System: java.io.PrintStream out>").makeRef()));
					units.insertBefore(initOut, invokeStmt);
					
					SootMethod toCall = Scene.v().getMethod("<java.io.PrintStream: java.io.PrintStream printf(java.lang.String,java.lang.Object[])>");
					
					InvokeStmt printInv = Jimple.v().newInvokeStmt(Jimple.v().newVirtualInvokeExpr(ref, toCall.makeRef(),StringConstant.v("Total number of iterations is: %d\n"),loopsArgs));
					units.insertAfter(printInv, invokeStmt);
					invokeStmt.redirectJumpsToThisTo(printInv);
					units.remove(invokeStmt);
				}
			} else if(s instanceof ReturnStmt || s instanceof ReturnVoidStmt){
				Local loopsToPrint = Jimple.v().newLocal("loopsToPrint", LongType.v());
	    		body.getLocals().add(loopsToPrint);
				AssignStmt asgCounterField= Jimple.v().newAssignStmt(loopsToPrint,Jimple.v().newStaticFieldRef(loopsCounter.makeRef()));
				units.insertBefore(asgCounterField, s);
				
				Local loopsArgs = Jimple.v().newLocal("loopsArgs", ArrayType.v(RefType.v("java.lang.Long"), 1));
				body.getLocals().add(loopsArgs);
				AssignStmt loopsArgsAssign = Jimple.v().newAssignStmt(loopsArgs, Jimple.v().newNewArrayExpr(RefType.v("java.lang.Long"), IntConstant.v(1)));
				units.insertBefore(loopsArgsAssign, s);
				
				SootMethod longV = Scene.v().getMethod("<java.lang.Long: java.lang.Long valueOf(long)>");
				
				Local loopsToPrintObject = Jimple.v().newLocal("loopsToPrintObject", RefType.v("java.lang.Long"));
				body.getLocals().add(loopsToPrintObject);
				AssignStmt asgObjectArgs= Jimple.v().newAssignStmt(loopsToPrintObject,Jimple.v().newStaticInvokeExpr(longV.makeRef(), loopsToPrint));
				units.insertBefore(asgObjectArgs, s);
				
				
				AssignStmt loopsArgSetValue = Jimple.v().newAssignStmt(Jimple.v().newArrayRef(loopsArgs, IntConstant.v(0)), loopsToPrintObject);
				units.insertBefore(loopsArgSetValue, s);
				
		        Local ref = Jimple.v().newLocal("ref", RefType.v("java.io.PrintStream"));
				body.getLocals().add(ref);
				
				AssignStmt initOut = Jimple.v().newAssignStmt(ref, Jimple.v().newStaticFieldRef(Scene.v().getField("<java.lang.System: java.io.PrintStream out>").makeRef()));
				units.insertBefore(initOut, s);
				
				SootMethod toCall = Scene.v().getMethod("<java.io.PrintStream: java.io.PrintStream printf(java.lang.String,java.lang.Object[])>");
				
				InvokeStmt printInv = Jimple.v().newInvokeStmt(Jimple.v().newVirtualInvokeExpr(ref, toCall.makeRef(),StringConstant.v("Total number of iterations is: %d\n"),loopsArgs));
				units.insertBefore(printInv, s);
			}
		}
		
        
		body.validate();
		
		String filename = SourceLocator.v().getFileNameFor(sootClass, Options.output_format_class);
		File fn= new File(transformedClassPath+filename);
		fn.getParentFile().mkdirs();
		OutputStream streamOut = new FileOutputStream(fn);
//		JasminOutputStream writerOut = new JasminOutputStream(streamOut);
		PrintWriter writerOut = new PrintWriter(new JasminOutputStream(streamOut));
//		JasminOutputStream writerOut = new JasminOutputStream(new OutputStreamWriter(streamOut));
		JasminClass jasminClass = new JasminClass(sootClass);
		jasminClass.print(writerOut);
		writerOut.flush();
	}

}
