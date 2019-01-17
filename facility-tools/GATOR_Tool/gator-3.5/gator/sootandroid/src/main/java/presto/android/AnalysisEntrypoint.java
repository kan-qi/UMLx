/*
 * AnalysisEntrypoint.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android;

import presto.android.gui.GUIAnalysis;
import soot.Scene;
import soot.SootClass;
import soot.SootMethod;

import java.util.Date;

public class AnalysisEntrypoint {
  private static AnalysisEntrypoint theInstance;

  private AnalysisEntrypoint() {
  }

  public static synchronized AnalysisEntrypoint v() {
    if (theInstance == null) {
      theInstance = new AnalysisEntrypoint();
    }
    return theInstance;
  }

  public void run() {
    Logger.stat("#Classes: " + Scene.v().getClasses().size() +
            ", #AppClasses: " + Scene.v().getApplicationClasses().size());
    Logger.trace("TIMECOST", "Start at " + System.currentTimeMillis());
    // Sanity check
    if (!"1".equals(System.getenv("PRODUCTION"))) {
      validate();
    }


//    final int[] numStmt = {0};
//    Scene.v().getClasses().parallelStream().forEach(new Consumer<SootClass>() {
//      @Override
//      public void accept(SootClass sootClass) {
//        if (!sootClass.isConcrete())
//          return;
//        sootClass.getMethods().parallelStream().forEach(new Consumer<SootMethod>() {
//          @Override
//          public void accept(SootMethod sootMethod) {
//            if (!sootMethod.isConcrete())
//              return;
//            Body b = sootMethod.retrieveActiveBody();
//            Stream<Unit> stmtStream = b.getUnits().parallelStream();
//            stmtStream.forEach(new Consumer<Unit>() {
//              @Override
//              public void accept(Unit unit) {
//                Stmt currentStmt = (Stmt) unit;
//                numStmt[0] += 1;
//              }
//            });
//          }
//        });
//      }
//    });
//
//    Logger.stat("#Stmt: " + numStmt[0] + " (not correct)");

    if (Configs.libraryPackages == null || Configs.libraryPackages.isEmpty()) {
      //If library packages are not defined
      Logger.trace("VERB", "lib pkg list is empty. Use default");
      Configs.addLibraryPackage("android.support.*");
      Configs.addLibraryPackage("com.google.android.gms.*");
    }
    
    StringBuilder sb = new StringBuilder();
    for (SootClass c : Scene.v().getClasses()) {
    sb.append(c.getName()+"\n");
      if (Configs.isLibraryClass(c.getName())) {
        if ((!c.isPhantomClass()) && c.isApplicationClass()) {
          c.setLibraryClass();
        }
      }
    }
    
    Debug2.v().printf("classes: %s", sb.toString());

//    // Analysis
//    // TODO: use reflection to allow nice little extensions.
//    if (Configs.guiAnalysis) {
//      GUIAnalysis guiAnalysis = GUIAnalysis.v();
//      guiAnalysis.run();
//      Date endTime = new Date();
//      Logger.verb(this.getClass().getSimpleName(),
//              "Soot stopped on " + endTime);
//      System.exit(0);
//    }
    
    CodeAnalysis codeAnalysis = CodeAnalysis.v();
    codeAnalysis.run();
    System.exit(0);
  }

  void validate() {
    validateMethodNames();
  }

  // Validate to catch typos in MethodNames.
  void validateMethodNames() {
    SootClass activity = Scene.v().getSootClass("android.app.Activity");
    //assertTrue(!activity.isPhantom(), "Activity class is phantom.");
    activity.getMethod(MethodNames.activityOpenContextMenuSubsig);
    activity.getMethod(MethodNames.activityOpenOptionsMenuSubsig);
    activity.getMethod(MethodNames.onCreateContextMenuSubSig);
    activity.getMethod(MethodNames.onPrepareOptionsMenuSubsig);
    activity.getMethod(MethodNames.activityShowDialogSubSig);
    if (Configs.numericApiLevel >= 8) {
      activity.getMethod(MethodNames.activityShowDialogBundleSubSig);
    }
    activity.getMethod(MethodNames.activityDismissDialogSubSig);
    activity.getMethod(MethodNames.activityRemoveDialogSubSig);

    SootClass listActivity = Scene.v().getSootClass("android.app.ListActivity");
//    assertTrue(!listActivity.isPhantom(), "ListActivity is phantom.");
    if (!listActivity.isPhantom()) {
      listActivity.getMethod(MethodNames.onListItemClickSubSig);
    } else {
      Scene.v().removeClass(listActivity);
    }

    SootClass tabHost = Scene.v().getSootClass("android.widget.TabHost");
    if (!tabHost.isPhantom()) {
      tabHost.getMethod(MethodNames.tabHostAddTabSugSig);
      tabHost.getMethod(MethodNames.tabHostNewTabSpecSubSig);
    } else {
      Scene.v().removeClass(tabHost);
    }

    SootClass tabSpec = Scene.v().getSootClass("android.widget.TabHost$TabSpec");
    if (!tabSpec.isPhantom()) {
      tabSpec.getMethod(MethodNames.tabSpecSetIndicatorCharSeqSubSig);
      tabSpec.getMethod(MethodNames.tabSpecSetIndicatorCharSeqDrawableSubSig);
      if (Configs.numericApiLevel >= 4) {
        tabSpec.getMethod(MethodNames.tabSpecSetIndicatorViewSubSig);
      }
      tabSpec.getMethod(MethodNames.tabSpecSetContentIntSubSig);
      tabSpec.getMethod(MethodNames.tabSpecSetContentFactorySubSig);
      tabSpec.getMethod(MethodNames.tabSpecSetContentIntentSubSig);
    } else {
      Scene.v().removeClass(tabSpec);
    }

    SootClass tabContentFactory =
            Scene.v().getSootClass("android.widget.TabHost$TabContentFactory");
    if (!tabContentFactory.isPhantom()) {
      tabContentFactory.getMethod(MethodNames.tabContentFactoryCreateSubSig);
    } else {
      Scene.v().removeClass(tabContentFactory);
    }

    SootClass layoutInflater =
            Scene.v().getSootClass("android.view.LayoutInflater");
    assertTrue(!layoutInflater.isPhantom(), "LayoutInflater class is phantom.");

    SootClass view = Scene.v().getSootClass("android.view.View");
    assertTrue(!view.isPhantom(), "View class is phantom.");

    view.getMethod(MethodNames.viewShowContextMenuSubsig);
    view.getMethod(MethodNames.viewOnCreateContextMenuSubSig);

    SootMethod setContentView1 = activity.getMethod(MethodNames.setContentViewSubSig);
    assertTrue(MethodNames.setContentViewSubSig.equals(setContentView1.getSubSignature()),
            "MethodNames.setContentViewSubSig is incorrect.");
    SootMethod setContentView2 = activity.getMethod(MethodNames.setContentViewViewSubSig);
    assertTrue(MethodNames.setContentViewViewSubSig.equals(setContentView2.getSubSignature()),
            "MethodNames.setContentViewViewSubSig is incorrect.");
    activity.getMethod(MethodNames.setContentViewViewParaSubSig);

    SootClass dialog = Scene.v().getSootClass("android.app.Dialog");
    dialog.getMethod(MethodNames.setContentViewSubSig);
    dialog.getMethod(MethodNames.setContentViewViewSubSig);
    dialog.getMethod(MethodNames.setContentViewViewParaSubSig);

    SootMethod inflate1 = layoutInflater.getMethod(
            "android.view.View inflate(int,android.view.ViewGroup)");
    assertTrue(MethodNames.layoutInflaterInflate.equals(inflate1.getSignature()),
            "MethodNames.layoutInflaterInflate is incorrect.");
    SootMethod inflate2 = layoutInflater.getMethod(
            "android.view.View inflate(int,android.view.ViewGroup,boolean)");
    assertTrue(MethodNames.layoutInflaterInflateBool.equals(inflate2.getSignature()),
            "MethodNames.layoutInflaterInflateBool is incorrect.");

    SootMethod inflate3 = view.getMethod(
            "android.view.View inflate(android.content.Context,int,android.view.ViewGroup)");
    assertTrue(MethodNames.viewCtxInflate.equals(inflate3.getSignature()),
            "MethodNames.viewCtxInflate is incorrect.");

    SootMethod findView1 = view.getMethod(
            "android.view.View findViewById(int)");
    assertTrue(MethodNames.viewFindViewById.equals(findView1.getSignature()),
            "MethodNames.viewFindViewById is incorrect.");
    SootMethod findView2 = activity.getMethod(
            "android.view.View findViewById(int)");
    assertTrue(MethodNames.actFindViewById.equals(findView2.getSignature()),
            "MethodNames.actFindViewById is incorrect.");

    SootMethod findView3 = activity.getMethod(MethodNames.findViewByIdSubSig);
    assertTrue(MethodNames.findViewByIdSubSig.equals(findView3.getSubSignature()),
            "MethodNames.findViewByIdSubSig is incorrect.");

    SootMethod setId = view.getMethod(MethodNames.setIdSubSig);
    assertTrue(MethodNames.setIdSubSig.equals(setId.getSubSignature()),
            "MethodNames.setIdSubSig is incorrect.");

    // MethodNames.addViewName is fine

    SootMethod findFocus1 = view.getMethod(MethodNames.findFocusSubSig);
    assertTrue(MethodNames.findFocusSubSig.equals(findFocus1.getSubSignature()),
            "MethodNames.findFocusSubSig is incorrect.");

    // Dialogs
    SootClass dialogInterfaceOnCancel =
            Scene.v().getSootClass("android.content.DialogInterface$OnCancelListener");
    assertTrue(
            !dialogInterfaceOnCancel.isPhantom(),
            "DialogInterface.OnCancelListener is phantom!");

    SootMethod dialogInterfaceOnCancelMethod =
            dialogInterfaceOnCancel.getMethod(MethodNames.dialogOnCancelSubSig);
    assertTrue(
            MethodNames.dialogOnCancelSubSig.equals(
                    dialogInterfaceOnCancelMethod.getSubSignature()),
            "MethodNames.dialogOnCancelSubSig is incorrect.");

    SootClass dialogInterfaceOnKey =
            Scene.v().getSootClass("android.content.DialogInterface$OnKeyListener");
    assertTrue(!dialogInterfaceOnKey.isPhantom(), "DialogInterface.OnCancelListener is phantom!");

    dialogInterfaceOnKey.getMethod(MethodNames.dialogOnKeySubSig);

    SootClass dialogInterfaceOnShow =
            Scene.v().getSootClass("android.content.DialogInterface$OnShowListener");
    assertTrue(
            !dialogInterfaceOnShow.isPhantom(),
            "DialogInterface.OnShowListener is phantom!");
    dialogInterfaceOnShow.getMethod(MethodNames.dialogOnShowSubSig);

    SootClass alertDialog = Scene.v().getSootClass("android.app.AlertDialog");
    assertTrue(!alertDialog.isPhantom(), "AlertDialog is phantom!");

    alertDialog.getMethod(MethodNames.alertDialogSetButtonCharSeqListenerSubSig);
    alertDialog.getMethod(MethodNames.alertDialogSetButtonCharSeqMsgSubSig);
    alertDialog.getMethod(MethodNames.alertDialogSetButtonIntCharSeqListenerSubSig);
    alertDialog.getMethod(MethodNames.alertDialogSetButtonIntCharSeqMsgSubSig);
  }

  void assertTrue(boolean assertion, String message) {
    if (!assertion) {
      throw new RuntimeException(message);
    }
  }
}
