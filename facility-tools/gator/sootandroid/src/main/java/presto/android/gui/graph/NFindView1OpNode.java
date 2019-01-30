/*
 * NFindView1OpNode.java - part of the GATOR project
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

// FindView1: lhs = view.findViewById(id)
public class NFindView1OpNode extends NOpNode {
  public FindView1Type type;

  public NFindView1OpNode(NNode idNode, NNode receiverNode,
                          NNode lhsNode, Pair<Stmt, SootMethod> callSite, FindView1Type type,
                          boolean artificial) {
    super(callSite, artificial);
    idNode.addEdgeTo(this);
    receiverNode.addEdgeTo(this);
    this.addEdgeTo(lhsNode);
    this.type = type;
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

  public enum FindView1Type {
    Ordinary,
    MenuFindItem,
  }
}
