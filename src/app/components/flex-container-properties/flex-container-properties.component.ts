import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IFlexProperties } from '../form-designer/models';


export interface DialogData {
  item: string;
  properties: IFlexProperties;
}

@Component({
  selector: 'app-flex-container-properties',
  templateUrl: './flex-container-properties.component.html',
  styleUrls: ['./flex-container-properties.component.scss']
})
export class FlexContainerPropertiesComponent implements OnInit {

  propertiesForm = new FormGroup({
    item: new FormControl(),
    flexWrap: new FormControl(),
    flexDirection: new FormControl(),
    alignItems: new FormControl(),
    justifyContent: new FormControl(),
    alignContent: new FormControl()
  });

  flexDirectionLov: string[] = ['row','row-reverse','column','column-reverse'];
  flexWrapLov: string[] = ['nowrap','wrap','wrap-reverse'];
  alignItemsLov: string[] = ['stretch', 'flex-start','flex-end','center' ,'baseline','first baseline','last baseline','start','end','self-start'];
  justifyContentLov: string[] = ['flex-start','flex-end','center','space-between','space-around','space-evenly','start','end','left','right'];
  alignContentLov: string[] = ['flex-start','flex-end','center','space-between','space-around','space-evenly','stretch','start','end','baseline','first baseline','last baseline'];


  constructor(
    public dialogRef: MatDialogRef<FlexContainerPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { 
      this.propertiesForm.patchValue({
        item: data.item,
        flexDirection: data.properties.flexDirection,
        flexWrap: data.properties.flexWrap,
        alignItems: data.properties.alignItems,
        justifyContent: data.properties.justifyContent,
        alignContent: data.properties.alignContent
      })
    }


  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  

}
