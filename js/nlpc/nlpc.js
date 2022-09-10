
class NLPC {
    constructor (program) {
        this.prog = program;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let codes = this.prog.split("\n");

        let cr = [];
        let vars = [];
        let oprs = ["+","-","*","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","=","<",">","equ","less","gret","get","out"];
        let oprasms = ["add","sub","mul","add","sub","mul","and","or","xor","not","buffer","inc","dec","rshift","lshift","equ","less","gret","equ","less","gret","get","out"];
        this.add("label","main");

        for (code of codes) {

            if (code.indexOf(";")!=-1) {
                code = code.slice(0,code.indexOf(";"));
            }
            console.log(code)
            let sp = code.split(" ");
            let spa = sp.indexOf("=>");
            debuglog(spa,sp);
            if (!(spa==sp.length-2||spa==-1)) {
                console.error("assignment error");
            }
            else if (spa==sp.length-2) {
                if (vars.indexOf(sp[sp.length-1])==-1) {
                    vars.push(sp[sp.length-1]);
                }
            }
            else if (spa==-1) {
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
                else if (vars.indexOf(sp[i])!=-1) { // 変数
                    cr.push([3,sp[i]]);
                }
                else if (parseInt(sp[i])!=NaN) { // 数字
                    cr.push([0,parseInt(sp[i])]);
                }
            }
        }

        debuglog(vars);
        this.add("ssp",vars.length);
        debuglog(cr)
        for (let i=0;i<cr.length;i++) {
            switch (cr[i][0]) {
                case 0:
                    this.add("push",cr[i][1]);
                break;
                case 1:
                    this.add(oprasms[oprs.indexOf(cr[i][1])]);
                break;
                case 2:
                    this.add("popvar",vars.indexOf(cr[i][1]));
                break;
                case 3:
                    this.add("pushvar",vars.indexOf(cr[i][1]));
                break;
            }
        }

        return this;
    }
    make() {
        this.asm = "";
        this.sstack = 1020-1; // for stack
        this.sptr = 1020; // address of the ponter

        let codes = this.prog.split("\n");

        let fcode = "";
        for (code of codes) {
            if (code.indexOf(";")!=-1) {
                code = code.slice(0,code.indexOf(";"));
            }
            code+=";";
            if (code.length>1) {
                fcode+=code;
            }
        }
        this.parse(fcode);

        return this;
    }
    parse(fcode) {
        console.log(fcode)
        let smpl = [{
            type:"function",
            name:"main",
            child:[],
        }]
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