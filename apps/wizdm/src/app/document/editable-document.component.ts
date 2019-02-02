import { Component, AfterViewChecked, Input, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';
import { EditableContent } from './common/editable-content';
import { wmDocument, wmTextStyle } from './common/editable-types';
import { EditableSelection } from './selection/editable-selection.service';

@Component({
  selector: 'wm-editable-document, [wm-editable-document]',
  templateUrl: './editable-document.component.html',
  styleUrls: ['./editable-document.component.scss']
})
export class EditableDocument extends EditableContent<wmDocument> implements AfterViewChecked  {

  @HostBinding('attr.contenteditable') get editable() {
    return this.editMode ? 'true' : 'false';
  }

  constructor(private sel: EditableSelection) { 
    super(null); sel.attach(this);
  }

  @Input() set source(source: wmDocument) {
    // Build the data tree
    this.build(this.node = source);
  }

  private editMode = false;

  @Input() set edit(mode: boolean) { 
    
    if(this.editMode = mode) {
      this.sel.query();
    }
  }

  get style(): string[] {
    return !!this.sel.start ? this.sel.start.style : [];
  }

  public format(style: wmTextStyle[]) {
    !!this.sel && this.sel.format(style);
  }

  ngAfterViewChecked() {
    // Applies the current selection to the document when needed. This is essential even when the selection
    // isn't modified since the document selection gets resetted when the involved node(s) are modified 
    // (like view rendering after content update)
    this.sel.apply();    
  }

  @HostListener('mouseup', ['$event']) //mouseUp(ev: Event) { this.keyUp(ev);}
  @HostListener('keyup', ['$event']) keyUp(ev: Event) {
    // Query the selection, so, it's always up to date
    if(this.editMode) { this.sel.query(); }
  }

  @HostListener('keydown', ['$event']) keyDown(ev: KeyboardEvent) {
    // Fallback to default while not in edit mode
    if(!this.editMode) { return true; }

    // Query the selection, so, it's always up to date. 
    this.sel.query();

    switch(ev.key) {
      /*// Navigating
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'Tab':*/
      
      // Merging foreward
      case 'Delete':
      // Force content syncing prior to any layout modification
      this.sync();
      // Extends the selection one char forward when collapsed
      if(this.sel.collapsed) { this.sel.move(0, 1); }
      // Deletes the selection
      return this.sel.delete(), false;
      
      // Merging backward
      case 'Backspace':
      // Force content syncing prior to any layout modification
      this.sync(); 
      // extends the selection one char backward when collapsed
      if(this.sel.collapsed) { this.sel.move(-1, 0); }
      // Deletes the selection
      return this.sel.delete(), false;
      
      // Splitting
      case 'Enter':
      // Force content syncing prior to any layout modification
      this.sync();
      // Breaks the current selection on enter
      return this.sel.break(ev.shiftKey), false;

      // Editing, does the minimun so to not interfere with press-and-hold feature on mac OSX
      default: if(ev.key.length === 1) {
        //if(ev.repeat) { return false; }

        if(this.sel.start.type !== 'text') {
          debugger;
        }

        return this.insert(ev.key);
      }
      // Don't bother applying the selection change if not needed
      // to avoid messing with the cursor position
      this.sel.mark(false);
    }
    // Fallback to default
    return true;
  }

  private updating = null;

  private insert(char: string): boolean {

    if(this.sel.collapsed) {

      clearTimeout(this.updating);

      this.updating = setTimeout(() => {
        this.sync();

        this.sel.query();
        this.sel.mark();
      }, 1000);
      
      return true;
    }

    return this.sel.insert(char), false;
  }

  private sync() {
    
    if(!!this.updating) {

      clearTimeout(this.updating);
      
      this.sel.sync();

      this.updating = null;
    }
  }
}