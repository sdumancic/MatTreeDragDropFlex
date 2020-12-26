import { TreeNode } from './models';

export const CONTROLS_DATA: TreeNode[] = [
    {
      "item": "Available Controls",
      "type" : "Available Controls",
      "properties" : {},
      "children": [
        {
          "item": "ID",
          "type": "Control"
        },
        {
          "item": "Name",
          "type": "Control"
        },
        {
          "item": "Description",
          "type": "Control"
        }
      ]
    },
    {
      "item": "MainContainer",
      "type" : "Flex Container",
      "properties" : {
        "flexDirection": "row"
      },
      "children": []
    }
  ]