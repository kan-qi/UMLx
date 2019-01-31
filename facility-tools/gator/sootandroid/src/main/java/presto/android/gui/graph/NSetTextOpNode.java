/*
 * NSetTextOpNode.java - part of the GATOR project
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

// Models operations that specify the displayed text for a given GUI object.
// Examples of such GUI objects: menu item, button, text label, etc.
// hailong: reuse this class for setHint()
public class NSetTextOpNode extends NOpNode {
  public Type type;

  public NSetTextOpNode(NNode textNode, NNode receiverNode, Type type,
                        Pair<Stmt, SootMethod> callSite) {
    // NOTE: for now, this operation is added so that we can produce some useful
    //       information for the experiments. However, it is not described in
    //       the paper. Therefore, we will treat them all as "artificial".
    super(callSite, true);
    textNode.addEdgeTo(this);
    receiverNode.addEdgeTo(this);
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
  public boolean hasReceiver() {
    return true;
  }

  @Override
  public boolean hasParameter() {
    return true;
  }

  // no getLhs()
  @Override
  public boolean hasLhs() {
    return false;
  }

  public enum Type {
    TITLE, // for menus and dialogs
    TEXT, // for TextView.setText()
    HINT // for TextView.setHint()
  }
}
