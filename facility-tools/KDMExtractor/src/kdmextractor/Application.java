package kdmextractor;

import org.osgi.resource.Resource;

public class Application {
	public void Man(){
		DiscoverKDMSourceAndJavaModelFromJavaProject discoverer = new DiscoverKDMSourceAndJavaModelFromJavaProject();
		discoverer.discoverElement(javaProject, monitor);
		Resource javaApplicationModel = discoverer.getTargetModel();
		
		DiscoverJavaModelFromJavaProject discoverer = new DiscoverJavaModelFromJavaProject();
		javaDiscoverer.discoverElement(javaProject, monitor);
		Resource javaResource = javaDiscoverer.getTargetModel();
	}

}

