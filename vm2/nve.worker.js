class NVE {
    #prog;#imme;#memr;#progcnt;#stackp;#framp;#regi;#labeladr;#ins; // 宣言
    constructor(program,args=[0]) { // 初期化
        let tbr = this.tbyte(program);
        this.#prog = tbr[0]; // プログラム
        this.#imme = tbr[1]; // 即値
        this.#memr = new Uint8Array(256); // 実行用スタック
        this.#progcnt = 0;
        this.#stackp = 0;
        this.#framp = 0;
    }
    push(x) {
        this.#memr[this.#stackp] = x;
        this.#stackp++;
    }
    pop() {
        this.#memr[this.#stackp] = 0;
        this.#stackp--;
        let r = this.#memr[this.#stackp];
        return r;
    }
    next() { // 一つの命令を実行する
        if (this.endRunning()) {console.warn("end runnning")}
        //console.log(this.#progcnt,this.#prog[this.#progcnt],this.#imme[this.#progcnt])
        let memshow = function(mem,sp,fp) {
            let ret = "";
            for (let i=0;i<mem.length;i++) {
                if (fp==i) {ret += ","}else {ret += " "}
                if (sp==i) {ret += "."}else {ret += " "}
                let memi = mem[i];
                let n = memi.toString(16);
                ret += "00".slice(n.length);
                ret += n;
            }
            return ret
        }
        // console.log("[internal state]"," mem:",memshow(this.#memr.slice(0,17),this.#stackp,this.#framp)," pc:",this.#progcnt.toString(16)," sp:",this.#stackp.toString(16)," fp:",this.#framp.toString(16))
        // console.log("")
        // console.log("[next]"," opcode:",this.#prog[this.#progcnt].toString(16)," mnemonic:",this.#ins[this.#prog[this.#progcnt]]," immediate:",this.#imme[this.#progcnt].toString(16))
        let adr = function(n) {return n&255;};
        switch (this.#prog[this.#progcnt]) {
            case 0: // push n スタックに即値を入れる
                this.push(this.#imme[this.#progcnt]);
            break;
            case 1: // pop n スタックトップの値をn個消す
                for (let i=0;i<this.#imme[this.#progcnt];i++) {
                    this.pop();
                }
            break;
            case 2: // call 関数を呼ばれたとき
                this.push(this.#framp);
                this.#framp = this.#stackp;
                this.push(this.#progcnt);
                this.#progcnt = this.#imme[this.#progcnt];
            break;
            case 3: // ret 関数から返るとき
                this.#progcnt = this.pop();
                this.#framp = this.pop();
            break;
            case 4: // fram m 局所変数の領域を確保する 0埋めする
                for (let i=0;i<this.#imme[this.#progcnt];i++) {
                    this.push(0);
                }
            break;
            case 5: // setvar a a個目の局所変数に値を入れる
                this.#memr[(this.#framp+this.#imme[this.#progcnt])&255] = this.pop();
            break;
            case 6: // getvar a a個目の局所変数から値を複製する
                this.push(this.#memr[(this.#framp+this.#imme[this.#progcnt])&255]);
            break;
            case 7: // setgvar a a個目のグローバル変数に値を入れる
                this.#memr[(this.#imme[this.#progcnt])&255] = this.pop();
            break;
            case 8: // getgvar a a個目のグローバル変数から値を複製する
                this.push(this.#memr[(this.#imme[this.#progcnt])&255]);
            break;
            case 9: // jmp
                this.#progcnt = this.#imme[this.#progcnt];
            break;
            case 10: // ifjmp
                if (this.pop()==1) {
                    this.#progcnt = this.#imme[this.#progcnt];
                }
            break;

            // 演算命令たち
            case 11: // add
                this.push(this.pop()+this.pop());
            break;
            case 12: // addc
                let cs = this.pop()+this.pop()+this.pop();
                this.push(cs>>>8);
                this.push(cs&0xff);
            break;
            case 13: // and
                this.push(Boolean(this.pop())&Boolean(this.pop()));
            break;
            case 14: // equal
                this.push(Number(this.pop()==this.pop()));
            break;
            case 15: // less
                this.push(Number(this.pop()<this.pop()));
            break;
            case 16: // greater
                this.push(Number(this.pop()>this.pop()));
            break;
            case 17: // not
                this.push(!Boolean(this.pop()));
            break;

            // その他の命令
            case 18: // out スタックトップの値を出力
                console.log("[output] ",this.pop().toString(16));
            break;

            default:
            break;
        }
        this.#progcnt++;
        return this;
    }
    runall() { // 最後まで命令を実行する(最大100000)
        let cnt = 0;
        while (cnt<100000&&!this.endRunning()) {cnt++;this.next();}
        return this;
    }
    tbyte(program) { // テキストを数値の配列に変換する
        this.#ins = ["push","pop","call","ret","fram","setvar","getvar","setgvar","getgvar","jmp","ifjmp","add","addc","and","equal","less","greater","not","out"];
        let icnt = 0;
        // m memory; i immeddiate; p memory-pointer; x result; a,b args;
        let ins = this.#ins;
        let lines = program.replace(/\r/g,"").split("\n");
        //console.log("lines",lines)
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
        let prog = new Uint8Array(icnt);
        let imme = new Uint8Array(icnt);
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
        let comp = function(n){if(n<0){return (~-n)+1;}else{return n;}}
        for (let i=0;i<tlss.length;i++) {
            if (tlss[i][0][tlss[i][0].length-1]==":") {continue;}
            if (ins.indexOf(tlss[i][0])==-1) {continue;}
            prog[ic] = ins.indexOf(tlss[i][0]);
            if (["jmp","ifjmp","call"].indexOf(tlss[i][0])!=-1) {
                imme[ic] = comp(labeladr[tlss[i][1]]-1);
            }
            else if (tlss[i].length>0) {
                imme[ic] = comp(parseInt(tlss[i][1]));
            }
            ic++;
        }
        this.#labeladr = labeladr;
        console.log(imme)
        return [prog,imme];
    }
    endRunning() {if(this.#progcnt>=this.#prog.length){return true};return false;}
    nextRead() {if(this.#prog[this.#progcnt]==5){return true};return false;}
    getProg() {return this.#prog}
    getImme() {return this.#imme}
    getData() {return this.#memr}
    getIptr() {return this.#progcnt}
    getDptr() {return this.#stackp}
    getRegi() {return this.#regi}
    getFunc() {return this.#labeladr}
}

let builtin = `
+/bin/bin:
    getvar -1
    getvar -2
    add
    ret
&/bib/bib:
    getvar -1
    getvar -2
    and
    ret
`
let code;
code = `; 10回カウントする
fram 0
jmp #callmain

main:
    push 1

    #whilebegan1:
        getvar 1
        push 10
        less
    ifjmp #whileend1
        getvar 1
        out
        getvar 1
        push 1
        add
        setvar 1
    jmp #whilebegan1
    #whileend1:

    pop 1
    ret

#callmain:
    call main
    pop 0
`
code = `
fram 0
jmp #callmain

main:
    push 1
    push 1
    push 1
    ;jmp #whileend
    #whilebegan1:
        getvar 1
        push 1000000
        less
    ifjmp #whileend1
        getvar 1
        out
        getvar 2
        getvar 1
        add
        setvar 3
        getvar 2
        setvar 1
        getvar 3
        setvar 2
    jmp #whilebegan1
    #whileend1:
    pop 3
    ret

#callmain:
    call main
    pop 0
`
code = `; addcのテスト
fram 0
jmp #callmain

main:

    ; 134 164 + out

    push 0
    push 134
    push 164
    addc
    out
    out

    ; 270 128 + out

    push 0
    push 14
    push 128
    addc
    push 1
    push 0
    addc
    out
    out
    out

    ret

#callmain:
    call main
    pop 0
`
code = `; 複数バイトのテスト
fram 0
jmp #callmain

main:
    ;call add2bytetest
    call add4bytetest
    ret

add2bytetest:
    ; 0x1a61 0x35e6 0x0000 + + out
    ; 6753 13798 0 + + out
    ; 26 97 53 230 0 0 + + out
    ; 4750 18256

    fram 2   ; 返り値 c1
    fram 2   ; 返り値 c2
    ; 引数たち (A2 A1 B2 B1) c2
    push 26  ; -5 A2
    push 97  ; -4 A1
    push 53  ; -3 B2
    push 230 ; -2 B1

    call add2byte ; c2
    pop 4    ; 引数削除 c2
    ; 引数たち (B2 B1) c1
    push 0
    push 0
    call add2byte ; c1
    pop 4    ; 引数削除 c1

    out
    out

    ret
    
add4bytetest:
    ; 0x19a92697 0xf03a5325 + out
    ; 109E379BC 4460870076

    fram 4   ; 返り値
    ; 引数たち (A4 A3 A2 A1 B4 B3 B2 B1)
    push 25  ; -9 A4
    push 169  ; -8 A3
    push 38  ; -7 A2
    push 151  ; -6 A1
    push 240  ; -5 B4
    push 58  ; -4 B3
    push 83  ; -3 B2
    push 37 ; -2 B1

    call add4byte ;
    pop 8    ; 引数削除

    out
    out
    out
    out

    ret

add2byte:
    push 0
    getvar -2
    getvar -4
    addc
    setvar -6
    getvar -3
    getvar -5
    addc
    setvar -7
    pop 1
    ret

add4byte:
    push 0
    getvar -2
    getvar -6
    addc
    setvar -10
    getvar -3
    getvar -7
    addc
    setvar -11
    getvar -4
    getvar -8
    addc
    setvar -12
    getvar -5
    getvar -9
    addc
    setvar -13
    pop 1
    ret

#callmain:
    call main
    pop 0
`

let a = new NVE(code);
a.runall();
// console.log(a.getData())