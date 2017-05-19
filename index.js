var geid = (i)=>document.getElementById(i)
var ce = (i)=>document.createElement(i)
var print = console.log
var range = (i)=>{
  if(i === undefined) throw 'input to range() is undefined'
  var arr=[];
  for(var k=0;k<i;k++)arr.push(k);
  return arr;
}
var random = (i)=>Math.random() * i
var choice = (i)=>Math.floor(random(i))
var gaussian = (i)=>Math.tanh(random(Math.PI)-Math.PI/2)*i

var make = (()=>{
  var make = function(populator){
    var c = function(){this.__init__.apply(this,arguments)}
    if(typeof populator==='function')populator(c.prototype)
    else c.prototype = populator
    return c
  }
  var make_new = function(new_populator){
    var nc = make(new_populator)
    nc.prototype.__proto__ = this.prototype
    nc.prototype.super = this.prototype
    return nc
  }
  Function.prototype.make = make_new
  return make
})()

var RandomColorGenerator = make(p=>{
  var c2str = (c)=>`rgb(${c[0]},${c[1]},${c[2]})`
  p.resample = function(){
    while(1){
      var c = [choice(100)+60,choice(80)+60,choice(120)+60]
      var brightness = c[0]*0.3+c[1]*.58+c[2]*0.12
      if(brightness>100&&brightness<150)break; // reject colors that are too dark
    }
    this.c = c
    return this
  }
  p.__init__ = function(){this.resample()}
  p.light = function(){return c2str(this.c)}
  p.dark = function(){return c2str(this.c.map(n=>Math.floor(n*0.89)))}
})

var randomcolor = new RandomColorGenerator()

var NullElement = make(p=>{
  p.__init__ = function(parent,id){
    this.elem = this.make_elem()
    if(parent)parent.appendChild(this.elem)
    if(id)this.elem.id = id
    this.text = ''
    this.classes = []
    this.children = []
    this.post_init()
  }
  p.make_elem = function(){throw 'not implemented'}
  p.onclick = function(f){
    var g = ()=>f(this)
    this.elem.addEventListener('click',g)
  }
  p.render = function(){
    this.children.map(child=>child.render())
    this.elem.className = this.classes.join(' ')
    if(this.children.length==0 && this.text){ // has no children, has text
      this.elem.innerHTML = this.text
    }
  }
  p.post_init = function(){}
  p.add_class = function(className){
    this.classes.push(className)
  }
})

var Box = NullElement.make(p=>{
  p.post_init = function(){
    this.add_class('box')
  }
  p.make_elem = function(){
    return ce('div')
  }
  p.make_child = function(c,id){
    var child = new c(this.elem,id)
    this.children.push(child)
    return child
  }
})

var Image = NullElement.make(p=>{
  p.make_elem = function(){
    var elem = ce('img')
    return elem
  }
  p.set_src = function(src){
    this.elem.src = src
  }
})

function newclassfrombox(classStr){
  return Box.make(p=>{
    p.__init__ = function(){
      this.super.__init__.apply(this,arguments)
      this.add_class(classStr)
    }
  })
}

var into_markdown = (function(){
  var parser = new commonmark.Parser();
  // var parserSmart = new commonmark.Parser({smart: true});
  var renderer = new commonmark.HtmlRenderer();
  return function(input){
    var parsed = parser.parse(input)
    var rendered = renderer.render(parsed)
    return rendered
  }
})()

var blanket = new Box(document.body,'blanket')
blanket.add_class('shadow-base')

var SubBox = newclassfrombox('subbox')
var AvaDesc = newclassfrombox('avadesc')

var SectionBox = newclassfrombox('secbox')

var SectionBoxInner = newclassfrombox('secboxinner')

var SectionHeader = newclassfrombox('secheader')
var SectionContent = newclassfrombox('seccontent')

var headsec = blanket.make_child(SubBox,'headsec')
// avatar.add_class('shadow-base')

var avatarimg = headsec.make_child(Image,'avatarimg')

avatarimg.set_src('profile3.jpg')
avatarimg.add_class('shadow-base')

var avatar_desc = headsec.make_child(AvaDesc)
avatar_desc.text = `
<div id="name">覃永良 Qin Yongliang</div>
<div id="field">EE / CS / ML / CV / CG / PE</div>
<div id="asl">1993, Guangzhou</div>
`

var hr = blanket.make_child(SubBox)
hr.make_child(Image,'pencil').set_src('pencil.png')

var abilities = blanket.make_child(SubBox,'abilities')

function make_section(title,content){
  var section = abilities.make_child(SectionBox)

  var section_inner = section.make_child(SectionBoxInner)
  section_inner.add_class('shadow-base')

  var secheader = section_inner.make_child(SectionHeader)
  var seccontent = section_inner.make_child(SectionContent)

  var secheader_circle = secheader.make_child(newclassfrombox('secheader_circle'))
  var secheader_title = secheader.make_child(newclassfrombox('secheader_title'))

  secheader_circle.elem.style.backgroundColor = randomcolor.resample().light()
  secheader_title.elem.style.color = randomcolor.dark()

  secheader_title.text = title

  seccontent.text = into_markdown(content)
  return section
}

make_section('Computer Science',
`
- Been [coding](https://github.com/ctmakro) for 9 yrs
- Once a fullstack web developmer (Node.js), wrote [entire community site](https://bbs.kechuang.org) in JS
- Wrote [Canton](https://github.com/ctmakro/canton), a DL framework extremely similar to, but came out earlier than, Sonnet
- [Topped](https://gym.openai.com/evaluations/eval_TjCKgigSQE6a2pdMS3SllA) the Pendulum environment on OpenAI Gym
- Got [BipedalWalker](https://ctmakro.github.io/site/on_learning/rl/bipedal.html) walking
- Read arXiv with little effort
`)

make_section('Electrical Engineering',`
- BSc. Power System Engineering
- Make anything move or rotate regardless of their own will
- Charge cell phones with a lemon
- Transmit file via speakers
- Designed and built 30+ systems of all kinds on PCB with purchased parts and MCUs
- Read IEEE with little effort
`)

make_section('Art',`
- Trained
- Adobe Fullstack
- Blender
- Nikon, Wacom
- Photorealistic rendering
- [Oilpaint Simulation](https://ctmakro.github.io/site/on_learning/artist.html)
`)

var hr = blanket.make_child(SubBox)
hr.make_child(Image,'memory').set_src('memory.png')

abilities = blanket.make_child(SubBox,'abilities')

make_section('Lang',
`
- Native Mandarin speaker
- Fluency in English - daily, vocationally and academically
- And Cantonese
- Je could parler un petit amount de Francais
- JS/Py/C#/C/Lua, OOP/FP

`)
make_section('Hobbies',`
- Science
- Christopher Nolan / Vince Gilligan
- Reading / [Writing](https://ctmakro.github.io/site)
- Photography & Video making
- Teach other people things they don't know
`)

make_section('Contact',`
**Email** ctmakro at gmail dot com

**Mobile** +86 152 020 634 00

**Tencent** 44 68 427 18

**LinkedIn/Twtr/FB** n/a

`)


var footnote = blanket.make_child(SubBox,'footnote')

var footbkgnd = footnote.make_child(Box,'footbkgnd_outer').make_child(Image,'footbkgnd')
footbkgnd.set_src('wrenchy_s.png')

var foottext = footnote.make_child(Box,'foottext_outer').make_child(Box,'foottext')

foottext.text = into_markdown(`
  (c)2017 Qin Yongliang - [Source code](https://github.com/ctmakro/resume)
  `
)

blanket.render()
