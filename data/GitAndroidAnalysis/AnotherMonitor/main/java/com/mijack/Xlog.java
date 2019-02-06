package com.mijack;

import android.os.Process;
import android.util.Log;


/**
* Created by Mr.Yuan on 2017/3/31.
*/
public class Xlog {
    public static final String TAG = "Xlog";
    public static final String LOG_TYPE_EXECUTE = "execute";
    public static final String LOG_TYPE_ENTER = "enter";
    public static final String LOG_TYPE_EXIT = "exit";
    public static final String INSTANCE_METHOD_TYPE = "instance_method_type";
    public static final String STATIC_METHOD_TYPE = "static_method_type";

    //static ObjectMapper objectMapper = new ObjectMapper();
    public static void logMethodExecute(String methodSign, Object instance, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExecute(String,Object,[Object)");logMethodExecuteInfo(INSTANCE_METHOD_TYPE, methodSign, instance, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExecute(String,Object,[Object)");
    }

    public static void logStaticMethodExecute(String methodSign, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExecute(String,[Object)");logMethodExecuteInfo(STATIC_METHOD_TYPE, methodSign, null, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExecute(String,[Object)");
    }

    //Xlog.logMethodEnter(System.identityHashCode(param),method2String(param.method), param.thisObject, param.args);
    public static void logMethodEnter(String methodSign, Object instance, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodEnter(String,Object,[Object)");logMethodEnter(-1, methodSign, instance, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodEnter(String,Object,[Object)");
    }

    public static void logMethodEnter(int hookId, String methodSign, Object instance, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodEnter(int,String,Object,[Object)");logMethodEnterInfo(hookId, INSTANCE_METHOD_TYPE, methodSign, instance, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodEnter(int,String,Object,[Object)");
    }

    //Xlog.logStaticMethodEnter(System.identityHashCode(param),method2String(param.method), param.args);
    public static void logStaticMethodEnter(String methodSign, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodEnter(String,[Object)");logStaticMethodEnter(-1, methodSign, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodEnter(String,[Object)");
    }

    public static void logStaticMethodEnter(int hookId, String methodSign, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodEnter(int,String,[Object)");logMethodEnterInfo(hookId, STATIC_METHOD_TYPE, methodSign, null, args);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodEnter(int,String,[Object)");
    }
//Xlog.logStaticMethodExitWithThrowable(System.identityHashCode(param),method2String(param.method), param.getThrowable());
public static void logStaticMethodExitWithThrowable( String methodSign, Throwable throwable) {com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExitWithThrowable(String,Throwable)");logStaticMethodExitWithThrowable(-1,methodSign, throwable);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExitWithThrowable(String,Throwable)");}
public static void logStaticMethodExitWithThrowable(int hookId, String methodSign, Throwable throwable) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExitWithThrowable(int,String,Throwable)");logMethodExitInfo(hookId,STATIC_METHOD_TYPE,methodSign,-1,null,throwable);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExitWithThrowable(int,String,Throwable)");
}
//Xlog.logStaticMethodExit(System.identityHashCode(param),method2String(param.method));
public static void logStaticMethodExit(String methodSign) {com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExit(String)");logStaticMethodExit(-1,methodSign);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExit(String)");}
public static void logStaticMethodExit(int hookId, String methodSign) {
    com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExit(int,String)");logMethodExitInfo(hookId,STATIC_METHOD_TYPE,methodSign,-1,null,null);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExit(int,String)");
}
public static void logStaticMethodExit(String methodSign, int index) {
    com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExit(String,int)");logMethodExitInfo(-1,STATIC_METHOD_TYPE,methodSign,index,null,null);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExit(String,int)");
}
//Xlog.logMethodExitWithThrowable(System.identityHashCode(param),method2String(param.method), param.thisObject, param.getThrowable());
public static void logMethodExitWithThrowable( String methodSign, Object instance, Throwable throwable) {com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExitWithThrowable(String,Object,Throwable)");logMethodExitWithThrowable(-1,methodSign, instance, throwable);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExitWithThrowable(String,Object,Throwable)");}
public static void logMethodExitWithThrowable(int hookId, String methodSign, Object instance, Throwable throwable) {
    com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExitWithThrowable(int,String,Object,Throwable)");logMethodExitInfo(hookId,INSTANCE_METHOD_TYPE,methodSign,-1,instance,throwable);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExitWithThrowable(int,String,Object,Throwable)");

}
//Xlog.logMethodExit(System.identityHashCode(param),method2String(param.method), param.thisObject);
public static void logMethodExit(String methodSign, Object instance) {com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExit(String,Object)");logMethodExit(methodSign, instance,-1);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExit(String,Object)");}
public static void logMethodExit(String methodSign, Object instance, int index) {
    com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExit(String,Object,int)");logMethodExitInfo(-1,INSTANCE_METHOD_TYPE,methodSign,index,instance,null);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExit(String,Object,int)");

}
public static void logMethodExit(int hookId, String methodSign, Object instance) {
    com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExit(int,String,Object)");logMethodExitInfo(hookId,INSTANCE_METHOD_TYPE,methodSign,-1,instance,null);com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExit(int,String,Object)");
}

    public static void logMethodExitInfo(int hookId,String methodType, String methodSign, int index, Object instance, Throwable throwable) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExitInfo(int,String,String,int,Object,Throwable)");StringBuilder sb = new StringBuilder("{").append(String.format(KEY_TO_VALUE, "logType", LOG_TYPE_EXIT));
        sb.append(",").append(String.format(KEY_TO_VALUE, "time", System.currentTimeMillis()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "processName", XlogUtils.getProcessName()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "threadName", XlogUtils.getCurrentThreadInfo()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "pid", XlogUtils.getProcessId()));
        if (hookId > 0) {
            sb.append(",").append(String.format(KEY_TO_VALUE, "hookId", hookId));
        }
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodType", methodType));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodSign", methodSign));
        if (index > 0) {
            sb.append(",").append(String.format(KEY_TO_VALUE, "index", index));
        }
        if (INSTANCE_METHOD_TYPE.equals(methodType)) {
            sb.append(",").append(String.format(KEY_TO_VALUE2, "instance", XlogUtils.object2String(instance)));
        }
        if (throwable !=null){
            sb.append(",").append(String.format(KEY_TO_VALUE, "throwable", XlogUtils.object2String(throwable)));
        }
        sb.append("}");
        XLoger.d(TAG, sb.toString());com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExitInfo(int,String,String,int,Object,Throwable)");
    }

    public static void logMethodExecuteInfo(String methodType, String methodSign, Object instance, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExecuteInfo(String,String,Object,[Object)");StringBuilder sb = new StringBuilder("{").append(String.format(KEY_TO_VALUE, "logType", LOG_TYPE_EXECUTE));
        sb.append(",").append(String.format(KEY_TO_VALUE, "time", System.currentTimeMillis()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "processName", XlogUtils.getProcessName()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "threadName", XlogUtils.getCurrentThreadInfo()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "pid", XlogUtils.getProcessId()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodType", methodType));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodSign", methodSign));
//å¤æ­æ¯å¦æ¯æ¹æ³å¼å§
        if (INSTANCE_METHOD_TYPE.equals(methodType)) {
            sb.append(",").append(String.format(KEY_TO_VALUE2, "instance", XlogUtils.object2String(instance)));
        }
        sb.append(",").append(XlogUtils.paramsToString(args));
        sb.append("}");
        XLoger.d(TAG, sb.toString());com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExecuteInfo(String,String,Object,[Object)");
    }

    public static void logMethodEnterInfo(int hookId, String methodType, String methodSign, Object instance, Object... args) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodEnterInfo(int,String,String,Object,[Object)");StringBuilder sb = new StringBuilder("{").append(String.format(KEY_TO_VALUE, "logType", LOG_TYPE_ENTER));
        sb.append(",").append(String.format(KEY_TO_VALUE, "time", System.currentTimeMillis()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "processName", XlogUtils.getProcessName()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "threadName", XlogUtils.getCurrentThreadInfo()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "pid", XlogUtils.getProcessId()));
        if (hookId > 0) {
            sb.append(",").append(String.format(KEY_TO_VALUE, "hookId", hookId));
        }
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodType", methodType));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodSign", methodSign));
//å¤æ­æ¯å¦æ¯æ¹æ³å¼å§
        if (INSTANCE_METHOD_TYPE.equals(methodType)) {
            sb.append(",").append(String.format(KEY_TO_VALUE2, "instance", XlogUtils.object2String(instance)));
        }
        sb.append(",").append(XlogUtils.paramsToString(args));
        sb.append("}");
        XLoger.d(TAG, sb.toString());com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodEnterInfo(int,String,String,Object,[Object)");
    }

    public static final String KEY_TO_VALUE = "\"%s\":\"%s\"";
    public static final String KEY_TO_VALUE2 = "\"%s\":%s";

    public static void logStaticMethodExitWithResult(int hookId, String methodSign, Object result) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logStaticMethodExitWithResult(int,String,Object)");StringBuilder sb = new StringBuilder("{").append(String.format(KEY_TO_VALUE, "logType", LOG_TYPE_EXIT));
        sb.append(",").append(String.format(KEY_TO_VALUE, "time", System.currentTimeMillis()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "processName", XlogUtils.getProcessName()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "threadName", XlogUtils.getCurrentThreadInfo()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "pid", XlogUtils.getProcessId()));
        if (hookId > 0) {
            sb.append(",").append(String.format(KEY_TO_VALUE, "hookId", hookId));
        }
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodType", STATIC_METHOD_TYPE));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodSign", methodSign));
        sb.append(",").append(String.format(KEY_TO_VALUE2, "result", XlogUtils.object2String(result)));
        sb.append("}");
        XLoger.d(TAG, sb.toString());com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logStaticMethodExitWithResult(int,String,Object)");
    }

    public static void logMethodExitWithResult(int hookId, String methodSign, Object instance, Object result) {
        com.mijack.Xlog.logStaticMethodEnter("void com.mijack.Xlog.logMethodExitWithResult(int,String,Object,Object)");StringBuilder sb = new StringBuilder("{").append(String.format(KEY_TO_VALUE, "logType", LOG_TYPE_EXIT));
        sb.append(",").append(String.format(KEY_TO_VALUE, "time", System.currentTimeMillis()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "processName", XlogUtils.getProcessName()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "threadName", XlogUtils.getCurrentThreadInfo()));
        sb.append(",").append(String.format(KEY_TO_VALUE, "pid", XlogUtils.getProcessId()));
        if (hookId > 0) {
            sb.append(",").append(String.format(KEY_TO_VALUE, "hookId", hookId));
        }
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodType", INSTANCE_METHOD_TYPE));
        sb.append(",").append(String.format(KEY_TO_VALUE, "methodSign", methodSign));
        sb.append(",").append(String.format(KEY_TO_VALUE2, "instance", XlogUtils.object2String(instance)));
        sb.append(",").append(String.format(KEY_TO_VALUE2, "result", XlogUtils.object2String(result)));
        sb.append("}");
        XLoger.d(TAG, sb.toString());com.mijack.Xlog.logStaticMethodExit("void com.mijack.Xlog.logMethodExitWithResult(int,String,Object,Object)");
    }
}
