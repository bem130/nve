ssp 0
jmp #callmain

main:
    push 104
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