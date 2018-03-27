package repo.component.checkbox;

import java.util.Vector;

import javax.swing.tree.DefaultMutableTreeNode;

public class CheckBoxNode extends DefaultMutableTreeNode{
//  String text;

  boolean selected;

  public CheckBoxNode(String text, boolean selected) {
	super(text);
    this.selected = selected;
  }

  public boolean isSelected() {
    return selected;
  }

  public void setSelected(boolean newValue) {
    selected = newValue;
  }

//  public String getText() {
//    return text;
//  }
//
//  public void setText(String newValue) {
//    text = newValue;
//  }
//
//  public String toString() {
//    return getClass().getName() + "[" + text + "/" + selected + "]";
//  }
}

class NamedVector extends Vector {
  String name;

  public NamedVector(String name) {
    this.name = name;
  }

  public NamedVector(String name, Object elements[]) {
    this.name = name;
    for (int i = 0, n = elements.length; i < n; i++) {
      add(elements[i]);
    }
  }

  public String toString() {
    return "[" + name + "]";
  }
}