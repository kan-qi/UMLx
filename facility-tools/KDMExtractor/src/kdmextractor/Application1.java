package kdmextractor;


public class Application1 {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		DiscoverJavaModelFromJavaProject javaDiscoverer = new DiscoverJavaModelFromJavaProject();
		javaDiscoverer.discoverElement(javaProject, monitor);
		Resource javaResource = javaDiscoverer.getTargetModel();
		
		Model javaModel = (Model) javaResource.getContents().get(0);
		
		EList<ClassFile> classFiles = javaModel.getClassFiles();
		for (ClassFile classFile : classFiles) {
		    System.out.println(classFile.getName());
		}
	}
	
	public void modelDiscovery(String projectName, String savePath){
		try {
			IProject project = 
				ResourcesPlugin.getWorkspace().getRoot().getProject(projectName);
			IJavaProject javaProject = JavaCore.create(project);
			DiscoverJavaModelFromJavaProject javaDiscoverer = new DiscoverJavaModelFromJavaProject();
			javaDiscoverer.discoverElement(javaProject, new NullProgressMonitor());
			Resource javaResource = javaDiscoverer.getTargetModel();
			FileOutputStream fout = new FileOutputStream(new File(savePath));
			javaResource.save(fout, null);
			fout.close();

		} catch (Exception e) {
			System.err.println("Error: " + e.getMessage());
		}
	}
	
	public void generateJava(String javaModelFilepath, String generatedCodeFolderPath){
		try {
			GenerateJavaExtended javaGenerator = new GenerateJavaExtended(URI.createFileURI(javaModelFilepath),
					new File(generatedCodeFolderPath),
					new ArrayList<Object>());
			javaGenerator.doGenerate(null);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	

}
