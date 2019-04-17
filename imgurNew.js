(function(root){
 /*history
 'onpaste',
 */
 'use strict';
 let document =root.document
 ,FormData =root.FormData
 ,fetch =root.fetch
 ,localStorage =root.localStorage
 ,FileReader = root.FileReader
 ,JSON =root.JSON
 ,atob =root.atob
 ,Uint8Array =root.Uint8Array
 ,Blob =root.Blob
 ;
 let fn={}
 ;
 fn.q=(d=>document.querySelector(d))
 fn.qa=((d,doc=document)=>[].slice.call(doc.querySelectorAll(d))) 
 fn.ce=(d=>document.createElement(d))
 fn.copy=function(text){
  //console.log(text)
  let cf = document.createElement("textarea")
  ,el = document.getElementsByTagName("body")[0]
  ;
  cf.textContent = text;
  el.appendChild(cf);
  cf.select();
  document.execCommand('copy');
  el.removeChild(cf); //copy next remove
 }
 fn.toBlob =function(base64) {
  let ma = /^data:(.*);base64,(.*)$/
  ;
  if(!ma.test(base64)){ console.log('error base64 data'); return null}

  let ary = base64.match(ma)  //[0] base64, [1] type, [2] body
  ,type = ary[1]
  ,bin = atob(ary[2])
  ,buffer = new Uint8Array(bin.length).map( (d,i)=>{return bin.charCodeAt(i)})
  ,blob = new Blob([buffer.buffer], {type: type})
  ;
  return blob;
 }
 
fn.dragger=(el,caller)=>{

 var dnd=(caller=>function(ev){
  let type=ev.type,mark ='drag'  //mark is .drag the custom class
  ;
  if(type!='paste'){
   ev.stopPropagation();
   ev.preventDefault();
  }
  if(type==='drop'||type==='paste'){
   //this paste hack, allow the chrome only.
   const flg= (type==='paste')
   ,files=(flg)?ev.clipboardData.items:ev.target.files||ev.dataTransfer.files
   ;
   ;[].slice.call(files)
   //.filter(f=>f.type.match('*.*')) 
   //.slice(0,10) //10 is limit
    .map((f)=>{
    let r=new FileReader(); 
    r.onloadend=(function(f){return function(ev){
     ev.target.file=f/**/ ;
     caller(ev)
    };
                            })(f);

    if(flg&&f.kind ==='string'){
     var _f=JSON.parse(JSON.stringify({kind:f.kind,type:f.type}))
     return f.getAsString(function(str) {
      ev.target.result=str; ev.target.file=_f; caller(ev);
     });
    }    
    r.readAsDataURL((flg)?f.getAsFile():f); 
   })
   ;
   this.classList.remove(mark)
   return;
  }     
  if(type==='dragover'){ this.classList.add(mark);ev.dataTransfer.dropEffect = 'copy';return}
  if(type==='dragleave'){ this.classList.remove(mark);return}
 })

 var _dnd=dnd(caller)
 ;['onpaste','ondragover','ondrop','ondragleave'].forEach(d=>el[d]=_dnd)
 return el; 
 /*usage
document.body.set({'contenteditable':'plaintext-only'})
fn.dragger(document.body,(ev)=>{
 console.log(ev,ev.target.result,ev.target.file)
}) 
 */

} 
 
 
 fn.upImgur=function(base64,cid){
  //console.log(base64)
  //base64 is data:image/jpeg...,....
  let blob = fn.toBlob(base64)
  ,c =cid
  ,formData = new FormData()
  formData.append('type', 'file')
  formData.append('image', blob)
  return fetch('https://api.imgur.com/3/upload.json', {
   method: 'POST',
   headers: {
    Accept: 'application/json',
    Authorization: `Client-ID ${c}` // imgur specific
   },
   body: formData
  })
   .then(d=>d.json())
 }
 fn.img=function(d){
  let el=fn.ce('img'); el.src=d||''; 
  el.onclick=function(){fn.copy(this.src)};
  return el
 }
 fn.stock=function(key,type,data){
  let gi=()=>{return (localStorage.getItem(key) )? JSON.parse(localStorage.getItem(key)) :[] }
  ,si=(d)=>{return localStorage.setItem(key, JSON.stringify(d)) }
  ;
  if(type==='save'){let a =gi(); a.push(data); return si(a)}
  else if(type==='allsave'){ return si(data) }
  else{return gi()} 
 }
 fn.deleteMe=function(el,caller){
  let is={}; 
  is.element=function(o){return !!(o && o.nodeType === 1)}
  ;
  if(!is.element(el)){
   console.log('delemteMe not element',el)
   return el;
  }
  el.setAttribute('tabindex','-1') //interactive-able
  el.style.outline='none'
  el.onkeydown=(e)=>{
   if(e.which===46){
    e.target.remove();//46 delete
    caller(e)
   }
  }
  return el;
 }  

 ;
 ;
 let $box=fn.q('[data-imgur]')
 ,cid=$box.getAttribute('data-imgur')
 ,loading=$box.getAttribute('data-imgur-loading')
 ,im=((base64)=>fn.upImgur(base64,cid))
 ,stock=((type,data)=>fn.stock(cid,type,data))
 ,deletecaller=(d)=>{
  let da=fn.qa('img',$box).map(el=>el.src)
  stock('allsave',da)
 }
 ;
 ;//double load check
 if($box.getAttribute('data-imgur-active')) return console.log('double loading')
 ;
 fn.dragger($box,caller) 

 ;
 stock('load')
  .map( d=>fn.deleteMe(fn.img(d),deletecaller) )
  .forEach(d=>$box.appendChild(d))
 ;
 $box.setAttribute('data-imgur-active','true');
 ;
 function caller(e){
  let imghead='data:image'
  ,cnk=e.target.result.slice(0,imghead.length)
  ;
  if(!cnk===imghead) return console.log('not image')
  
  let data = e.target.result
  ,img = fn.img(loading) 
  ,calc=(d)=>{
   img.src =d.data.link; stock('save',img.src);return img.src
  }
  ;
  fn.deleteMe(img,deletecaller);/// 
  $box.appendChild(img);
  imgc(data).fit({w:300})
   .then(im).then(calc)
  ;
 }
 ;
 ;
})(this);
