#!/usr/bin/env python3

import concurrent.futures
import rpyc
import subprocess
import socket
import json
import os


hostname = subprocess.check_output(['hostname']).strip()
ncores = int(int(subprocess.check_output(['nproc', '--all'])) / 4)
# if hostname == b'bryce':
#     ncores = 2
print('Hostname: %s\nUsing %d processes' % (hostname, ncores))

dir_path = os.path.dirname(os.path.realpath(__file__))
sootandroid_dir = os.path.realpath(os.path.join(dir_path, '..'))
print('Root of sootandroid: %s' % sootandroid_dir)

executor = concurrent.futures.ThreadPoolExecutor(max_workers=ncores)


def run(i, pkg):
    cmd = ['%s/gator' % sootandroid_dir, 'a', '--apk', pkg, '-client', 'GUIHierarchyPrinterClient']
    print('[%4s] %s' % (i, ' '.join(cmd)))
    output = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
    return output


class ClientService(rpyc.Service):

    def on_connect(self):
        print('connected')

    def on_disconnect(self):
        print('disconnected')

    def exposed_get_hostname(self):  # this is an exposed method
        return socket.gethostname()

    def exposed_get_num_tasks(self):
        return ncores

    def exposed_run_batch(self, cmd_json):
        cmds = json.loads(cmd_json)
        output = {}
        futures = {}
        for i in cmds:
            pkg = cmds[i]
            future = executor.submit(run, i, pkg)
            futures[i] = future
        for i in futures:
            output[i] = futures[i].result().decode('utf-8')
            # output[i] = subprocess.check_output(cmd, stderr=subprocess.STDOUT, shell=True)
        output = json.dumps(output)
        print('finished')
        return output


if __name__ == "__main__":
    from rpyc.utils.server import ThreadedServer
    t = ThreadedServer(ClientService, port=8889)
    t.start()
