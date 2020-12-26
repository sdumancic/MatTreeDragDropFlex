import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CONTROLS_DATA } from './data';
import { IFlexProperties, TreeNode } from './models';

@Injectable({
  providedIn: 'root'
})
export class FormDesignerService {

  dataChange = new BehaviorSubject<TreeNode[]>([]);

  get data(): TreeNode[] { return this.dataChange.value; }

  constructor() {
    this.initialize();
  }

  initialize() {
    const data = CONTROLS_DATA;
    // Notify the change.
    this.dataChange.next(data);
  }


  addAvailableControl(item: string) {
    let availableControlNode = null;
    this.data.forEach(node => {
      if (node.type === 'Available Controls') {
        availableControlNode = node;
      }
    });
    if (availableControlNode === null) {
      availableControlNode = {
        "item": "Available Controls",
        "type" : "Available Controls",
        "properties" : {}
      } as TreeNode;
      
      this.data.push(availableControlNode);
    }
    let newControlNode = {
      item: item, type: 'Control'
    } as TreeNode;
    availableControlNode.children.push(newControlNode);
    this.dataChange.next(this.data);
  }
  addData(item: 'Controls' | 'Flex Container') {}

  /** Add an item to to-do list */
  insertItem(parent: TreeNode, name: string, type: string, properties?: IFlexProperties): TreeNode {
    if (!parent.children) {
      parent.children = [];
    }
    const newItem = { item: name, type: type, properties: properties } as TreeNode;
    parent.children.push(newItem);
    
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemAbove(node: TreeNode, name: string, type: string, properties?: IFlexProperties): TreeNode {
    const parentNode = this.getParentFromNodes(node);
    const newItem = { item: name, type: type, properties: properties } as TreeNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node), 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  insertItemBelow(node: TreeNode, name: string, type: string, properties?: IFlexProperties): TreeNode {
    const parentNode = this.getParentFromNodes(node);
    
    const newItem = { item: name, type: type, properties: properties } as TreeNode;
    if (parentNode != null) {
      parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    } else {
      this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    }
    this.dataChange.next(this.data);
    return newItem;
  }

  getParentFromNodes(node: TreeNode): TreeNode {
    for (let i = 0; i < this.data.length; ++i) {
      const currentRoot = this.data[i];
      const parent = this.getParent(currentRoot, node);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  getParent(currentRoot: TreeNode, node: TreeNode): TreeNode {
    if (currentRoot.children && currentRoot.children.length > 0) {
      for (let i = 0; i < currentRoot.children.length; ++i) {
        const child = currentRoot.children[i];
        if (child === node) {
          return currentRoot;
        } else if (child.children && child.children.length > 0) {
          const parent = this.getParent(child, node);
          if (parent != null) {
            return parent;
          }
        }
      }
    }
    return null;
  }

  findNode(node: TreeNode) {

  }
  updateItem(node: TreeNode, name: string, type: string, properties: IFlexProperties) {

    node.item = name;
    node.type= type;
    node.properties = properties;
    this.dataChange.next(this.data);
  }

  deleteItem(node: TreeNode) {
    this.deleteNode(this.data, node);
    this.dataChange.next(this.data);
  }

  copyPasteItem(from: TreeNode, to: TreeNode): TreeNode {
    const newItem = this.insertItem(to, from.item, from.type, from.properties);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemAbove(from: TreeNode, to: TreeNode): TreeNode {
    const newItem = this.insertItemAbove(to, from.item, from.type, from.properties);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  copyPasteItemBelow(from: TreeNode, to: TreeNode): TreeNode {
    const newItem = this.insertItemBelow(to, from.item, from.type, from.properties);
    if (from.children) {
      from.children.forEach(child => {
        this.copyPasteItem(child, newItem);
      });
    }
    return newItem;
  }

  deleteNode(nodes: TreeNode[], nodeToDelete: TreeNode) {
    const index = nodes.indexOf(nodeToDelete, 0);
    if (index > -1) {
      nodes.splice(index, 1);
    } else {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          this.deleteNode(node.children, nodeToDelete);
        }
      });
    }
  }

  findInChildren(nodeToStart: TreeNode, type: string, foundNodes: TreeNode[]) {
    nodeToStart.children.forEach(node => {
      if (node.type === type) {
        foundNodes.push(node);
      }
      if (node.children && node.children.length > 0) {
        this.findInChildren(node, type, foundNodes);
      }
    });
  }

  


}
