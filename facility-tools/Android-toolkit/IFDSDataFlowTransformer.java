package sootandroid.src.main.java.presto.android;

import heros.IFDSTabulationProblem;
import heros.InterproceduralCFG;
import heros.solver.IFDSSolver;
import presto.android.CodeAnalysis;
import presto.android.Configs;
import presto.android.gui.clients.energy.Pair;
import soot.SceneTransformer;
import soot.SootMethod;
import soot.Unit;
import soot.Value;
import soot.jimple.DefinitionStmt;
import soot.jimple.toolkits.ide.exampleproblems.IFDSReachingDefinitions;
import soot.jimple.toolkits.ide.icfg.JimpleBasedInterproceduralCFG;

import java.util.Map;
import java.util.Set;

// Subclass of SceneTransformer to run Heros IFDS solver in Soot's "wjtp" pack
public class IFDSDataFlowTransformer extends SceneTransformer {
    @Override
    protected void internalTransform(String phaseName, Map<String, String> options) {
        JimpleBasedInterproceduralCFG icfg= new JimpleBasedInterproceduralCFG();
        IFDSTabulationProblem problem = new IFDSReachingDefinitions(icfg);

        IFDSSolver<Unit, Pair<Value, Set<DefinitionStmt>>,
                        SootMethod, InterproceduralCFG<Unit, SootMethod>> solver =
                new IFDSSolver<Unit, Pair<Value, Set<DefinitionStmt>>, SootMethod,
                        InterproceduralCFG<Unit, SootMethod>>(problem);

        System.out.println("Starting solver");
        solver.solve();
        System.out.println("Done");

        System.out.println("enter Code analysis");
        if(Configs.codeAnalysis) {
            CodeAnalysis codeAnalysis = CodeAnalysis.v();
            codeAnalysis.run();
        }

        System.out.println("exit Code analysis");

    }
}