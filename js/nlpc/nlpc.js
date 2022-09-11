class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let functions = this.toplevel(this.prog);
        console.log("functions:")
        console.table(functions);

        let cr = [];

        let vars = [];
        let oprs = ["+","-","*","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","=","<",">","equ","less","gret","get","out","return"];
        let oprasms = ["add","sub","mul","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","equ","less","gret","equ","less","gret","get","out","ret"];
        for (let i=0;i<functions.length;i++) {
            if (oprs.indexOf(functions[i][0])!=-1) {
                console.error("error");
                continue;
            }
            if (["0","1","2","3","4","5","6","7","8","9","#","$","&"].indexOf(functions[i][0][0])!=-1) {
                console.log("function names must not start with numbers and symbols");
                continue;
            }

            cr.push([5,functions[i][0]]);
            let codes = functions[i][2].slice(0,functions[i][2].length-1).split(";");
            for (let j=0;j<codes.length;j++) {
                let code = codes[j];
                let sp = code.split(" ");
                let spa = sp.indexOf("=>");
                if (!(spa==sp.length-2||spa==-1)) {
                    console.error("assignment error");
                }
                else if (spa==-1) {
                }
                else if (spa==sp.length-2) {
                    if (vars.indexOf(sp[sp.length-1])==-1&&oprs.indexOf(sp[sp.length-1])==-1) {
                        vars.push(sp[sp.length-1]);
                    }
                    // console.log(code,spa,sp)
                }

                for (let i=0;i<sp.length;i++) {
                    if (oprs.indexOf(sp[i])!=-1) { // 演算子
                        cr.push([1,sp[i]]);
                    }
                    else if (sp[i]=="=>") { // 代入
                        cr.push([2,sp[i+1]]);
                        i++;
                    }
                    else if (["true","false"].indexOf(sp[i])!=-1) { // 論理値
                        cr.push([0,[["true","false"].indexOf(sp[i])]]);
                    }
                    else if (sp[i][0]=="!") { // 関数呼び出し
                        cr.push([6,sp[i].slice(1)]);
                    }
                    else if (vars.indexOf(sp[i])!=-1) { // 変数
                        cr.push([3,sp[i]]);
                    }
                    else if (parseInt(sp[i])!=NaN) { // 数字
                        cr.push([0,parseInt(sp[i])]);
                    }
                }
            }

        }
        cr.push([5,"#callmain"]);
        cr.push([6,"main"]);

        this.add("ssp",vars.length);
        this.add("jmp","#callmain");
        this.add("");

        for (let i=0;i<cr.length;i++) {
            switch (cr[i][0]) {
                case 0:
                    this.add("push",cr[i][1],1);
                break;
                case 1:
                    this.add(oprasms[oprs.indexOf(cr[i][1])],"",1);
                break;
                case 2:
                    this.add("popvar",vars.indexOf(cr[i][1]),1);
                break;
                case 3:
                    this.add("pushvar",vars.indexOf(cr[i][1]),1);
                break;
                case 5:
                    this.add("label",cr[i][1],0);
                break;
                case 6:
                    this.add("call",cr[i][1],1);
                break;
            }
        }

        console.log("variables:",vars)

        return this;
    }
    toplevel(program) {
        let functions = [];
        let codes = program.split("\n");
        let fcode = "";
        let itmain = false;
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
        let cc = 0;
        while (cc<fcode.length) {
            if (fcode[cc]!="!") {
                console.log("can't define anything that isn't a function in the top-level");
            }
            else {
                cc++;
                let funcname = "";
                while(fcode[cc]!="(") { // 関数名
                    funcname += fcode[cc];cc++;
                }
                let brcnt = 1;
                let args = "";
                while(!(brcnt==0&&fcode[cc]==")")) { // 引数
                    cc++;
                    if (fcode[cc]=="(") {brcnt++;}
                    else if (fcode[cc]==")") {brcnt--;}
                    args+=fcode[cc];
                }
                args = args.slice(0,args.length-1);
                brcnt = 0;
                let child = "";
                while(!(brcnt==0&&fcode[cc]=="}")) { // 関数の中身
                    cc++;
                    if (fcode[cc]=="{") {brcnt++;}
                    else if (fcode[cc]=="}") {brcnt--;}
                    child+=fcode[cc];
                }
                child = child.slice(1,child.length-1);
                if (funcname=="main") {itmain=true;}
                functions.push([funcname,args,child]);
            }
            cc++;
        }
        if (!itmain) {console.error("there is not the main function");return [];}
        return functions;
    }
    parse(tokens) {
    }
    add(ins,imme="",indent=0) {
        imme = imme.toString();
        if (ins=="label") {
            this.asm += imme+":"+"\n";
            return;
        }
        for (let i=0;i<indent*4;i++) {
            this.asm += " ";
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
    8 => n1;
    6 => n2;
    !ret56;
    return;
}

!ret56(){
    n1 n2 * out;
    return;
}
`;
console.log("");
console.log("---- code ----");
console.log(prog);
console.log("--------------");
console.log("");

code = new NLPC(prog).make();


console.log("");
console.log("---- asm ----");
console.log(code.asm);
console.log("");