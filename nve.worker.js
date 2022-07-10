console.log("✅worker started!");



let dispsize = [1000,1000]

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
        self.postMessage([iarr,dispsize]);
    }
}

draw = new Draw()


draw.update()
for (i=0;i<100;i++) {
    for (ix=0;ix<dispsize[0];ix++) {
        for (iy=0;iy<dispsize[1];iy++) {
            draw.dot(ix,iy,[(ix)%255,(iy)%255,(ix+iy)%255])
        }
    }
    
    draw.update()
    for (ix=0;ix<dispsize[0];ix++) {
        for (iy=0;iy<dispsize[1];iy++) {
            draw.dot(ix,iy,[(ix+100)%255,(iy+100)%255,(ix+iy+100)%255])
        }
    }
    
    draw.update()

}
