class NVM {
    #prog;#imme;#memr;#istr;#ostr;#ispt;#ospt;#regi; // 宣言
    constructor(program,args=[0]) { // 初期化
        let tbr = this.tbyte(program);
        this.#prog = tbr[0]; // プログラム
        this.#imme = tbr[1]; // 即値
        this.#memr = new Uint8Array(1024); // データ
        this.#istr = new Uint8Array(args); // 標準入力
        this.#ostr = new Uint8Array(1024); // 標準出力
        this.#ispt = 0; // 標準入力ポインタ
        this.#ospt = 0; // 標準出力ポインタ
        this.#regi = [0,0,0,0,0]; // i p x a b
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
                    this.#regi[0]-=2;
                }
            break;
            case 7: // uneqgoto
                if (this.#regi[2]!=0) {
                    this.#regi[0] = this.#imme[this.#regi[0]];
                    this.#regi[0]-=2;
                }
            break;
            case 8: // goto
                this.#regi[0] = this.#imme[this.#regi[0]];
                this.#regi[0]-=2;
            break;

            case 9: // movpx
                this.#regi[1] = this.#regi[2]
            break;
            case 10: // movpv
                this.#regi[1] = this.#imme[this.#regi[0]]
            break;
            case 11: // movmx
                this.#memr[this.#regi[1]] = this.#regi[2]
            break;
            case 12: // movmi
                this.#memr[this.#regi[1]] = this.#imme[this.#regi[0]]
            break;

            case 13: // movam
                this.#regi[3] = this.#memr[this.#regi[1]]
            break;
            case 14: // movbm
                this.#regi[4] = this.#memr[this.#regi[1]]
            break;
            case 15: // movxm
                this.#regi[2] = this.#memr[this.#regi[1]]
            break;
            case 16: // movai
                this.#regi[3] = this.#imme[this.#regi[0]]
            break;
            case 17: // movbi
                this.#regi[4] = this.#imme[this.#regi[0]]
            break;
            case 18: // movxi
                this.#regi[2] = this.#imme[this.#regi[0]]
            break;
            case 29: // movax
                this.#regi[3] = this.#regi[2]
            break;
            case 20: // movbx
                this.#regi[4] = this.#regi[2]
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

            default:
            break;
        }
        this.#regi[0]++;
        return this;
    }
    runall() { // 最後まで命令を実行する(最大10000)
        let cnt = 0;
        while (cnt<10000&&!this.endRunning()) {cnt++;this.next();}
        return this;
    }
    tbyte(program) { // テキストを数値の配列に変換する
        let icnt = 0;
        // m memory; i immeddiate; p memory-pointer; x result; a,b args;
        let ins = ["get","outx","outm","equal","less","greater","eqgoto","uneqgoto","goto","movpx","movpi","movmx","movmv","movam","movbm","movxm","movai","movbi","movxi","movax","movbx","add","sub","mul","and","or","xor","not","inc","dec","rshift","lshift"];
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
            let tl = lines[l].slice(s,c)
            if (tl.length==0) {continue;}
            let tls = tl.split(" ");
            tlss.push(tls);
            if (ins.indexOf(tls[0])==-1) {continue;}
            icnt++;
            if (tls[tls.length-1]==":") {icnt--;}
        }
        let prog = new Uint8ClampedArray(icnt);
        let imme = new Uint8ClampedArray(icnt);
        let ic = 0;
        let labeladr = {};
        for (let i=0;i<tlss.length;i++) {
            ic++;
            if (tlss[i][0][tlss[i][0].length-1]==":") {
                labeladr[tlss[i][0].slice(0,tlss[i][0].length-1)] = ic;
                ic--;
            }
            if (ins.indexOf(tlss[i][0])==-1) {ic--;continue;}
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
}

code = `
goto main
main:
    movai 1 ; set a to 1
    movbi 1 ; set b to 1
    add     ; a+b (1+1)
    movpi 0 ; set mem-address to 0
    movmx

    movai 7 ; set a to 7
    movbi 9 ; set b to 9
    mul     ; a*b (1+1)
    movpi 1 ; set mem-address to 1
    movmx

    movam   ; set a to mem-address 1
    movpi 0
    movbm   ; set b to get mem-address 0
    add     ; a+b (2+63)

    outx    ; output the result (65,"A" in ASCII)
`
runtime = new NVM(code)
runtime.runall();

console.log(runtime.getBinOut());
console.log(runtime.getOut());