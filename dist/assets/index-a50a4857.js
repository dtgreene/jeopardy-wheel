import{g as le,W as ce,r as L,j as w,c as ge}from"./index-f93ee627.js";var z={exports:{}};(function(d){(function(c){var k=/^\s+/,j=/\s+$/,B=0,f=c.round,m=c.min,x=c.max,F=c.random;function s(e,r){if(e=e||"",r=r||{},e instanceof s)return e;if(!(this instanceof s))return new s(e,r);var t=O(e);this._originalInput=e,this._r=t.r,this._g=t.g,this._b=t.b,this._a=t.a,this._roundA=f(100*this._a)/100,this._format=r.format||t.format,this._gradientType=r.gradientType,this._r<1&&(this._r=f(this._r)),this._g<1&&(this._g=f(this._g)),this._b<1&&(this._b=f(this._b)),this._ok=t.ok,this._tc_id=B++}s.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var e=this.toRgb();return(e.r*299+e.g*587+e.b*114)/1e3},getLuminance:function(){var e=this.toRgb(),r,t,n,a,i,h;return r=e.r/255,t=e.g/255,n=e.b/255,r<=.03928?a=r/12.92:a=c.pow((r+.055)/1.055,2.4),t<=.03928?i=t/12.92:i=c.pow((t+.055)/1.055,2.4),n<=.03928?h=n/12.92:h=c.pow((n+.055)/1.055,2.4),.2126*a+.7152*i+.0722*h},setAlpha:function(e){return this._a=N(e),this._roundA=f(100*this._a)/100,this},toHsv:function(){var e=E(this._r,this._g,this._b);return{h:e.h*360,s:e.s,v:e.v,a:this._a}},toHsvString:function(){var e=E(this._r,this._g,this._b),r=f(e.h*360),t=f(e.s*100),n=f(e.v*100);return this._a==1?"hsv("+r+", "+t+"%, "+n+"%)":"hsva("+r+", "+t+"%, "+n+"%, "+this._roundA+")"},toHsl:function(){var e=T(this._r,this._g,this._b);return{h:e.h*360,s:e.s,l:e.l,a:this._a}},toHslString:function(){var e=T(this._r,this._g,this._b),r=f(e.h*360),t=f(e.s*100),n=f(e.l*100);return this._a==1?"hsl("+r+", "+t+"%, "+n+"%)":"hsla("+r+", "+t+"%, "+n+"%, "+this._roundA+")"},toHex:function(e){return q(this._r,this._g,this._b,e)},toHexString:function(e){return"#"+this.toHex(e)},toHex8:function(e){return U(this._r,this._g,this._b,this._a,e)},toHex8String:function(e){return"#"+this.toHex8(e)},toRgb:function(){return{r:f(this._r),g:f(this._g),b:f(this._b),a:this._a}},toRgbString:function(){return this._a==1?"rgb("+f(this._r)+", "+f(this._g)+", "+f(this._b)+")":"rgba("+f(this._r)+", "+f(this._g)+", "+f(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:f(o(this._r,255)*100)+"%",g:f(o(this._g,255)*100)+"%",b:f(o(this._b,255)*100)+"%",a:this._a}},toPercentageRgbString:function(){return this._a==1?"rgb("+f(o(this._r,255)*100)+"%, "+f(o(this._g,255)*100)+"%, "+f(o(this._b,255)*100)+"%)":"rgba("+f(o(this._r,255)*100)+"%, "+f(o(this._g,255)*100)+"%, "+f(o(this._b,255)*100)+"%, "+this._roundA+")"},toName:function(){return this._a===0?"transparent":this._a<1?!1:ae[q(this._r,this._g,this._b,!0)]||!1},toFilter:function(e){var r="#"+I(this._r,this._g,this._b,this._a),t=r,n=this._gradientType?"GradientType = 1, ":"";if(e){var a=s(e);t="#"+I(a._r,a._g,a._b,a._a)}return"progid:DXImageTransform.Microsoft.gradient("+n+"startColorstr="+r+",endColorstr="+t+")"},toString:function(e){var r=!!e;e=e||this._format;var t=!1,n=this._a<1&&this._a>=0,a=!r&&n&&(e==="hex"||e==="hex6"||e==="hex3"||e==="hex4"||e==="hex8"||e==="name");return a?e==="name"&&this._a===0?this.toName():this.toRgbString():(e==="rgb"&&(t=this.toRgbString()),e==="prgb"&&(t=this.toPercentageRgbString()),(e==="hex"||e==="hex6")&&(t=this.toHexString()),e==="hex3"&&(t=this.toHexString(!0)),e==="hex4"&&(t=this.toHex8String(!0)),e==="hex8"&&(t=this.toHex8String()),e==="name"&&(t=this.toName()),e==="hsl"&&(t=this.toHslString()),e==="hsv"&&(t=this.toHsvString()),t||this.toHexString())},clone:function(){return s(this.toString())},_applyModification:function(e,r){var t=e.apply(null,[this].concat([].slice.call(r)));return this._r=t._r,this._g=t._g,this._b=t._b,this.setAlpha(t._a),this},lighten:function(){return this._applyModification(X,arguments)},brighten:function(){return this._applyModification(Z,arguments)},darken:function(){return this._applyModification(J,arguments)},desaturate:function(){return this._applyModification(W,arguments)},saturate:function(){return this._applyModification(V,arguments)},greyscale:function(){return this._applyModification(Q,arguments)},spin:function(){return this._applyModification(K,arguments)},_applyCombination:function(e,r){return e.apply(null,[this].concat([].slice.call(r)))},analogous:function(){return this._applyCombination(ne,arguments)},complement:function(){return this._applyCombination(Y,arguments)},monochromatic:function(){return this._applyCombination(ie,arguments)},splitcomplement:function(){return this._applyCombination(re,arguments)},triad:function(){return this._applyCombination(ee,arguments)},tetrad:function(){return this._applyCombination(te,arguments)}},s.fromRatio=function(e,r){if(typeof e=="object"){var t={};for(var n in e)e.hasOwnProperty(n)&&(n==="a"?t[n]=e[n]:t[n]=S(e[n]));e=t}return s(e,r)};function O(e){var r={r:0,g:0,b:0},t=1,n=null,a=null,i=null,h=!1,u=!1;return typeof e=="string"&&(e=oe(e)),typeof e=="object"&&(y(e.r)&&y(e.g)&&y(e.b)?(r=M(e.r,e.g,e.b),h=!0,u=String(e.r).substr(-1)==="%"?"prgb":"rgb"):y(e.h)&&y(e.s)&&y(e.v)?(n=S(e.s),a=S(e.v),r=D(e.h,n,a),h=!0,u="hsv"):y(e.h)&&y(e.s)&&y(e.l)&&(n=S(e.s),i=S(e.l),r=$(e.h,n,i),h=!0,u="hsl"),e.hasOwnProperty("a")&&(t=e.a)),t=N(t),{ok:h,format:e.format||u,r:m(255,x(r.r,0)),g:m(255,x(r.g,0)),b:m(255,x(r.b,0)),a:t}}function M(e,r,t){return{r:o(e,255)*255,g:o(r,255)*255,b:o(t,255)*255}}function T(e,r,t){e=o(e,255),r=o(r,255),t=o(t,255);var n=x(e,r,t),a=m(e,r,t),i,h,u=(n+a)/2;if(n==a)i=h=0;else{var l=n-a;switch(h=u>.5?l/(2-n-a):l/(n+a),n){case e:i=(r-t)/l+(r<t?6:0);break;case r:i=(t-e)/l+2;break;case t:i=(e-r)/l+4;break}i/=6}return{h:i,s:h,l:u}}function $(e,r,t){var n,a,i;e=o(e,360),r=o(r,100),t=o(t,100);function h(b,R,p){return p<0&&(p+=1),p>1&&(p-=1),p<1/6?b+(R-b)*6*p:p<1/2?R:p<2/3?b+(R-b)*(2/3-p)*6:b}if(r===0)n=a=i=t;else{var u=t<.5?t*(1+r):t+r-t*r,l=2*t-u;n=h(l,u,e+1/3),a=h(l,u,e),i=h(l,u,e-1/3)}return{r:n*255,g:a*255,b:i*255}}function E(e,r,t){e=o(e,255),r=o(r,255),t=o(t,255);var n=x(e,r,t),a=m(e,r,t),i,h,u=n,l=n-a;if(h=n===0?0:l/n,n==a)i=0;else{switch(n){case e:i=(r-t)/l+(r<t?6:0);break;case r:i=(t-e)/l+2;break;case t:i=(e-r)/l+4;break}i/=6}return{h:i,s:h,v:u}}function D(e,r,t){e=o(e,360)*6,r=o(r,100),t=o(t,100);var n=c.floor(e),a=e-n,i=t*(1-r),h=t*(1-a*r),u=t*(1-(1-a)*r),l=n%6,b=[t,h,i,i,u,t][l],R=[u,t,t,h,i,i][l],p=[i,i,u,t,t,h][l];return{r:b*255,g:R*255,b:p*255}}function q(e,r,t,n){var a=[_(f(e).toString(16)),_(f(r).toString(16)),_(f(t).toString(16))];return n&&a[0].charAt(0)==a[0].charAt(1)&&a[1].charAt(0)==a[1].charAt(1)&&a[2].charAt(0)==a[2].charAt(1)?a[0].charAt(0)+a[1].charAt(0)+a[2].charAt(0):a.join("")}function U(e,r,t,n,a){var i=[_(f(e).toString(16)),_(f(r).toString(16)),_(f(t).toString(16)),_(P(n))];return a&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)&&i[3].charAt(0)==i[3].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0)+i[3].charAt(0):i.join("")}function I(e,r,t,n){var a=[_(P(n)),_(f(e).toString(16)),_(f(r).toString(16)),_(f(t).toString(16))];return a.join("")}s.equals=function(e,r){return!e||!r?!1:s(e).toRgbString()==s(r).toRgbString()},s.random=function(){return s.fromRatio({r:F(),g:F(),b:F()})};function W(e,r){r=r===0?0:r||10;var t=s(e).toHsl();return t.s-=r/100,t.s=H(t.s),s(t)}function V(e,r){r=r===0?0:r||10;var t=s(e).toHsl();return t.s+=r/100,t.s=H(t.s),s(t)}function Q(e){return s(e).desaturate(100)}function X(e,r){r=r===0?0:r||10;var t=s(e).toHsl();return t.l+=r/100,t.l=H(t.l),s(t)}function Z(e,r){r=r===0?0:r||10;var t=s(e).toRgb();return t.r=x(0,m(255,t.r-f(255*-(r/100)))),t.g=x(0,m(255,t.g-f(255*-(r/100)))),t.b=x(0,m(255,t.b-f(255*-(r/100)))),s(t)}function J(e,r){r=r===0?0:r||10;var t=s(e).toHsl();return t.l-=r/100,t.l=H(t.l),s(t)}function K(e,r){var t=s(e).toHsl(),n=(t.h+r)%360;return t.h=n<0?360+n:n,s(t)}function Y(e){var r=s(e).toHsl();return r.h=(r.h+180)%360,s(r)}function ee(e){var r=s(e).toHsl(),t=r.h;return[s(e),s({h:(t+120)%360,s:r.s,l:r.l}),s({h:(t+240)%360,s:r.s,l:r.l})]}function te(e){var r=s(e).toHsl(),t=r.h;return[s(e),s({h:(t+90)%360,s:r.s,l:r.l}),s({h:(t+180)%360,s:r.s,l:r.l}),s({h:(t+270)%360,s:r.s,l:r.l})]}function re(e){var r=s(e).toHsl(),t=r.h;return[s(e),s({h:(t+72)%360,s:r.s,l:r.l}),s({h:(t+216)%360,s:r.s,l:r.l})]}function ne(e,r,t){r=r||6,t=t||30;var n=s(e).toHsl(),a=360/t,i=[s(e)];for(n.h=(n.h-(a*r>>1)+720)%360;--r;)n.h=(n.h+a)%360,i.push(s(n));return i}function ie(e,r){r=r||6;for(var t=s(e).toHsv(),n=t.h,a=t.s,i=t.v,h=[],u=1/r;r--;)h.push(s({h:n,s:a,v:i})),i=(i+u)%1;return h}s.mix=function(e,r,t){t=t===0?0:t||50;var n=s(e).toRgb(),a=s(r).toRgb(),i=t/100,h={r:(a.r-n.r)*i+n.r,g:(a.g-n.g)*i+n.g,b:(a.b-n.b)*i+n.b,a:(a.a-n.a)*i+n.a};return s(h)},s.readability=function(e,r){var t=s(e),n=s(r);return(c.max(t.getLuminance(),n.getLuminance())+.05)/(c.min(t.getLuminance(),n.getLuminance())+.05)},s.isReadable=function(e,r,t){var n=s.readability(e,r),a,i;switch(i=!1,a=ue(t),a.level+a.size){case"AAsmall":case"AAAlarge":i=n>=4.5;break;case"AAlarge":i=n>=3;break;case"AAAsmall":i=n>=7;break}return i},s.mostReadable=function(e,r,t){var n=null,a=0,i,h,u,l;t=t||{},h=t.includeFallbackColors,u=t.level,l=t.size;for(var b=0;b<r.length;b++)i=s.readability(e,r[b]),i>a&&(a=i,n=s(r[b]));return s.isReadable(e,n,{level:u,size:l})||!h?n:(t.includeFallbackColors=!1,s.mostReadable(e,["#fff","#000"],t))};var C=s.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},ae=s.hexNames=se(C);function se(e){var r={};for(var t in e)e.hasOwnProperty(t)&&(r[e[t]]=t);return r}function N(e){return e=parseFloat(e),(isNaN(e)||e<0||e>1)&&(e=1),e}function o(e,r){fe(e)&&(e="100%");var t=he(e);return e=m(r,x(0,parseFloat(e))),t&&(e=parseInt(e*r,10)/100),c.abs(e-r)<1e-6?1:e%r/parseFloat(r)}function H(e){return m(1,x(0,e))}function g(e){return parseInt(e,16)}function fe(e){return typeof e=="string"&&e.indexOf(".")!=-1&&parseFloat(e)===1}function he(e){return typeof e=="string"&&e.indexOf("%")!=-1}function _(e){return e.length==1?"0"+e:""+e}function S(e){return e<=1&&(e=e*100+"%"),e}function P(e){return c.round(parseFloat(e)*255).toString(16)}function G(e){return g(e)/255}var v=function(){var e="[-\\+]?\\d+%?",r="[-\\+]?\\d*\\.\\d+%?",t="(?:"+r+")|(?:"+e+")",n="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?",a="[\\s|\\(]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")[,|\\s]+("+t+")\\s*\\)?";return{CSS_UNIT:new RegExp(t),rgb:new RegExp("rgb"+n),rgba:new RegExp("rgba"+a),hsl:new RegExp("hsl"+n),hsla:new RegExp("hsla"+a),hsv:new RegExp("hsv"+n),hsva:new RegExp("hsva"+a),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/}}();function y(e){return!!v.CSS_UNIT.exec(e)}function oe(e){e=e.replace(k,"").replace(j,"").toLowerCase();var r=!1;if(C[e])e=C[e],r=!0;else if(e=="transparent")return{r:0,g:0,b:0,a:0,format:"name"};var t;return(t=v.rgb.exec(e))?{r:t[1],g:t[2],b:t[3]}:(t=v.rgba.exec(e))?{r:t[1],g:t[2],b:t[3],a:t[4]}:(t=v.hsl.exec(e))?{h:t[1],s:t[2],l:t[3]}:(t=v.hsla.exec(e))?{h:t[1],s:t[2],l:t[3],a:t[4]}:(t=v.hsv.exec(e))?{h:t[1],s:t[2],v:t[3]}:(t=v.hsva.exec(e))?{h:t[1],s:t[2],v:t[3],a:t[4]}:(t=v.hex8.exec(e))?{r:g(t[1]),g:g(t[2]),b:g(t[3]),a:G(t[4]),format:r?"name":"hex8"}:(t=v.hex6.exec(e))?{r:g(t[1]),g:g(t[2]),b:g(t[3]),format:r?"name":"hex"}:(t=v.hex4.exec(e))?{r:g(t[1]+""+t[1]),g:g(t[2]+""+t[2]),b:g(t[3]+""+t[3]),a:G(t[4]+""+t[4]),format:r?"name":"hex8"}:(t=v.hex3.exec(e))?{r:g(t[1]+""+t[1]),g:g(t[2]+""+t[2]),b:g(t[3]+""+t[3]),format:r?"name":"hex"}:!1}function ue(e){var r,t;return e=e||{level:"AA",size:"small"},r=(e.level||"AA").toUpperCase(),t=(e.size||"small").toLowerCase(),r!=="AA"&&r!=="AAA"&&(r="AA"),t!=="small"&&t!=="large"&&(t="small"),{level:r,size:t}}d.exports?d.exports=s:window.tinycolor=s})(Math)})(z);var de=z.exports;const be=le(de),_e="8px",ve="64px",pe="_lightGroup_1q9kj_7",me="_row_1q9kj_15",xe="_col_1q9kj_23",ye="_start_1q9kj_31",ke="_end_1q9kj_39",Ae="_container_1q9kj_63",we="_wire_1q9kj_91",Se="_socket_1q9kj_147",Re="_bulb_1q9kj_203",A={shadow:_e,spacing:ve,lightGroup:pe,row:me,col:xe,start:ye,end:ke,container:Ae,wire:we,socket:Se,bulb:Re,"animation-1":"_animation-1_1q9kj_1","animation-2":"_animation-2_1q9kj_1","animation-3":"_animation-3_1q9kj_1","animation-4":"_animation-4_1q9kj_1","animation-5":"_animation-5_1q9kj_1"},He=64;ce.forEach((d,c)=>{document.body.style.setProperty(`--christmas-color-${c+1}`,d),document.body.style.setProperty(`--christmas-color-${c+1}-fade`,be(d).darken(15).toHexString())});const Ee=()=>{const[d,c]=L.useState([]);return L.useEffect(()=>{const k=()=>{c(Fe(Math.floor(window.innerWidth/He)))};return window.addEventListener("resize",k,!1),k(),()=>window.removeEventListener("resize",k,!1)},[]),w.jsx(je,{items:d})},je=({items:d,orientation:c="row",position:k="start"})=>w.jsx("div",{className:ge(A.lightGroup,A[c],A[k]),children:d.map(j=>w.jsxs("div",{className:A.container,children:[w.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 64 64",className:A.wire,children:w.jsx("path",{fill:"none",stroke:"#294b29",strokeWidth:"2",d:"M0,32 Q32,64 64,32"})}),w.jsx("div",{className:A.socket}),w.jsx("div",{className:A.bulb})]},j))});function Fe(d){return d<=0?[]:[...Array(d)].map(()=>Ce())}function Ce(){return(Math.random()+1).toString(36).substring(7)}export{Ee as default};