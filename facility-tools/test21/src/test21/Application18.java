package test21;

import java.io.File;
import java.io.FileOutputStream;

import org.eclipse.core.resources.IProject;
import org.eclipse.core.runtime.IPath;
import org.eclipse.core.resources.IProjectDescription;
import org.eclipse.core.resources.IWorkspace;
import org.eclipse.core.resources.ResourcesPlugin;
import org.eclipse.core.runtime.NullProgressMonitor;
import org.eclipse.core.runtime.Path;
import org.eclipse.emf.ecore.resource.Resource;
import org.eclipse.equinox.app.IApplication;
import org.eclipse.equinox.app.IApplicationContext;
import org.eclipse.jdt.core.IJavaProject;
import org.eclipse.jdt.core.JavaCore;
import org.eclipse.modisco.infra.discovery.core.exception.DiscoveryException;
import org.eclipse.modisco.java.discoverer.DiscoverKDMModelFromJavaProject;

public class Application18 implements IApplication {

	@Override
	public Object start(IApplicationContext context) throws Exception {
		// TODO Auto-generated method stub
		String[] args = (String[])context.getArguments().get("application.args");
		String projectName = "";
		String savePath = "";
//		String savePath = "C:\\Users\\zhen114\\Desktop\\jars\\model.xmi";
		if (args != null && args.length == 2) {
			//path = new Path(args[0]);
			projectName = args[0];
			savePath = args[1];
//			savePath = args[1];
		}
//		System.out.println(projectName);
		
		IPath path = new Path(projectName+"/.project");
//		IPath path = Path.fromPortableString(projectName);
		IWorkspace ws = ResourcesPlugin.getWorkspace();
		IProjectDescription proDes = ws.loadProjectDescription(path);
		IProject proj = ws.getRoot().getProject(proDes.getName());
//		System.out.println(proj.getName());
//		IProject[] projs = ws.getProjects();
//		for (IProject project : projs) {
//			System.out.println("name: ");
//			System.out.println(project.getName());
//		}
//		IProject proj = ws.getRoot().getProject(projectName);

//		proj.open(new NullProgressMonitor());
		if (!proj.isAccessible()) {
			proj.create(proDes, null);
		    proj.open(null);
	    }
//		proj.open(null);
		IJavaProject javaProject = JavaCore.create(proj);
	    DiscoverKDMModelFromJavaProject kdmDiscoverer = new DiscoverKDMModelFromJavaProject();
        try {
        	kdmDiscoverer.discoverElement(javaProject, new NullProgressMonitor());
			Resource kdmModel = kdmDiscoverer.getTargetModel();
			FileOutputStream fout = new FileOutputStream(new File(savePath));
			kdmModel.save(fout, null);
			fout.close();
        } catch (Exception e) {
			throw new DiscoveryException(e);
		}
		return IApplication.EXIT_OK;
	}

	@Override
	public void stop() {
		// TODO Auto-generated method stub

	}

}
