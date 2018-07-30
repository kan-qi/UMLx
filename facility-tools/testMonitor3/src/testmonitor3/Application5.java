package testmonitor3;

import java.io.File;
import java.io.FileOutputStream;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.resources.IProjectDescription;
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.CoreException;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.runtime.IProgressMonitor;
import org.eclipse.core.runtime.IStatus;
//import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Path;
import org.eclipse.core.runtime.Status;
import org.eclipse.core.runtime.jobs.Job;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.equinox.app.IApplication;
import org.eclipse.equinox.app.IApplicationContext;
import org.eclipse.jdt.core.IJavaProject;
import org.eclipse.jdt.core.JavaCore;
import org.eclipse.modisco.java.discoverer.DiscoverKDMModelFromJavaProject;
import org.eclipse.modisco.infra.discovery.core.exception.DiscoveryException;


public class Application5 implements IApplication {

	@Override
	public Object start(IApplicationContext context) throws Exception {
		String[] args = (String[])context.getArguments().get("application.args");
		String projectName = "";
		String save = "";
		if (args != null && args.length == 2) {
			projectName = args[0];
			save = args[1];
		}
		final String savePath = save;
		
		IPath path = new Path(projectName+"/.project");
		IWorkspace ws = ResourcesPlugin.getWorkspace();
		IProjectDescription proDes = ws.loadProjectDescription(path);
		final IProject proj = ws.getRoot().getProject(proDes.getName());
//		if (!proj.isAccessible()) {
//			proj.create(proDes, null);
//		    proj.open(null);
//	    }
		Job job = new Job("Extract KDM"){
			public IStatus run(IProgressMonitor monitor) {
				try {
					monitor.beginTask("converting", 100);
					if (!proj.isAccessible()) {
						proj.create(proDes, null);
					    proj.open(null);
				    }
					IJavaProject javaProject = JavaCore.create(proj);
				    DiscoverKDMModelFromJavaProject kdmDiscoverer = new DiscoverKDMModelFromJavaProject();
			        try {
			        	kdmDiscoverer.discoverElement(javaProject, monitor);
						Resource kdmModel = kdmDiscoverer.getTargetModel();
						FileOutputStream fout = new FileOutputStream(new File(savePath));
						kdmModel.save(fout, null);
						fout.close();
			        } catch (Exception e) {
			        	e.printStackTrace();
					}
			        if (monitor.isCanceled()) {
			        	return Status.CANCEL_STATUS;
			        }
				} catch(CoreException e) {
					return e.getStatus();
				} finally {
					monitor.done();
				}
				return Status.OK_STATUS;
			}
		};
//		job.setRule(ResourcesPlugin.getWorkspace().getRoot());
//		job.setPriority(Job.SHORT);
		job.setUser(true);
		job.schedule();
		return IApplication.EXIT_OK;
	}

	@Override
	public void stop() {
		// TODO Auto-generated method stub

	}

}
