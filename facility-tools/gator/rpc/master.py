#!/usr/bin/env python3

import rpyc
import time
import glob
import os
import csv
import json
from queue import Queue
from threading import Timer
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime


dir_path = os.path.dirname(os.path.realpath(__file__))
ready = Queue()
cmds = {}


def init():
    with open('hosts.csv', 'r') as f:
        reader = csv.DictReader(f)
        for item in reader:
            ready.put(item)


def reactivate_host(host):
    # print(name, ip, port)
    # host = {'name': name, 'ip': ip, 'port': port}
    print('...... reactivating %s...' % host['name'])
    ready.put(host)


def run_on_host(host):
    try:
        batch = {}
        conn = rpyc.connect(host['ip'], host['port'])
        num_tasks = conn.root.get_num_tasks()
        while num_tasks > 0:
            num_tasks -= 1
            i, pkg = cmds.popitem()
            print('[%4s @ %-7s] %s' % (i, host['name'], datetime.now()))
            batch[i] = pkg
        batch_json = json.dumps(batch)
        # output_json = conn.root.run_batch(batch_json)
        # wait for 30 minutes
        timed_run = rpyc.timed(conn.root.run_batch, 1800)
        async_output = timed_run(batch_json)
        try:
            output_json = async_output.value
        except rpyc.AsyncResultTimeout as e:
            print('..... lost connection to %s, retry in 1 minute' % host)
            Timer(60, reactivate_host, args=[host]).start()
            return
        finally:
            conn.close()
        ready.put(host)
        output = json.loads(output_json)
        for i in output:
            apk = batch[int(i)]
            pkg = apk.split('/')[-1]
            log = '%s/logs/%s.log' % (dir_path, pkg)
            with open(log, 'w') as f:
                print('Save to %s' % log)
                f.write(output[i])
    except ConnectionRefusedError:
        print('...... "%s" refuse to connect, retry in 1 minute' %
              host['name'])
        Timer(60, reactivate_host, args=[host]).start()


def main():
    init()
    executor = ThreadPoolExecutor(ready.qsize())
    i = 0
    apks = set()
    logs = set()
    for pkg in glob.glob('/export/raid/all-apk/play.20180422/*.apk'):
        apks.add(pkg)
    # for log in glob.glob('%s/logs/*.log' % dir_path):
    #     logs.add(log.split('/')[-1][:-len('.log')])
    for apk in apks:
        if apk.split('/')[-1] not in logs:
            i += 1
            cmds[i] = apk
            # print(':::::::::::' + apk)
    while len(cmds) > 0:
        print('# remaining cmds: %s, available hosts: %s' %
              (len(cmds), [h['name'] for h in ready.queue]))
        host = ready.get()
        # run_on_host(host)
        executor.submit(run_on_host, host)


if __name__ == "__main__":
    start = datetime.now()
    print('[START] @ %s' % start)
    main()
    end = datetime.now()
    print('[END] @ %s, time: %s' % (end, end - start))
