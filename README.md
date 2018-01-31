# imgurdemo
imgurdemo15
Authorization: Client-ID YOUR_CLIENT_ID
```
c552bf3081f07909342764f2b742548881bf5e252c8a0461fb7b9d5
```

### imgur rate limit
レート制限
Imgur APIは、容量の公平な配分を保証するために、クレジット割り当てシステムを使用します。各アプリケーションでは、1日あたり約1,250アップロードまたは1日約12,500リクエストを許可できます 。1日の制限が1か月に5回発生すると、残りの月はアプリがブロックされます。残りの与信限度額は、X-RateLimit-ClientRemaining HTTPヘッダーに各要求応答と共に表示されます。

### ready. base64 <> blob
file to base64. if outer url to base64, attention the same-origin.
input type="file" is no limit.
```
//file to base64
      let reader = new FileReader()
      ,caller = function(e) {
          let data = e.target.result //data:image/png;base64,...
          upImgur(data)
        }
      ;
      reader.onloadend=caller;
      reader.readAsDataURL(f);

```

```
//fn.toBlob
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
//var debug = {hello: "world"};
//var blob = new Blob([JSON.stringify(debug, null, 2)], {type : 'application/json'});
//data:image/png;base64,... 
}
```

### quick upload
```
var upImgur =function(base64){
 //base64 is data:image/jpeg...,....
 let blob = fn.toBlob(base64)
 ,c ='c552bf3081f0790'
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
```
