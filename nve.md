## 命令

```md
d[] メモリ
i プログラムカウンタ
p ポインタ
x 結果
a 引数1
b 引数2
```
### 演算
```md
; add
x <= x + b
; and
x <= a and b
; or
x <= x or b
; not
x <= not a
; buf
x <= a
```
```md
; equ
x <= a == b
; lss
x <= a < b
; gtr
x <= a > b
```
### 条件分岐
```md
; ifgo
if (x==0) i <= a
```
### データ移動
```md
; lda
a <= d[p]
; ldb
b <= d[p]
; save
d[p] <= x
; movp
p <= x
; ldp
x <= p
```