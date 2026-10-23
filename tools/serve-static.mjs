// Minimal static file server for previewing public/ (the Pocket Lite build lives at /pocket/).
// Usage: node tools/serve-static.mjs <directory> <port>
import {createServer} from "node:http";
import {createReadStream,statSync} from "node:fs";
import {extname,join,normalize,resolve} from "node:path";

const root=resolve(process.argv[2]??"public"),port=Number(process.env.PORT??process.argv[3]??8790);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".json":"application/json",".mp3":"audio/mpeg",".webp":"image/webp"};

createServer((req,res)=>{
 let path=decodeURIComponent((req.url??"/").split("?")[0]);
 if(path.endsWith("/"))path+="index.html";
 const file=join(root,normalize(path));
 if(!file.startsWith(root)){res.writeHead(403);res.end();return}
 let stat;
 try{stat=statSync(file)}catch{res.writeHead(404);res.end("not found");return}
 if(stat.isDirectory()){res.writeHead(302,{Location:path+"/"});res.end();return}
 res.writeHead(200,{"Content-Type":types[extname(file)]??"application/octet-stream","Content-Length":stat.size,"Cache-Control":"no-store"});
 createReadStream(file).pipe(res);
}).listen(port,"127.0.0.1",()=>console.log(`serving ${root} at http://127.0.0.1:${port}/`));
