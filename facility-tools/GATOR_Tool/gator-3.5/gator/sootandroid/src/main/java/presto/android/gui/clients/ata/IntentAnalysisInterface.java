/*
 * IntentAnalysisInterface.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android.gui.clients.ata;

import soot.jimple.Stmt;

import java.util.Set;

public interface IntentAnalysisInterface {
  /*
   * Given a statement, tell if it is a startActivity call statement.
   */
  boolean isActivityLaunch(Stmt s);

  /*
   * Given a startActivity call state, return the set of all possible target
   * activities (represented in class name).
   */
  Set<String> getTargetActivities(Stmt s);

  /*
   * Given a startActivity call statement and the target activity, return the
   * set of all possible IntentFlags objects.
   */
  Set<LaunchConfiguration> getLaunchConfigurations(Stmt s, String targetActivity);

  /*
   * Return the set of all startActivity call statements in the application
   * code. Note that we treat MenuItem.setIntent() as an activity launch call
   * as well. It is a simple hack that works for this analysis, but *not* for
   * wtg construction.
   */
  Set<Stmt> getAllActivityLaunchCalls();

  /*
   * Return the set of all startActivity call statements when the specified
   * activity is on top of stack.
   *
   * TODO(tony): provide variants of this that adds constraints on what set of
   * callback methods are considered reachable.
   */
  Set<Stmt> getActivityLaunchCalls(String activityClassName);
}
