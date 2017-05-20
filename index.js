var geid = function (i) { return document.getElementById(i); };
var ce = function (i) { return document.createElement(i); };
var print = console.log;
var range = function (i) {
    if (i === undefined)
        throw 'input to range() is undefined';
    var arr = [];
    for (var k = 0; k < i; k++)
        arr.push(k);
    return arr;
};
var random = function (i) { return Math.random() * i; };
var choice = function (i) { return Math.floor(random(i)); };
var gaussian = function (i) { return Math.tanh(random(Math.PI) - Math.PI / 2) * i; };
var make = (function () {
    var make = function (populator) {
        var c = function () { this.__init__.apply(this, arguments); };
        if (typeof populator === 'function')
            populator(c.prototype);
        else
            c.prototype = populator;
        return c;
    };
    var make_new = function (new_populator) {
        var nc = make(new_populator);
        nc.prototype.__proto__ = this.prototype;
        nc.prototype.super = this.prototype;
        return nc;
    };
    Function.prototype.make = make_new;
    return make;
})();
var RandomColorGenerator = make(function (p) {
    var c2str = function (c) { return ("rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"); };
    p.resample = function () {
        while (1) {
            var c = [choice(100) + 60, choice(80) + 60, choice(120) + 60];
            var brightness = c[0] * 0.3 + c[1] * .58 + c[2] * 0.12;
            if (brightness > 100 && brightness < 150)
                break; // reject colors that are too dark
        }
        this.c = c;
        return this;
    };
    p.__init__ = function () { this.resample(); };
    p.light = function () { return c2str(this.c); };
    p.dark = function () { return c2str(this.c.map(function (n) { return Math.floor(n * 0.89); })); };
});
var randomcolor = new RandomColorGenerator();
var NullElement = make(function (p) {
    p.__init__ = function (parent, id) {
        this.elem = this.make_elem();
        if (parent)
            parent.appendChild(this.elem);
        if (id)
            this.elem.id = id;
        this.text = '';
        this.classes = [];
        this.children = [];
        this.post_init();
    };
    p.make_elem = function () { throw 'not implemented'; };
    p.onclick = function (f) {
        var _this = this;
        var g = function () { return f(_this); };
        this.elem.addEventListener('click', g);
    };
    p.render = function () {
        this.children.map(function (child) { return child.render(); });
        this.elem.className = this.classes.join(' ');
        if (this.children.length == 0 && this.text) {
            this.elem.innerHTML = this.text;
        }
    };
    p.post_init = function () { };
    p.add_class = function (className) {
        this.classes.push(className);
    };
});
var Box = NullElement.make(function (p) {
    p.post_init = function () {
        this.add_class('box');
    };
    p.make_elem = function () {
        return ce('div');
    };
    p.make_child = function (c, id) {
        var child = new c(this.elem, id);
        this.children.push(child);
        return child;
    };
});
var Image = NullElement.make(function (p) {
    p.make_elem = function () {
        var elem = ce('img');
        return elem;
    };
    p.set_src = function (src) {
        this.elem.src = src;
    };
});
function newclassfrombox(classStr) {
    return Box.make(function (p) {
        p.__init__ = function () {
            this.super.__init__.apply(this, arguments);
            this.add_class(classStr);
        };
    });
}
var into_markdown = (function () {
    var parser = new commonmark.Parser();
    // var parserSmart = new commonmark.Parser({smart: true});
    var renderer = new commonmark.HtmlRenderer();
    return function (input) {
        var parsed = parser.parse(input);
        var rendered = renderer.render(parsed);
        return rendered;
    };
})();
var blanket = new Box(document.body, 'blanket');
blanket.add_class('shadow-base');
var SubBox = newclassfrombox('subbox');
var AvaDesc = newclassfrombox('avadesc');
var SectionBox = newclassfrombox('secbox');
var SectionBoxInner = newclassfrombox('secboxinner');
var SectionHeader = newclassfrombox('secheader');
var SectionContent = newclassfrombox('seccontent');
var headsec = blanket.make_child(SubBox, 'headsec');
// avatar.add_class('shadow-base')
var avatarimgdiv = headsec.make_child(Box, 'avatarimgdiv');
avatarimgdiv.add_class('shadow-base');
var avatarimg = avatarimgdiv.make_child(Image, 'avatarimg');
avatarimg.set_src('profile3.jpg');
var tape = avatarimgdiv.make_child(Image, 'tape');
tape.set_src('tape.png');
var avatar_desc = headsec.make_child(AvaDesc);
avatar_desc.text = "\n<div id=\"name\">\u8983\u6C38\u826F Qin Yongliang</div>\n<div id=\"field\">EE / CS / ML / CV / CG / PE</div>\n<div id=\"asl\">1993, Guangzhou</div>\n";
var hr = blanket.make_child(SubBox);
hr.make_child(Image, 'pencil').set_src('pencil.png');
var abilities = blanket.make_child(SubBox, 'abilities');
function make_section(title, content) {
    var section = abilities.make_child(SectionBox);
    var section_inner = section.make_child(SectionBoxInner);
    section_inner.add_class('shadow-base');
    var secheader = section_inner.make_child(SectionHeader);
    var seccontent = section_inner.make_child(SectionContent);
    var secheader_circle = secheader.make_child(newclassfrombox('secheader_circle'));
    var secheader_title = secheader.make_child(newclassfrombox('secheader_title'));
    secheader_circle.elem.style.backgroundColor = randomcolor.resample().light();
    secheader_title.elem.style.color = randomcolor.dark();
    secheader_title.text = title;
    seccontent.text = into_markdown(content);
    return section;
}
make_section('Computer Science', "\n- Been [coding](https://github.com/ctmakro) for 9 yrs\n- Once a fullstack web developmer (Node.js), wrote [entire community site](https://bbs.kechuang.org) in JS\n- Wrote [Canton](https://github.com/ctmakro/canton), a DL framework extremely similar to, but came out earlier than, Sonnet\n- [Topped](https://gym.openai.com/evaluations/eval_TjCKgigSQE6a2pdMS3SllA) the Pendulum environment on OpenAI Gym\n- Got [BipedalWalker](https://ctmakro.github.io/site/on_learning/rl/bipedal.html) walking\n- Read arXiv with little effort\n");
make_section('Electrical Engineering', "\n- BSc. Power System Engineering\n- Make anything move or rotate regardless of their own will\n- Charge cell phones with a lemon\n- Transmit file via speakers\n- Designed and built 30+ systems of all kinds on PCB with purchased parts and MCUs\n- Read IEEE with little effort\n");
make_section('Art', "\n- Adobe Fullstack\n- [Familiar](https://ctmakro.github.io/site/art/ferenova.html) with Blender\n- Chinese calligrapher\n- Photographer\n- Photorealistic rendering\n- [Oilpaint Simulation](https://ctmakro.github.io/site/on_learning/artist.html)\n");
var hr = blanket.make_child(SubBox);
hr.make_child(Image, 'memory').set_src('memory.png');
abilities = blanket.make_child(SubBox, 'abilities');
make_section('Lang', "\n- Native Mandarin speaker\n- Fluency in English - daily, vocationally and academically\n- And Cantonese\n- Je could parler un petit amount de Francais\n- JS/Py/C#/C/Lua, OOP/FP\n\n");
make_section('Hobbies', "\n- Science\n- Christopher Nolan / Vince Gilligan\n- Reading / [Writing](https://ctmakro.github.io/site)\n- Photography & Video making\n- Teach other people things they don't know\n");
make_section('Contact', "\n**Email** ctmakro at gmail dot com\n\n**Mobile** +86 152 020 634 00\n\n**Tencent** 44 68 427 18\n\n**LinkedIn/Twtr/FB** n/a\n\n");
var footnote = blanket.make_child(SubBox, 'footnote');
var footbkgnd = footnote.make_child(Box, 'footbkgnd_outer').make_child(Image, 'footbkgnd');
footbkgnd.set_src('wrenchy_s.png');
var foottext = footnote.make_child(Box, 'foottext_outer').make_child(Box, 'foottext');
foottext.text = into_markdown("\n  (c)2017 Qin Yongliang - [Source code](https://github.com/ctmakro/resume)\n  ");
blanket.render();
