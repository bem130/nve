# Memory

## 関数の引数のテスト
```
fram 0
jmp #callmain

; メインの関数
main:
    ; 引数1
    push 2
    ; 引数2
    push 3
    ; 関数呼び出し
    call sub
    ; 引数削除
    pop 2
    ret
sub:
    ; 引数2
    getvar -1
    out
    ; 引数1
    getvar -2
    out
    ret

#callmain:
    call main
    pop 0
```

mem:`,.00  00  00  00  00  00  00  00  00  00  00  00` pc:`0`
fram 0
mem:`,.00  00  00  00  00  00  00  00  00  00  00  00` pc:`1`
jmp #callmain
mem:`,.00  00  00  00  00  00  00  00  00  00  00  00` pc:`12`
call main
mem:`,.00  00  00  00  00  00  00  00  00  00  00  00` pc:`12`