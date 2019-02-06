/* 
 * 2010-2017 (C) Antonio Redondo
 * http://antonioredondo.com
 * http://github.com/AntonioRedondo/AnotherMonitor
 *
 * Code under the terms of the GNU General Public License v3.
 *
 */

package org.anothermonitor;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.text.DecimalFormat;
import java.util.Calendar;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.TaskStackBuilder;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.*;
import android.os.Debug.MemoryInfo;
import android.os.Process;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.widget.Toast;

public class ServiceReader extends Service {
	
	private boolean /*threadSuspended, */recording, firstRead = true, topRow = true;
	private int memTotal, pId, intervalRead, intervalUpdate, intervalWidth, maxSamples = 2000;
	private long workT, totalT, workAMT, total, totalBefore, work, workBefore, workAM, workAMBefore;
	private String s;
	private String[] sa;
	private List<Float> cpuTotal, cpuAM;
	private List<Integer> memoryAM;
	private List<Map<String, Object>> mListSelected; // Integer		 C.pId
												  // String		 C.pName
												  // Integer	 C.work
												  // Integer	 C.workBefore
												  // List<Sring> C.finalValue
	private List<String> memUsed, memAvailable, memFree, cached, threshold;
	private ActivityManager am;
	private Debug.MemoryInfo[] amMI;
	private ActivityManager.MemoryInfo mi;
	private NotificationManager mNM;
	private Notification mNotificationRead, mNotificationRecord;
	private BufferedReader reader;
	private BufferedWriter mW;
	private File mFile;
	private SharedPreferences mPrefs;
	private Runnable readRunnable = new Runnable() { // http://docs.oracle.com/javase/8/docs/technotes/guides/concurrency/threadPrimitiveDeprecation.html
		@Override   
		public void run() {
			com.mijack.Xlog.logMethodEnter("void org.anothermonitor.1.run()",this);// The service makes use of an explicit Thread instead of a Handler because with the Threat the code is executed more synchronously.
			// However the ViewGraphic is drew with a Handler because the drawing code must be executed in the UI thread.
			Thread thisThread = Thread.currentThread();
			while (readThread == thisThread) {
				read();
				try {
					Thread.sleep(intervalRead);
/*					synchronized (this) {
						while (readThread == thisThread && threadSuspended)
							wait();
					}*/
				} catch (InterruptedException e) {
					break;
				}
				
				// The Runnable can be suspended and resumed with the below code:
//				threadSuspended = !threadSuspended;
//				if (!threadSuspended)
//					notify();
			}com.mijack.Xlog.logMethodExit("void org.anothermonitor.1.run()",this);
		}
		
/*		public synchronized void stop() {
			readThread = null;
			notify();
		}*/
		
		
	};
	private volatile Thread readThread = new Thread(readRunnable, C.readThread);
	private BroadcastReceiver receiverStartRecord = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			com.mijack.Xlog.logMethodEnter("void org.anothermonitor.2.onReceive(android.content.Context,android.app.PendingIntent)",this);startRecord();
			sendBroadcast(new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS));com.mijack.Xlog.logMethodExit("void org.anothermonitor.2.onReceive(android.content.Context,android.app.PendingIntent)",this);
		}
	},
	receiverStopRecord = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			com.mijack.Xlog.logMethodEnter("void org.anothermonitor.3.onReceive(android.content.Context,android.app.PendingIntent)",this);stopRecord();
			sendBroadcast(new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS));com.mijack.Xlog.logMethodExit("void org.anothermonitor.3.onReceive(android.content.Context,android.app.PendingIntent)",this);
		}
	},
	receiverClose = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			com.mijack.Xlog.logMethodEnter("void org.anothermonitor.4.onReceive(android.content.Context,android.app.PendingIntent)",this);sendBroadcast(new Intent(Intent.ACTION_CLOSE_SYSTEM_DIALOGS));
			sendBroadcast(new Intent(C.actionFinishActivity));
			stopSelf();com.mijack.Xlog.logMethodExit("void org.anothermonitor.4.onReceive(android.content.Context,android.app.PendingIntent)",this);
		}
	};
	
	
	
	
	
	class ServiceReaderDataBinder extends Binder {
		ServiceReader getService() {
			com.mijack.Xlog.logMethodEnter("org.anothermonitor.ServiceReader org.anothermonitor.ServiceReader$ServiceReaderDataBinder.getService()",this);com.mijack.Xlog.logMethodExit("org.anothermonitor.ServiceReader org.anothermonitor.ServiceReader$ServiceReaderDataBinder.getService()",this);return ServiceReader.this;
		}
	}
	
	
	
	
	
	@Override
	public void onCreate() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.onCreate()",this);cpuTotal = new ArrayList<Float>(maxSamples);
		cpuAM = new ArrayList<Float>(maxSamples);
		memoryAM = new ArrayList<Integer>(maxSamples);
		memUsed = new ArrayList<String>(maxSamples);
		memAvailable = new ArrayList<String>(maxSamples);
		memFree = new ArrayList<String>(maxSamples);
		cached = new ArrayList<String>(maxSamples);
		threshold = new ArrayList<String>(maxSamples);
		
		pId = Process.myPid();
		
		am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
		amMI = am.getProcessMemoryInfo(new int[]{ pId });
		mi = new ActivityManager.MemoryInfo();
		
		mPrefs = getSharedPreferences(getString(R.string.app_name) + C.prefs, MODE_PRIVATE);
		intervalRead = mPrefs.getInt(C.intervalRead, C.defaultIntervalRead);
		intervalUpdate = mPrefs.getInt(C.intervalUpdate, C.defaultIntervalUpdate);
		intervalWidth = mPrefs.getInt(C.intervalWidth, C.defaultIntervalWidth);
		
		readThread.start();
		
//		LocalBroadcastManager.getInstance(this).registerReceiver(receiver, new IntentFilter(Constants.anotherMonitorEvent));
		registerReceiver(receiverStartRecord, new IntentFilter(C.actionStartRecord));
		registerReceiver(receiverStopRecord, new IntentFilter(C.actionStopRecord));
		registerReceiver(receiverClose, new IntentFilter(C.actionClose));
		
		mNM = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
		
		PendingIntent contentIntent =  TaskStackBuilder.create(this)
//				.addParentStack(ActivityMain.class)
//				.addNextIntent(new Intent(this, ActivityMain.class))
				.addNextIntentWithParentStack(new Intent(this, ActivityMain.class))
				.getPendingIntent(0, PendingIntent.FLAG_UPDATE_CURRENT);
		PendingIntent pIStartRecord = PendingIntent.getBroadcast(this, 0, new Intent(C.actionStartRecord), PendingIntent.FLAG_UPDATE_CURRENT);
		PendingIntent pIStopRecord = PendingIntent.getBroadcast(this, 0, new Intent(C.actionStopRecord), PendingIntent.FLAG_UPDATE_CURRENT);
		PendingIntent pIClose = PendingIntent.getBroadcast(this, 0, new Intent(C.actionClose), PendingIntent.FLAG_UPDATE_CURRENT);
		
		mNotificationRead = new NotificationCompat.Builder(this)
				.setContentTitle(getString(R.string.app_name))
				.setContentText(getString(R.string.notify_read2))
//				.setTicker(getString(R.string.notify_read))
				.setSmallIcon(R.drawable.icon_bw)
				.setLargeIcon(BitmapFactory.decodeResource(getResources(), R.drawable.icon, null))
				.setWhen(0) // Removes the time
				.setOngoing(true)
				.setContentIntent(contentIntent) // PendingIntent.getActivity(this, 0, new Intent(this, ActivityMain.class), 0)
				.setStyle(new NotificationCompat.BigTextStyle().bigText(getString(R.string.notify_read2)))
				.addAction(R.drawable.icon_circle_sb, getString(R.string.menu_record), pIStartRecord)
				.addAction(R.drawable.icon_times_ai, getString(R.string.menu_close), pIClose)
				.build();
		
		mNotificationRecord = new NotificationCompat.Builder(this)
				.setContentTitle(getString(R.string.app_name))
				.setContentText(getString(R.string.notify_record2))
				.setTicker(getString(R.string.notify_record))
				.setSmallIcon(R.drawable.icon_recording_bw)
				.setLargeIcon(BitmapFactory.decodeResource(getResources(), R.drawable.icon_recording, null))
				.setWhen(0)
				.setOngoing(true)
				.setContentIntent(contentIntent)
				.setStyle(new NotificationCompat.BigTextStyle().bigText(getString(R.string.notify_record2)))
				.addAction(R.drawable.icon_stop_sb, getString(R.string.menu_stop_record), pIStopRecord)
				.addAction(R.drawable.icon_times_ai, getString(R.string.menu_close), pIClose)
				.build();
		
//		mNM.notify(0, mNotificationRead);
		startForeground(10, mNotificationRead); // If not the AM service will be easily killed when a heavy-use memory app (like a browser or Google Maps) goes onto the foregroundcom.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.onCreate()",this);
	}
	
	
	
	
	
	@Override
	public void onDestroy() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.onDestroy()",this);if (recording)
			stopRecord();
		mNM.cancelAll();
		
		unregisterReceiver(receiverStartRecord);
		unregisterReceiver(receiverStopRecord);
		unregisterReceiver(receiverClose);
		
		try {
			readThread.interrupt();
		} catch (Exception e) {
			e.printStackTrace();
		}
		synchronized (this) {
			readThread = null;
			notify();
		}com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.onDestroy()",this);
	}
	
	
	
	
	
	@Override
	public IBinder onBind(Intent intent) {
		com.mijack.Xlog.logMethodEnter("IBinder org.anothermonitor.ServiceReader.onBind(android.app.PendingIntent)",this);com.mijack.Xlog.logMethodExit("IBinder org.anothermonitor.ServiceReader.onBind(android.app.PendingIntent)",this);return new ServiceReaderDataBinder();
	}
	
	
	
	
	
	@SuppressLint("NewApi")
	@SuppressWarnings("unchecked")
	private void read() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.read()",this);try {
			reader = new BufferedReader(new FileReader("/proc/meminfo"));
			s = reader.readLine();
			while (s != null) {
				// Memory is limited as far as we know
				while (memFree.size() >= maxSamples) {
					cpuTotal.remove(cpuTotal.size() - 1);
					cpuAM.remove(cpuAM.size() - 1);
					memoryAM.remove(memoryAM.size() - 1);
					
					memUsed.remove(memUsed.size() - 1);
					memAvailable.remove(memAvailable.size() - 1);
					memFree.remove(memFree.size() - 1);
					cached.remove(cached.size() - 1);
					threshold.remove(threshold.size() - 1);
				}
				if (mListSelected != null && !mListSelected.isEmpty()) {
					List<Integer> l = (List<Integer>) (mListSelected.get(0)).get(C.pFinalValue);
					if (l != null && l.size() >= maxSamples)
						for (Map<String, Object> m : mListSelected) {
							((List<Integer>) m.get(C.pFinalValue)).remove(l.size() - 1);
							((List<Integer>) m.get(C.pTPD)).remove(((List<Integer>) m.get(C.pTPD)).size() - 1);
						}
				}
				if (mListSelected != null && !mListSelected.isEmpty()) {
					for (Map<String, Object> m : mListSelected) {
						List<Integer> l = (List<Integer>) m.get(C.pFinalValue);
						if (l == null)
							break;
						while (l.size() >= maxSamples)
							l.remove(l.size() - 1);
						l = (List<Integer>) m.get(C.pTPD);
						while (l.size() >= maxSamples)
							l.remove(l.size() - 1);
					}
				}
				
				// Memory values. Percentages are calculated in the ActivityMain class.
				if (firstRead && s.startsWith("MemTotal:")) {
					memTotal = Integer.parseInt(s.split("[ ]+", 3)[1]);
					firstRead = false;
				} else if (s.startsWith("MemFree:"))
					memFree.add(0, s.split("[ ]+", 3)[1]);
				else if (s.startsWith("Cached:"))
					cached.add(0, s.split("[ ]+", 3)[1]);
				
				s = reader.readLine();
			}
			reader.close();
			
			// http://stackoverflow.com/questions/3170691/how-to-get-current-memory-usage-in-android
			am.getMemoryInfo(mi);
			if (mi == null) { // Sometimes mi is null
				memUsed.add(0, String.valueOf(0));
				memAvailable.add(0, String.valueOf(0));
				threshold.add(0, String.valueOf(0));
			} else {
				memUsed.add(0, String.valueOf(memTotal - mi.availMem/1024));
				memAvailable.add(0, String.valueOf(mi.availMem/1024));
				threshold.add(0, String.valueOf(mi.threshold/1024));
			}
			
			memoryAM.add(amMI[0].getTotalPrivateDirty());
//			Log.d("TotalPrivateDirty", String.valueOf(amMI[0].getTotalPrivateDirty()));
//			Log.d("TotalPrivateClean", String.valueOf(amMI[0].getTotalPrivateClean()));
//			Log.d("TotalPss", String.valueOf(amMI[0].getTotalPss()));
//			Log.d("TotalSharedDirty", String.valueOf(amMI[0].getTotalSharedDirty()));
			
//			CPU usage percents calculation. It is possible negative values or values higher than 100% may appear.
//			http://stackoverflow.com/questions/1420426
//			http://kernel.org/doc/Documentation/filesystems/proc.txt
			if (Build.VERSION.SDK_INT < 26) {
				reader = new BufferedReader(new FileReader("/proc/stat"));
				sa = reader.readLine().split("[ ]+", 9);
				work = Long.parseLong(sa[1]) + Long.parseLong(sa[2]) + Long.parseLong(sa[3]);
				total = work + Long.parseLong(sa[4]) + Long.parseLong(sa[5]) + Long.parseLong(sa[6]) + Long.parseLong(sa[7]);
				reader.close();
			}
			
			reader = new BufferedReader(new FileReader("/proc/" + pId + "/stat"));
			sa = reader.readLine().split("[ ]+", 18);
			workAM = Long.parseLong(sa[13]) + Long.parseLong(sa[14]) + Long.parseLong(sa[15]) + Long.parseLong(sa[16]);
			reader.close();
			
			if (mListSelected != null && !mListSelected.isEmpty()) {
				int[] arrayPIds = new int[mListSelected.size()];
				synchronized (mListSelected) {
					int n=0;
					for (Map<String, Object> p : mListSelected) {
						try {
							if (p.get(C.pDead) == null) {
								reader = new BufferedReader(new FileReader("/proc/" + p.get(C.pId) + "/stat"));
								arrayPIds[n] = Integer.valueOf((String) p.get(C.pId));
								++n;
								sa = reader.readLine().split("[ ]+", 18);
								p.put(C.work, (float) Long.parseLong(sa[13]) + Long.parseLong(sa[14]) + Long.parseLong(sa[15]) + Long.parseLong(sa[16]));
								reader.close();
							}
						} catch (FileNotFoundException e) {
							p.put(C.pDead, Boolean.TRUE);
							Intent intent = new Intent(C.actionDeadProcess);
							intent.putExtra(C.process, (Serializable) p);
							sendBroadcast(intent);
						}
					}
				}
				
				MemoryInfo[] mip = am.getProcessMemoryInfo(arrayPIds);
				int n = 0;
				for (Map<String, Object> entry : mListSelected) {
					List<Integer> l = (List<Integer>) entry.get(C.pTPD);
					if (l == null) {
						l = new ArrayList<Integer>();
						entry.put(C.pTPD, l);
					}
					if (entry.get(C.pDead) == null) {
//						if (mip[n].getTotalPrivateDirty() !=0
//								&& mip[n].getTotalPss() != 0
//								&& mip[n].getTotalSharedDirty() != 0) // To avoid dead processes
							l.add(0, mip[n].getTotalPrivateDirty());
							++n;
					} else l.add(0, 0);
				}
//				Log.d("MemoryInfo entries", String.valueOf(mip.length));
//				Log.d("List Selected entries", String.valueOf(mListSelected.size()));
				
//				Log.d("TotalSharedClean", String.valueOf(mi[0].getTotalSharedClean()));
//				Log.d("TotalSharedDirty", String.valueOf(mi[0].getTotalSharedDirty()));
//				Log.d("TotalPrivateClean", String.valueOf(mi[0].getTotalPrivateClean()));
//				Log.d("TotalPrivateDirty", String.valueOf(mi[0].getTotalPrivateDirty()));
//				Log.d("TotalPss", String.valueOf(mi[0].getTotalPss()));
//				Log.d("Pss", String.valueOf(Debug.getPss()));
//				Log.d("GlobalAllocSize", String.valueOf(Debug.getGlobalAllocSize()));
//				Log.d("NativeHeapSize", String.valueOf(Debug.getNativeHeapSize()/1024));
//				Log.d("NativeHeapAllocatedSize", String.valueOf(Debug.getNativeHeapAllocatedSize()/1024));
			}
			
			if (totalBefore != 0) {
				totalT = total - totalBefore;
				workT = work - workBefore;
				workAMT = workAM - workAMBefore;
				
				cpuTotal.add(0, restrictPercentage(workT * 100 / (float) totalT));
				cpuAM.add(0, restrictPercentage(workAMT * 100 / (float) totalT));
				
				if (mListSelected != null && !mListSelected.isEmpty()) {
					int workPT = 0;
					List<Float> l;
					
					synchronized (mListSelected) {
						for (Map<String, Object> p : mListSelected) {
							if (p.get(C.workBefore) == null)
								break;
							l = (List<Float>) p.get(C.pFinalValue);
							if (l == null) {
								l = new ArrayList<Float>();
								p.put(C.pFinalValue, l);
							}
							while (l.size() >= maxSamples)
								l.remove(l.size() - 1);
							
							workPT = (int) ((Float) p.get(C.work) - (Float) p.get(C.workBefore));
							l.add(0, restrictPercentage(workPT * 100 / (float) totalT));
						}
					}
				}
			}
			
			totalBefore = total;
			workBefore = work;
			workAMBefore = workAM;
			
			if (mListSelected != null && !mListSelected.isEmpty())
				for (Map<String, Object> p : mListSelected)
					p.put(C.workBefore, p.get(C.work));
			
			reader.close();
			
			if (recording)
				record();
		} catch (Exception e) {
			e.printStackTrace();
		}com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.read()",this);
	}
	
	
	
	
	
	private float restrictPercentage(float percentage) {
		com.mijack.Xlog.logMethodEnter("float org.anothermonitor.ServiceReader.restrictPercentage(float)",this);if (percentage > 100)
			{com.mijack.Xlog.logMethodExit("float org.anothermonitor.ServiceReader.restrictPercentage(float)",this,1);return 100;}
		else if (percentage < 0)
			{com.mijack.Xlog.logMethodExit("float org.anothermonitor.ServiceReader.restrictPercentage(float)",this,2);return 0;}
		else {com.mijack.Xlog.logMethodExit("float org.anothermonitor.ServiceReader.restrictPercentage(float)",this,3);return percentage;}
	}
	
	
	
	
	
	@SuppressWarnings("unchecked")
	private void record() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.record()",this);if (mW == null) {
			File dir = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/AnotherMonitor");
			dir.mkdirs();
			mFile = new File(dir, new StringBuilder().append(getString(R.string.app_name)).append("Record-").append(getDate()).append(".csv").toString());
			
			try {
				mW = new BufferedWriter(new FileWriter(mFile));
			} catch (IOException e) {
				notifyError(e);
				{com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.record()",this,1);return;}
			}
		}
		
		try {
			if (topRow) {
				StringBuilder sb = new StringBuilder()
						.append(getString(R.string.app_name))
						.append(" Record,Starting date and time:,")
						.append(getDate())
						.append(",Read interval (ms):,")
						.append(intervalRead)
						.append(",MemTotal (kB),")
						.append(memTotal)
						.append("\nTotal CPU usage (%),AnotherMonitor (Pid ").append(Process.myPid()).append(") CPU usage (%),AnotherMonitor Memory (kB)");
				if (mListSelected != null && !mListSelected.isEmpty())
					for (Map<String, Object> p : mListSelected)
						sb.append(",").append(p.get(C.pAppName)).append(" (Pid ").append(p.get(C.pId)).append(") CPU usage (%)")
						  .append(",").append(p.get(C.pAppName)).append(" Memory (kB)");
				
				sb.append(",,Memory used (kB),Memory available (MemFree+Cached) (kB),MemFree (kB),Cached (kB),Threshold (kB)");
				
				mW.write(sb.toString());
				mNM.notify(10, mNotificationRecord);
				topRow = false;
			}
			
			StringBuilder sb = new StringBuilder()
					.append("\n").append(cpuTotal.get(0))
					.append(",").append(cpuAM.get(0))
					.append(",").append(memoryAM.get(0));
			if (mListSelected != null && !mListSelected.isEmpty())
				for (Map<String, Object> p : mListSelected) {
					if (p.get(C.pDead) != null)
						sb.append(",DEAD,DEAD");
					else sb.append(",").append(((List<Integer>) p.get(C.pFinalValue)).get(0))
							.append(",").append(((List<Integer>) p.get(C.pTPD)).get(0));
				}
			sb.append(",")
					.append(",").append(memUsed.get(0))
					.append(",").append(memAvailable.get(0))
					.append(",").append(memFree.get(0))
					.append(",").append(cached.get(0))
					.append(",").append(threshold.get(0));
			
			mW.write(sb.toString());
		} catch (IOException e) {
			notifyError(e);
		}
	}
	
	
	
	
	
	void startRecord() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.startRecord()",this);if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_DENIED) {
			Toast.makeText(this, getString(R.string.w_main_storage_permission), Toast.LENGTH_LONG).show();
			{com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.startRecord()",this,1);return;}
		}
		recording = true;
		sendBroadcast(new Intent(C.actionSetIconRecord));
	}
	
	void stopRecord() {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.stopRecord()",this);recording = false;
		sendBroadcast(new Intent(C.actionSetIconRecord));
		try {
			mW.flush();
			mW.close();
			mW = null;
			
			// http://stackoverflow.com/questions/13737261/nexus-4-not-showing-files-via-mtp
//			MediaScannerConnection.scanFile(this, new String[] { mFile.getAbsolutePath() }, null, null);
			// http://stackoverflow.com/questions/5739140/mediascannerconnection-produces-android-app-serviceconnectionleaked
			sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE).setData(Uri.fromFile(mFile)));
			
			Toast.makeText(this, new StringBuilder().append(getString(R.string.app_name)).append("Record-").append(getDate()).append(".csv ")
					.append(getString(R.string.notify_toast_saved))
					.append(" " + Environment.getExternalStorageDirectory().getAbsolutePath() + "/AnotherMonitor"), Toast.LENGTH_LONG).show();
		} catch (Exception e) {
			e.printStackTrace();
			Toast.makeText(this, getString(R.string.notify_toast_error) + " " + e.getMessage(), Toast.LENGTH_LONG).show();
		}
		topRow = true;
		mNM.notify(10, mNotificationRead);com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.stopRecord()",this);
	}
	
	boolean isRecording() {
		com.mijack.Xlog.logMethodEnter("boolean org.anothermonitor.ServiceReader.isRecording()",this);com.mijack.Xlog.logMethodExit("boolean org.anothermonitor.ServiceReader.isRecording()",this);return recording;
	}
	
	
	
	
	
	void notifyError(final IOException e) {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.notifyError(java.io.IOException)",this);e.printStackTrace();
		if (mW != null)
			stopRecord();
		else {
			recording = false;
			sendBroadcast(new Intent(C.actionSetIconRecord));
			
			// http://stackoverflow.com/questions/3875184/cant-create-handler-inside-thread-that-has-not-called-looper-prepare
			new Handler(Looper.getMainLooper()).post(new Runnable() {
				@Override
				public void run() {
					com.mijack.Xlog.logMethodEnter("void org.anothermonitor.5.run()",this);Toast.makeText(ServiceReader.this, getString(R.string.notify_toast_error_2) + " " + e.getMessage(), Toast.LENGTH_LONG).show();com.mijack.Xlog.logMethodExit("void org.anothermonitor.5.run()",this);
				}
			});
			
			mNM.notify(10, mNotificationRead);
		}com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.notifyError(java.io.IOException)",this);
	}
	
	
	
	
	
	private String getDate() {
		com.mijack.Xlog.logMethodEnter("String org.anothermonitor.ServiceReader.getDate()",this);Calendar c = Calendar.getInstance();
		DecimalFormat df = new DecimalFormat("00");
		{com.mijack.Xlog.logMethodExit("String org.anothermonitor.ServiceReader.getDate()",this,1);return new StringBuilder()
				.append(df.format(c.get(Calendar.YEAR))).append("-")
				.append(df.format(c.get(Calendar.MONTH) + 1)).append("-")
				.append(df.format(c.get(Calendar.DATE))).append("-")
				.append(df.format(c.get(Calendar.HOUR_OF_DAY))).append("-")
				.append(df.format(c.get(Calendar.MINUTE))).append("-")
				.append(df.format(c.get(Calendar.SECOND))).toString();}
	}
	
	
	
	
	
	void setIntervals(int intervalRead, int intervalUpdate, int intervalWidth) {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.setIntervals(int,int,int)",this);this.intervalRead = intervalRead;
		this.intervalUpdate = intervalUpdate;
		this.intervalWidth = intervalWidth;com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.setIntervals(int,int,int)",this);
	}
	
	
	
	
	
	List<Map<String, Object>> getProcesses() {
		com.mijack.Xlog.logMethodEnter("List<Map<String, Object>> org.anothermonitor.ServiceReader.getProcesses()",this);com.mijack.Xlog.logMethodExit("List<Map<String, Object>> org.anothermonitor.ServiceReader.getProcesses()",this);return mListSelected != null && !mListSelected.isEmpty() ? mListSelected : null;
	}
	
	void addProcess(Map<String, Object> process) {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.addProcess(Map<String, Object>)",this);// Integer	   C.pId
		// String	   C.pName
		// Integer	   C.work
		// Integer	   C.workBefore
		// List<Sring> C.finalValue
		if (mListSelected == null)
			mListSelected = Collections.synchronizedList(new ArrayList<Map<String, Object>>());
		mListSelected.add(process);com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.addProcess(Map<String, Object>)",this);
	}
	
	void removeProcess(Map<String, Object> process) {
		com.mijack.Xlog.logMethodEnter("void org.anothermonitor.ServiceReader.removeProcess(Map<String, Object>)",this);synchronized (mListSelected) {
			Iterator<Map<String, Object>> i = mListSelected.iterator();
			while (i.hasNext())
				if (i.next().get(C.pId).equals(process.get(C.pId))) {
					i.remove();
					Log.i(getString(R.string.w_processes_dead_notification), (String) process.get(C.pName));
				}
		}com.mijack.Xlog.logMethodExit("void org.anothermonitor.ServiceReader.removeProcess(Map<String, Object>)",this);
	}
	
	
	
	
	
	int getIntervalRead() {
		com.mijack.Xlog.logMethodEnter("int org.anothermonitor.ServiceReader.getIntervalRead()",this);com.mijack.Xlog.logMethodExit("int org.anothermonitor.ServiceReader.getIntervalRead()",this);return intervalRead;
	}
	
	int getIntervalUpdate() {
		com.mijack.Xlog.logMethodEnter("int org.anothermonitor.ServiceReader.getIntervalUpdate()",this);com.mijack.Xlog.logMethodExit("int org.anothermonitor.ServiceReader.getIntervalUpdate()",this);return intervalUpdate;
	}
	
	int getIntervalWidth() {
		com.mijack.Xlog.logMethodEnter("int org.anothermonitor.ServiceReader.getIntervalWidth()",this);com.mijack.Xlog.logMethodExit("int org.anothermonitor.ServiceReader.getIntervalWidth()",this);return intervalWidth;
	}
	
	
	
	
	
	List<Float> getCPUTotalP() {
		com.mijack.Xlog.logMethodEnter("List<Float> org.anothermonitor.ServiceReader.getCPUTotalP()",this);com.mijack.Xlog.logMethodExit("List<Float> org.anothermonitor.ServiceReader.getCPUTotalP()",this);return cpuTotal;
	}
	
	List<Float> getCPUAMP() {
		com.mijack.Xlog.logMethodEnter("List<Float> org.anothermonitor.ServiceReader.getCPUAMP()",this);com.mijack.Xlog.logMethodExit("List<Float> org.anothermonitor.ServiceReader.getCPUAMP()",this);return cpuAM;
	}
	
	List<Integer> getMemoryAM() {
		com.mijack.Xlog.logMethodEnter("List<Integer> org.anothermonitor.ServiceReader.getMemoryAM()",this);com.mijack.Xlog.logMethodExit("List<Integer> org.anothermonitor.ServiceReader.getMemoryAM()",this);return memoryAM;
	}
	
	int getMemTotal() {
		com.mijack.Xlog.logMethodEnter("int org.anothermonitor.ServiceReader.getMemTotal()",this);com.mijack.Xlog.logMethodExit("int org.anothermonitor.ServiceReader.getMemTotal()",this);return memTotal;
	}
	
	List<String> getMemUsed() {
		com.mijack.Xlog.logMethodEnter("List<String> org.anothermonitor.ServiceReader.getMemUsed()",this);com.mijack.Xlog.logMethodExit("List<String> org.anothermonitor.ServiceReader.getMemUsed()",this);return memUsed;
	}
	
	List<String> getMemAvailable() {
		com.mijack.Xlog.logMethodEnter("List<String> org.anothermonitor.ServiceReader.getMemAvailable()",this);com.mijack.Xlog.logMethodExit("List<String> org.anothermonitor.ServiceReader.getMemAvailable()",this);return memAvailable;
	}
	
	List<String> getMemFree() {
		com.mijack.Xlog.logMethodEnter("List<String> org.anothermonitor.ServiceReader.getMemFree()",this);com.mijack.Xlog.logMethodExit("List<String> org.anothermonitor.ServiceReader.getMemFree()",this);return memFree;
	}
	
	List<String> getCached() {
		com.mijack.Xlog.logMethodEnter("List<String> org.anothermonitor.ServiceReader.getCached()",this);com.mijack.Xlog.logMethodExit("List<String> org.anothermonitor.ServiceReader.getCached()",this);return cached;
	}
	
	List<String> getThreshold() {
		com.mijack.Xlog.logMethodEnter("List<String> org.anothermonitor.ServiceReader.getThreshold()",this);com.mijack.Xlog.logMethodExit("List<String> org.anothermonitor.ServiceReader.getThreshold()",this);return threshold;
	}
}
