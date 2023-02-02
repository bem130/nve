ssp 0
jmp #callmain

main:
    call hello
    ret
hello:
    push 90
    push 14
    add
    out
    push 101
    out
    push 108
    out
    push 108
    out
    push 111
    out
    ret
#callmain:
    call main