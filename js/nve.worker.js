class Display {
    constructor(x,y) {
        this.size = [x,y];
        this.dpds = new Uint8ClampedArray(x*y*3).fill(0);
    }
    set(adr,c) {
        this.dpds[adr] = c;
        return this;
    }
}

class NVM {
    #prog;#imme;#memr;#istr;#ostr;#ispt;#ospt;#regi;#labeladr; // 宣言
    constructor(program,args=[0]) { // 初期化
        let tbr = this.tbyte(program);
        this.#prog = tbr[0]; // プログラム
        this.#imme = tbr[1]; // 即値
        this.#memr = new Int32Array(1024); // データ
        this.#istr = new Int32Array(args); // 標準入力
        this.#ostr = new Int32Array(1024); // 標準出力
        this.#ispt = 0; // 標準入力ポインタ
        this.#ospt = 0; // 標準出力ポインタ
        this.#regi = [0,0,0]; // i sp fp
        this.display = new Display(10,10);
    }
    push(x) {
        this.#memr[this.#regi[1]] = x;
        this.#regi[1]++;
    }
    pop() {
        this.#memr[this.#regi[1]] = 0;
        this.#regi[1]--;
        let r = this.#memr[this.#regi[1]];
        return r;
    }
    next() { // 一つの命令を実行する
        if (this.endRunning()) {console.warn("end runnning")}
        switch (this.#prog[this.#regi[0]]) {
            case 0: // push n
                this.push(this.#imme[this.#regi[0]]);
            break;
            case 1: // pop
                this.pop();
            break;
            case 2: // get
                this.push(this.#istr[this.#ispt]);
                this.#ispt++;
            break;
            case 3: // out
                let out = this.pop()
                postmes(["putchar",out]);
                this.#ostr[this.#ospt] = out;
                this.#ospt++;
            break;
            case 4: // ssp
                this.#regi[1] = this.#imme[this.#regi[0]];
            break;

            case 5: // add
                this.push(this.pop()+this.pop());
            break;
            case 6: // sub
                this.push(-this.pop()+this.pop());
            break;
            case 7: // mul
                this.push(this.pop()*this.pop());
            break;
            case 8: // and
                this.push(Boolean(this.pop())&Boolean(this.pop()));
            break;
            case 9: // or
                this.push(Number(Boolean(this.pop())|Boolean(this.pop())));
            break;
            case 10: // xor
                this.push(Number(Boolean(this.pop())^Boolean(this.pop())));
            break;
            case 11: // not
                this.push(Number(!Boolean(this.pop())))
            break;
            case 12: // buffer
                this.push(Number(Boolean(this.pop())))
            break;

            case 13: // inc
                this.push(this.pop()+1);
            break;
            case 14: // dec
                this.push(this.pop()-1);
            break;

            case 15: // rshift
                this.push(this.pop()>>1);
            break;
            case 16: // lshift
                this.push(this.pop()<<1);
            break;

            case 17: // equal
                this.push(Number(this.pop()==this.pop()));
            break;
            case 18: // less
                this.push(Number(this.pop()<this.pop()));
            break;
            case 19: // greater
                this.push(Number(this.pop()>this.pop()));
            break;
            case 20: // jmp
                this.#regi[0] = this.#imme[this.#regi[0]];
                this.#regi[0]--;
            break;
            case 21: // ifjmp
                if (this.pop()==0) {
                    this.#regi[0] = this.#imme[this.#regi[0]];
                    this.#regi[0]--;
                }
            break;

            case 22: // call
                this.#regi[2] = this.#regi[0];
                this.push(this.#regi[0]);
                this.#regi[0] = this.#imme[this.#regi[0]];
                this.#regi[0]--;
            break;
            case 23: // ret
                this.#regi[0] = this.pop();
            break;
            case 24: // fram m
            break;

            case 25: // pushvar a
                this.push(this.#memr[this.pop()]);
            break;
            case 26: // popvar
                this.#memr[this.pop()] = this.pop();
            break;
            case 27: // pushrel
                this.push(this.#memr[this.pop()]);
            break;
            case 28: // poprel
                this.#memr[this.pop()] = this.pop();
            break;
            case 29: // vmov
                this.display.set(this.pop(),this.pop());
                postmes(["display",this.display]);
            break;


            default:
            break;
        }
        this.#regi[0]++;
        return this;
    }
    runall() { // 最後まで命令を実行する(最大100000)
        let cnt = 0;
        while (cnt<100000&&!this.endRunning()) {cnt++;debuglog(this.getRegi(),this.getData().slice());this.next();}
        return this;
    }
    tbyte(program) { // テキストを数値の配列に変換する
        let icnt = 0;
        // m memory; i immeddiate; p memory-pointer; x result; a,b args;
        let ins = ["push","pop","get","out","ssp","add","sub","mul","and","or","xor","not","bf","inc","dec","rshift","lshift","equ","less","gret","jmp","ifjmp","call","ret","fram","pushvar","popvar","pushrel","poprel","vmov"];
        let lines = program.replace(/\r/g,"").split("\n");
        console.log("lines",lines)
        let tlss = [];
        for (let l=0;l<lines.length;l++) {
            let s;
            for (s=0;s<lines[l].length;s++) {
                if (lines[l][s]!=" ") {break;}
            }
            let c;
            for (c=0;c<lines[l].length;c++) {
                if (lines[l][c]==";") {break;}
            }
            let tl = lines[l].slice(s,c);
            if (tl.length==0) {continue;}
            let tls = tl.split(" ");
            tlss.push(tls);
            if (ins.indexOf(tls[0])==-1) {continue;}
            icnt++;
            if (tls[tls.length-1]==":") {icnt--;}
        }
        let prog = new Uint8ClampedArray(icnt);
        let imme = new Uint32Array(icnt);
        let ic = 0;
        let labeladr = {};
        for (let i=0;i<tlss.length;i++) {
            ic++;
            if (tlss[i][0][tlss[i][0].length-1]==":") {
                ic--;
                labeladr[tlss[i][0].slice(0,tlss[i][0].length-1)] = ic;
            }
        }
        ic = 0;
        for (let i=0;i<tlss.length;i++) {
            if (tlss[i][0][tlss[i][0].length-1]==":") {continue;}
            if (ins.indexOf(tlss[i][0])==-1) {continue;}
            prog[ic] = ins.indexOf(tlss[i][0]);
            if (["jmp","ifjmp","call"].indexOf(tlss[i][0])!=-1) {
                imme[ic] = labeladr[tlss[i][1]];
            }
            else if (tlss[i].length>0) {
                imme[ic] = parseInt(tlss[i][1]);
            }
            ic++;
        }
        this.#labeladr = labeladr;
        return [prog,imme];
    }
    endRunning() {if(this.#regi[0]>this.#prog.length){return true};return false;}
    nextRead() {if(this.#prog[this.#regi[0]]==5){return true};return false;}
    getOut(format="utf-8") {return (new TextDecoder(format)).decode(new Uint8Array(this.#ostr.slice(0,this.#ospt)));} // 出力をテキストで取得
    getBinOut() {return new Int32Array(this.#ostr.slice(0,this.#ospt))} // 出力を配列で取得
    getProg() {return this.#prog}
    getImme() {return this.#imme}
    getData() {return this.#memr}
    getIptr() {return this.#regi[0]}
    getDptr() {return this.#regi[1]}
    getRegi() {return this.#regi}
    getFunc() {return this.#labeladr}
}

function postmes(message) {
    self.postMessage(message);
}
{
    let debug = false;
    if (debug) {
        var debuglog = console.log;
    }
    else {
        var debuglog = function() {};
    }
}
