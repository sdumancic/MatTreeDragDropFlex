/**
 * File node data with nested structure.
 * Each node has a label, and a type or a list of children.
 */

 export interface IFlexProperties {
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'first baseline' | 'last baseline' | 'start' | 'end' | 'self-start';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end' | 'left' | 'right';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch' | 'start' | 'end' | 'baseline' | 'first baseline' | 'last baseline';
 }

export class TreeNode {
   children?: TreeNode[];
   item: string;
   type: string;
   properties?: IFlexProperties;
 }
 
 /** Flat node with expandable and level information */
 export class TreeFlatNode {
    expandable: boolean;
    item: string;
    level: number;
    type: string;
    properties?: IFlexProperties;
 }