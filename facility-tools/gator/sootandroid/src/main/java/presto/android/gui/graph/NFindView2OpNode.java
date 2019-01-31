/*
 * NFindView2OpNode.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android.gui.graph;

import soot.SootMethod;
import soot.jimple.Stmt;
import soot.toolkits.scalar.Pair;

// FindView2: lhs = act/dialog.findViewById(id)
public class NFindView2OpNode extends NOpNode {
  public NFindView2OpNode(NNode idNode, NNode receiverNode,
                          NNode lhsNode, Pair<Stmt, SootMethod> callSite, boolean artificial) {
    super(callSite, artificial);
    idNode.addEdgeTo(this);
    receiverNode.addEdgeTo(this);
    this.addEdgeTo(lhsNode);
  }

  @Override
  public NVarNode getReceiver() {
    return (NVarNode) this.pred.get(1);
  }

  @Override
  public NNode getParameter() {
    return this.pred.get(0);
  }

  @Override
  public NVarNode getLhs() {
    return (NVarNode) this.getSuccessor(0);
  }

  @Override
  public boolean hasReceiver() {
    return true;
  }

  @Override
  public boolean hasParameter() {
    return true;
  }

  @Override
  public boolean hasLhs() {
    return true;
  }
}
