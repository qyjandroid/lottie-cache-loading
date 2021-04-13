function createScriptTag(src, options = {}){
    const s = document.createElement("script");
    // TODO:: 别的属性
    s.src = src;
    return s;
}

function fetchResource(url){
    return fetch(url, {
         method:"get",
         responseType: 'blob'
     }).then(res=> res.blob());
 }  

 function copyObject(obj){
    return  JSON.parse(JSON.stringify(obj))
 }

 function generateBlobUrl(blob){
     const url = URL.createObjectURL(blob);
     console.log("blob url:", url);
     return url;
 }

 // status undefined loading loaded error

class ResourceLoader {

    constructor(resourcesInfo){
        // TODO:: idb采用注入
        this.resourcesInfo = this.createNewResourceInfo(resourcesInfo);
        console.log("ResourceLoader=resourcesInfo=",this.resourcesInfo);
        // 已缓存， 缓存不等已加载，只有调用URL.createObjectURL之后，才会变为loaded
        this.cached = {};   

        this.loaded = {};
        
        this.events = {
            completed: [],
            loaded: []
        };
    }

    createNewResourceInfo=(resourcesInfo)=>{
        let mapKey={};
       return resourcesInfo.map((r,index)=>{
           const curKey=r.key;
           if(curKey && !mapKey[curKey]){
             mapKey[curKey]=true;
           }else{
              throw new Error("配置中存在重复:"+curKey);
           }
           return  copyObject(r);
       });
    }
    getCachedResources=(keys)=>{    
        const {resourcesInfo} = this;
        const cached = {} ;
        console.log("keys==",keys);
        return idb.getMany(keys).then(results=>{  
            results.forEach((value, index)=>{
                if(value !==  undefined){
                    cached[resourcesInfo[index].key] = value;
                }
            });
            return cached
        })
    }

    isCompleted=()=>{
        return this.resourcesInfo.every((r)=>{
            if(r.status!=="loaded"){
                console.log("下载未完成",r);
            }
           return r.status === "loaded"
        });
    }

    isCached=(key)=>{
        return this.cached[key] != undefined;
    }

    getUncachedResourcesInfo=()=>{
        return  this.resourcesInfo.filter(r=> this.cached[r.key] == undefined);
    }

    onResourceLoaded = (info, data)=>{
        console.log(`${info.key} 下载完成`);
        console.log(`${info.key} is loaded`);
        const cacheInfo = this.resourcesInfo.find(r=> r.key === info.key);
        cacheInfo.status = "loaded";
        
        cacheInfo.data = data;
        this.loaded[cacheInfo.key] = cacheInfo;
        const blobUrl= generateBlobUrl(data);
        this.emit("loaded", {cacheInfo:cacheInfo,blobUrl:blobUrl});
        // TOTO:: 来源是DB就不用再存
        idb.set(info.key, cacheInfo);
       
        if(!this.isCompleted()){
           return this.fetchResources()
        }
        this.emit("completed");
    }

    emit=(type, ...args)=>{
        const events = this.events[type];
        if(!Array.isArray(events) || events.length  === 0){
            return;
        }
        events.forEach(event=> event.apply(null, args));
    }

    on=(type, fn)=>{
        const events = this.events[type];
        if(!Array.isArray(events)){
            return;
        }
        events.push(fn)
    }

    fetchResource=(resourceInfo)=>{
        return fetchResource(resourceInfo.url).then(blob=> this.onResourceLoaded(resourceInfo, blob))
    }

    isPreLoaded =(pre)=>{
        return pre.every(p=> this.loaded[p] !== undefined);
    }

    findCanLoadResource=()=>{
        const info = this.resourcesInfo.find(r=> r.status == undefined && ( r.pre == undefined || this.isPreLoaded(r.pre)));
        return info;
    }

    fetchResources=()=>{
        let info = this.findCanLoadResource();
        while(info){           
            if(this.isCached(info.key)){
                console.log(`${info.key} is cached, load from db, pre`, info.pre);

                const data = this.cached[info.key].data;
                this.onResourceLoaded(info, data);
                info = this.findCanLoadResource();
                continue;
            }
            console.log(`${info.key} is not cached, load from network ${info.url}, pre`, info.pre);
            info.status = "loading";
            this.fetchResource(info);
            info = this.findCanLoadResource();
        }
    }

     prepare= async ()=>{
        console.time("prepare");;
        const keys = this.resourcesInfo.map(r=>r.key);
        this.cached = await this.getCachedResources(keys);
        console.log("chached",  this.cached);  
        console.timeEnd("prepare");;

    }

     startLoad= async ()=>{
        await this.prepare();
        this.fetchResources();
    }
}

export default ResourceLoader;