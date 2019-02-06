/*
 * 2010-2017 (C) Antonio Redondo
 * http://antonioredondo.com
 * http://github.com/AntonioRedondo/AnotherMonitor
 *
 * Code under the terms of the GNU General Public License v3.
 *
 */

package org.anothermonitor;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.widget.LinearLayout;


public class LinearLayoutCustomised extends LinearLayout {
	private boolean touchEventsDisabled = true;
	
//	public LinearLayoutCustomised(Context context) {
//		super(context);
//	}
	
	public LinearLayoutCustomised(Context context, AttributeSet attrs) {
		super(context, attrs);com.mijack.Xlog.logMethodEnter("org.anothermonitor.LinearLayoutCustomised.LinearLayoutCustomised(android.content.Context,android.util.AttributeSet)",this);com.mijack.Xlog.logMethodExit("org.anothermonitor.LinearLayoutCustomised.LinearLayoutCustomised(android.content.Context,android.util.AttributeSet)",this);
	}
	
	@Override
	public boolean onInterceptTouchEvent(MotionEvent ev) {
		com.mijack.Xlog.logMethodEnter("boolean org.anothermonitor.LinearLayoutCustomised.onInterceptTouchEvent(android.view.MotionEvent)",this);com.mijack.Xlog.logMethodExit("boolean org.anothermonitor.LinearLayoutCustomised.onInterceptTouchEvent(android.view.MotionEvent)",this);return touchEventsDisabled;
	}
	
	public void interceptChildTouchEvents(boolean b) {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.LinearLayoutCustomised.interceptChildTouchEvents(boolean)",this);touchEventsDisabled = b;com.mijack.Xlog.logMethodExit("void org.anothermonitor.LinearLayoutCustomised.interceptChildTouchEvents(boolean)",this);
	}
}
