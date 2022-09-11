class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let functions = this.toplevel(this.prog);

        let remakefunctable = function(funcs) {
            let ret = [];
            for (let func of funcs) {ret.push({name:func[0],child:func[2]});}
            return ret;
        }
        console.log("functions:");
        console.table(remakefunctable(functions));

        this.cr = [];

        this.vars = [];
        this.oprs = ["+","-","*","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","=","<",">","equ","less","gret","get","out","return"];
        this.oprasms = ["add","sub","mul","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","equ","less","gret","equ","less","gret","get","out","ret"];

        this.objcnt = {"if":0};
        for (let i=0;i<functions.length;i++) {

            if (this.oprs.indexOf(functions[i][0])!=-1) {
                console.error("error");
                continue;
            }
            if (["0","1","2","3","4","5","6","7","8","9","#","$","&"].indexOf(functions[i][0][0])!=-1) {
                console.log("function names must not start with numbers and symbols");
                continue;
            }

            this.cr.push([5,functions[i][0]]);
            
            for (let fcc=0;fcc<functions[i][2].length;fcc++) {

                if (typeof functions[i][2][fcc] === 'object') {
                    switch (functions[i][2][fcc].type) {
                        case "if":
                            this.if(functions[i][2][fcc]);
                        break;
                    }
                }
                else {
                    this.block(functions[i][2][fcc]);

                }


            }

        }
        this.cr.push([5,"#callmain"]);
        this.cr.push([6,"main"]);

        this.add("ssp",this.vars.length);
        this.add("jmp","#callmain");
        this.add("");

        for (let i=0;i<this.cr.length;i++) {
            switch (this.cr[i][0]) {
                case 0:
                    this.add("push",this.cr[i][1],1);
                break;
                case 1:
                    this.add(this.oprasms[this.oprs.indexOf(this.cr[i][1])],"",1);
                break;
                case 2:
                    this.add("popvar",this.vars.indexOf(this.cr[i][1]),1);
                break;
                case 3:
                    this.add("pushvar",this.vars.indexOf(this.cr[i][1]),1);
                break;
                case 5:
                    this.add("label",this.cr[i][1],0);
                break;
                case 6:
                    this.add("call",this.cr[i][1],1);
                break;

                default:
                    this.add(this.cr[i][0],this.cr[i][1],1);
                break;
            }
        }

        console.log("variables:",this.vars)

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
                child = this.parsechild(child,funcname);
                functions.push([funcname,args,child]);
            }
            cc++;
        }
        if (!itmain) {console.error("there is not the main function");return [];}
        return functions;
    }
    block(blkcode) {
        let codes = blkcode.slice(0,blkcode.length-1).split(";");
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
                if (this.vars.indexOf(sp[sp.length-1])==-1&&this.oprs.indexOf(sp[sp.length-1])==-1) {
                    this.vars.push(sp[sp.length-1]);
                }
                // console.log(code,spa,sp)
            }

            for (let i=0;i<sp.length;i++) {
                if (this.oprs.indexOf(sp[i])!=-1) { // 演算子
                    this.cr.push([1,sp[i]]);
                }
                else if (sp[i]=="=>") { // 代入
                    this.cr.push([2,sp[i+1]]);
                    i++;
                }
                else if (["false","true"].indexOf(sp[i])!=-1) { // 論理値
                    this.cr.push([0,[["false","true"].indexOf(sp[i])]]);
                }
                else if (sp[i][0]=="!") { // 関数呼び出し
                    this.cr.push([6,sp[i].slice(1)]);
                }
                else if (this.vars.indexOf(sp[i])!=-1) { // 変数
                    this.cr.push([3,sp[i]]);
                }
                else if (parseInt(sp[i])!=NaN) { // 数字
                    this.cr.push([0,parseInt(sp[i])]);
                }
            }
        }
    }
    if(ifobj) {
        this.objcnt["if"]++;
        this.block(ifobj.condition+";");
        this.block(ifobj.then);
        this.cr.push([5,"#ifend"+this.objcnt["if"]]);
    }
    parsechild(block,funcname="") {
        let blocks = [block];

        for (let i=0;i<blocks.length;i++) {
            let fcode = blocks[i];
            let cc = 0;
            let child = [];
            let coms = "";
            while (cc<fcode.length) {
                if (fcode[cc]=="i"&&fcode[cc+1]=="f") {
                    if (coms.length>1) {
                        child.push(coms);
                        coms = "";
                    }
    
                    cc+=2;
                    let funcname = "";
                    while(fcode[cc]!="(") { // 関数名
                        funcname += fcode[cc];cc++;
                    }
                    let brcnt = 1;
                    let condit = "";
                    while(!(brcnt==0&&fcode[cc]==")")) { // 条件式
                        cc++;
                        if (fcode[cc]=="(") {brcnt++;}
                        else if (fcode[cc]==")") {brcnt--;}
                        condit+=fcode[cc];
                    }
                    condit = condit.slice(0,condit.length-1);
                    brcnt = 0;
                    let thens = "";
                    while(!(brcnt==0&&fcode[cc]=="}")) { // 関数の中身
                        cc++;
                        if (fcode[cc]=="{") {brcnt++;}
                        else if (fcode[cc]=="}") {brcnt--;}
                        thens+=fcode[cc];
                    }
                    thens = thens.slice(1,thens.length-1);
                    child.push({type:"if",condition:condit,then:thens,});
                }
                else {
                    coms += fcode[cc];
                }
                cc++;
            }
            if (coms.length>1) {
                child.push(coms);
                coms = "";
            }
            //console.log(child);
            if (child.length>1) {
                blocks = child;
            }
        }
        console.log(funcname,blocks)
        console.log("")
        return blocks;
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
    if(n1 0 =){
        n1 n2 + out;
        return;
    }
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