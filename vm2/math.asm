.global addtest:int:int,int

add:
    push 0
    getvar -2
    getvar -3
    addc
    setvar -4
    pop 1
    ret