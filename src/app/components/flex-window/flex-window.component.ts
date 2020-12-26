import { AfterViewInit, Component, ElementRef, HostBinding, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IFlexProperties } from '../form-designer/models';

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2
}

@Component({
  selector: 'app-flex-window',
  templateUrl: './flex-window.component.html',
  styleUrls: ['./flex-window.component.scss']
})
export class FlexWindowComponent implements OnInit, AfterViewInit {


  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('left') public left: number;
  @Input('top') public top: number;
  @ViewChild("box") public box: ElementRef;
  private boxPosition: { left: number, top: number };
  private containerPos: { left: number, top: number, right: number, bottom: number };
  public mouse: {x: number, y: number}
  public status: Status = Status.OFF;
  private mouseClick: {x: number, y: number, left: number, top: number}

  private nativeElement : Node;

  getNativeElement() {
    return this.nativeElement;
  }
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }


  ngAfterViewInit(){
    this.loadBox();
    this.loadContainer();
  }

  private loadBox(){
    const {left, top} = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = {left, top};
  }

  private loadContainer(){
    const left = this.boxPosition.left - this.left;
    const top = this.boxPosition.top - this.top;
    const right = left + 600;
    const bottom = top + 450;
    this.containerPos = { left, top, right, bottom };
  }

  setStatus(event: MouseEvent, status: number){
    if(status === 1) event.stopPropagation();
    else if(status === 2) this.mouseClick = { x: event.clientX, y: event.clientY, left: this.left, top: this.top };
    else this.loadBox();
    this.status = status;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent){
    this.mouse = { x: event.clientX, y: event.clientY };

    if(this.status === Status.RESIZE) this.resize();
    else if(this.status === Status.MOVE) this.move();
  }

  private resize(){
    //if(this.resizeCondMeet())
    {
      this.width = Number(this.mouse.x > this.boxPosition.left) ? this.mouse.x - this.boxPosition.left : 0;
      this.height = Number(this.mouse.y > this.boxPosition.top) ? this.mouse.y - this.boxPosition.top : 0;
    }
  }

  private resizeCondMeet(){
    return (this.mouse.x < this.containerPos.right && this.mouse.y < this.containerPos.bottom);
  }

  private move(){
    //if(this.moveCondMeet())
    {
      this.left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
      this.top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
    }
  }

  private moveCondMeet(){
    const offsetLeft = this.mouseClick.x - this.boxPosition.left; 
    const offsetRight = this.width - offsetLeft; 
    const offsetTop = this.mouseClick.y - this.boxPosition.top;
    const offsetBottom = this.height - offsetTop;
    return (
      this.mouse.x > this.containerPos.left + offsetLeft && 
      this.mouse.x < this.containerPos.right - offsetRight &&
      this.mouse.y > this.containerPos.top + offsetTop &&
      this.mouse.y < this.containerPos.bottom - offsetBottom
      );
  }

  clearAll() {
    const children = this.elRef.nativeElement.children;
    let target: ChildNode;
    for (let child of children) {
      const chNode = (child as ChildNode);
       target = chNode.lastChild;
    }
    //this.renderer.removeChild(this.elRef.nativeElement, child);
    target.childNodes.forEach(child => {
      this.renderer.removeChild(target, child);
    })
    
  }

  createDivWithClass(className: string) {
    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, className);
    return div;
  }

  createDivWithClassAndAppend(className: string, parent: any) {
    const div = this.createDivWithClass(className);
    this.renderer.appendChild(parent,div);
    return div;
  }

  createInputAndAppend(value: string, parent:any) {
    const input = this.renderer.createElement('input');
    this.renderer.setAttribute(input, 'value', value);
    this.renderer.appendChild(parent,input);
    return input;
  }


  setFlexProperties(container:any, flexProps: IFlexProperties) {
    
    const style="display: flex;";
    this.renderer.setStyle(container, 'display', 'flex');
    
    if (flexProps.flexDirection) {
      this.renderer.setStyle(container, 'flex-direction', flexProps.flexDirection);
    }
    if (flexProps.flexWrap) {
      this.renderer.setStyle(container, 'flex-wrap', flexProps.flexWrap);
    }
    if (flexProps.justifyContent) {
      this.renderer.setStyle(container, 'justify-content', flexProps.justifyContent);
    }
    if (flexProps.alignItems) {
      this.renderer.setStyle(container, 'align-items', flexProps.alignItems);
    }
    if (flexProps.alignContent) {
      this.renderer.setStyle(container, 'align-content', flexProps.alignContent);
    }

  }

  ngOnInit(): void {

    this.nativeElement = this.elRef.nativeElement;
/*
    const mainDiv = this.createDivWithClassAndAppend('MainContainer', this.nativeElement);
    const div1 = this.createDivWithClassAndAppend('Container1', mainDiv); 
    const div2 = this.createDivWithClassAndAppend('Container2',mainDiv);
    const div3 = this.createDivWithClassAndAppend('Container3',mainDiv);

    this.createInputAndAppend('input #1', div1);
    this.createInputAndAppend('input #2', div1);
    this.createInputAndAppend('input #3', div2);
    this.createInputAndAppend('input #4', div2);
    this.createInputAndAppend('input #5', div3);
    this.createInputAndAppend('input #6', div3);
    
    this.setFlexProperties(mainDiv, {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'});
    this.setFlexProperties(div1, {flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'});
    this.setFlexProperties(div2, {flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'});
    this.setFlexProperties(div3, {flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'});
        
  */

  }

}
