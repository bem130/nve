ssp 1
jmp #callmain

main:
    push 0
    push 0
    popvar
    #whilebegan1:
        push 0
        pushvar
        push NaN
        gret
        ifjmp #whileend1
        push 0
        pushvar
        call out
        push NaN
        push 0
        pushvar
        add
        push 0
        popvar
        jmp #whilebegan1
    #whileend1:
    ret
#callmain:
    call main