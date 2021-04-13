export default async function LottieOptionFactory(option) {
    let {path,name,...other}=option;
   const lottieCache= window.GlobCache[name];
   if(!lottieCache){
        return {
            ...other,
            path
        }
   }
   console.log("lottieCache=",name,"==",lottieCache,"++==",window.GlobCache);
   const jsonData= await getLottieJson(lottieCache.data);
   const transJson=transformLottieJson(jsonData,name);
   if(transJson){
       console.log("transJson···",transJson);
        return {
            ...other,
            animationData:transJson
        }

   }
   console.log("jsonData=2=",transJson);

}

 function getLottieJson (lottieCacheData){
    const reader = new FileReader();
    return new Promise((resolve,reject)=>{
        reader.readAsText(lottieCacheData,'utf8');
        reader.onload = function(){
            const receive_data = this.result;//这个就是解析出来的数据
            try{
                resolve(JSON.parse(receive_data));
            }catch(e){
                console.log("解析",e);
                reject("失败");
            }
        }
    })
}

function transformLottieJson (lottieJson,lottieName){
    const newLottieJson={...lottieJson};
    try{
        const assets=newLottieJson.assets;
        for(let i=0;i<assets.length;i++){
            const item=assets[i];
            if(item.p && item.u){
                const name=`${lottieName}_${item.p}`;
                const lottieCache= window.GlobCache[name];
                console.log("获取到的name==",lottieCache);
                if(lottieCache && lottieCache.blobUrl){
                    newLottieJson.assets[i].u="";
                    newLottieJson.assets[i].p=lottieCache.blobUrl;
                }
            }
        }
    }catch(e){
        console.log(e);
    }
    return newLottieJson;

}