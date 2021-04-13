import ResourceLoader from "./dbCache.js";
import LottieOptionFactory from "./lottieOptionCreate.js";
 window.GlobCache={};
let resourcesInfo = [
{
    key: "mqtt2",
    url: "//public.live.jjmatch.com/front/libs/js/mqtt.min.js"
},{
    key: "lottie",
    url: "//img1.cache.jj.cn/myjj/my.cl/pc_live/lib/lottie.min.js"
},{
    key: "flv",
    pre: ["mqtt"],
    url: "//public.live.jjmatch.com/front/libs/js/flv.1.5.min.js"
},{
    pre: ["lottie"],
    key: "mqtt",
    url: "//public.live.jjmatch.com/front/libs/js/mqtt.min.js"
},];



if(window._config){
    resourcesInfo=resourcesInfo.concat(window._config);
    console.log("resourcesInfo==",resourcesInfo);
}


console.time("db1");
const rl = new ResourceLoader(resourcesInfo);

rl.on("completed", ()=>{
    console.log("completed");
    console.timeEnd("db1");
});
rl.on("loaded", (info)=>{
    console.log("loaded event", info.cacheInfo,"=url=",info.blobUrl);
    const cacheInfo=info.cacheInfo;
    const blobUrl=info.blobUrl;
    window.GlobCache[cacheInfo.key]={blobUrl:blobUrl,...cacheInfo};
})

rl.startLoad();


// var animation = bodymovin.loadAnimation({
//     container: document.getElementById('bm'),
//     renderer: 'svg',
//     loop: true,
//     autoplay: true,
//     animationData : a
//   })

setTimeout(async ()=>{
  const option= await LottieOptionFactory({
        container: document.getElementById('bm'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path : "https://public.live.jjmatch.com/front/acts-effects/luck-draw-act-effect1/data.json",
        name:"luck-draw-act-effect1"
    });
    console.log("option==",option);
    const animation = bodymovin.loadAnimation(option)
},1000)
