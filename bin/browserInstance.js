var e,t;!function(e){e[e.InitConnection=1]="InitConnection",e[e.Authenticate=15]="Authenticate",e[e.Acknowledge=6]="Acknowledge",e[e.Reconnect=22]="Reconnect",e[e.Topic=26]="Topic",e[e.Identifier=11]="Identifier",e[e.Error=21]="Error",e[e.Alert=7]="Alert",e[e.AddAction=12]="AddAction",e[e.DeleteAction=16]="DeleteAction",e[e.Server=24]="Server",e[e.Payload=29]="Payload",e[e.Presence=14]="Presence"}(e||(e={})),function(e){e[e.ArraySeparator=31]="ArraySeparator"}(t||(t={}));const n=e=>{const t=new ArrayBuffer(e.length),n=new Uint8Array(t),s=e.length+1;for(let t=0;t<s;t++)n[t]=e.charCodeAt(t);return t},s=e=>n(e),i=e=>a(e),a=e=>new Uint8Array(e).reduce(((e,t)=>e+String.fromCharCode(t)),"");class r{commandArray=[];setCommand(e,t){if(!e)return this;this.commandArray.push(e);let n=[];return t?(Array.isArray(t)?n=this.convertArray(t):"string"==typeof t&&(n=this.convertStringNumberArray(t)),this.commandArray=[...this.commandArray,...n],this):this}convertStringNumberArray(e){const t=s(e);return Array.from(new Uint8Array(t))}convertArray(e){return e.map((e=>this.convertStringNumberArray(e))).map((e=>(e.push(t.ArraySeparator),e))).flat()}build(){return new Uint8Array(this.commandArray)}}const o=()=>new r;class c{static encode(t,n){const s=new Uint8Array(1);s[0]=e.Payload;const i=t.build(),a=i.byteLength;let r,o=0,c=new Uint8Array(0);n&&(o=n.byteLength+1,c=new Uint8Array(n),r=a+1);const h=new ArrayBuffer(a+o),u=new Uint8Array(h);return u.set(i,0),n&&(u.set(s,a),u.set(c,r)),u.buffer}static decode(t){const n=t.byteLength,s=new Uint8Array(t);let i=s.indexOf(e.Payload);i=i<0?n:i;const a=s.slice(0,i),r=i+1,o=this.extractCommands(a);return{commands:o,payload:t.slice(r,n),getCommand:e=>!!o[e]&&o[e]}}static hasSeparatorIndexes(e){return e.indexOf(t.ArraySeparator)>0}static commandActionUint8ArrayToString(e){return e.map((e=>String.fromCharCode(e))).join("")}static commandActionUint8ArrayToStringArray(e){const n=[];let s=[];return e.forEach((e=>{e===t.ArraySeparator?(n.push(s),s=[]):s.push(e)})),s.length>0&&n.push(s),n.map((e=>this.commandActionUint8ArrayToString(e.map((e=>Number(e))))))}static extractCommands(t){const n={};let s=null;return t.forEach((t=>{if(Object.values(e).indexOf(t)>=0)return s=t,void(n[s]=[]);n[s].push(t)})),Object.keys(n).forEach((e=>{const t=n[e];this.hasSeparatorIndexes(t)?n[e]=this.commandActionUint8ArrayToStringArray(t):0===t.length?n[e]=!0:n[e]=this.commandActionUint8ArrayToString(t)})),n}}class h{topicName;initiate;authentication;identifiers;presence;constructor(e){this.topicName=e.topicName,this.initiate=e.initiate,this.authentication=e.authentication,this.identifiers=e.identifiers,this.presence=e.presence}identifiersToOrderedString(e){if(e&&e?.length)return console.log(e),e.sort().join("_")}generateKey(){return[this.initiate,this.authentication,this.topicName,this.identifiersToOrderedString(this.identifiers),this.identifiersToOrderedString(this.presence)].filter((e=>e)).join("_")}}var u,d,l,m,p,f,b,g,w;!function(e){e.Idle="idle",e.Initiate="initiate",e.Authentication="authentication",e.Connecting="connecting",e.Connected="connected",e.Disconnected="disconnected"}(u||(u={})),function(e){e.Nodejs="nodejs",e.Browser="browser"}(d||(d={})),function(e){e.Arraybuffer="arraybuffer"}(l||(l={})),function(e){e.Hidden="hidden",e.Visible="visible"}(m||(m={})),function(e){e.Subscribe="subscribe",e.Publish="publish",e.PubSub="pubSub"}(p||(p={})),function(e){e.Active="active",e.Inactive="inactive"}(f||(f={})),function(e){e.Standard="standard",e.Api="api"}(b||(b={})),function(e){e.RoundRobbin="roundRobin"}(g||(g={})),function(e){e.Subscribe="subscribe",e.Unsubscribe="unsubscribe",e.Publish="publish",e.AddIdentifier="addIdentifier",e.RemoveIdentifier="removeIdentifier"}(w||(w={}));class y{connection;topicName;onReceiveCallback;identifiers=[];presence;tunnel;acknowledgeQueueManager;constructor(e,t,n,s,i){this.tunnel=e,this.acknowledgeQueueManager=i,this.setConnection(t),this.topicName=n,this.saveIdentifiers(s?.OR??[]),this.subscribe()}saveIdentifiers(e){Array.isArray(e)&&e.map((e=>{this.identifiers.find((t=>t===e))||this.identifiers.push(e)}))}deleteSavedIdentifiers(e){const t=[];e.map((e=>{this.identifiers.find((t=>t===e))&&t.push(e)})),this.identifiers=t}async subscribe(t){if(!this.topicName&&0===this.identifiers?.length||!Array.isArray(this.identifiers)){const e=new Error("Topic name and identifiers are required");if(!t)throw e;t(e,null)}const n=o().setCommand(e.Topic,this.topicName);this.identifiers.length>0&&n.setCommand(e.Identifier,this.identifiers),this.presence&&n.setCommand(e.Presence,this.presence),n.setCommand(e.AddAction);const s=c.encode(n);return this.send(w.Subscribe,s),await this.acknowledgeQueueManager.addToSentQueue(new h({presence:this.presence?[this.presence]:void 0,topicName:this.topicName,identifiers:this.identifiers}),t),this}setPresence(e,t){return this.presence=e,this.subscribe(t)}setConnection(e){return this.connection=e,this}_onReceiveMessage(e){return this.onReceiveCallback&&this.onReceiveCallback(e),this}onReceive(e){return this.onReceiveCallback=e,this}async addIdentifiers(t,n){if(!t?.OR?.length||0===t?.OR?.length){const e=new Error("Topic name and identifiers are required");if(!n)throw e;n(e,null)}const s=t?.OR??[];this.saveIdentifiers(s);const i=o().setCommand(e.Topic,this.topicName);s.length>0&&i.setCommand(e.Identifier,s),i.setCommand(e.AddAction);const a=c.encode(i);return this.send(w.AddIdentifier,a),await this.acknowledgeQueueManager.addToSentQueue(new h({topicName:this.topicName,identifiers:this.identifiers}),n),this}async removeIdentifiers(t,n){if(!t?.length||0===t?.length){const e=new Error("Topic name and identifiers are required");if(!n)throw e;n(e,null)}this.deleteSavedIdentifiers(t??[]);const s=o().setCommand(e.Topic,this.topicName);s.setCommand(e.Identifier,t),s.setCommand(e.DeleteAction);const i=c.encode(s);return this.send(w.RemoveIdentifier,i),await this.acknowledgeQueueManager.addToSentQueue(new h({topicName:this.topicName,identifiers:this.identifiers}),n),this}async unsubscribe(t){const n=o().setCommand(e.Topic,this.topicName).setCommand(e.DeleteAction),s=c.encode(n);return this.send(w.Unsubscribe,s),await this.acknowledgeQueueManager.addToSentQueue(new h({topicName:this.topicName,identifiers:this.identifiers}),t),!0}publish(t,n){if(0===t.byteLength)return this;const s=o().setCommand(e.Topic,this.topicName);n&&n?.length>0&&s.setCommand(e.Identifier,n);const i=c.encode(s,t);return this.send(w.Publish,i),this}send(e,t){console.log(e),console.log(c.decode(t)),this.connection&&this.connection.send(t)}}const C=e=>{if(!e)return"";const t=[],n=e;Object.keys(n).map((e=>{t.push(`${e}=${n[e]}`)}));const s=t.join("&");return s?`?${s}`:""},v={DefaultWsHost:"tunnel.nolag.app",DefaultApiHost:"api.nolag.app",DefaultWsUrl:"/ws",DefaultPort:443,DefaultWsProtocol:"wss",DefaultApiUrl:"/v1",DefaultHttpProtocol:"https"};class I{host;authToken;wsInstance;protocol;url;deviceConnectionId=void 0;environment;deviceTokenId=null;defaultCheckConnectionInterval=100;defaultCheckConnectionTimeout=1e4;checkConnectionInterval;checkConnectionTimeout;reConnect=!1;callbackOnOpen=()=>{};callbackOnReceive=()=>{};callbackOnClose=()=>{};callbackOnError=()=>{};connectionStatus=u.Idle;buffer=[];backpressureSendInterval=0;senderInterval=0;unifiedWebsocket;acknowledgeQueueManager;constructor(e,t,n,s){this.acknowledgeQueueManager=n,this.authToken=t??"",this.host=s?.host??v.DefaultWsHost,this.protocol=s?.protocol??v.DefaultWsProtocol,this.url=v.DefaultWsUrl,this.checkConnectionInterval=s?.checkConnectionInterval??this.defaultCheckConnectionInterval,this.checkConnectionTimeout=s?.checkConnectionTimeout??this.defaultCheckConnectionTimeout,this.unifiedWebsocket=e,this.startSender()}startSender(){this.senderInterval=setInterval((()=>{const e=this.buffer.shift();e&&this.wsInstance&&(console.log(c.decode(e)),this.wsInstance.send&&this.wsInstance.send(e))}),this.backpressureSendInterval)}slowDownSender(e){clearInterval(this.senderInterval),this.backpressureSendInterval=e,this.startSender()}addToBuffer(e){this.buffer.push(e)}setReConnect(e){e&&(this.reConnect=e)}async connect(){this.connectionStatus=u.Idle,await this.initWebsocketConnection(),await this.authenticate()}disconnect(){this.wsInstance&&this.wsInstance.close&&(this.wsInstance.close(),this.wsInstance=void 0)}async initWebsocketConnection(){return this.connectionStatus===u.Connected||(this.wsInstance=this.unifiedWebsocket(`${this.protocol}://${this.host}${this.url}`),!this.wsInstance||(this.wsInstance.onOpen=e=>{this._onOpen(e)},this.wsInstance.onMessage=e=>{this._onReceive(e)},this.wsInstance.onClose=e=>{this._onClose(e)},this.wsInstance.onError=e=>{this._onError(e)},await this.acknowledgeQueueManager.addToSentQueue(new h({initiate:u.Initiate})),!0))}async authenticate(){this.connectionStatus=u.Connecting;const{authToken:t}=this,n=o().setCommand(e.Authenticate,t);this.reConnect&&n.setCommand(e.Reconnect),this.send(c.encode(n)),await this.acknowledgeQueueManager.addToSentQueue(new h({authentication:u.Authentication}))}onOpen(e){this.callbackOnOpen=e}onReceiveMessage(e){this.callbackOnReceive=e}onClose(e){this.callbackOnClose=e}onError(e){this.callbackOnError=e}_onOpen(e){this.connectionStatus,u.Idle,this.callbackOnOpen(void 0,e)}ackCommand(t){if(t.getCommand(e.InitConnection)&&this.connectionStatus===u.Idle)return this.acknowledgeQueueManager.addToReceivedQueue(new h({initiate:u.Initiate}),null,{}),!0;if(t.getCommand(e.Acknowledge)&&this.connectionStatus===u.Connecting){this.connectionStatus=u.Connected,this.deviceTokenId=t.getCommand(e.Acknowledge);let n=null;return t.getCommand(e.Error)&&(n=new Error(t.getCommand(e.Error)),console.log("--error--",n)),this.acknowledgeQueueManager.addToReceivedQueue(new h({authentication:u.Authentication}),n,{}),!0}return(t.getCommand(e.Acknowledge)||!!t.getCommand(e.Error))&&(this.acknowledgeQueueManager.addToReceivedQueue(new h({topicName:t.getCommand(e.Topic),identifiers:t.getCommand(e.Identifier),presence:t.getCommand(e.Presence)}),null,{}),!0)}_onReceive(t){const n=t??new ArrayBuffer(0),s=c.decode(n);if(0===n.byteLength)return;if(console.log("onReceive",s),this.ackCommand(s))return;const i=s.getCommand(e.Identifier),a=s.getCommand(e.Presence);this.callbackOnReceive(void 0,{topicName:s.getCommand(e.Topic),presences:!0===a?[]:a,identifiers:!0===i?[]:i,data:s.payload})}_onClose(e){this.connectionStatus=u.Disconnected,this.callbackOnClose(e,void 0)}_onError(e){this.connectionStatus=u.Disconnected,this.callbackOnError(e,void 0)}send(e){this.addToBuffer(e)}heartbeat(){this.wsInstance&&this.send(new ArrayBuffer(0))}}class k{_expirePeriodInMs=18e4;expireTimestamp;key;constructor(e,t){this.key=e?.key,this._expirePeriodInMs=t||this._expirePeriodInMs,this.expireTimestamp=Date.now()+this.expirePeriodInMs}set expirePeriodInMs(e){this._expirePeriodInMs=e}get expirePeriodInMs(){return this._expirePeriodInMs}get isExpired(){return this.expireTimestamp<=Date.now()}expire(){this.expireTimestamp=Date.now()}}class R extends k{callbackFn;constructor(e,t){super(e,t),this.callbackFn=e?.callbackFn}}class T extends k{error;data;constructor(e,t){super(e,t),this.error=e?.error,this.data=e?.data}}class A{queues={sent:{},received:{}};_expirePeriodInMs;matchSentQueueWithReceiveQueue(){Object.keys(this.queues.sent).forEach((e=>{const t=this.queues.sent[e],n=this.queues.received[e];t?.callbackFn&&n&&(console.log("key",e),console.log("item",t),console.log("foundReceiveQueueItem",n),t.callbackFn(n.error,n.data),t.expire()),t?.isExpired&&(this.queues.sent[e]=null,delete this.queues.sent[e],this.queues.received[e]=null,delete this.queues.received[e])}))}cleanUpReceivedQueue(){Object.keys(this.queues.received).forEach((e=>{const t=this.queues.received[e];t?.isExpired&&(this.queues.received[e]=null,delete this.queues.received[e])}))}runQueue(){return setTimeout((()=>{this.matchSentQueueWithReceiveQueue(),this.cleanUpReceivedQueue(),this.runQueue()}),0),this}constructor(){this.runQueue()}expirePeriodInMs(e){return this._expirePeriodInMs=e,this}async addToSentQueue(e,t){return new Promise(((n,s)=>{const i=e.generateKey();this.queues.sent[i]=new R({key:i,callbackFn:(e,i)=>{t&&t(e,i),e?s(e):n(i)}},this._expirePeriodInMs)}))}addToReceivedQueue(e,t,n){const s=e.generateKey();this.queues.received[s]=new T({key:s,error:t,data:n},this._expirePeriodInMs)}getSentQueue(){return Object.values(this.queues.sent).filter((e=>e))}getReceivedQueue(){return Object.values(this.queues.received).filter((e=>e))}}class P{noLagClient;connectOptions;authToken;topics={};heartbeatTimer;defaultCheckConnectionInterval=1e4;checkConnectionInterval;heartBeatInterval=2e4;visibilityState=m.Visible;callbackOnReceive;callbackOnDisconnect=()=>{};callbackOnReconnect=()=>{};callbackOnReceivedError=()=>{};acknowledgeQueueManager=new A;constructor(e,t,n,s){this.checkConnectionInterval=s?.checkConnectionInterval??this.defaultCheckConnectionInterval,this.connectOptions=s??void 0,this.authToken=t,this.noLagClient=new I(e,this.authToken,this.acknowledgeQueueManager,this.connectOptions),this.onClose(),this.onError(),this.onReceiveMessage(),n?.disconnectOnNoVisibility&&this.onVisibilityChange()}get deviceTokenId(){return this.noLagClient?.deviceTokenId}startHeartbeat(){this.heartbeatTimer=setInterval((()=>{this.noLagClient.heartbeat()}),this.heartBeatInterval)}stopHeartbeat(){clearInterval(this.heartbeatTimer)}async initiate(e){return this.noLagClient.setReConnect(e),console.log("initiate"),await this.noLagClient.connect(),console.log("connect"),this.noLagClient.setReConnect(!1),this.startHeartbeat(),this}onVisibilityChange(){document.addEventListener&&document.addEventListener("visibilitychange",(async()=>{switch(this.visibilityState=document.visibilityState,this.visibilityState){case m.Hidden:this.noLagClient?.disconnect(),this.stopHeartbeat();break;case m.Visible:await this.initiate(!0)}}))}onReceiveMessage(){const e=this;this.noLagClient?.onReceiveMessage(((t,n)=>{const{topicName:s,identifiers:i}=n;console.log("onReceiveMessage",n),this.noLagClient&&!this.topics[s]&&(this.topics[s]=new y(e,this.noLagClient,s,{OR:i},this.acknowledgeQueueManager)),s&&this.topics[s]&&this.topics[s]?._onReceiveMessage(n),"function"==typeof this.callbackOnReceive&&this.callbackOnReceive(n)}))}reconnect(){this.stopHeartbeat(),setTimeout((async()=>{await this.initiate(!0),"function"==typeof this.callbackOnReconnect&&this.callbackOnReconnect()}),this.checkConnectionInterval)}canReconnect(){return this.visibilityState!==m.Hidden}doReconnect(){this.canReconnect()?this.reconnect():(this.stopHeartbeat(),"function"==typeof this.callbackOnDisconnect&&this.callbackOnDisconnect("connection retry timeout."))}onClose(){this.noLagClient.onClose(((e,t)=>{this.doReconnect(),"function"==typeof this.callbackOnReceivedError&&this.callbackOnReceivedError(e)}))}onError(){this.noLagClient.onError(((e,t)=>{"function"==typeof this.callbackOnReceivedError&&this.callbackOnReceivedError(e)}))}onReceive(e){this.callbackOnReceive=e}disconnect(){this.visibilityState=m.Hidden,this.noLagClient?.disconnect()}onDisconnect(e){this.callbackOnDisconnect=e}onReconnect(e){this.callbackOnReconnect=e}onErrors(e){this.callbackOnReceivedError=e}async getTopic(e,t){if(!this.topics[e]){const n=new y(this,this.noLagClient,e,{},this.acknowledgeQueueManager);await n.subscribe(((e,s)=>{t&&t(e,n)})),this.topics[e]=n}return this.topics[e]}unsubscribe(e){return!!this.topics[e]&&(this.topics[e]?.unsubscribe(),!0)}async subscribe(e,t={},n){if(!this.noLagClient)throw new Error("Can not subscribe to a Topic ");if(this.topics[e]){const n=this.topics[e];return await n.addIdentifiers(t),n}{const s=this.topics[e]=new y(this,this.noLagClient,e,t,this.acknowledgeQueueManager);return await s.subscribe(n),this.topics[e]}}publish(t,n,s=[]){if(this.noLagClient&&this.noLagClient.send){this.stopHeartbeat();const i=o().setCommand(e.Topic,t);s?.length>0&&i.setCommand(e.Identifier,s);const a=c.encode(i,n);console.log("publish global",a),this.noLagClient.send(a),this.startHeartbeat()}}get status(){return this.noLagClient?.connectionStatus??null}}const O=e=>{const t=new WebSocket(e);console.log("BROWSER!!!!"),t.binaryType=l.Arraybuffer;const n={send:e=>{t.send(e)},close:()=>{t.close()}};return t.onopen=e=>{n?.onOpen&&n.onOpen(e)},t.onclose=e=>{n?.onClose&&n.onClose(e)},t.onerror=e=>{n?.onError&&n.onError(e)},t.onmessage=e=>{n?.onMessage&&n.onMessage(e.data)},n};class S{routeNamespace="devices";parentRouteNamespace;tunnelId;requestParams;constructor(e,t,n){this.parentRouteNamespace=e,this.tunnelId=t,this.requestParams=n}async createDevice(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}`,{method:"POST",headers:this.requestParams.headers,body:JSON.stringify(e)});if(t.status>=400)throw await t.json();return t.json()}async getDeviceById(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"GET",headers:this.requestParams.headers});if(t.status>=400)throw await t.json();return t.json()}async listDevices(e){const t=C(e),n=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}${t}`,{method:"GET",headers:this.requestParams.headers});if(n.status>=400)throw await n.json();return n.json()}async updateDevice(e,t){const n=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"PATCH",headers:this.requestParams.headers,body:JSON.stringify(t)});if(n.status>=400)throw await n.json();return n.json()}async deleteDevice(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"DELETE",headers:this.requestParams.headers});if(t.status>=400)throw await t.json();return t.json()}}const $=async(t,n,s,i,a,r,h)=>{const u=o().setCommand(e.Topic,n).setCommand(e.Identifier,s).setCommand(e.AddAction),d=c.encode(u,t),l=`${h?.protocol}://${h?.wsHost}`;return await fetch(`${l}/${a}/${i}/publish`,{headers:r.headers,method:"POST",body:d}),!0};class N{routeNamespace="topics";parentRouteNamespace;tunnelId;requestParams;constructor(e,t,n){this.parentRouteNamespace=e,this.tunnelId=t,this.requestParams=n}async createTopic(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}`,{method:"POST",headers:this.requestParams.headers,body:JSON.stringify(e)});if(t.status>=400)throw await t.json();return t.json()}async getTopicById(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"GET",headers:this.requestParams.headers});if(t.status>=400)throw await t.json();return t.json()}async listTopics(e){const t=e?C(e):"",n=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}${t}`,{method:"GET",headers:this.requestParams.headers});if(n.status>=400)throw await n.json();return n.json()}async updateTopic(e,t){const n=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"PATCH",headers:this.requestParams.headers,body:JSON.stringify(t)});if(n.status>=400)throw await n.json();return n.json()}async deleteTopic(e){const t=await fetch(`${this.requestParams.baseURL}/${this.parentRouteNamespace}/${this.tunnelId}/${this.routeNamespace}/${e}`,{method:"DELETE",headers:this.requestParams.headers});if(t.status>=400)throw await t.json();return t.json()}}class q{routeNamespace="tunnels";tunnelId;requestParams;apiTunnel;constructor(e,t,n){this.tunnelId=t,this.requestParams=n,this.apiTunnel=e}get topics(){return new N(this.routeNamespace,this.tunnelId,this.requestParams)}get devices(){return new S(this.routeNamespace,this.tunnelId,this.requestParams)}async getTunnel(){const e=await fetch(`${this.requestParams.baseURL}/${this.routeNamespace}/${this.tunnelId}`,{method:"GET",headers:this.requestParams.headers});if(e.status>=400)throw await e.json();return e.json()}async updateTunnel(e){const t=await fetch(`${this.requestParams.baseURL}/${this.routeNamespace}/${this.tunnelId}`,{method:"PATCH",headers:this.requestParams.headers,body:JSON.stringify(e)});if(t.status>=400)throw await t.json();return t.json()}async deleteTunnel(){const e=await fetch(`${this.requestParams.baseURL}/${this.routeNamespace}/${this.tunnelId}`,{method:"DELETE",headers:this.requestParams.headers});if(e.status>=400)throw await e.json();return e.json()}async publish(e){const{data:t,topicName:n,identifiers:s}=e;return $(t,n,s,this.tunnelId,this.routeNamespace,this.requestParams,this.apiTunnel.connectOptions)}}class E{apiKey;connectOptions;requestParams;constructor(e,t){this.connectOptions={host:v.DefaultApiHost,protocol:v.DefaultHttpProtocol,url:v.DefaultApiUrl,wsUrl:v.DefaultWsUrl,wsHost:v.DefaultWsHost,apiKey:e,...t},this.apiKey=e,this.requestParams={baseURL:`${this.connectOptions?.protocol}://${this.connectOptions?.host}${this.connectOptions?.url}`,headers:{"X-API-Key":this.apiKey,"Content-Type":"application/json"}}}async tunnels(e){const t=new URLSearchParams(e).toString();return(await fetch(`${this.requestParams.baseURL}/tunnels${t?`?${t}`:""}`,{headers:this.requestParams.headers,method:"get"})).json()}async createTunnel(e){const t=await fetch(`${this.requestParams.baseURL}/tunnels`,{method:"POST",headers:this.requestParams.headers,body:JSON.stringify(e)});if(t.status>=400)throw await t.json();return t.json()}tunnel(e){return new q(this,e,this.requestParams)}}const L=(e,t)=>new E(e,t);console.log("load browserInstance");const j=async(e,t,n)=>new P(O,e,t,n).initiate();export{L as Api,v as CONSTANT,p as EAccessPermission,u as EConnectionStatus,l as EEncoding,d as EEnvironment,g as ELoadBalanceType,w as ESendAction,f as EStatus,b as ETopicType,m as EVisibilityState,c as NqlTransport,y as Topic,P as Tunnel,q as TunnelApi,S as TunnelDevice,$ as TunnelPublish,N as TunnelTopic,j as WebSocketClient,i as bufferToString,C as generateQueryString,n as stringToArrayBuffer,s as stringToBuffer,a as uint8ArrayToString};
//# sourceMappingURL=browserInstance.js.map
