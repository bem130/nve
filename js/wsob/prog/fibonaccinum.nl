ssp 4
jmp #callmain

main:
    push 1
    push 0
    popvar
    push 1
    push 1
    popvar
    push 1
    push 2
    popvar
    push 10000
    push 3
    popvar
    call run
    ret
run:
    push 0
    pushvar
    out
    #whilebegan1:
        push 0
        pushvar
        push 3
        pushvar
        gret
        ifjmp #whileend1
        push 1
        pushvar
        push 0
        pushvar
        add
        push 2
        popvar
        push 1
        pushvar
        push 0
        popvar
        push 2
        pushvar
        push 1
        popvar
        push 0
        pushvar
        out
        jmp #whilebegan1
    #whileend1:
    ret
#callmain:
    call main