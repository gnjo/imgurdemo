(function(root){
 'use strict'
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
  else{return gi()} 
 }
 ;
 ;
 let $box=fn.q('[data-imgur]')
 ,cid=$box.getAttribute('data-imgur')
 ,loading=$box.getAttribute('data-imgur-loading')
 ,im=((base64)=>fn.upImgur(base64,cid))
 ,stock=((type,data)=>fn.stock(cid,type,data))
 ;
 ['ondragover','ondrop','ondragleave'].forEach(d=>$box[d]=dnd)
 stock('load').map(d=>fn.img(d)).forEach(d=>$box.appendChild(d))
 ;
 function dnd(ev){
  let type=ev.type,mark ='drag'  //mark is .drag the custom class
  ;
  ev.stopPropagation();
  ev.preventDefault();
  if(type==='drop'){
    ;[].slice.call( ev.target.files||ev.dataTransfer.files )
     .filter(f=>f.type.match('image.*'))
     .map((f)=>{ let r=new FileReader();  r.onloadend=caller;  r.readAsDataURL(f)})
   ;
   this.classList.remove(mark)
   return;
  }   
  if(type==='dragover'){ this.classList.add(mark);ev.dataTransfer.dropEffect = 'copy';return}
  if(type==='dragleave'){ this.classList.remove(mark);return}
 }
 ;
 function caller(e){
  let data = e.target.result
  ,img =fn.img(loading)
  ;
  $box.appendChild(img);
  im(data).then((d)=>{/*console.log(d);*/img.src =d.data.link; stock('save',img.src) })
  ;
 }
 ;
 ;/*case by superagent
 let req =root.superagent
 ;
 function upImgur(base64,cid){
  //base64 is data:image/jpeg...,....
  let blob = fn.toBlob(base64)
  ,c =cid
  ,formData = new FormData()
  ;
   formData.append('type', 'file')
   formData.append('image', blob)
  
   return req.post('https://api.imgur.com/3/upload.json')
    .set({ Accept: 'application/json', Authorization: `Client-ID ${c}`})
    .send(formData)
    .then(res=>res.body)
 }
 ;
 */
 ;
})(this);

