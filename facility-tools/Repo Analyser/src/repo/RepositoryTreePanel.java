
/*
 * Copyright (c) 1995, 2008, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Oracle or the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package repo;

/*
 * TableFilterDemo.java requires SpringUtilities.java
 */

import javax.swing.*;
import javax.swing.event.*;
import javax.swing.table.AbstractTableModel;

import repo.component.utilities.SpringUtilities;

import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.FileNotFoundException;
import java.awt.Button;

public class RepositoryTreePanel extends JPanel {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static boolean DEBUG = false;
	// private JTable table;
	private JTextField filterText;
	private JTextField statusText;
	private RepositoryTree tree;
	// private TableRowSorter<AbstractTableModel> sorter;
	private JPanel operatorArea;
	private JLabel message;
	// private AbstractTableModel model;

	public RepositoryTreePanel(String repoListFile) {
		super();

		setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));

		try {
			tree = new RepositoryTree(repoListFile);
		} catch (Exception e1) {
			e1.printStackTrace();
		}
		// Add the scroll pane to this panel.
		add(tree);

		// Create a separate form for filterText and statusText
		JPanel form = new JPanel(new SpringLayout());
		JLabel l1 = new JLabel("Filter Text:", SwingConstants.TRAILING);
		form.add(l1);
		filterText = new JTextField();
		// Whenever filterText changes, invoke newFilter.
		filterText.getDocument().addDocumentListener(new DocumentListener() {
			public void changedUpdate(DocumentEvent e) {
				newFilter();
			}

			public void insertUpdate(DocumentEvent e) {
				newFilter();
			}

			public void removeUpdate(DocumentEvent e) {
				newFilter();
			}
		});
		l1.setLabelFor(filterText);
		form.add(filterText);
		JLabel l2 = new JLabel("Status:", SwingConstants.TRAILING);
		form.add(l2);
		statusText = new JTextField();
		l2.setLabelFor(statusText);
		form.add(statusText);
		operatorArea = new JPanel();
		form.add(new JLabel("Operations:"));
		form.add(operatorArea);
		message = new JLabel("");
		operatorArea.add(message);
		operatorArea.setLayout(new FlowLayout(FlowLayout.LEFT));
		SpringUtilities.makeCompactGrid(form, 3, 2, 6, 6, 6, 6);
		add(form);
	}

	private void outputMessage(String messageStr) {
		message.setText(messageStr);
	}

	public void addOperationComponent(Button button) {
		// button.addActionListener();
		operatorArea.add(button);
	}

	public abstract class FileOperationButtonClickListner implements ActionListener {

		@Override
		public void actionPerformed(ActionEvent e) {
			// int selectedRow =
			// table.convertRowIndexToModel(table.getSelectedRow());
			// actionPerformed(e, selectedRow,
			// model.getValueAt(selectedRow,-1));

		}

		public abstract void actionPerformed(ActionEvent e, int row, Object data);

	}

	/**
	 * Update the row filter regular expression from the expression in the text
	 * box.
	 */
	private void newFilter() {
		RowFilter<AbstractTableModel, Object> rf = null;
		// If current expression doesn't parse, don't update.
		try {
			rf = RowFilter.regexFilter(filterText.getText(), 0);
		} catch (java.util.regex.PatternSyntaxException e) {
			return;
		}
		// sorter.setRowFilter(rf);
	}

	static class MyTableModel extends AbstractTableModel {
		private String[] columnNames = { "First Name", "Last Name", "Sport", "# of Years", "Vegetarian" };
		private Object[][] data = { { "Kathy", "Smith", "Snowboarding", new Integer(5), new Boolean(false) },
				{ "John", "Doe", "Rowing", new Integer(3), new Boolean(true) },
				{ "Sue", "Black", "Knitting", new Integer(2), new Boolean(false) },
				{ "Jane", "White", "Speed reading", new Integer(20), new Boolean(true) },
				{ "Joe", "Brown", "Pool", new Integer(10), new Boolean(false) } };

		public int getColumnCount() {
			return columnNames.length;
		}

		public int getRowCount() {
			return data.length;
		}

		public String getColumnName(int col) {
			return columnNames[col];
		}

		public Object getValueAt(int row, int col) {
			return data[row][col];
		}

		/*
		 * JTable uses this method to determine the default renderer/ editor for
		 * each cell. If we didn't implement this method, then the last column
		 * would contain text ("true"/"false"), rather than a check box.
		 */
		public Class getColumnClass(int c) {
			return getValueAt(0, c).getClass();
		}

		/*
		 * Don't need to implement this method unless your table's editable.
		 */
		public boolean isCellEditable(int row, int col) {
			// Note that the data/cell address is constant,
			// no matter where the cell appears onscreen.
			if (col < 2) {
				return false;
			} else {
				return true;
			}
		}

		/*
		 * Don't need to implement this method unless your table's data can
		 * change.
		 */
		public void setValueAt(Object value, int row, int col) {
			if (DEBUG) {
				System.out.println("Setting value at " + row + "," + col + " to " + value + " (an instance of "
						+ value.getClass() + ")");
			}

			data[row][col] = value;
			fireTableCellUpdated(row, col);

			if (DEBUG) {
				System.out.println("New value of data:");
				printDebugData();
			}
		}

		private void printDebugData() {
			int numRows = getRowCount();
			int numCols = getColumnCount();

			for (int i = 0; i < numRows; i++) {
				System.out.print("    row " + i + ":");
				for (int j = 0; j < numCols; j++) {
					System.out.print("  " + data[i][j]);
				}
				System.out.println();
			}
			System.out.println("--------------------------");
		}
	}

	/**
	 * Create the GUI and show it. For thread safety, this method should be
	 * invoked from the event-dispatching thread.
	 */
	private static void createAndShowGUI() {
		// Create and set up the window.
		JFrame frame = new JFrame("TableFilterDemo");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		// Create and set up the content pane.
		RepositoryTreePanel newContentPane = new RepositoryTreePanel(
				"//192.168.31.1/XiaoMi-usb0/research/git/filelist/tools/repositories1.txt");
		newContentPane.setOpaque(true); // content panes must be opaque
		frame.setContentPane(newContentPane);

		// Display the window.
		frame.pack();
		frame.setVisible(true);
	}

	public static void main(String[] args) {
		// Schedule a job for the event-dispatching thread:
		// creating and showing this application's GUI.
		javax.swing.SwingUtilities.invokeLater(new Runnable() {
			public void run() {
				createAndShowGUI();
			}
		});
	}

	public Dimension getPreferredSize() {
		return tree.getPreferredSize();
	}

	public void dumpSelectedPaths(String string) {
		tree.dumpSelectedPaths(string);
	}

//	public void save() {
//		outputMessage("Start saving...");
//		tree.save();
//		outputMessage("End saving");
//	}

	public void saveToProject(String projectPath) {

		try {

			tree.saveToProject(projectPath);

		} catch (FileNotFoundException e) {

			e.printStackTrace();

		}
	}
}