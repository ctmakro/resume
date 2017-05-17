var Canvas = NullElement.make(p=>{
  p.make_elem = function(){
    return ce('canvas')
  }
  p.render = function(){}
})

function canvasy(){
  var dim = 800
  var canvas_sect = blanket.make_child(SubBox,'canvas-section')
  var canvas = canvas_sect.make_child(Canvas,'canvas')
  canvas.elem.width = dim.toString()
  canvas.elem.height = dim.toString()
  var ctx = canvas.elem.getContext('2d')

  var Circle = make(p=>{
    p.__init__ = function(x,y,r,c){
      Object.assign(this,{x,y,r,c})
    }
    p.draw = function(){
      ctx.beginPath()
      var c = this.c
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fill();
    }
    p.copy = function(){
      return new Circle(this.x,this.y,this.r,this.c)
    }
  })

  function makegrid(unit){
    var scale = dim/unit
    return range(unit).map(i=>range(unit).map(j=>new Circle(i*scale,j*scale,scale,[
      255,255,255,1
    ])))
  }
  var circles2d = makegrid(100)

  function iter(f){
    var c2d = []
    for(var i = 0;i<circles2d.length;i++){
      var row = []
      for(var j = 0; j<circles2d[i].length;j++){
        row.push(f(circles2d,i,j))
      }
      c2d.push(row)
    }
    return c2d
  }

  ctx.fillStyle = '#003366'
  ctx.fillRect(0,0,dim,dim)

  function randomize(k){
    iter((c,i,j)=>{ // add randomness
      var n = c[i][j]
      n.r = n.r + gaussian(1)
    })
  }

  function boxblur(){

    circles2d = iter((c,i,j)=>{ // hblur
      var a0 = c[i][j-1], a1 = c[i][j], a2 = c[i][j+1]
      var n = a1.copy()
      n.r = ((a0||a1).r + a1.r + (a2||a1).r) / 3
      return n
    })

    circles2d = iter((c,i,j)=>{ // vblur
      var a0 = c[i-1], a1 = c[i], a2 = c[i+1]
      var n = a1[j].copy()
      n.r = ((a0||a1)[j].r + a1[j].r + (a2||a1)[j].r) / 3
      return n
    })
  }

  randomize(10)

  range(10).map(n=>{
    boxblur()
  })

  iter((c,i,j)=>{ // gradient
    var a0 = c[i][j-1], a1 = c[i][j], a2 = c[i][j+1]
    a1.gradx = ((a0||a1).r - (a2||a1).r)
    var a0 = c[i-1], a1 = c[i], a2 = c[i+1]
    a1[j].grady = ((a0||a1)[j].r - (a2||a1)[j].r)
  })

  /*
  refraction
  sin f1 / sin f2 = 1.33 (water)

  f1 = arctan(grad)
  interface_angle = f1

  fin_angle = 90 - (90 - f1) - f2 = f1 - f2

  fin_dist = tan(fin_angle) = tan(f1-f2)

  f2 = arcsin(sin f1 / 1.33)

  fin_dist = tan(arctan(x) - arcsin(sin(arctan(x)) / 1.33))

  = tan(atan(x)- asin(x/(1.33 * sqrt(x^2+1))))

  */

  function gradient_refract_displace(g){
    var x = g
    // return x*x*x
    return Math.tan(Math.atan(x)-Math.asin(x/(1.33*Math.sqrt(x*x+1))))
  }

  iter((c,i,j)=>{
    var a = c[i][j]
    scale = 1000.0

    var mode = Math.sqrt(a.gradx*a.gradx+a.grady*a.grady)
    var disp = gradient_refract_displace(mode) * scale
    var lum = Math.exp(-disp/10)

    var dispx = disp /mode*a.gradx
    var dispy = disp /mode*a.grady

    a.x += dispx
    a.y += dispy
    a.r = Math.sqrt(lum)
  })

  iter((c,i,j)=>c[i][j].draw())
}

canvasy()
