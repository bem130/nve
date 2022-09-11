class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        this.tokenize(this.prog);

        return this;
    }
    tokenize(program) {
        let codes = program.split("\n");
        let fcode = "";
        for (code of codes) {
            let spc = 0;
            while (code[spc]==" ") {
                spc++;
            }
            code = code.slice(spc);
            if (code.indexOf(";")!=-1) {
                code = code.slice(0,code.indexOf(";"));
            }
            code+=";";
            if (code.length>1) {
                fcode+=code.replace(/{;/g,"{").replace(/};/g,"}");
            }
        }
        console.log("");
        console.log(fcode);
        console.log("");
        console.log("functions:");
        let cc = 0;
        while (cc<fcode.length) {
            if (fcode[cc]!="!") {
                console.log("can't define anything that isn't a function in the top-level");
            }
            else {
                cc++;
                let funcname = "";
                while(fcode[cc]!="(") {
                    funcname += fcode[cc];cc++;
                }
                let brcnt = 1;
                let cndit = "";
                while(!(brcnt==0&&fcode[cc]==")")) {
                    cc++;
                    if (fcode[cc]=="(") {brcnt++;}
                    else if (fcode[cc]==")") {brcnt--;}
                    cndit+=fcode[cc];
                }
                cndit = cndit.slice(0,cndit.length-1);
                brcnt = 0;
                let child = "";
                while(!(brcnt==0&&fcode[cc]=="}")) {
                    cc++;
                    if (fcode[cc]=="{") {brcnt++;}
                    else if (fcode[cc]=="}") {brcnt--;}
                    child+=fcode[cc];
                }
                child = child.slice(1,child.length-1);
                console.log("   ",funcname,"("+cndit+")","{"+child+"}");
            }
            cc++;
        }
    }
    parse(tokens) {
        console.log(fcode);
        let smpl = [{
            type:"function", name:"main", child:["15 8 mul => n1;","8 8 + => n2;",{type:"if",condition:["true"],then:["4 5 +"],else:[]},"n1 n2 - out;"],
        }]
        console.log(smpl);
        var pattern = /! ?main ?\(/g;
        var result = fcode.match(pattern);
        console.log(result)
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
prog = `

!main(){
    15 8 mul => n1; 15*8をn1に格納
    8 8 + => n2;    8+8をn2に格納
    if (true) {
        4 5 +;
    }
    n1 n2 - out;    n1-n2を出力
}

!ret56(int int){
    7 8 * => ret;
    return ret;
}

`;
code = new NLPC(prog).make();

console.log("");
console.log("---- code ----");
console.log(code.prog);
console.log("");

console.log("---- asm ----");
console.log(code.asm);
console.log("");