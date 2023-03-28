.global addtest
.global add1word

fram 0
jmp #callmain

main:
    call addtest
    ret
    
addtest:
    ; 0x19a92697 + 0xf03a5325 => 0x109e379bc
    ; 430515863 + 4030354213 => 4460870076

    fram 1   ; 返り値 -4
    ; 引数たち (A1 B1)
    push 430515863  ; -3 A1
    push 4030354213 ; -2 B1

    call add1word ;
    pop 2    ; 引数削除

    out

    ret

add1word:
    push 0
    getvar -2
    getvar -3
    addc
    setvar -4
    pop 1
    ret

#callmain:
    call main
    pop 0