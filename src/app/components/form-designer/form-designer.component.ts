import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of } from 'rxjs';
import { FlexContainerPropertiesComponent } from '../flex-container-properties/flex-container-properties.component';
import { FormDesignerService } from './form-designer.service';
import { TreeFlatNode, TreeNode } from './models';
import { String, StringBuilder } from 'typescript-string-operations';
import { FlexWindowComponent } from '../flex-window/flex-window.component';

@Component({
  selector: 'app-form-designer',
  templateUrl: './form-designer.component.html',
  styleUrls: ['./form-designer.component.scss']
})
export class FormDesignerComponent implements AfterViewInit {

  @ViewChild('flexWindow') flexWindow: FlexWindowComponent;

  public css: string;
  public html: string;

  containerCounter: number = 0;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TreeFlatNode, TreeNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeNode, TreeFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TreeFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TreeFlatNode>;

  treeFlattener: MatTreeFlattener<TreeNode, TreeFlatNode>;

  dataSource: MatTreeFlatDataSource<TreeNode, TreeFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TreeFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number;
  dragNodeExpandOverArea: string;
  @ViewChild('emptyItem') emptyItem: ElementRef;

  constructor(public database: FormDesignerService,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
    ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    
  }
  ngAfterViewInit(): void {
    this.database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
      this.generateCssHtmlAndPreview();
    });

    
  }

  getLevel = (node: TreeFlatNode) => node.level;

  isFlexContainer = (_nodeData: TreeFlatNode) => { 
    return _nodeData.type === 'Flex Container'; 
  }

  isExpandable = (node: TreeFlatNode) => node.expandable;

  getChildren = (node: TreeNode): TreeNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TreeFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeFlatNode();
    flatNode.item = node.item;
    flatNode.type = node.type;
    flatNode.properties = node.properties;
    flatNode.level = level;
    flatNode.expandable = (node.children && node.children.length > 0);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  addControl(item) {
    if (item) {
     this.database.addAvailableControl(item);
    }
  }

 
  addNewItem(node: TreeFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.containerCounter = this.containerCounter +1;
    this.database.insertItem(parentNode, 'Container' + this.containerCounter, 'Flex Container',
    {"flexDirection": "row"});
    this.treeControl.expand(node);
  }

  deleteExistingItem(node: TreeFlatNode) {
    if (node.level === 0) {
      return;
    }
    const nestedNode = this.flatNodeMap.get(node);
    const foundNodes: TreeNode[] = [];
    this.database.findInChildren(nestedNode, 'Control', foundNodes);

    //move controls from deleted node into available controls
    const availableControlsNode = this.treeControl.dataNodes.find(node => node.type = 'Available Controls');

    let lastChildNode;
    const availableControlsTreeNode = this.flatNodeMap.get(availableControlsNode);
    availableControlsTreeNode.children.forEach(childNode => lastChildNode = childNode);
    if (!lastChildNode) {
      foundNodes.forEach(node => {
        this.database.insertItem(availableControlsTreeNode, node.item, node.type);
      })
    } else {
      foundNodes.forEach(node => {
        this.database.insertItemBelow(lastChildNode, node.item, node.type);
      })
    }
    
    this.database.deleteItem(nestedNode);

  }

  /** Save the node to database */
  saveNode(node: TreeFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode, itemValue, node.type, node.properties);
  }

  /** Cancel Save the node to database */
  cancelSaveNode(node: TreeFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.deleteNode(this.treeControl.dataNodes, node);
  }
  
  onClick(event, node) {
    
    if (node.type === 'Flex Container' && event.ctrlKey) {
      this.displayProperties(node);
    }
  }

  handleDragStart(event, node) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    event.dataTransfer.setData('foo', 'bar');
    event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event, node) {
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    const percentageX = event.offsetX / event.target.clientWidth;
    const percentageY = event.offsetY / event.target.clientHeight;
    if (percentageY < 0.25) {
      this.dragNodeExpandOverArea = 'above';
    } else if (percentageY > 0.75) {
      this.dragNodeExpandOverArea = 'below';
    } else {
      this.dragNodeExpandOverArea = 'center';
    }
  }

  handleDrop(event, node) {
    event.preventDefault();
    if (node !== this.dragNode) {
      let newItem: TreeNode;
      if (this.dragNodeExpandOverArea === 'above') {
        newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else if (this.dragNodeExpandOverArea === 'below') {
        newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      } else {
        newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode), this.flatNodeMap.get(node));
      }
      this.database.deleteItem(this.flatNodeMap.get(this.dragNode));
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem));
    }
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  

  displayProperties(node: TreeFlatNode) {
    const dialogRef = this.dialog.open(FlexContainerPropertiesComponent, {
      width: '400',
      height: '400',
      data: {item: node.item, properties: node.properties}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      
      if (result) {
        const properties = {
          alignContent: result.alignContent,
          alignItems: result.alignItems,
          flexDirection: result.flexDirection,
          flexWrap: result.flexWrap,
          justifyContent: result.justifyContent
        }
        //console.log(this.flatNodeMap.get(node), result.item, node.type, properties);
        this.database.updateItem(this.flatNodeMap.get(node), result.item, node.type,properties);
      }
      
    });
  }

  generateCssHtmlAndPreview(): void {
    const sbCss = new StringBuilder();
    const sbHtml = new StringBuilder();
    const arr: {item: string, element: any}[] = [];
    if (this.flexWindow) {
      this.flexWindow.clearAll();
      //this.getFlexWindowTargetNode().childNodes.forEach(node => node.clear)
      const mainContainer = this.treeControl.dataNodes.find(node => 
        node.type === 'Flex Container' && node.level === 0);
      const mainContainerTreeNode = this.flatNodeMap.get(mainContainer);
      this.traverseDepthFirst(mainContainerTreeNode, sbCss, sbHtml, arr);
      this.css = sbCss.ToString();
      this.html = sbHtml.ToString();
      this.cd.detectChanges();
    }
    //availableControlsTreeNode.children.forEach(childNode => lastChildNode = childNode);    
  }

  traverseDepthFirst(treeNode: TreeNode, sbCss: StringBuilder, sbHtml: StringBuilder, arr) {
    //this.displayFlexWindow();
    if (treeNode.type === 'Flex Container') {
      this.generateContainerCss(treeNode, sbCss);
    }
      this.generateHtmlCss(treeNode, sbHtml);
      this.generateFlexWindowContent(treeNode,arr);
    if (!treeNode.children) {
      return;
    }
    treeNode.children.forEach(child => {
      this.traverseDepthFirst(child, sbCss, sbHtml, arr);
    })
    sbHtml.AppendLine('</div>');
      
  }

  generateContainerCss(treeNode: TreeNode, sb: StringBuilder): void {
    sb.AppendLine('.' + treeNode.item + '{');
    sb.AppendLine('  display: flex;');
    if (treeNode.properties.flexDirection) {
      sb.AppendLineFormat('  flex-direction: {0};', treeNode.properties.flexDirection);
    }
    if (treeNode.properties.flexWrap) {
      sb.AppendLineFormat('  flex-wrap: {0};', treeNode.properties.flexWrap);
    }
    if (treeNode.properties.justifyContent) {
      sb.AppendLineFormat('  justify-content: {0};', treeNode.properties.justifyContent);
    }
    if (treeNode.properties.alignItems) {
      sb.AppendLineFormat('  align-items: {0};', treeNode.properties.alignItems);
    }
    if (treeNode.properties.alignContent) {
      sb.AppendLineFormat('  align-content: {0};', treeNode.properties.alignContent);
    }
    sb.AppendLine('}');
  }

  generateHtmlCss(treeNode: TreeNode, sb: StringBuilder): void {
    if (treeNode.type === 'Flex Container') {
      sb.AppendLineFormat(`<div class='{0}'>`, treeNode.item);
    }
    if (treeNode.type === 'Control') {
    sb.AppendLineFormat(` <input type="input" value='{0}'>`, treeNode.item); 
    }
  }

  getFlexWindowTargetNode() {
    let targetNode: ChildNode;
    this.flexWindow.getNativeElement().childNodes.forEach(node => targetNode = node);
    return targetNode.lastChild;
  }
  
  generateFlexWindowContent(treeNode: TreeNode, arr:{item: string, element: any}[]){
    
    const parentNode = this.database.getParentFromNodes(treeNode);
    //console.log('NODE= ', treeNode.item, 'PARENT=',parentNode?.item);
    const item = treeNode.item;
    if (!parentNode) {
      if (treeNode.type === 'Flex Container') {
        
        const res = this.flexWindow.createDivWithClassAndAppend(item, this.getFlexWindowTargetNode()/*this.flexWindow.getNativeElement()*/);
        this.flexWindow.setFlexProperties(res, treeNode.properties);
        arr.push({ item: item, element: res});
      }
    } else {
      const parent = arr.find(el => el.item === parentNode.item);
      //console.log('parent=',parent);
      if (treeNode.type === 'Flex Container') {
        const res2 = this.flexWindow.createDivWithClassAndAppend(item, 
          parent.element);
        this.flexWindow.setFlexProperties(res2, treeNode.properties);
        arr.push({ item: item, element: res2});
      } else if (treeNode.type === 'Control') {
        const res3 = this.flexWindow.createInputAndAppend(item, parent.element);
        arr.push({ item: item, element: res3});
      }
    }
  }
    

}

