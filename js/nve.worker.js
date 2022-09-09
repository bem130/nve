class Display {
    constructor(x,y) {
        this.size = [x,y]
        this.dpds = new Uint8ClampedArray(x*y*3).fill(255);
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
        this.#regi = [0,0,0,0,0]; // i p x a b
        this.display = new Display(640,480);
    }
    next() { // 一つの命令を実行する
        if (this.endRunning()) {console.warn("end runnning")}
        switch (this.#prog[this.#regi[0]]) {
            case 0: // get
                this.#regi[2] = this.#istr[this.#ispt];
                this.#ispt++;
            break;
            case 1: // outx
                this.#ostr[this.#ospt] = this.#regi[2];
                this.#ospt++;
            break;
            case 2: // outm
                this.#ostr[this.#ospt] = this.#memr[this.#regi[1]];
                this.#ospt++;
            break;

            case 3: // equal
                this.#regi[2] = this.#regi[3]==this.#regi[4];
            break;
            case 4: // less
                this.#regi[2] = this.#regi[3]<this.#regi[4];
            break;
            case 5: // greater
                this.#regi[2] = this.#regi[3]>this.#regi[4];
            break;
            case 6: // eqgoto
                if (this.#regi[2]==0) {
                    this.#regi[0] = this.#imme[this.#regi[0]];
                    this.#regi[0]--;
                }
            break;
            case 7: // uneqgoto
                if (this.#regi[2]!=0) {
                    this.#regi[0] = this.#imme[this.#regi[0]];
                    this.#regi[0]--;
                }
            break;
            case 8: // goto
                this.#regi[0] = this.#imme[this.#regi[0]];
                this.#regi[0]--;
            break;

            case 9: // movpx
                this.#regi[1] = this.#regi[2];
            break;
            case 10: // movpv
                this.#regi[1] = this.#imme[this.#regi[0]];
            break;
            case 11: // movmx
                this.#memr[this.#regi[1]] = this.#regi[2];
            break;
            case 12: // movmi
                this.#memr[this.#regi[1]] = this.#imme[this.#regi[0]];
            break;

            case 13: // movam
                this.#regi[3] = this.#memr[this.#regi[1]];
            break;
            case 14: // movbm
                this.#regi[4] = this.#memr[this.#regi[1]];
            break;
            case 15: // movxm
                this.#regi[2] = this.#memr[this.#regi[1]];
            break;
            case 16: // movai
                this.#regi[3] = this.#imme[this.#regi[0]];
            break;
            case 17: // movbi
                this.#regi[4] = this.#imme[this.#regi[0]];
            break;
            case 18: // movxi
                this.#regi[2] = this.#imme[this.#regi[0]];
            break;
            case 29: // movax
                this.#regi[3] = this.#regi[2];
            break;
            case 20: // movbx
                this.#regi[4] = this.#regi[2];
            break;

            case 21: // add
                this.#regi[2] = this.#regi[3]+this.#regi[4];
            break;
            case 22: // sub
                this.#regi[2] = this.#regi[3]-this.#regi[4];
            break;
            case 23: // mul
                this.#regi[2] = this.#regi[3]*this.#regi[4];
            break;

            case 24: // and
                this.#regi[2] = Boolean(this.#regi[3])&&Boolean(this.#regi[4]);
            break;
            case 25: // or
            this.#regi[2] = Boolean(this.#regi[3])||Boolean(this.#regi[4]);
            break;
            case 26: // xor
            this.#regi[2] = Boolean(this.#regi[3])^Boolean(this.#regi[4]);
            break;
            case 27: // not
            this.#regi[2] = !Boolean(this.#regi[3]);
            break;

            case 28: // inc
                this.#regi[2] = this.#regi[3]+1;
            break;
            case 39: // dec
                this.#regi[2] = this.#regi[3]-1;
            break;

            case 30: // rshift
                this.#regi[2] = this.#regi[3]>>1;
            break;
            case 31: // lshift
                this.#regi[2] = this.#regi[3]<<1;
            break;
            case 32: // outdisp
                postMessage(["display",this.display]);
            break;
            case 33: // dotx
                this.display.set(this.#imme[this.#regi[0]],this.#regi[2]);
            break;

            default:
            break;
        }
        this.#regi[0]++;
        return this;
    }
    runall() { // 最後まで命令を実行する(最大100000)
        let cnt = 0;
        while (cnt<100000&&!this.endRunning()) {cnt++;this.next();}
        return this;
    }
    tbyte(program) { // テキストを数値の配列に変換する
        let icnt = 0;
        // m memory; i immeddiate; p memory-pointer; x result; a,b args;
        let ins = ["get","outx","outm","equal","less","greater","eqgoto","uneqgoto","goto","movpx","movpi","movmx","movmv","movam","movbm","movxm","movai","movbi","movxi","movax","movbx","add","sub","mul","and","or","xor","not","inc","dec","rshift","lshift","outdisp","dotx"];
        let lines = program.replace(/\r/,"").split("\n");
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
            if (["goto","eqgoto","uneqgoto"].indexOf(tlss[i][0])!=-1) {
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
    endRunning() {if(this.#regi[0]>=this.#prog.length){return true};return false;}
    nextRead() {if(this.#prog[this.#regi[0]]==5){return true};return false;}
    getOut(format="utf-8") {return (new TextDecoder(format)).decode(new Uint8Array(this.#ostr.slice(0,this.#ospt)));} // 出力をテキストで取得
    getBinOut() {return new Uint8Array(this.#ostr.slice(0,this.#ospt))} // 出力を配列で取得
    getProg() {return this.#prog}
    getImme() {return this.#imme}
    getData() {return this.#memr}
    getIptr() {return this.#regi[0]}
    getDptr() {return this.#regi[1]}
    getRegi() {return this.#regi}
    getFunc() {return this.#labeladr}
}

class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1024-1; // for stack
        this.sptr = 1024;

        let code = this.prog;

        this.add("goto","0prepare");
        this.add("label","0prepare");
        { // for stack
            this.add("movpi",sptr);
            this.add("movxi",sstack);
            this.add("movmx");

            this.add("goto","main");
        }
        this.add("label","main");
        this.push(10);

        return this.asm;
    }
    push(x) {
        this.add("movxi",x);
        this.add("movmx");

        this.add("movpi",sptr);
        this.add("movam");
        this.add("movxi",sstack);
        this.add("movmx");
    }
    add(ins,imme="") {
        imme = imme.toString();
        if (ins=="label") {
            this.asm += imme+":"+"\n";
            return;
        }
        if (imme.length>0) {
            this.asm += ins+" "+imme+"\n";
        }
        else {
            this.asm += ins+"\n";
        }
    }
}

let code
code = `
goto main

main:

hw:
    movxi 72
    outx
    movxi 101
    outx
    movxi 108
    outx
    outx
    movxi 111
    outx

disp:
    outdisp
    movxi 10
    dotx 1
    movxi 10
    dotx 2
    outdisp
`
prog = `10 5 * 2 5 + -`;
code = new NLPC(prog).make();

console.log(code)
runtime = new NVM(code);
runtime.runall();

console.log(runtime.getBinOut());
console.log(runtime.getOut());
