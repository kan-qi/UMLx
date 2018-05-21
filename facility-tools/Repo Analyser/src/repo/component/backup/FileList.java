package repo.component.backup;
import java.awt.BorderLayout;
import java.awt.Button;
import java.awt.CheckboxMenuItem;
import java.awt.Desktop;
import java.awt.Frame;
import java.awt.List;
import java.awt.Menu;
import java.awt.MenuBar;
import java.awt.MenuItem;
import java.awt.MenuShortcut;
import java.awt.Panel;
import java.awt.ScrollPane;
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

import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.AbstractTableModel;

public class FileList extends JFrame{
	private FileListModel fileListModel;
	public FileList(String filelist){
		Panel panel = new Panel();        // Panel is a Container
		Button btn = new Button("Press"); // Button is a Component
//		panel.add(btn);
//		this.add(panel);
//		ScrollPane scrollPane = new ScrollPane();
//		List list = new List();
//		list.add("hello1");
//		list.add("hello2");
//		scrollPane.add(list);
		
		//Create and set up the window.
        this.setTitle("TableFilterDemo");
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
 
        //Create and set up the content pane.
        fileListModel = new FileListModel(filelist);
        TableFilterDemo newContentPane = new TableFilterDemo(fileListModel);
        newContentPane.setOpaque(true); //content panes must be opaque
        this.setContentPane(newContentPane);
        Button locateBtn = new Button("Locate");
        locateBtn.addActionListener(newContentPane.new FileOperationButtonClickListner(){

			@Override
			public void actionPerformed(ActionEvent e, int row, Object d) {
				Object[] data = (Object[])d;
				String filePath = data[0].toString();
				String path = filePath.substring(0,filePath.lastIndexOf("/"));
				try {
//					Desktop.getDesktop().open(new File(filePath));
					Runtime.getRuntime().exec("explorer.exe /select," + filePath.replace("/", "\\"));
				} catch (IOException e1) {
					e1.printStackTrace();
				}
			}
        	
        });
      
        newContentPane.addOperationComponent(locateBtn);
        //Display the window.
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
				// TODO Auto-generated catch block
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
		final String fileListPath = "//192.168.31.1/XiaoMi-usb0/research/Repositories/577 projects/fall2015/projects/team01/team01b/FD/SourceCode_ASBUILT_S16b_T01/fileList.txt";
        javax.swing.SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                new FileList(fileListPath).setVisible(true);
            }
        });

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
    		fileListModel.saveEditedFile();
    	}
    }    
 }

}
