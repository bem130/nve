class NVE {
    #prog;#imme;#memr;#progcnt;#stackp;#framp;#regi;#labeladr; // 宣言
    constructor(program,args=[0]) { // 初期化
        let tbr = this.tbyte(program);
        this.#prog = tbr[0]; // プログラム
        this.#imme = tbr[1]; // 即値
        this.#memr = new Int32Array(1024); // 実行用スタック
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
        //console.log(this.#prog[this.#regi[0]])
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
                this.#framp = this.#progcnt;
                this.push(this.#progcnt);
                this.#progcnt = this.#imme[this.#progcnt];
            break;
            case 3: // ret 関数から返るとき
                this.#progcnt = this.pop();
                this.#framp = this.pop();
            break;
            case 4: // fram m 局所変数の領域を確保する
                this.#stackp += this.#imme[this.#progcnt];
            break;
            case 5: // setvar a a個目の局所変数に値を入れる
                this.#memr[this.#framp+this.#imme[this.#progcnt]] = this.pop();
            break;
            case 6: // getvar a a個目の局所変数から値を複製する
                this.push(this.#memr[this.#framp+this.#imme[this.#progcnt]]);
            break;
            case 7: // setgvar a a個目のグローバル変数に値を入れる
                this.#memr[this.#imme[this.#progcnt]] = this.pop();
            break;
            case 8: // getgvar a a個目のグローバル変数から値を複製する
                this.push(this.#memr[this.#imme[this.#progcnt]]);
            break;
            case 9: // jmp
                this.#progcnt = this.#imme[this.#progcnt];
            break;
            case 10: // ifjmp
                if (this.pop()==0) {
                    this.#progcnt = this.#imme[this.#progcnt];
                }
            break;

            // 演算命令たち
            case 11: // add
                this.push(this.pop()+this.pop());
            break;
            case 12: // sub
                this.push(-this.pop()+this.pop());
            break;
            case 13: // mul
                this.push(this.pop()*this.pop());
            break;
            case 14: // and
                this.push(Boolean(this.pop())&Boolean(this.pop()));
            break;

            // その他の命令
            case 15: // out スタックトップの値を出力
                console.log("out:",this.pop());
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
        let icnt = 0;
        // m memory; i immeddiate; p memory-pointer; x result; a,b args;
        let ins = ["push","pop","call","ret","fram","setvar","getvar","setgvar","getgvar","jmp","ifjmp","add","sub","mul","and","out"];
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
        let imme = new Int32Array(icnt);
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
                imme[ic] = labeladr[tlss[i][1]]-1;
            }
            else if (tlss[i].length>0) {
                imme[ic] = parseInt(tlss[i][1]);
            }
            ic++;
        }
        this.#labeladr = labeladr;
        return [prog,imme];
    }
    endRunning() {if(this.#progcnt>this.#prog.length){return true};return false;}
    nextRead() {if(this.#prog[this.#progcnt]==5){return true};return false;}
    getProg() {return this.#prog}
    getImme() {return this.#imme}
    getData() {return this.#memr}
    getIptr() {return this.#progcnt}
    getDptr() {return this.#stackp}
    getRegi() {return this.#regi}
    getFunc() {return this.#labeladr}
}

let code;
code = `
; ローカル変数とグローバル変数のテスト
fram 2
jmp #callmain

; メインの関数
main:
    ; ローカル変数を1つ確保
    fram 2
    push 3
    ; 3を1番のローカル変数に保存
    setvar 1
    ; 1番のローカル変数から取り出して出力
    getvar 1
    out
    ; 2番のローカル変数から取り出して出力
    getvar 2
    out
    ; 1番のローカル変数を1番のグローバル変数にコピー
    getvar 1
    setgvar 1
    ; 1番のグローバル変数から取り出して出力
    getgvar 1
    out
    ; 2番のグローバル変数から取り出して出力
    getgvar 2
    out
    ; sub関数を呼ぶ
    call sub
    ; ローカル変数の領域を削除
    pop 2
    ret
; サブの関数
sub:
    ; ローカル変数を1つ確保
    fram 1
    ; 1番のローカル変数から取り出して出力
    getvar 1
    out
    ; 1番のグローバル変数から取り出して出力
    getgvar 1
    out
    ; ローカル変数の領域を削除
    pop 1
    ret

#callmain:
    call main
    pop 2
`
code = `
; 関数の引数のテスト
fram 0
jmp #callmain

; メインの関数
main:
    ; 引数1
    push 2
    ; 引数2
    push 3
    ; 関数呼び出し
    call sub
    ; 引数削除
    pop 2
    ret
sub:
    ; 引数2
    getvar -1
    out
    ; 引数1
    getvar -2
    out
    ret

#callmain:
    call main
    pop 0
`

let a = new NVE(code);
a.runall();
console.log(a.getData())