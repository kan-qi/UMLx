package repo;

/*
 * Copyright (c) Ian F. Darwin, http://www.darwinsys.com/, 1996-2002.
 * All rights reserved. Software written by Ian F. Darwin and others.
 * $Id: LICENSE,v 1.8 2004/02/09 03:33:38 ian Exp $
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS''
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 * 
 * Java, the Duke mascot, and all variants of Sun's Java "steaming coffee
 * cup" logo are trademarks of Sun Microsystems. Sun's, and James Gosling's,
 * pioneering role in inventing and promulgating (and standardizing) the Java 
 * language and environment is gratefully acknowledged.
 * 
 * The pioneering role of Dennis Ritchie and Bjarne Stroustrup, of AT&T, for
 * inventing predecessor languages C and C++ is also gratefully acknowledged.
 */

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import javax.swing.tree.TreeNode;
import javax.swing.tree.TreePath;

import repo.component.checkbox.CheckBoxNode;
import repo.component.checkbox.CheckBoxNodeEditor;
import repo.component.checkbox.CheckBoxNodeRenderer;

/**
 * Display a file system in a JTree view
 * 
 * @version $Id: FileTree.java,v 1.9 2004/02/23 03:39:22 ian Exp $
 * @author Ian Darwin
 */
public class RepositoryTree extends JPanel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private JTree tree;

//	private String reposFileName = "repositories.txt";

	/** Construct a FileTree */
	public RepositoryTree(String reposListFile) throws Exception {
		setLayout(new BorderLayout());

//		String reposFilePath = projectPath + "\\" + reposFileName;

		// reposFilePath = reposFilePath.replace("\\", "/");

		File reposFile = new File(reposListFile);

		if (!reposFile.exists()) {
			throw new Exception();
		}

		// this.repos = repos;
		// Make a tree list with all the nodes, and make it a JTree
		tree = new JTree(buildTree(reposFile));
		tree.addMouseListener(new PopClickListener());
		//
		// Add a listener
		// tree.addTreeSelectionListener(new TreeSelectionListener() {
		// public void valueChanged(TreeSelectionEvent e) {
		// }
		// });

		CheckBoxNodeRenderer renderer = new CheckBoxNodeRenderer();
		tree.setCellRenderer(renderer);

		tree.setCellEditor(new CheckBoxNodeEditor(tree));
		tree.setEditable(true);

		menu = new PopUpMenu(this);
		rootMenu = new RootPopupMenu(this);

		// Lastly, put the JTree into a JScrollPane.
		JScrollPane scrollpane = new JScrollPane();
		scrollpane.getViewport().add(tree);
		add(BorderLayout.CENTER, scrollpane);
	}

	public String getPathToNode(DefaultMutableTreeNode node) {
		String pathToNode = "";
		TreeNode[] treePath = node.getPath();
		for (int i = 0; i < treePath.length; i++) {
			if (i == 0) {
				continue;
			} else if (i == 1) {
				pathToNode += treePath[i];
			} else {
				pathToNode += "\\" + treePath[i];
			}

		}

		return pathToNode;
	}

	public String getNodeFileName(DefaultMutableTreeNode treeNode) {
		String pathToNode = this.getPathToNode(treeNode).replaceAll("[:\\s\\\\]", "_");
		int startPoint = pathToNode.length() - 24 > 0? pathToNode.length() - 24 : 0;
		return pathToNode.substring(startPoint, pathToNode.length());
	}
	
	
	public interface PathFilterCallback{
		boolean onPathFilter(Path path);
	}
	
	public void dumpPaths(String file, DefaultMutableTreeNode currentSelectedNode, boolean filter, PathFilterCallback filterCallback){
		// DefaultMutableTreeNode root = (DefaultMutableTreeNode)
				// tree.getModel().getRoot();
				List<Path> paths = new ArrayList<Path>();

				String pathToNode = this.getPathToNode(currentSelectedNode);

				Enumeration enumeration = currentSelectedNode.children();
				while (enumeration.hasMoreElements()) {
					for (Path path : getPaths((CheckBoxNode) enumeration.nextElement(), filter)) {
						path.path = pathToNode + "\\" + path.path;
						paths.add(path);
					}
				}

				try {
					PrintWriter writer = new PrintWriter(file);
					for (Path path : paths) {
						if (filterCallback == null || filterCallback.onPathFilter(path)) {
							writer.println(path.path);
							System.out.println(path.path);
						}
					}
					writer.close();
				} catch (IOException e) {
					// do something
				}
	}

	public void dumpSelectedPaths(String file, DefaultMutableTreeNode currentSelectedNode) {
		this.dumpPaths(file, currentSelectedNode, true, null);
	}

	public void dumpSelectedPaths(String filePath) {
		this.dumpSelectedPaths(filePath, (DefaultMutableTreeNode) this.tree.getModel().getRoot());
	}
	

	public void saveRepo(CheckBoxNode repo) {
		this.saveRepoTo(repo, RepoBrowser.projectPath+"\\"+this.getNodeFileName(repo)+"\\filelist.txt", RepoBrowser.projectPath+"\\"+this.getNodeFileName(repo)+"\\selectedfilelist.txt", RepoBrowser.projectPath+"\\"+this.getNodeFileName(repo)+"\\selectedfiles.txt");
	}
	
	public DefaultMutableTreeNode getContainingRepoNode(DefaultMutableTreeNode node){
		DefaultMutableTreeNode parent = null;
		while ((parent = (DefaultMutableTreeNode) node.getParent()) != null){
			if(isRepoNode(parent)){
				return parent;
			}
		}
		
		return parent;
	}

	private void saveRepoTo(CheckBoxNode project, String fileListPath, String selectedFileListPath, String selectedFilesPath) {

		try {
//			List<Path> projectList = new ArrayList<Path>();
			Path projectPath = new Path();
			projectPath.path = project.toString();
			projectPath.include = project.isSelected();
//			projectList.add(projectPath);
			List<Path> paths = getPaths(project, false);
			List<Path> selectedPaths = getPaths(project, true);
			File file = new File(fileListPath);
			if (!file.exists()) {
				file.createNewFile();
			}
			
			PrintWriter writer = new PrintWriter(file);
			for (Path path : paths) {
				writer.println((path.include ? "" : "-") + path.path);
				System.out.println("saving path: " + (path.include ? "" : "-") + path.path);
			}
			writer.close();
			
			File selectedFiles = new File(selectedFileListPath);
			if(!selectedFiles.exists()) {
				selectedFiles.createNewFile();
			}

			PrintWriter writer2 = new PrintWriter(selectedFiles);
			for (Path selectedPath : selectedPaths) {
				writer2.println((selectedPath.include ? "" : "-") + selectedPath.path);
				System.out.println("saving path: " + (selectedPath.include ? "" : "-") + selectedPath.path);
			}
			writer2.close();
			
			File selectedFiles2 = new File(selectedFilesPath);
			if(!selectedFiles2.exists()) {
				selectedFiles2.createNewFile();
			}

			PrintWriter writer3 = new PrintWriter(selectedFiles2);
			for (Path selectedPath : selectedPaths) {
				File selectedFile = new File(selectedPath.path);
				if(selectedFile.isFile()) {
				writer3.println((selectedPath.include ? "" : "-") + selectedPath.path);
				System.out.println("saving path: " + (selectedPath.include ? "" : "-") + selectedPath.path);
				}
			}
			System.out.println("file list saved!");
			
			writer3.close();

		} catch (IOException e) {
			// do something
			e.printStackTrace();
		}
	}

	public boolean isRepoNode(DefaultMutableTreeNode node) {
		DefaultMutableTreeNode root = (DefaultMutableTreeNode) tree.getModel().getRoot();
		List<Path> repoList = new ArrayList<Path>();
		Enumeration enumeration = root.children();
		while (enumeration.hasMoreElements()) {
			DefaultMutableTreeNode child = (DefaultMutableTreeNode) enumeration.nextElement();
			if (child.equals(node)) {
				return true;
			}
		}

		return false;
	}

	public void saveToProject(String repoPath) throws FileNotFoundException {
		List<String> projects = new ArrayList<String>();
		DefaultMutableTreeNode root = (DefaultMutableTreeNode) tree.getModel().getRoot();
		Enumeration enumeration = root.children();
		while (enumeration.hasMoreElements()) {
			CheckBoxNode repo = (CheckBoxNode) enumeration.nextElement();
			File folder = new File(repoPath + "\\" + this.getNodeFileName(repo));
			if (!folder.exists() || !folder.isDirectory()) {
				folder.mkdir();
			}
			saveRepoTo(repo, folder + "\\filelist.txt", folder+"\\selectedfilelist.txt", folder+"\\selectedFiles.txt");
			projects.add(repo.toString());
		}
		
		PrintWriter writer = new PrintWriter(repoPath + "\\repositories.txt");
		for (String projectPath : projects) {
			writer.println(projectPath);
		}
		writer.flush();
		writer.close();
	
	}
	
	private List<Path> getPaths(CheckBoxNode node, boolean filter) {
		// ignore means ignore selection or not.
		
		List<Path> paths = new ArrayList<Path>();

		System.out.println(node.toString());

		if(!filter || node.isSelected()) {
		Path path = new Path();
		path.path = node.toString();
		path.include = node.isSelected();
		paths.add(path);
		System.out.println(path.path);

		Enumeration enumeration = node.children();
		while (enumeration.hasMoreElements()) {
			CheckBoxNode child = (CheckBoxNode) enumeration.nextElement();
		
			for (Path childPath : getPaths(child, filter)) {
				childPath.path = node.toString() + "\\" + childPath.path;
				paths.add(childPath);
			}
			
		}
		}

		return paths;
	}

	public static class Path {
		boolean include = true;
		String path = "";
	}

	PopUpMenu menu;
	RootPopupMenu rootMenu;

	class PopClickListener extends MouseAdapter {
		public void mousePressed(MouseEvent e) {
			if (e.isPopupTrigger() || e.getButton() == MouseEvent.BUTTON3) {
				TreePath pathForLocation = tree.getPathForLocation(e.getPoint().x, e.getPoint().y);
				if (pathForLocation != null) {
					tree.setSelectionPath(pathForLocation);
					DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) pathForLocation
							.getLastPathComponent();
					if (selectedNode.isRoot()) {
						rootMenu.show(e.getComponent(), e.getX(), e.getY(), selectedNode, pathForLocation);
					} else {
						menu.show(e.getComponent(), e.getX(), e.getY(), selectedNode, pathForLocation);

					}
				} else {

				}
			} else {
				TreePath pathForLocation = tree.getPathForLocation(e.getPoint().x, e.getPoint().y);
				if (pathForLocation != null) {
					tree.setSelectionPath(pathForLocation);
					DefaultMutableTreeNode selectedNode = (DefaultMutableTreeNode) pathForLocation
							.getLastPathComponent();
					if (selectedNode instanceof CheckBoxNode) {
						// DefaultMutableTreeNode node =
						// (DefaultMutableTreeNode)
						// e.getPath().getLastPathComponent();
						CheckBoxNode checkBoxNode = (CheckBoxNode) selectedNode;
						checkBoxNode.setSelected(!checkBoxNode.isSelected());
						System.out.println("You selected " + selectedNode);
					}
				} else {

				}
			}
		}
	}

	/** Add nodes from under "dir" into curTop. Highly recursive. */
	DefaultMutableTreeNode buildTree(File reposFile) {
		DefaultMutableTreeNode curTop = new DefaultMutableTreeNode("repos");
		try {
			BufferedReader repobr = new BufferedReader(new FileReader(reposFile));
			for (String repoPath; (repoPath = repobr.readLine()) != null;) {
				Boolean includeRepo = true;
				// repo = repo.replace("\\", "/");
				System.out.println("building repo: " + repoPath);
				CheckBoxNode repoNode = new CheckBoxNode(repoPath, includeRepo);
				curTop.add(repoNode);
//				String repoFileListPath = RepoBrowser.projectPath + "\\" + repoPath.replaceAll("[:\\s\\\\]", "_") + "\\filelist.txt";
				String repoFileListPath = RepoBrowser.projectPath + "\\" + this.getNodeFileName(repoNode) + "\\filelist.txt";
				File repoFileList = new File(repoFileListPath);

				if (repoFileList.exists()) {
					try {
						BufferedReader br = new BufferedReader(new FileReader(repoFileList));
						for (String line; (line = br.readLine()) != null;) {
							// line = line.replace("\\", "/");
							line = line.replace("/", "\\");
							boolean include = true;
							if (line.startsWith("-")) {
								include = false;
								line = line.substring(1);
							}
							if (!line.startsWith(repoPath)) {
								continue;
							}
							if (line.equals(repoPath)) {
								repoNode.setSelected(include);
							}
							// if(line.endsWith("/target/scala-2.11/classes_managed/views/html/main$$anonfun$f$1.class")){
							// System.out.println("hello");
							// }
							String path = line.substring(repoPath.length(), line.length());
							System.out.println("examine path: " + path);
							String[] parts = path.split("\\\\");
							CheckBoxNode currentNode = repoNode;
							for (int i = 0; i < parts.length; i++) {
								String part = parts[i];
								if (part.equals("")) {
									continue;
								}
								Enumeration enumeration = currentNode.children();
								CheckBoxNode matchedNode = null;
								while (enumeration.hasMoreElements()) {
									CheckBoxNode child = (CheckBoxNode) enumeration.nextElement();
									if (child.toString().equals(part)) {
										matchedNode = child;
										break;
									}
								}
								if (matchedNode == null) {
									CheckBoxNode addedNode = new CheckBoxNode(part, true);
									currentNode.add(addedNode);
									matchedNode = addedNode;
								}

								currentNode = matchedNode;

								if (i == parts.length - 1) {
									currentNode.setSelected(include);
								}

							}
						}
						br.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				} else {

				}
			}
			repobr.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return curTop;
	}
	
	
	public DefaultMutableTreeNode getRepoNode(DefaultMutableTreeNode node){
		TreeNode[] nodes = node.getPath();
		for(TreeNode pathNode : nodes){
			if(pathNode instanceof DefaultMutableTreeNode){
			if(this.isRepoNode((DefaultMutableTreeNode)pathNode)){
				return (DefaultMutableTreeNode)pathNode;
			}
			}
		}
		
		return null;
	}
	
	public List<String> getRepoPaths() {
		List<String> repoPaths = new ArrayList<String>();
		DefaultMutableTreeNode node = (DefaultMutableTreeNode) this.tree.getModel().getRoot();
		Enumeration children = node.children();
		while (children.hasMoreElements()) {
			DefaultMutableTreeNode child = (DefaultMutableTreeNode) children.nextElement();
			repoPaths.add(child.toString());
		}
		return repoPaths;
	}

	public List<DefaultMutableTreeNode> getRepoNodes() {
		List<DefaultMutableTreeNode> repoNodes = new ArrayList<DefaultMutableTreeNode>();
		DefaultMutableTreeNode node = (DefaultMutableTreeNode) this.tree.getModel().getRoot();
		Enumeration children = node.children();
		while (children.hasMoreElements()) {
			repoNodes.add((DefaultMutableTreeNode) children.nextElement());
		}
		return repoNodes;
	}

	public Dimension getMinimumSize() {
		return new Dimension(200, 400);
	}

	public Dimension getPreferredSize() {
		return new Dimension(800, 600);
	}

	public void checkUncheckNode(CheckBoxNode node) {
		boolean isChecked = node.isSelected()?false:true;
		checkUncheckSubtree(node, isChecked);
		node.setSelected(isChecked);
		DefaultTreeModel treeModel = (DefaultTreeModel) tree.getModel();
		treeModel.reload();
	}
	
	public void checkUncheckSubtree(CheckBoxNode node, boolean isChecked){
		Enumeration children = node.children();
		while(children.hasMoreElements()){
			CheckBoxNode checkBoxNode = (CheckBoxNode) children.nextElement();
			checkBoxNode.setSelected(isChecked);
			checkUncheckSubtree(checkBoxNode, isChecked);
		}
	}

}
