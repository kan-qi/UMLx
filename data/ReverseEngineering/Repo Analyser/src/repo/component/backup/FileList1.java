package repo.component.backup;
import java.awt.Color;
import java.awt.Container;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import javax.swing.BoxLayout;
import javax.swing.JFrame;

import repo.RepositoryTree;

public class FileList1 {

	 /** Main: make a Frame, add a FileTree */
	  public static void main(String[] av) {
		
		
	    JFrame frame = new JFrame("FileTree");
	    frame.setForeground(Color.black);
	    frame.setBackground(Color.lightGray);
	    Container cp = frame.getContentPane();

		String fileListPath = "//192.168.31.1/XiaoMi-usb0/research/git/filelist/tools/repositories1.txt";
	    
//	    cp.setLayout(new BoxLayout(cp, BoxLayout.X_AXIS));
//	      for (String line: lines) {
//	    	if(line.equals("")){
//	    		continue;
//	    	}
//	        cp.add(new RepositoryTree(line));
//	      }
//	    cp.add(new RepositoryTree("//192.168.31.1/XiaoMi-usb0/research/Repositories/577 projects/fall2015/projects/team02/team02b/new/Final Deliverables/source_ASBULT_S16b_T02"));
//		RepositoryTree tree = new RepositoryTree(fileListPath);
//		cp.add(tree);
//	    if (av.length == 0) {
//	      cp.add(new FileTree(new File(".")));
//	    } else {
//	      cp.setLayout(new BoxLayout(cp, BoxLayout.X_AXIS));
//	      for (int i = 0; i < av.length; i+re+)
//	        cp.add(new FileTree(new File(av[i])));
//	    }

	    frame.pack();
	    frame.setVisible(true);
	    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	    
	  }
	  
}
