console.log("✅worker started!");

let dispsize = [1280,720]


let Mouse= {loc:[0,0]}
self.addEventListener("message", (e) => {
    if (e.data[0]=="MouseLoc") {
        Mouse.loc = e.data[1]
    }
});

class Draw {
    constructor() {
        this.dpds = new Uint8ClampedArray(dispsize[0]*dispsize[1]*3).fill(0);
    }
    dot(x,y,rgb) {
        let idx = (y*dispsize[0]+x)*3;
        this.dpds[idx+0] = rgb[0]
        this.dpds[idx+1] = rgb[1]
        this.dpds[idx+2] = rgb[2]
    }
    update() {
        let x = dispsize[0]
        let y = dispsize[1]
        let iarr = new Uint8ClampedArray(x*y*4).fill(255);
        for (let iy = 0; iy < y; iy++) {
            for (let ix = 0; ix < x; ix++) {
                let iarridx = (iy*x+ix)*4;
                let dpdsidx = (iy*x+ix)*3;
                iarr[iarridx+0] = this.dpds[dpdsidx+0];
                iarr[iarridx+1] = this.dpds[dpdsidx+1];
                iarr[iarridx+2] = this.dpds[dpdsidx+2];
            }
        }
        self.postMessage(["Out",iarr,dispsize]);
    }
}

draw = new Draw()


cursorImg = [
    [1,0,0,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0],
    [1,2,1,0,0,0,0,0,0,0],
    [1,2,2,1,0,0,0,0,0,0],
    [1,2,2,2,1,0,0,0,0,0],
    [1,2,2,2,2,1,0,0,0,0],
    [1,2,2,2,2,2,1,0,0,0],
    [1,2,2,2,2,2,2,1,0,0],
    [1,2,2,2,2,2,2,2,1,0],
    [1,1,2,2,2,2,2,2,1,1],
]

NeknajImg = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0],
    [0,1,1,0,0,1,0,0,0,1,1,0,1,1,0,0,0,1,0,0,0,1,0],
    [0,1,0,1,0,0,1,1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0],
]

draw.update()
function drawdisp() {

    for (ix=0;ix<dispsize[0];ix++) {
        for (iy=0;iy<dispsize[1];iy++) {
            draw.dot(ix,iy,[(ix)%255,(iy)%255,(ix+iy)%255])
        }
    }
    for (ix=50;ix<dispsize[0]-50;ix++) {
        for (iy=50;iy<dispsize[1]-50;iy++) {
            draw.dot(ix,iy,[200,200,200])
        }
    }

    for (ix=0;ix<NeknajImg[0].length;ix+=0.25) {
        for (iy=0;iy<NeknajImg.length;iy+=0.25) {
            let mx = 100
            let my = 100
            imx = Math.floor(ix)
            imy = Math.floor(iy)
            if (NeknajImg[imy][imx]==1) {
                draw.dot(ix*4+mx,iy*4+my,[0,0,0])
            }
        }
    }


    for (ix=0;ix<cursorImg[0].length;ix++) {
        for (iy=0;iy<cursorImg.length;iy++) {
            if (cursorImg[iy][ix]==1) {
                draw.dot(ix+Mouse.loc[0],iy+Mouse.loc[1],[0,0,0])
            }
            else if (cursorImg[iy][ix]==2) {
                draw.dot(ix+Mouse.loc[0],iy+Mouse.loc[1],[255,255,255])
            }
        }
    }

    draw.update()

    setTimeout(drawdisp,50)

}
drawdisp()



