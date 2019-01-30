/*
 * NViewAllocNode.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android.gui.graph;

import soot.SootClass;

public class NViewAllocNode extends NAllocNode {
  public SootClass c; // the subclass of android.view.View

  @Override
  public String toString() {
    String p = "";
    if (parents == null) {
      p = "*]";
    } else if (parents.size() == 1) {
      p = parents.iterator().next().id + "]";
    } else {
      for (NNode n : parents) {
        p += n.id + ";";
      }
      p += "]";
    }
    return "NEWVIEW[" + c + "," + (idNode == null ? "*" : idNode) + "," + p
            + id;
  }
}
