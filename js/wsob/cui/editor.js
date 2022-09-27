class NCharInput {
    constructor() {
        this.reset();
    }
    reset() {
        this.text = "";
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
}
class NCharUI {
    constructor(editorarea,text="") {
        this.ui = editorarea;
        this.oninput = false;
        this.editor = new NCharInput();
        console.log(this.editor)
        this.text = text;
        {
            this.ui.classList.add("NChar");
            // edit area
            this.display = document.createElement("div");
            this.display.classList.add("display");
            // cursor
            this.composingtext = document.createElement("span");
            this.composingtext.classList.add("composing");
            this.addtextarea = document.createElement("textarea");
            this.addtextarea.classList.add("addtext");
            this.display.onclick = function() {this.addtextarea.focus()}.bind(this);
            this.ui.appendChild(this.display);
            this.addtextarea.oninput = this.addtext.bind(this);
            this.addtextarea.onkeydown = this.keyevents.bind(this);
            this.updatelines();
        }
    }
    addtext(e) {
        if( e.isComposing ) {
            this.composingtext.innerText = e.target.value;
            this.infocursor.innerText = [this.editor.cursor+e.target.value.length];
            return;
        }
        else {
            for (let i=0;i<e.target.value.length;i++) {
                if (e.target.value[i]!="\n") {
                    this.editor.addText(e.target.value[i]);
                }
                else {
                    console.log("input:",this.editor.text);
                    self.postMessage(["inputed",this.editor.text]);
                    this.editor.reset();
                    this.oninput = false;
                }
            }
            e.target.value = "";
            this.composingtext.innerText = "";
        }
        this.updatelines();
    }
    putchar(t) {
        console.log(t)
        this.text += t;
        this.updatelines();
    }
    keyevents(e) {
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
            if (true) {
                this.editor.moveCursor(-1);
            }
            this.updatelines();
        }
        if (e.keyCode==39) {
            if (true) {
                this.editor.moveCursor(1);
            }
            this.updatelines();
        }

        this.beforekey = e;

    }
    updatelines() {
        this.display.innerHTML = "";
        let lines = document.createElement("span");
        let i = 0;
        for (i=0;i<=this.text.length;i++) {
            if (this.text[i]==null) {
                lines.classList.add("line");
                this.display.appendChild(lines);
            }
            else if (this.text[i]=="\n") {
                lines.classList.add("line");
                this.display.appendChild(lines);
                lines = document.createElement("span");
            }
            else {
                let chars = document.createElement("span");
                //lines.classList.add("endline");
                chars.classList.add("char");
                chars.innerText = this.text[i];
                lines.appendChild(chars);
            }
        }
        if (this.oninput) {
            for (let j=0;j<this.editor.text.length+1;j++) {
                if (j+1==this.editor.cursor) {
                    lines.appendChild(this.composingtext);
                    lines.appendChild(this.addtextarea);
                }
                if (this.editor.text[j]==null) {
                    lines.classList.add("line");
                    this.display.appendChild(lines);
                }
                else if (this.editor.text[j]=="\n") {
                    lines.classList.add("line");
                    this.display.appendChild(lines);
                    lines = document.createElement("span");
                }
                else {
                    let chars = document.createElement("span");
                    chars.classList.add("char");
                    chars.innerText = this.editor.text[j];
                    lines.appendChild(chars);
                }
            }
            this.addtextarea.focus();
        }
    }
    async getinput() {
        self.addEventListener("message", (e) => {
            if (e.data[0]!=null&&e.data[0]=="inputed") {
                resolve(e.data[1]);
            }
        });
    }
}