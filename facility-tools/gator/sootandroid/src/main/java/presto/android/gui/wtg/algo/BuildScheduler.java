/*
 * BuildScheduler.java - part of the GATOR project
 *
 * Copyright (c) 2018 The Ohio State University
 *
 * This file is distributed under the terms described in LICENSE in the
 * root directory.
 */
package presto.android.gui.wtg.algo;

import com.google.common.collect.Maps;
import presto.android.Configs;
import presto.android.Logger;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class BuildScheduler {
  public BuildScheduler() {
    threadPool = new ArrayBlockingQueue<BuildWorker>(Configs.workerNum);
    initializeScheduler();
  }

  private void initializeScheduler() {
    for (int i = 0; i < Configs.workerNum; i++) {
      try {
        threadPool.put(new BuildWorker(this));
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }

  public Map<AlgorithmInput, AlgorithmOutput> schedule(Set<AlgorithmInput> inputs) {
    // the underline idea is to parallelise analyzeCallbackMethod
    // and leave the rest executed in sequence
    int count = 0;
    for (AlgorithmInput input : inputs) {
      BuildWorker worker = null;
      try {
        worker = threadPool.take();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
      if (worker == null) {
        Logger.err(getClass().getSimpleName(), "can not grab existing worker to do task");
      }
      // set the work to do + the input data
      worker.setTask(input);
      // start new thread to do this job
      new Thread(worker).start();
      final int steps = 10;
      if (++count % steps == 0) {
        System.out.print(".");
        if (count >= 100 * steps) {
          Logger.verb(this.getClass().getSimpleName(), "");
          count = 0;
        }
      }
    }
    Logger.verb(this.getClass().getSimpleName(), "");
    // wait every thread to finish
    while (threadPool.size() != Configs.workerNum) {
      try {
        Thread.sleep(500);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
    Map<AlgorithmInput, AlgorithmOutput> aggregateOutput = Maps.newHashMap();
    // aggregate the output from all the threads
    for (BuildWorker worker : threadPool) {
      Map<AlgorithmInput, AlgorithmOutput> partialOutput = worker.getOutput();
      for (AlgorithmInput input : partialOutput.keySet()) {
        if (aggregateOutput.containsKey(input)) {
          Logger.err(getClass().getSimpleName(), "cfg analyzer input has been processed: " + input);
        }
        AlgorithmOutput output = partialOutput.get(input);
        aggregateOutput.put(input, output);
      }
    }
    return aggregateOutput;
  }

  // thread pool
  final BlockingQueue<BuildWorker> threadPool;
}
