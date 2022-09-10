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
        this.#regi = [0,0]; // i sp
        this.display = new Display(640,480);
    }
    push(x) {
        this.#memr[this.#regi[1]] = x;
        this.#regi[1]++;
    }
    pop() {
        this.#regi[1]--;
        let r = this.#memr[this.#regi[1]];
        this.#memr[this.#regi[1]] = 0;
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
                this.#ostr[this.#ospt] = this.pop();
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
                this.push(Boolean(this.pop())&&Boolean(this.pop()));
            break;
            case 9: // or
                this.push(Boolean(this.pop())||Boolean(this.pop()));
            break;
            case 10: // xor
                this.push(Boolean(this.pop())^Boolean(this.pop()));
            break;
            case 11: // not
                this.push(!Boolean(this.pop()))
            break;
            case 12: // buffer
                this.push(Boolean(this.pop()))
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
                this.push(this.pop()==this.pop());
            break;
            case 18: // less
                this.push(this.pop()<this.pop());
            break;
            case 19: // greater
                this.push(this.pop()>this.pop());
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
                this.push(this.#regi[0]+1);
                this.#regi[0] = this.#imme[this.#regi[0]];
                this.#regi[0]--;
            break;
            case 23: // ret
                this.#regi[0] = this.pop();
            break;


            default:
            break;
        }
        this.#regi[0]++;
        return this;
    }
    runallshow() { // 最後まで命令を実行する(最大100000)
        let cnt = 0;
        while (cnt<100000&&!this.endRunning()) {cnt++;console.log(this.getRegi(),this.getData().slice());this.next();}
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
        let ins = ["push","pop","get","out","ssp","add","sub","mul","and","or","xor","not","bf","inc","dec","rshift","lshift","equ","less","gret","jmp","ifjmp","call","ret","popr","fram"];
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
    endRunning() {if(this.#regi[0]>this.#prog.length){return true};return false;}
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
        // 1021 - 1023
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let code = this.prog;
        let sp = code.split(" ");

        let cr = [];
        let oprs = ["+","-","*","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift"];
        let oprasms = ["add","sub","mul","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift"];
        for (let i=0;i<sp.length;i++) {
            if (oprs.indexOf(sp[i])!=-1) {
                cr.push([1,sp[i]]);
            }
            else if (parseInt(sp[i])!=NaN) {
                cr.push([0,parseInt(sp[i])]);
            }
        }

        this.add("label","main");
        for (let i=0;i<cr.length;i++) {
            switch (cr[i][0]) {
                case 0:
                    this.add("push",cr[i][1]);
                break;
                case 1:
                    this.add(oprasms[oprs.indexOf(sp[i])]);
                break;
            }
        }
        this.add("out");

        return this;
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
prog = `10 10 +`;
code = new NLPC(prog).make();

console.log(code.prog);
console.log(code.asm)

runtime = new NVM(code.asm);


runtime.runall();

console.log(runtime.getBinOut());
console.log(runtime.getOut());
