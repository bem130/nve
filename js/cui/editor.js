class NEditor {
    constructor() {
        this.text = [""];
        this.cursor = 1;
    }
    setText(text) {}
    addText(text) {
        this.text = this.text.slice(0,this.cursor-1)+text+this.text.slice(this.cursor-1);
        this.cursor++;
    }
    deleteText() {
        if (this.cursor>1) {
            this.text = this.text.slice(0,this.cursor-2)+this.text.slice(this.cursor-1);
            this.cursor--;
        }
    }
    moveCursor(c) {
        if (this.cursor+c>0&&this.cursor+c<this.text.length+2) {
            this.cursor+=c;
            return true;
        }
        return false;
    }
    selectText(text) {
    }
}
class NEditorUI {
    constructor(editorarea) {
        this.editor = new NEditor();
        this.ui = editorarea;
        this.beforekey = false;
        this.nowkey = false;
        this.startselect = 0;
        this.initalui();
    }
    initalui() {
        this.ui.classList.add("NEditor");
        // edit area
        this.editarea = document.createElement("div");
        this.editarea.classList.add("editarea");
        this.editarea.onclick = function() {this.addtextarea.focus()}.bind(this);
        this.ui.appendChild(this.editarea);
        // cursor
        this.composingtext = document.createElement("span");
        this.composingtext.classList.add("composing");
        this.addtextarea = document.createElement("textarea");
        this.addtextarea.classList.add("addtext");
        //this.addtextarea.onchange = this.addtext.bind(this);
        this.addtextarea.oninput = this.addtext.bind(this);
        this.editarea.onkeydown = this.keyevent.bind(this);
        // under bar
        let infobar = document.createElement("div");
        infobar.classList.add("infobar");
        {
            // cursor info
            this.infocursor = document.createElement("div");
            this.infocursor.innerHTML = [this.editor.cursor,this.editor.cursor-1];
            infobar.appendChild(this.infocursor);
        }
        this.ui.appendChild(infobar);
        this.updatelines();
    }
    addtext(e) {
        if( e.isComposing ) {
            this.composingtext.innerText = e.target.value;
            this.infocursor.innerText = [this.editor.cursor+e.target.value.length];
            return;
        }
        else {
            for (let i=0;i<e.target.value.length;i++) {
                this.editor.addText(e.target.value[i]);
            }
            e.target.value = "";
            this.composingtext.innerText = "";
        }
        this.updatelines();
    }
    keyevent(e) {
        //console.log(e)
        this.nowkey = e;

        if (e.keyCode==8) {
            this.editor.deleteText();
            this.updatelines();
        }
        if (e.keyCode==46) {
            if (this.editor.moveCursor(1)) {
                this.editor.deleteText();
                this.updatelines();
            }
        }
        if (e.keyCode==37) {
            if ((this.beforekey.keyCode==16)&&e.shiftKey) {
                this.startselect = this.editor.cursor;
            }
            if (true) {
                this.editor.moveCursor(-1);
            }
            this.updatelines();
        }
        if (e.keyCode==39) {
            if ((this.beforekey.keyCode==16)&&e.shiftKey) {
                this.startselect = this.editor.cursor;
            }
            if (true) {
                this.editor.moveCursor(1);
            }
            this.updatelines();
        }

        this.beforekey = e;

    }
    updatelines() {
        let selecting = this.nowkey.shiftKey;
        let startselection = Math.min(this.startselect,this.editor.cursor)-2;
        let endselection = Math.max(this.startselect,this.editor.cursor)-1;
        this.editarea.innerHTML = "";
        let lines = document.createElement("div");
        let i = 0;
        for (i=0;i<=this.editor.text.length;i++) {
            if (i+1==this.editor.cursor) {
                lines.appendChild(this.composingtext);
                lines.appendChild(this.addtextarea);
            }
            if (this.editor.text[i]==null) {
                lines.classList.add("line");
                this.editarea.appendChild(lines);
            }
            else if (this.editor.text[i]=="\n") {
                lines.classList.add("line");
                this.editarea.appendChild(lines);
                lines = document.createElement("div");
            }
            else {
                let chars = document.createElement("span");
                chars.classList.add("char");
                chars.innerText = this.editor.text[i];
                //console.log(selecting,startselection,endselection)
                if (selecting&&startselection<i&&endselection>i) {
                    chars.classList.add("selecting")
                }
                lines.appendChild(chars);
            }
        }
        this.infocursor.innerText = this.editor.cursor;
        this.addtextarea.focus();
        //console.log("updated")
    }
    moveselector() {
        let chars = document.querySelector(`.NEditor > div.editarea span:nth-child(${this.editor.cursor-1})`);
        if (chars!=null) {
            chars.after(this.addtextarea);
            chars.after(this.composingtext);
        }
        else {
            chars = document.querySelector(`.NEditor > div.editarea span:nth-child(${this.editor.cursor})`);
            if (chars!=null) {
                chars.before(this.addtextarea);
                chars.before(this.composingtext);
            }
            else {
                chars = document.querySelector(`.NEditor > div.editarea`);
                chars.appendChild(this.addtextarea);
                chars.appendChild(this.composingtext);
            }
        }
    }
    setui() {}
}