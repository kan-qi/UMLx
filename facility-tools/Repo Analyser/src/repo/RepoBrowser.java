package repo;

import java.awt.CheckboxMenuItem;
import java.awt.Font;
import java.awt.Menu;
import java.awt.MenuBar;
import java.awt.MenuItem;
import java.awt.MenuShortcut;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.KeyEvent;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Set;

import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.UIManager;
import javax.swing.table.AbstractTableModel;

public class RepoBrowser extends JFrame{
	
	private FileListModel attribute;
	private RepositoryTreePanel attribute2;
//	public static String projectPath = projectRoot+"\\tools\\Projects\\UMLCounter577";
//	public static String projectRepoPath = projectPath+"\\repo_UML_Counter_Mac_Windows.txt";
	public static String projectPath = Config.projectRoot+"\\tools\\Projects\\rufus_labs";
	public static String projectRepoPath = projectPath+"\\repositories.txt";
//	public static String projectPath = projectRoot+"\\tools\\Projects\\ResilientAgileSrcCount";
//	public static String projectRepoPath = projectPath+"\\repo_resilient_agile.txt";
	public static String projectTempPath = projectPath+"\\temp";
//	public static String projectRepoListFilePath = projectTempPath+"\\filelist.txt";
//	public static String projectRepoListFilePath = projectTempPath+"\\repositories.txt";
	private FileListModel fileListModel;
	private RepositoryTreePanel newContentPane;
	
	public RepoBrowser(String workpath){
		
		
		//Create and set up the window.
        this.setTitle("RepositoryTreePanel");
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
 
        //Create and set up the content pane.
//        fileListModel = new FileListModel(filelist);
        
        projectPath = workpath;
        projectRepoPath = projectPath + "\\repositories.txt";
        projectTempPath = projectPath + "\\temp";
        
        File projectFolder = new File(projectPath);
        if(!projectFolder.exists()){
        	projectFolder.mkdir();
        }
        File projectTempFolder = new File(projectTempPath);
        if(! projectTempFolder.exists()){
        	projectTempFolder.mkdir();
        }
        
        newContentPane = new RepositoryTreePanel(projectRepoPath);
        newContentPane.setOpaque(true); //content panes must be opaque
        this.setContentPane(newContentPane);
        newContentPane.setSize(newContentPane.getPreferredSize());
        this.pack();
        this.showMenu();
        this.setVisible(true);

	}
	
    class FileListModel extends AbstractTableModel {
        private static final boolean DEBUG = false;
        private String fileList;
		private String[] columnNames = {"File Path",
                                        "Include"};
//        private Object[][] data = {
//        {"Kathy", new Boolean(false)},
//        {"John",  new Boolean(true)},
//        {"Sue",  new Boolean(false)},
//        {"Jane", new Boolean(true)},
//        {"Joe", new Boolean(false)}
//        };
        
        private ArrayList<Object[]> data = new ArrayList<Object[]>();
        

    	private void saveEditedFile(){
    		try{
    		    PrintWriter writer = new PrintWriter(fileList.substring(0,fileList.lastIndexOf("/"))+"/filelist1.txt");
    			for(Object[] item : data){
        			if((Boolean)item[1]){
        				writer.print(item[0].toString());
        			}
        		}
    		    writer.close();
    		} catch (IOException e) {
    		   // do something
    		}
    	
    	}
        
        public FileListModel(String fileList){
        	this.fileList = fileList;
        	try(BufferedReader br = new BufferedReader(new FileReader(fileList))) {
        	    for(String line; (line = br.readLine()) != null; ) {
        	        data.add(new Object[]{line, new Boolean(true)});
        	    }
        	    // line is not visible here.
        	} catch (IOException e) {
				e.printStackTrace();
			}
        }
 
        public int getColumnCount() {
            return columnNames.length;
        }
 
        public int getRowCount() {
            return data.size();
        }
 
        public String getColumnName(int col) {
            return columnNames[col];
        }
 
        public Object getValueAt(int row, int col) {
        	if(row == -1){
        		if(col != -1){
        			Object[] column = new Object[data.size()];
        			int i = 0;
        			for(Object[] rowData : data){
        				if(rowData.length > col){
        					column[i++] = rowData[col];
        				}
        			}
        			return column;
        		}
        	}
        	else if(col == -1){
        		if(row != -1 && row < data.size()){
        			return data.get(row);
        		}
        	}
        	else {
        		return data.get(row)[col];
        	}
        	
            return null;
        }
 
        /*
         * JTable uses this method to determine the default renderer/
         * editor for each cell.  If we didn't implement this method,
         * then the last column would contain text ("true"/"false"),
         * rather than a check box.
         */
        public Class getColumnClass(int c) {
            return getValueAt(0, c).getClass();
        }
 
        /*
         * Don't need to implement this method unless your table's
         * editable.
         */
        public boolean isCellEditable(int row, int col) {
            //Note that the data/cell address is constant,
            //no matter where the cell appears onscreen.
            if (col < 1) {
                return false;
            } else {
                return true;
            }
        }
 
        /*
         * Don't need to implement this method unless your table's
         * data can change.
         */
        public void setValueAt(Object value, int row, int col) {
            if (DEBUG) {
                System.out.println("Setting value at " + row + "," + col
                                   + " to " + value
                                   + " (an instance of "
                                   + value.getClass() + ")");
            }
 
            data.get(row)[col] = value;
            fireTableCellUpdated(row, col);
 
            if (DEBUG) {
                System.out.println("New value of data:");
                printDebugData();
            }
        }
 
        private void printDebugData() {
            int numRows = getRowCount();
            int numCols = getColumnCount();
 
            for (int i=0; i < numRows; i++) {
                System.out.print("    row " + i + ":");
                for (int j=0; j < numCols; j++) {
                    System.out.print("  " + data.get(i)[j]);
                }
                System.out.println();
            }
            System.out.println("--------------------------");
        }
    }

	public static void main(String[] args) {
		  //Schedule a job for the event-dispatching thread:
        //creating and showing this application's GUI.
		
//		  try {
//              UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
//          } catch (ClassNotFoundException | InstantiationException | IllegalAccessException | UnsupportedLookAndFeelException ex) {
//              ex.printStackTrace();
//          }
//
//          setDefaultSize(24);

          
//		final String fileListPath = "./tools/temp/repositories.txt";
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                new RepoBrowser(projectPath).setVisible(true);
            }
        });

	}
	
	public static void setDefaultSize(int size) {

	    Set<Object> keySet = UIManager.getLookAndFeelDefaults().keySet();
	    Object[] keys = keySet.toArray(new Object[keySet.size()]);

	    for (Object key : keys) {

	        if (key != null && key.toString().toLowerCase().contains("font")) {

	            System.out.println(key);
	            Font font = UIManager.getDefaults().getFont(key);
	            if (font != null) {
	                font = font.deriveFont((float)size);
	                UIManager.put(key, font);
	            }

	        }

	    }

	}
	
	private void showMenu(){
	 //create a menu bar
    final MenuBar menuBar = new MenuBar();

    //create menus
    Menu fileMenu = new Menu("File");
    Menu editMenu = new Menu("Edit"); 
    final Menu aboutMenu = new Menu("About");

    //create menu items
    MenuItem newMenuItem = new MenuItem("New",new MenuShortcut(KeyEvent.VK_N));
    newMenuItem.setActionCommand("New");

    MenuItem openMenuItem = new MenuItem("Open");
    openMenuItem.setActionCommand("Open");

    MenuItem saveMenuItem = new MenuItem("Save");
    saveMenuItem.setActionCommand("Save");

    MenuItem exitMenuItem = new MenuItem("Exit");
    exitMenuItem.setActionCommand("Exit");
    
    MenuItem exportMenuItem = new MenuItem("Export");
    exportMenuItem.setActionCommand("Export");

    MenuItem cutMenuItem = new MenuItem("Cut");
    cutMenuItem.setActionCommand("Cut");

    MenuItem copyMenuItem = new MenuItem("Copy");
    copyMenuItem.setActionCommand("Copy");

    MenuItem pasteMenuItem = new MenuItem("Paste");
    pasteMenuItem.setActionCommand("Paste");
 
    MenuItemListener menuItemListener = new MenuItemListener();

    newMenuItem.addActionListener(menuItemListener);
    openMenuItem.addActionListener(menuItemListener);
    saveMenuItem.addActionListener(menuItemListener);
    exitMenuItem.addActionListener(menuItemListener);
    cutMenuItem.addActionListener(menuItemListener);
    copyMenuItem.addActionListener(menuItemListener);
    pasteMenuItem.addActionListener(menuItemListener);
    exportMenuItem.addActionListener(menuItemListener);

    final CheckboxMenuItem showWindowMenu = 
       new CheckboxMenuItem("Show About", true);
    showWindowMenu.addItemListener(new ItemListener() {
       public void itemStateChanged(ItemEvent e) {
          if(showWindowMenu.getState()){
             menuBar.add(aboutMenu);
          }else{
             menuBar.remove(aboutMenu);
          }
       }
    });

    //add menu items to menus
    fileMenu.add(newMenuItem);
    fileMenu.add(openMenuItem);
    fileMenu.add(saveMenuItem);
    fileMenu.add(exportMenuItem);
    fileMenu.addSeparator();
    fileMenu.add(showWindowMenu);
    fileMenu.addSeparator();
    fileMenu.add(exitMenuItem);

    editMenu.add(cutMenuItem);
    editMenu.add(copyMenuItem);
    editMenu.add(pasteMenuItem);

    //add menu to menubar
    menuBar.add(fileMenu);
    menuBar.add(editMenu);
    menuBar.add(aboutMenu);

    //add menubar to the frame
    this.setMenuBar(menuBar);
 }

 class MenuItemListener implements ActionListener {
    public void actionPerformed(ActionEvent e) {            
//       statusLabel.setText(e.getActionCommand()  + " MenuItem clicked.");
    	if(e.getActionCommand().equals("Save")){
//    		newContentPane.save();
    		newContentPane.saveToProject(projectPath);
    	}
    	else if(e.getActionCommand().equals("Export")){
    		newContentPane.dumpSelectedPaths(projectTempPath+"\\dump.txt");
    	}
    	else if(e.getActionCommand().equals("Open")){
    		JFileChooser fc = new JFileChooser();
    		 int returnVal = fc.showOpenDialog(RepoBrowser.this);

    	        if (returnVal == JFileChooser.APPROVE_OPTION) {
    	            File file = fc.getSelectedFile();
    	            System.out.println(file.getAbsolutePath());
    	            //This is where a real application would open the file.
//    	            log.append("Opening: " + file.getName() + "." + newline);
    	        } else {
//    	            log.append("Open command cancelled by user." + newline);
    	        }
    	}
    }    
 }

}
