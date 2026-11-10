/* LOOK 0.1.0 for Maxx: three.js r180 (MIT) + LOOK realism kit. */
(()=>{var{defineProperty:mu,getOwnPropertyNames:ex,getOwnPropertyDescriptor:tx}=Object,nx=Object.prototype.hasOwnProperty;function ix(e){return this[e]}var sx=(e)=>{var t=(Xp??=new WeakMap).get(e),n;if(t)return t;if(t=mu({},"__esModule",{value:!0}),e&&typeof e==="object"||typeof e==="function"){for(var i of ex(e))if(!nx.call(t,i))mu(t,i,{get:ix.bind(e,i),enumerable:!(n=tx(e,i))||n.enumerable})}return Xp.set(e,t),t},Xp;var rx=(e)=>e;function ox(e,t){this[e]=rx.bind(null,t)}var Io=(e,t)=>{for(var n in t)mu(e,n,{get:t[n],enumerable:!0,configurable:!0,set:ox.bind(t,n)})};var Ob={};Io(Ob,{default:()=>Bb});var Wn={};Io(Wn,{ACESFilmicToneMapping:()=>Zi,AddEquation:()=>Qn,AddOperation:()=>Af,AdditiveAnimationBlendMode:()=>y0,AdditiveBlending:()=>di,AgXToneMapping:()=>Ys,AlphaFormat:()=>Df,AlwaysCompare:()=>Wf,AlwaysDepth:()=>ea,AlwaysStencilFunc:()=>B0,AmbientLight:()=>zh,AnimationAction:()=>Zh,AnimationClip:()=>hi,AnimationLoader:()=>hd,AnimationMixer:()=>pr,AnimationObjectGroup:()=>Md,AnimationUtils:()=>ld,ArcCurve:()=>wh,ArrayCamera:()=>Xh,ArrowHelper:()=>Gd,AttachedBindMode:()=>i0,Audio:()=>qh,AudioAnalyser:()=>xd,AudioContext:()=>Ya,AudioListener:()=>gd,AudioLoader:()=>pd,AxesHelper:()=>Wd,BackSide:()=>vn,BasicDepthPacking:()=>_0,BasicShadowMap:()=>n0,BatchedMesh:()=>_h,Bone:()=>rr,BooleanKeyframeTrack:()=>es,Box2:()=>Id,Box3:()=>zt,Box3Helper:()=>Hd,BoxGeometry:()=>Dn,BoxHelper:()=>zd,BufferAttribute:()=>at,BufferGeometry:()=>Je,BufferGeometryLoader:()=>Vh,ByteType:()=>Rf,Cache:()=>li,Camera:()=>ro,CameraHelper:()=>Bd,CanvasTexture:()=>Pi,CapsuleGeometry:()=>Aa,CatmullRomCurve3:()=>bh,CineonToneMapping:()=>la,CircleGeometry:()=>Ms,ClampToEdgeWrapping:()=>ua,Clock:()=>bs,Color:()=>fe,ColorKeyframeTrack:()=>Ga,ColorManagement:()=>mt,CompressedArrayTexture:()=>sd,CompressedCubeTexture:()=>rd,CompressedTexture:()=>ho,CompressedTextureLoader:()=>ud,ConeGeometry:()=>ji,ConstantAlphaFactor:()=>wf,ConstantColorFactor:()=>Mf,Controls:()=>Xd,CubeCamera:()=>gh,CubeReflectionMapping:()=>Ks,CubeRefractionMapping:()=>ps,CubeTexture:()=>nr,CubeTextureLoader:()=>fd,CubeUVReflectionMapping:()=>$r,CubicBezierCurve:()=>Ca,CubicBezierCurve3:()=>Th,CubicInterpolant:()=>Uh,CullFaceBack:()=>Tc,CullFaceFront:()=>lf,CullFaceFrontBack:()=>t0,CullFaceNone:()=>af,Curve:()=>Gn,CurvePath:()=>Ah,CustomBlending:()=>Qo,CustomToneMapping:()=>ca,CylinderGeometry:()=>En,Cylindrical:()=>Cd,Data3DTexture:()=>io,DataArrayTexture:()=>no,DataTexture:()=>mn,DataTextureLoader:()=>dr,DataUtils:()=>mi,DecrementStencilOp:()=>A0,DecrementWrapStencilOp:()=>C0,DefaultLoadingManager:()=>cd,DepthFormat:()=>pa,DepthStencilFormat:()=>gs,DepthTexture:()=>lr,DetachedBindMode:()=>s0,DirectionalLight:()=>ws,DirectionalLightHelper:()=>Od,DiscreteInterpolant:()=>Fh,DodecahedronGeometry:()=>Ra,DoubleSide:()=>$t,DstAlphaFactor:()=>Jr,DstColorFactor:()=>jr,DynamicCopyUsage:()=>q0,DynamicDrawUsage:()=>H0,DynamicReadUsage:()=>W0,EdgesGeometry:()=>Sh,EllipseCurve:()=>uo,EqualCompare:()=>zf,EqualDepth:()=>na,EqualStencilFunc:()=>L0,EquirectangularReflectionMapping:()=>Js,EquirectangularRefractionMapping:()=>ha,Euler:()=>gn,EventDispatcher:()=>ei,ExternalTexture:()=>Ea,ExtrudeGeometry:()=>hr,FileLoader:()=>Pn,Float16BufferAttribute:()=>ed,Float32BufferAttribute:()=>ze,FloatType:()=>hn,Fog:()=>wa,FogExp2:()=>ir,FramebufferTexture:()=>id,FrontSide:()=>Yi,Frustum:()=>_s,FrustumArray:()=>Ta,GLBufferAttribute:()=>Td,GLSL1:()=>Z0,GLSL3:()=>dh,GreaterCompare:()=>Hf,GreaterDepth:()=>sa,GreaterEqualCompare:()=>Gf,GreaterEqualDepth:()=>ia,GreaterEqualStencilFunc:()=>O0,GreaterStencilFunc:()=>U0,GridHelper:()=>Ud,Group:()=>wt,HalfFloatType:()=>It,HemisphereLight:()=>go,HemisphereLightHelper:()=>Nd,IcosahedronGeometry:()=>La,ImageBitmapLoader:()=>qa,ImageLoader:()=>qs,ImageUtils:()=>mh,IncrementStencilOp:()=>E0,IncrementWrapStencilOp:()=>R0,InstancedBufferAttribute:()=>Tn,InstancedBufferGeometry:()=>Wh,InstancedInterleavedBuffer:()=>bd,InstancedMesh:()=>Ln,Int16BufferAttribute:()=>Qf,Int32BufferAttribute:()=>$f,Int8BufferAttribute:()=>Kf,IntType:()=>Cc,InterleavedBuffer:()=>Ii,InterleavedBufferAttribute:()=>Kn,Interpolant:()=>$i,InterpolateDiscrete:()=>ch,InterpolateLinear:()=>ya,InterpolateSmooth:()=>p0,InterpolationSamplingMode:()=>Q0,InterpolationSamplingType:()=>j0,InvertStencilOp:()=>I0,KeepStencilOp:()=>b0,KeyframeTrack:()=>Nn,LOD:()=>yh,LatheGeometry:()=>ur,Layers:()=>so,LessCompare:()=>Bf,LessDepth:()=>ta,LessEqualCompare:()=>fh,LessEqualDepth:()=>Qr,LessEqualStencilFunc:()=>N0,LessStencilFunc:()=>D0,Light:()=>Di,LightProbe:()=>Gh,Line:()=>Jn,Line3:()=>Pd,LineBasicMaterial:()=>tn,LineCurve:()=>Ia,LineCurve3:()=>Eh,LineDashedMaterial:()=>Nh,LineLoop:()=>lo,LineSegments:()=>_n,LinearFilter:()=>Kt,LinearInterpolant:()=>ka,LinearMipMapLinearFilter:()=>c0,LinearMipMapNearestFilter:()=>l0,LinearMipmapLinearFilter:()=>$n,LinearMipmapNearestFilter:()=>js,LinearSRGBColorSpace:()=>Dt,LinearToneMapping:()=>oa,LinearTransfer:()=>uh,Loader:()=>an,LoaderUtils:()=>ui,LoadingManager:()=>Wa,LoopOnce:()=>u0,LoopPingPong:()=>d0,LoopRepeat:()=>f0,MOUSE:()=>$m,Material:()=>Gt,MaterialLoader:()=>Xa,MathUtils:()=>er,Matrix2:()=>Jh,Matrix3:()=>ht,Matrix4:()=>He,MaxEquation:()=>ff,Mesh:()=>vt,MeshBasicMaterial:()=>on,MeshDepthMaterial:()=>za,MeshDistanceMaterial:()=>Ha,MeshLambertMaterial:()=>Dh,MeshMatcapMaterial:()=>Lh,MeshNormalMaterial:()=>mo,MeshPhongMaterial:()=>Ih,MeshPhysicalMaterial:()=>Ht,MeshStandardMaterial:()=>Pt,MeshToonMaterial:()=>Ph,MinEquation:()=>uf,MirroredRepeatWrapping:()=>fa,MixOperation:()=>Ef,MultiplyBlending:()=>Rc,MultiplyOperation:()=>Tf,NearestFilter:()=>xn,NearestMipMapLinearFilter:()=>a0,NearestMipMapNearestFilter:()=>o0,NearestMipmapLinearFilter:()=>ms,NearestMipmapNearestFilter:()=>da,NeutralToneMapping:()=>Zs,NeverCompare:()=>Of,NeverDepth:()=>$o,NeverStencilFunc:()=>P0,NoBlending:()=>Zt,NoColorSpace:()=>xs,NoToneMapping:()=>Ci,NormalAnimationBlendMode:()=>x0,NormalBlending:()=>fs,NotEqualCompare:()=>kf,NotEqualDepth:()=>ra,NotEqualStencilFunc:()=>F0,NumberKeyframeTrack:()=>Ri,Object3D:()=>dt,ObjectLoader:()=>dd,ObjectSpaceNormalMap:()=>Ff,OctahedronGeometry:()=>fo,OneFactor:()=>df,OneMinusConstantAlphaFactor:()=>bf,OneMinusConstantColorFactor:()=>Sf,OneMinusDstAlphaFactor:()=>xf,OneMinusDstColorFactor:()=>yf,OneMinusSrcAlphaFactor:()=>vf,OneMinusSrcColorFactor:()=>mf,OrthographicCamera:()=>Li,PCFShadowMap:()=>Ec,PCFSoftShadowMap:()=>jo,PMREMGenerator:()=>_o,Path:()=>Zr,PerspectiveCamera:()=>Ot,Plane:()=>Ei,PlaneGeometry:()=>Qt,PlaneHelper:()=>kd,PointLight:()=>vo,PointLightHelper:()=>Ld,Points:()=>co,PointsMaterial:()=>ar,PolarGridHelper:()=>Fd,PolyhedronGeometry:()=>Qi,PositionalAudio:()=>vd,PropertyBinding:()=>St,PropertyMixer:()=>Yh,QuadraticBezierCurve:()=>Pa,QuadraticBezierCurve3:()=>cr,Quaternion:()=>Nt,QuaternionKeyframeTrack:()=>ti,QuaternionLinearInterpolant:()=>Oh,RED_GREEN_RGTC2_Format:()=>ah,RED_RGTC1_Format:()=>rh,REVISION:()=>of,RGBADepthPacking:()=>Nf,RGBAFormat:()=>Jt,RGBAIntegerFormat:()=>Nc,RGBA_ASTC_10x10_Format:()=>$c,RGBA_ASTC_10x5_Format:()=>Jc,RGBA_ASTC_10x6_Format:()=>jc,RGBA_ASTC_10x8_Format:()=>Qc,RGBA_ASTC_12x10_Format:()=>eh,RGBA_ASTC_12x12_Format:()=>th,RGBA_ASTC_4x4_Format:()=>Gc,RGBA_ASTC_5x4_Format:()=>Wc,RGBA_ASTC_5x5_Format:()=>Vc,RGBA_ASTC_6x5_Format:()=>Xc,RGBA_ASTC_6x6_Format:()=>qc,RGBA_ASTC_8x5_Format:()=>Yc,RGBA_ASTC_8x6_Format:()=>Zc,RGBA_ASTC_8x8_Format:()=>Kc,RGBA_BPTC_Format:()=>nh,RGBA_ETC2_EAC_Format:()=>kc,RGBA_PVRTC_2BPPV1_Format:()=>Bc,RGBA_PVRTC_4BPPV1_Format:()=>Oc,RGBA_S3TC_DXT1_Format:()=>ga,RGBA_S3TC_DXT3_Format:()=>va,RGBA_S3TC_DXT5_Format:()=>xa,RGBDepthPacking:()=>M0,RGBFormat:()=>Lf,RGBIntegerFormat:()=>h0,RGB_BPTC_SIGNED_Format:()=>ih,RGB_BPTC_UNSIGNED_Format:()=>sh,RGB_ETC1_Format:()=>zc,RGB_ETC2_Format:()=>Hc,RGB_PVRTC_2BPPV1_Format:()=>Fc,RGB_PVRTC_4BPPV1_Format:()=>Uc,RGB_S3TC_DXT1_Format:()=>ma,RGDepthPacking:()=>S0,RGFormat:()=>Ji,RGIntegerFormat:()=>Lc,RawShaderMaterial:()=>po,Ray:()=>ys,Raycaster:()=>Ed,RectAreaLight:()=>Hh,RedFormat:()=>vs,RedIntegerFormat:()=>Dc,ReinhardToneMapping:()=>aa,RenderTarget:()=>_a,RenderTarget3D:()=>Sd,RepeatWrapping:()=>cn,ReplaceStencilOp:()=>T0,ReverseSubtractEquation:()=>hf,RingGeometry:()=>Na,SIGNED_RED_GREEN_RGTC2_Format:()=>lh,SIGNED_RED_RGTC1_Format:()=>oh,SRGBColorSpace:()=>en,SRGBTransfer:()=>Ct,Scene:()=>sr,ShaderChunk:()=>pt,ShaderLib:()=>gi,ShaderMaterial:()=>xt,ShadowMaterial:()=>Ch,Shape:()=>ci,ShapeGeometry:()=>Ua,ShapePath:()=>Vd,ShapeUtils:()=>Zn,ShortType:()=>Cf,Skeleton:()=>or,SkeletonHelper:()=>Za,SkinnedMesh:()=>ao,Source:()=>Ai,Sphere:()=>Xt,SphereGeometry:()=>un,Spherical:()=>Rd,SphericalHarmonics3:()=>kh,SplineCurve:()=>Da,SpotLight:()=>Ss,SpotLightHelper:()=>Dd,Sprite:()=>xh,SpriteMaterial:()=>ba,SrcAlphaFactor:()=>gf,SrcAlphaSaturateFactor:()=>_f,SrcColorFactor:()=>pf,StaticCopyUsage:()=>X0,StaticDrawUsage:()=>z0,StaticReadUsage:()=>G0,StereoCamera:()=>md,StreamCopyUsage:()=>Y0,StreamDrawUsage:()=>k0,StreamReadUsage:()=>V0,StringKeyframeTrack:()=>ts,SubtractEquation:()=>cf,SubtractiveBlending:()=>Ac,TOUCH:()=>e0,TangentSpaceNormalMap:()=>Uf,TetrahedronGeometry:()=>Fa,Texture:()=>Rt,TextureLoader:()=>Va,TextureUtils:()=>qd,Timer:()=>Ad,TimestampQuery:()=>J0,TorusGeometry:()=>Oa,TorusKnotGeometry:()=>Ba,Triangle:()=>bn,TriangleFanDrawMode:()=>$s,TriangleStripDrawMode:()=>to,TrianglesDrawMode:()=>hh,TubeGeometry:()=>fr,UVMapping:()=>r0,Uint16BufferAttribute:()=>Ma,Uint32BufferAttribute:()=>Sa,Uint8BufferAttribute:()=>Jf,Uint8ClampedBufferAttribute:()=>jf,Uniform:()=>Kh,UniformsGroup:()=>wd,UniformsLib:()=>Be,UniformsUtils:()=>jt,UnsignedByteType:()=>pi,UnsignedInt101111Type:()=>Pf,UnsignedInt248Type:()=>Ki,UnsignedInt5999Type:()=>If,UnsignedIntType:()=>Qs,UnsignedShort4444Type:()=>Ic,UnsignedShort5551Type:()=>Pc,UnsignedShortType:()=>eo,VSMShadowMap:()=>fi,Vector2:()=>se,Vector3:()=>I,Vector4:()=>bt,VectorKeyframeTrack:()=>jn,VideoFrameTexture:()=>nd,VideoTexture:()=>Mh,WebGL3DRenderTarget:()=>Zf,WebGLArrayRenderTarget:()=>Yf,WebGLCoordinateSystem:()=>ph,WebGLCubeRenderTarget:()=>vh,WebGLRenderTarget:()=>Ft,WebGLRenderer:()=>nu,WebGLUtils:()=>Kg,WebGPUCoordinateSystem:()=>K0,WebXRController:()=>oo,WireframeGeometry:()=>Rh,WrapAroundEnding:()=>v0,ZeroCurvatureEnding:()=>m0,ZeroFactor:()=>ds,ZeroSlopeEnding:()=>g0,ZeroStencilOp:()=>w0,createCanvasElement:()=>qf});var np={};Io(np,{computeMikkTSpaceTangents:()=>Ew,computeMorphedAttributes:()=>Dw,deepCloneAttribute:()=>Aw,deinterleaveAttribute:()=>iu,deinterleaveGeometry:()=>Cw,estimateBytesUsed:()=>Iw,interleaveAttributes:()=>Rw,mergeAttributes:()=>tp,mergeGeometries:()=>ja,mergeGroups:()=>Lw,mergeVertices:()=>Pw,toCreasedNormals:()=>Nw,toTrianglesDrawMode:()=>su});var gp={};Io(gp,{clone:()=>cb,retarget:()=>Fv,retargetClip:()=>lb});var cu={};Io(cu,{asphalt:()=>ll,brick:()=>Mp,cached:()=>ln,carPaint:()=>fl,chrome:()=>pl,concrete:()=>_p,dirt:()=>Ep,fabric:()=>bo,glass:()=>dl,grass:()=>Tp,gravel:()=>bp,lightLens:()=>As,metal:()=>wp,neon:()=>Rp,noiseTexture:()=>ml,pavement:()=>cl,plaster:()=>Sp,rng:()=>is,roadPaint:()=>To,rubber:()=>Ap,skin:()=>ul,wood:()=>hl});var of="180",$m={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},e0={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},af=0,Tc=1,lf=2,t0=3,n0=0,Ec=1,jo=2,fi=3,Yi=0,vn=1,$t=2,Zt=0,fs=1,di=2,Ac=3,Rc=4,Qo=5,Qn=100,cf=101,hf=102,uf=103,ff=104,ds=200,df=201,pf=202,mf=203,gf=204,vf=205,Jr=206,xf=207,jr=208,yf=209,_f=210,Mf=211,Sf=212,wf=213,bf=214,$o=0,ea=1,ta=2,Qr=3,na=4,ia=5,sa=6,ra=7,Tf=0,Ef=1,Af=2,Ci=0,oa=1,aa=2,la=3,Zi=4,ca=5,Ys=6,Zs=7,i0="attached",s0="detached",r0=300,Ks=301,ps=302,Js=303,ha=304,$r=306,cn=1000,ua=1001,fa=1002,xn=1003,da=1004,o0=1004,ms=1005,a0=1005,Kt=1006,js=1007,l0=1007,$n=1008,c0=1008,pi=1009,Rf=1010,Cf=1011,eo=1012,Cc=1013,Qs=1014,hn=1015,It=1016,Ic=1017,Pc=1018,Ki=1020,If=35902,Pf=35899,Df=1021,Lf=1022,Jt=1023,pa=1026,gs=1027,vs=1028,Dc=1029,Ji=1030,Lc=1031,h0=1032,Nc=1033,ma=33776,ga=33777,va=33778,xa=33779,Uc=35840,Fc=35841,Oc=35842,Bc=35843,zc=36196,Hc=37492,kc=37496,Gc=37808,Wc=37809,Vc=37810,Xc=37811,qc=37812,Yc=37813,Zc=37814,Kc=37815,Jc=37816,jc=37817,Qc=37818,$c=37819,eh=37820,th=37821,nh=36492,ih=36494,sh=36495,rh=36283,oh=36284,ah=36285,lh=36286,u0=2200,f0=2201,d0=2202,ch=2300,ya=2301,p0=2302,m0=2400,g0=2401,v0=2402,x0=2500,y0=2501,hh=0,to=1,$s=2,_0=3200,Nf=3201,M0=3202,S0=3203,Uf=0,Ff=1,xs="",en="srgb",Dt="srgb-linear",uh="linear",Ct="srgb",w0=0,b0=7680,T0=7681,E0=7682,A0=7683,R0=34055,C0=34056,I0=5386,P0=512,D0=513,L0=514,N0=515,U0=516,F0=517,O0=518,B0=519,Of=512,Bf=513,zf=514,fh=515,Hf=516,kf=517,Gf=518,Wf=519,z0=35044,H0=35048,k0=35040,G0=35045,W0=35049,V0=35041,X0=35046,q0=35050,Y0=35042,Z0="100",dh="300 es",ph=2000,K0=2001,J0={COMPUTE:"compute",RENDER:"render"},j0={PERSPECTIVE:"perspective",LINEAR:"linear",FLAT:"flat"},Q0={NORMAL:"normal",CENTROID:"centroid",SAMPLE:"sample",FIRST:"first",EITHER:"either"};class ei{addEventListener(e,t){if(this._listeners===void 0)this._listeners={};let n=this._listeners;if(n[e]===void 0)n[e]=[];if(n[e].indexOf(t)===-1)n[e].push(t)}hasEventListener(e,t){let n=this._listeners;if(n===void 0)return!1;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let s=i.indexOf(t);if(s!==-1)i.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,e);e.target=null}}}var fn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qp=1234567,Ws=Math.PI/180,Vs=180/Math.PI;function kn(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(fn[e&255]+fn[e>>8&255]+fn[e>>16&255]+fn[e>>24&255]+"-"+fn[t&255]+fn[t>>8&255]+"-"+fn[t>>16&15|64]+fn[t>>24&255]+"-"+fn[n&63|128]+fn[n>>8&255]+"-"+fn[n>>16&255]+fn[n>>24&255]+fn[i&255]+fn[i>>8&255]+fn[i>>16&255]+fn[i>>24&255]).toLowerCase()}function it(e,t,n){return Math.max(t,Math.min(n,e))}function Vf(e,t){return(e%t+t)%t}function ax(e,t,n,i,s){return i+(e-t)*(s-i)/(n-t)}function lx(e,t,n){if(e!==t)return(n-e)/(t-e);else return 0}function Xo(e,t,n){return(1-n)*e+n*t}function cx(e,t,n,i){return Xo(e,t,1-Math.exp(-n*i))}function hx(e,t=1){return t-Math.abs(Vf(e,t*2)-t)}function ux(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*(3-2*e)}function fx(e,t,n){if(e<=t)return 0;if(e>=n)return 1;return e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10)}function dx(e,t){return e+Math.floor(Math.random()*(t-e+1))}function px(e,t){return e+Math.random()*(t-e)}function mx(e){return e*(0.5-Math.random())}function gx(e){if(e!==void 0)qp=e;let t=qp+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function vx(e){return e*Ws}function xx(e){return e*Vs}function yx(e){return(e&e-1)===0&&e!==0}function _x(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function Mx(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function Sx(e,t,n,i,s){let{cos:r,sin:o}=Math,a=r(n/2),l=o(n/2),c=r((t+i)/2),h=o((t+i)/2),u=r((t-i)/2),f=o((t-i)/2),d=r((i-t)/2),g=o((i-t)/2);switch(s){case"XYX":e.set(a*h,l*u,l*f,a*c);break;case"YZY":e.set(l*f,a*h,l*u,a*c);break;case"ZXZ":e.set(l*u,l*f,a*h,a*c);break;case"XZX":e.set(a*h,l*g,l*d,a*c);break;case"YXY":e.set(l*d,a*h,l*g,a*c);break;case"ZYZ":e.set(l*g,l*d,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function wn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error("Invalid component type.")}}function ft(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error("Invalid component type.")}}var er={DEG2RAD:Ws,RAD2DEG:Vs,generateUUID:kn,clamp:it,euclideanModulo:Vf,mapLinear:ax,inverseLerp:lx,lerp:Xo,damp:cx,pingpong:hx,smoothstep:ux,smootherstep:fx,randInt:dx,randFloat:px,randFloatSpread:mx,seededRandom:gx,degToRad:vx,radToDeg:xx,isPowerOfTwo:yx,ceilPowerOfTwo:_x,floorPowerOfTwo:Mx,setQuaternionFromProperEuler:Sx,normalize:ft,denormalize:wn};class se{constructor(e=0,t=0){se.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,r=this.y-e.y;return this.x=s*n-r*i+e.x,this.y=s*i+r*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Nt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,r,o){let a=n[i+0],l=n[i+1],c=n[i+2],h=n[i+3],u=s[r+0],f=s[r+1],d=s[r+2],g=s[r+3];if(o===0){e[t+0]=a,e[t+1]=l,e[t+2]=c,e[t+3]=h;return}if(o===1){e[t+0]=u,e[t+1]=f,e[t+2]=d,e[t+3]=g;return}if(h!==g||a!==u||l!==f||c!==d){let x=1-o,m=a*u+l*f+c*d+h*g,p=m>=0?1:-1,M=1-m*m;if(M>Number.EPSILON){let S=Math.sqrt(M),C=Math.atan2(S,m*p);x=Math.sin(x*C)/S,o=Math.sin(o*C)/S}let y=o*p;if(a=a*x+u*y,l=l*x+f*y,c=c*x+d*y,h=h*x+g*y,x===1-o){let S=1/Math.sqrt(a*a+l*l+c*c+h*h);a*=S,l*=S,c*=S,h*=S}}e[t]=a,e[t+1]=l,e[t+2]=c,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,i,s,r){let o=n[i],a=n[i+1],l=n[i+2],c=n[i+3],h=s[r],u=s[r+1],f=s[r+2],d=s[r+3];return e[t]=o*d+c*h+a*f-l*u,e[t+1]=a*d+c*u+l*h-o*f,e[t+2]=l*d+c*f+o*u-a*h,e[t+3]=c*d-o*h-a*u-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let{_x:n,_y:i,_z:s,_order:r}=e,{cos:o,sin:a}=Math,l=o(n/2),c=o(i/2),h=o(s/2),u=a(n/2),f=a(i/2),d=a(s/2);switch(r){case"XYZ":this._x=u*c*h+l*f*d,this._y=l*f*h-u*c*d,this._z=l*c*d+u*f*h,this._w=l*c*h-u*f*d;break;case"YXZ":this._x=u*c*h+l*f*d,this._y=l*f*h-u*c*d,this._z=l*c*d-u*f*h,this._w=l*c*h+u*f*d;break;case"ZXY":this._x=u*c*h-l*f*d,this._y=l*f*h+u*c*d,this._z=l*c*d+u*f*h,this._w=l*c*h-u*f*d;break;case"ZYX":this._x=u*c*h-l*f*d,this._y=l*f*h+u*c*d,this._z=l*c*d-u*f*h,this._w=l*c*h+u*f*d;break;case"YZX":this._x=u*c*h+l*f*d,this._y=l*f*h+u*c*d,this._z=l*c*d-u*f*h,this._w=l*c*h-u*f*d;break;case"XZY":this._x=u*c*h-l*f*d,this._y=l*f*h-u*c*d,this._z=l*c*d+u*f*h,this._w=l*c*h+u*f*d;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+r)}if(t===!0)this._onChangeCallback();return this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],s=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10],u=n+o+h;if(u>0){let f=0.5/Math.sqrt(u+1);this._w=0.25/f,this._x=(c-a)*f,this._y=(s-l)*f,this._z=(r-i)*f}else if(n>o&&n>h){let f=2*Math.sqrt(1+n-o-h);this._w=(c-a)/f,this._x=0.25*f,this._y=(i+r)/f,this._z=(s+l)/f}else if(o>h){let f=2*Math.sqrt(1+o-n-h);this._w=(s-l)/f,this._x=(i+r)/f,this._y=0.25*f,this._z=(a+c)/f}else{let f=2*Math.sqrt(1+h-n-o);this._w=(r-i)/f,this._x=(s+l)/f,this._y=(a+c)/f,this._z=0.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;if(n<0.00000001)if(n=0,Math.abs(e.x)>Math.abs(e.z))this._x=-e.y,this._y=e.x,this._z=0,this._w=n;else this._x=0,this._y=-e.z,this._z=e.y,this._w=n;else this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n;return this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(it(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();if(e===0)this._x=0,this._y=0,this._z=0,this._w=1;else e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e;return this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let{_x:n,_y:i,_z:s,_w:r}=e,{_x:o,_y:a,_z:l,_w:c}=t;return this._x=n*c+r*o+i*l-s*a,this._y=i*c+r*a+s*o-n*l,this._z=s*c+r*l+n*a-i*o,this._w=r*c-n*o-i*a-s*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,i=this._y,s=this._z,r=this._w,o=r*e._w+n*e._x+i*e._y+s*e._z;if(o<0)this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o;else this.copy(e);if(o>=1)return this._w=r,this._x=n,this._y=i,this._z=s,this;let a=1-o*o;if(a<=Number.EPSILON){let f=1-t;return this._w=f*r+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}let l=Math.sqrt(a),c=Math.atan2(l,o),h=Math.sin((1-t)*c)/l,u=Math.sin(t*c)/l;return this._w=r*h+this._w*u,this._x=n*h+this._x*u,this._y=i*h+this._y*u,this._z=s*h+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,n=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){if(n===void 0)n=this.z;return this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Yp.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Yp.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=e.elements,r=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,{x:s,y:r,z:o,w:a}=e,l=2*(r*i-o*n),c=2*(o*t-s*i),h=2*(s*n-r*t);return this.x=t+a*l+r*h-o*c,this.y=n+a*c+o*l-s*h,this.z=i+a*h+s*c-r*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let{x:n,y:i,z:s}=e,{x:r,y:o,z:a}=t;return this.x=i*a-s*o,this.y=s*r-n*a,this.z=n*o-i*r,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return gu.copy(this).projectOnVector(e),this.sub(gu)}reflect(e){return this.sub(gu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var gu=new I,Yp=new Nt;class ht{constructor(e,t,n,i,s,r,o,a,l){if(ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,o,a,l)}set(e,t,n,i,s,r,o,a,l){let c=this.elements;return c[0]=e,c[1]=i,c[2]=o,c[3]=t,c[4]=s,c[5]=a,c[6]=n,c[7]=r,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],o=n[3],a=n[6],l=n[1],c=n[4],h=n[7],u=n[2],f=n[5],d=n[8],g=i[0],x=i[3],m=i[6],p=i[1],M=i[4],y=i[7],S=i[2],C=i[5],R=i[8];return s[0]=r*g+o*p+a*S,s[3]=r*x+o*M+a*C,s[6]=r*m+o*y+a*R,s[1]=l*g+c*p+h*S,s[4]=l*x+c*M+h*C,s[7]=l*m+c*y+h*R,s[2]=u*g+f*p+d*S,s[5]=u*x+f*M+d*C,s[8]=u*m+f*y+d*R,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],o=e[5],a=e[6],l=e[7],c=e[8];return t*r*c-t*o*l-n*s*c+n*o*a+i*s*l-i*r*a}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],o=e[5],a=e[6],l=e[7],c=e[8],h=c*r-o*l,u=o*a-c*s,f=l*s-r*a,d=t*h+n*u+i*f;if(d===0)return this.set(0,0,0,0,0,0,0,0,0);let g=1/d;return e[0]=h*g,e[1]=(i*l-c*n)*g,e[2]=(o*n-i*r)*g,e[3]=u*g,e[4]=(c*t-i*a)*g,e[5]=(i*s-o*t)*g,e[6]=f*g,e[7]=(n*a-l*t)*g,e[8]=(r*t-n*s)*g,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,r,o){let a=Math.cos(s),l=Math.sin(s);return this.set(n*a,n*l,-n*(a*r+l*o)+r+e,-i*l,i*a,-i*(-l*r+a*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(vu.makeScale(e,t)),this}rotate(e){return this.premultiply(vu.makeRotation(-e)),this}translate(e,t){return this.premultiply(vu.makeTranslation(e,t)),this}makeTranslation(e,t){if(e.isVector2)this.set(1,0,e.x,0,1,e.y,0,0,1);else this.set(1,0,e,0,1,t,0,0,1);return this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}var vu=new ht;function Xf(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}var wx={Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array};function Vr(e,t){return new wx[e](t)}function qr(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function qf(){let e=qr("canvas");return e.style.display="block",e}var Zp={};function Yr(e){if(e in Zp)return;Zp[e]=!0,console.warn(e)}function $0(e,t,n){return new Promise(function(i,s){function r(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}var Kp=new ht().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Jp=new ht().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function bx(){let e={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(s,r,o){if(this.enabled===!1||r===o||!r||!o)return s;if(this.spaces[r].transfer==="srgb")s.r=qi(s.r),s.g=qi(s.g),s.b=qi(s.b);if(this.spaces[r].primaries!==this.spaces[o].primaries)s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ);if(this.spaces[o].transfer==="srgb")s.r=Xr(s.r),s.g=Xr(s.g),s.b=Xr(s.b);return s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){if(s==="")return"linear";return this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Yr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Yr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,r)}},t=[0.64,0.33,0.3,0.6,0.15,0.06],n=[0.2126,0.7152,0.0722],i=[0.3127,0.329];return e.define({["srgb-linear"]:{primaries:t,whitePoint:i,transfer:"linear",toXYZ:Kp,fromXYZ:Jp,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:t,whitePoint:i,transfer:"srgb",toXYZ:Kp,fromXYZ:Jp,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),e}var mt=bx();function qi(e){return e<0.04045?e*0.0773993808:Math.pow(e*0.9478672986+0.0521327014,2.4)}function Xr(e){return e<0.0031308?e*12.92:1.055*Math.pow(e,0.41666)-0.055}var br;class mh{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src))return e.src;if(typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{if(br===void 0)br=qr("canvas");br.width=e.width,br.height=e.height;let i=br.getContext("2d");if(e instanceof ImageData)i.putImageData(e,0,0);else i.drawImage(e,0,0,e.width,e.height);n=br}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=qr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=qi(s[r]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)if(t instanceof Uint8Array||t instanceof Uint8ClampedArray)t[n]=Math.floor(qi(t[n]/255)*255);else t[n]=qi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}var Tx=0;class Ai{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Tx++}),this.uuid=kn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;if(typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement)e.set(t.videoWidth,t.videoHeight,0);else if(t instanceof VideoFrame)e.set(t.displayHeight,t.displayWidth,0);else if(t!==null)e.set(t.width,t.height,t.depth||0);else e.set(0,0,0);return e}set needsUpdate(e){if(e===!0)this.version++}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,o=i.length;r<o;r++)if(i[r].isDataTexture)s.push(xu(i[r].image));else s.push(xu(i[r]))}else s=xu(i);n.url=s}if(!t)e.images[this.uuid]=n;return n}}function xu(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap)return mh.getDataURL(e);else if(e.data)return{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name};else return console.warn("THREE.Texture: Unable to serialize Texture."),{}}var Ex=0,yu=new I;class Rt extends ei{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=1001,i=1001,s=1006,r=1008,o=1023,a=1009,l=Rt.DEFAULT_ANISOTROPY,c=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Ex++}),this.uuid=kn(),this.name="",this.source=new Ai(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=a,this.offset=new se(0,0),this.repeat=new se(1,1),this.center=new se(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=e&&e.depth&&e.depth>1?!0:!1,this.pmremVersion=0}get width(){return this.source.getSize(yu).x}get height(){return this.source.getSize(yu).y}get depth(){return this.source.getSize(yu).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}if(i&&n&&(i.isVector2&&n.isVector2))i.copy(n);else if(i&&n&&(i.isVector3&&n.isVector3))i.copy(n);else if(i&&n&&(i.isMatrix3&&n.isMatrix3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)n.userData=this.userData;if(!t)e.textures[this.uuid]=n;return n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1000:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.x)%2)===1)e.x=Math.ceil(e.x)-e.x;else e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1000:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(e.y)%2)===1)e.y=Math.ceil(e.y)-e.y;else e.y=e.y-Math.floor(e.y);break}if(this.flipY)e.y=1-e.y;return e}set needsUpdate(e){if(e===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(e){if(e===!0)this.pmremVersion++}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=300;Rt.DEFAULT_ANISOTROPY=1;class bt{constructor(e=0,t=0,n=0,i=1){bt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,s=this.w,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*t+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*t+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*t+r[7]*n+r[11]*i+r[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);if(t<0.0001)this.x=1,this.y=0,this.z=0;else this.x=e.x/t,this.y=e.y/t,this.z=e.z/t;return this}setAxisAngleFromRotationMatrix(e){let t,n,i,s,r=0.01,o=0.1,a=e.elements,l=a[0],c=a[4],h=a[8],u=a[1],f=a[5],d=a[9],g=a[2],x=a[6],m=a[10];if(Math.abs(c-u)<0.01&&Math.abs(h-g)<0.01&&Math.abs(d-x)<0.01){if(Math.abs(c+u)<0.1&&Math.abs(h+g)<0.1&&Math.abs(d+x)<0.1&&Math.abs(l+f+m-3)<0.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(l+1)/2,y=(f+1)/2,S=(m+1)/2,C=(c+u)/4,R=(h+g)/4,E=(d+x)/4;if(M>y&&M>S)if(M<0.01)n=0,i=0.707106781,s=0.707106781;else n=Math.sqrt(M),i=C/n,s=R/n;else if(y>S)if(y<0.01)n=0.707106781,i=0,s=0.707106781;else i=Math.sqrt(y),n=C/i,s=E/i;else if(S<0.01)n=0.707106781,i=0.707106781,s=0;else s=Math.sqrt(S),n=R/s,i=E/s;return this.set(n,i,s,t),this}let p=Math.sqrt((x-d)*(x-d)+(h-g)*(h-g)+(u-c)*(u-c));if(Math.abs(p)<0.001)p=1;return this.x=(x-d)/p,this.y=(h-g)/p,this.z=(u-c)/p,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this.w=it(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this.w=it(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class _a extends ei{constructor(e=1,t=1,n={}){super();n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t);let i={width:e,height:t,depth:n.depth},s=new Rt(i);this.textures=[];let r=n.count;for(let o=0;o<r;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(e.mapping!==void 0)t.mapping=e.mapping;if(e.wrapS!==void 0)t.wrapS=e.wrapS;if(e.wrapT!==void 0)t.wrapT=e.wrapT;if(e.wrapR!==void 0)t.wrapR=e.wrapR;if(e.magFilter!==void 0)t.magFilter=e.magFilter;if(e.minFilter!==void 0)t.minFilter=e.minFilter;if(e.format!==void 0)t.format=e.format;if(e.type!==void 0)t.type=e.type;if(e.anisotropy!==void 0)t.anisotropy=e.anisotropy;if(e.colorSpace!==void 0)t.colorSpace=e.colorSpace;if(e.flipY!==void 0)t.flipY=e.flipY;if(e.generateMipmaps!==void 0)t.generateMipmaps=e.generateMipmaps;if(e.internalFormat!==void 0)t.internalFormat=e.internalFormat;for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){if(this._depthTexture!==null)this._depthTexture.renderTarget=null;if(e!==null)e.renderTarget=this;this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ai(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null)this.depthTexture=e.depthTexture.clone();return this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ft extends _a{constructor(e=1,t=1,n={}){super(e,t,n);this.isWebGLRenderTarget=!0}}class no extends Rt{constructor(e=null,t=1,n=1,i=1){super(null);this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Yf extends Ft{constructor(e=1,t=1,n=1,i={}){super(e,t,i);this.isWebGLArrayRenderTarget=!0,this.depth=n,this.texture=new no(null,e,t,n),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}}class io extends Rt{constructor(e=null,t=1,n=1,i=1){super(null);this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Zf extends Ft{constructor(e=1,t=1,n=1,i={}){super(e,t,i);this.isWebGL3DRenderTarget=!0,this.depth=n,this.texture=new io(null,e,t,n),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}}class zt{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(ri.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(ri.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=ri.copy(t).multiplyScalar(0.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let r=0,o=s.count;r<o;r++){if(e.isMesh===!0)e.getVertexPosition(r,ri);else ri.fromBufferAttribute(s,r);ri.applyMatrix4(e.matrixWorld),this.expandByPoint(ri)}else{if(e.boundingBox!==void 0){if(e.boundingBox===null)e.computeBoundingBox();Nl.copy(e.boundingBox)}else{if(n.boundingBox===null)n.computeBoundingBox();Nl.copy(n.boundingBox)}Nl.applyMatrix4(e.matrixWorld),this.union(Nl)}}let i=e.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ri),ri.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;if(e.normal.x>0)t=e.normal.x*this.min.x,n=e.normal.x*this.max.x;else t=e.normal.x*this.max.x,n=e.normal.x*this.min.x;if(e.normal.y>0)t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y;else t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y;if(e.normal.z>0)t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z;else t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z;return t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Po),Ul.subVectors(this.max,Po),Tr.subVectors(e.a,Po),Er.subVectors(e.b,Po),Ar.subVectors(e.c,Po),rs.subVectors(Er,Tr),os.subVectors(Ar,Er),Is.subVectors(Tr,Ar);let t=[0,-rs.z,rs.y,0,-os.z,os.y,0,-Is.z,Is.y,rs.z,0,-rs.x,os.z,0,-os.x,Is.z,0,-Is.x,-rs.y,rs.x,0,-os.y,os.x,0,-Is.y,Is.x,0];if(!_u(t,Tr,Er,Ar,Ul))return!1;if(t=[1,0,0,0,1,0,0,0,1],!_u(t,Tr,Er,Ar,Ul))return!1;return Fl.crossVectors(rs,os),t=[Fl.x,Fl.y,Fl.z],_u(t,Tr,Er,Ar,Ul)}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ri).distanceTo(e)}getBoundingSphere(e){if(this.isEmpty())e.makeEmpty();else this.getCenter(e.center),e.radius=this.getSize(ri).length()*0.5;return e}intersect(e){if(this.min.max(e.min),this.max.min(e.max),this.isEmpty())this.makeEmpty();return this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){if(this.isEmpty())return this;return zi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),zi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),zi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),zi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),zi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),zi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),zi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),zi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(zi),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}var zi=[new I,new I,new I,new I,new I,new I,new I,new I],ri=new I,Nl=new zt,Tr=new I,Er=new I,Ar=new I,rs=new I,os=new I,Is=new I,Po=new I,Ul=new I,Fl=new I,Ps=new I;function _u(e,t,n,i,s){for(let r=0,o=e.length-3;r<=o;r+=3){Ps.fromArray(e,r);let a=s.x*Math.abs(Ps.x)+s.y*Math.abs(Ps.y)+s.z*Math.abs(Ps.z),l=t.dot(Ps),c=n.dot(Ps),h=i.dot(Ps);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Ax=new zt,Do=new I,Mu=new I;class Xt{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;if(t!==void 0)n.copy(t);else Ax.setFromPoints(e).getCenter(n);let i=0;for(let s=0,r=e.length;s<r;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);if(t.copy(e),n>this.radius*this.radius)t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center);return t}getBoundingBox(e){if(this.isEmpty())return e.makeEmpty(),e;return e.set(this.center,this.center),e.expandByScalar(this.radius),e}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Do.subVectors(e,this.center);let t=Do.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*0.5;this.center.addScaledVector(Do,i/n),this.radius+=i}return this}union(e){if(e.isEmpty())return this;if(this.isEmpty())return this.copy(e),this;if(this.center.equals(e.center)===!0)this.radius=Math.max(this.radius,e.radius);else Mu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Do.copy(e.center).add(Mu)),this.expandByPoint(Do.copy(e.center).sub(Mu));return this}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}var Hi=new I,Su=new I,Ol=new I,as=new I,wu=new I,Bl=new I,bu=new I;class ys{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);if(n<0)return t.copy(this.origin);return t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hi.subVectors(e,this.origin).dot(this.direction);if(t<0)return this.origin.distanceToSquared(e);return Hi.copy(this.origin).addScaledVector(this.direction,t),Hi.distanceToSquared(e)}distanceSqToSegment(e,t,n,i){Su.copy(e).add(t).multiplyScalar(0.5),Ol.copy(t).sub(e).normalize(),as.copy(this.origin).sub(Su);let s=e.distanceTo(t)*0.5,r=-this.direction.dot(Ol),o=as.dot(this.direction),a=-as.dot(Ol),l=as.lengthSq(),c=Math.abs(1-r*r),h,u,f,d;if(c>0)if(h=r*a-o,u=r*o-a,d=s*c,h>=0)if(u>=-d)if(u<=d){let g=1/c;h*=g,u*=g,f=h*(h+r*u+2*o)+u*(r*h+u+2*a)+l}else u=s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*a)+l;else u=-s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*a)+l;else if(u<=-d)h=Math.max(0,-(-r*s+o)),u=h>0?-s:Math.min(Math.max(-s,-a),s),f=-h*h+u*(u+2*a)+l;else if(u<=d)h=0,u=Math.min(Math.max(-s,-a),s),f=u*(u+2*a)+l;else h=Math.max(0,-(r*s+o)),u=h>0?s:Math.min(Math.max(-s,-a),s),f=-h*h+u*(u+2*a)+l;else u=r>0?-s:s,h=Math.max(0,-(r*u+o)),f=-h*h+u*(u+2*a)+l;if(n)n.copy(this.origin).addScaledVector(this.direction,h);if(i)i.copy(Su).addScaledVector(Ol,u);return f}intersectSphere(e,t){Hi.subVectors(e.center,this.origin);let n=Hi.dot(this.direction),i=Hi.dot(Hi)-n*n,s=e.radius*e.radius;if(i>s)return null;let r=Math.sqrt(s-i),o=n-r,a=n+r;if(a<0)return null;if(o<0)return this.at(a,t);return this.at(o,t)}intersectsSphere(e){if(e.radius<0)return!1;return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0){if(e.distanceToPoint(this.origin)===0)return 0;return null}let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);if(n===null)return null;return this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);if(t===0)return!0;if(e.normal.dot(this.direction)*t<0)return!0;return!1}intersectBox(e,t){let n,i,s,r,o,a,l=1/this.direction.x,c=1/this.direction.y,h=1/this.direction.z,u=this.origin;if(l>=0)n=(e.min.x-u.x)*l,i=(e.max.x-u.x)*l;else n=(e.max.x-u.x)*l,i=(e.min.x-u.x)*l;if(c>=0)s=(e.min.y-u.y)*c,r=(e.max.y-u.y)*c;else s=(e.max.y-u.y)*c,r=(e.min.y-u.y)*c;if(n>r||s>i)return null;if(s>n||isNaN(n))n=s;if(r<i||isNaN(i))i=r;if(h>=0)o=(e.min.z-u.z)*h,a=(e.max.z-u.z)*h;else o=(e.max.z-u.z)*h,a=(e.min.z-u.z)*h;if(n>a||o>i)return null;if(o>n||n!==n)n=o;if(a<i||i!==i)i=a;if(i<0)return null;return this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Hi)!==null}intersectTriangle(e,t,n,i,s){wu.subVectors(t,e),Bl.subVectors(n,e),bu.crossVectors(wu,Bl);let r=this.direction.dot(bu),o;if(r>0){if(i)return null;o=1}else if(r<0)o=-1,r=-r;else return null;as.subVectors(this.origin,e);let a=o*this.direction.dot(Bl.crossVectors(as,Bl));if(a<0)return null;let l=o*this.direction.dot(wu.cross(as));if(l<0)return null;if(a+l>r)return null;let c=-o*as.dot(bu);if(c<0)return null;return this.at(c/r,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class He{constructor(e,t,n,i,s,r,o,a,l,c,h,u,f,d,g,x){if(He.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0)this.set(e,t,n,i,s,r,o,a,l,c,h,u,f,d,g,x)}set(e,t,n,i,s,r,o,a,l,c,h,u,f,d,g,x){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=s,m[5]=r,m[9]=o,m[13]=a,m[2]=l,m[6]=c,m[10]=h,m[14]=u,m[3]=f,m[7]=d,m[11]=g,m[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new He().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,i=1/Rr.setFromMatrixColumn(e,0).length(),s=1/Rr.setFromMatrixColumn(e,1).length(),r=1/Rr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*r,t[9]=n[9]*r,t[10]=n[10]*r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,{x:n,y:i,z:s}=e,r=Math.cos(n),o=Math.sin(n),a=Math.cos(i),l=Math.sin(i),c=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let u=r*c,f=r*h,d=o*c,g=o*h;t[0]=a*c,t[4]=-a*h,t[8]=l,t[1]=f+d*l,t[5]=u-g*l,t[9]=-o*a,t[2]=g-u*l,t[6]=d+f*l,t[10]=r*a}else if(e.order==="YXZ"){let u=a*c,f=a*h,d=l*c,g=l*h;t[0]=u+g*o,t[4]=d*o-f,t[8]=r*l,t[1]=r*h,t[5]=r*c,t[9]=-o,t[2]=f*o-d,t[6]=g+u*o,t[10]=r*a}else if(e.order==="ZXY"){let u=a*c,f=a*h,d=l*c,g=l*h;t[0]=u-g*o,t[4]=-r*h,t[8]=d+f*o,t[1]=f+d*o,t[5]=r*c,t[9]=g-u*o,t[2]=-r*l,t[6]=o,t[10]=r*a}else if(e.order==="ZYX"){let u=r*c,f=r*h,d=o*c,g=o*h;t[0]=a*c,t[4]=d*l-f,t[8]=u*l+g,t[1]=a*h,t[5]=g*l+u,t[9]=f*l-d,t[2]=-l,t[6]=o*a,t[10]=r*a}else if(e.order==="YZX"){let u=r*a,f=r*l,d=o*a,g=o*l;t[0]=a*c,t[4]=g-u*h,t[8]=d*h+f,t[1]=h,t[5]=r*c,t[9]=-o*c,t[2]=-l*c,t[6]=f*h+d,t[10]=u-g*h}else if(e.order==="XZY"){let u=r*a,f=r*l,d=o*a,g=o*l;t[0]=a*c,t[4]=-h,t[8]=l*c,t[1]=u*h+g,t[5]=r*c,t[9]=f*h-d,t[2]=d*h-f,t[6]=o*c,t[10]=g*h+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Rx,e,Cx)}lookAt(e,t,n){let i=this.elements;if(zn.subVectors(e,t),zn.lengthSq()===0)zn.z=1;if(zn.normalize(),ls.crossVectors(n,zn),ls.lengthSq()===0){if(Math.abs(n.z)===1)zn.x+=0.0001;else zn.z+=0.0001;zn.normalize(),ls.crossVectors(n,zn)}return ls.normalize(),zl.crossVectors(zn,ls),i[0]=ls.x,i[4]=zl.x,i[8]=zn.x,i[1]=ls.y,i[5]=zl.y,i[9]=zn.y,i[2]=ls.z,i[6]=zl.z,i[10]=zn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,s=this.elements,r=n[0],o=n[4],a=n[8],l=n[12],c=n[1],h=n[5],u=n[9],f=n[13],d=n[2],g=n[6],x=n[10],m=n[14],p=n[3],M=n[7],y=n[11],S=n[15],C=i[0],R=i[4],E=i[8],D=i[12],w=i[1],T=i[5],P=i[9],B=i[13],H=i[2],k=i[6],X=i[10],q=i[14],re=i[3],W=i[7],Q=i[11],ae=i[15];return s[0]=r*C+o*w+a*H+l*re,s[4]=r*R+o*T+a*k+l*W,s[8]=r*E+o*P+a*X+l*Q,s[12]=r*D+o*B+a*q+l*ae,s[1]=c*C+h*w+u*H+f*re,s[5]=c*R+h*T+u*k+f*W,s[9]=c*E+h*P+u*X+f*Q,s[13]=c*D+h*B+u*q+f*ae,s[2]=d*C+g*w+x*H+m*re,s[6]=d*R+g*T+x*k+m*W,s[10]=d*E+g*P+x*X+m*Q,s[14]=d*D+g*B+x*q+m*ae,s[3]=p*C+M*w+y*H+S*re,s[7]=p*R+M*T+y*k+S*W,s[11]=p*E+M*P+y*X+S*Q,s[15]=p*D+M*B+y*q+S*ae,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],r=e[1],o=e[5],a=e[9],l=e[13],c=e[2],h=e[6],u=e[10],f=e[14],d=e[3],g=e[7],x=e[11],m=e[15];return d*(+s*a*h-i*l*h-s*o*u+n*l*u+i*o*f-n*a*f)+g*(+t*a*f-t*l*u+s*r*u-i*r*f+i*l*c-s*a*c)+x*(+t*l*h-t*o*f-s*r*h+n*r*f+s*o*c-n*l*c)+m*(-i*o*c-t*a*h+t*o*u+i*r*h-n*r*u+n*a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;if(e.isVector3)i[12]=e.x,i[13]=e.y,i[14]=e.z;else i[12]=e,i[13]=t,i[14]=n;return this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],r=e[4],o=e[5],a=e[6],l=e[7],c=e[8],h=e[9],u=e[10],f=e[11],d=e[12],g=e[13],x=e[14],m=e[15],p=h*x*l-g*u*l+g*a*f-o*x*f-h*a*m+o*u*m,M=d*u*l-c*x*l-d*a*f+r*x*f+c*a*m-r*u*m,y=c*g*l-d*h*l+d*o*f-r*g*f-c*o*m+r*h*m,S=d*h*a-c*g*a-d*o*u+r*g*u+c*o*x-r*h*x,C=t*p+n*M+i*y+s*S;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/C;return e[0]=p*R,e[1]=(g*u*s-h*x*s-g*i*f+n*x*f+h*i*m-n*u*m)*R,e[2]=(o*x*s-g*a*s+g*i*l-n*x*l-o*i*m+n*a*m)*R,e[3]=(h*a*s-o*u*s-h*i*l+n*u*l+o*i*f-n*a*f)*R,e[4]=M*R,e[5]=(c*x*s-d*u*s+d*i*f-t*x*f-c*i*m+t*u*m)*R,e[6]=(d*a*s-r*x*s-d*i*l+t*x*l+r*i*m-t*a*m)*R,e[7]=(r*u*s-c*a*s+c*i*l-t*u*l-r*i*f+t*a*f)*R,e[8]=y*R,e[9]=(d*h*s-c*g*s-d*n*f+t*g*f+c*n*m-t*h*m)*R,e[10]=(r*g*s-d*o*s+d*n*l-t*g*l-r*n*m+t*o*m)*R,e[11]=(c*o*s-r*h*s-c*n*l+t*h*l+r*n*f-t*o*f)*R,e[12]=S*R,e[13]=(c*g*i-d*h*i+d*n*u-t*g*u-c*n*x+t*h*x)*R,e[14]=(d*o*i-r*g*i-d*n*a+t*g*a+r*n*x-t*o*x)*R,e[15]=(r*h*i-c*o*i+c*n*a-t*h*a-r*n*u+t*o*u)*R,this}scale(e){let t=this.elements,{x:n,y:i,z:s}=e;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){if(e.isVector3)this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1);else this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1);return this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),s=1-n,{x:r,y:o,z:a}=e,l=s*r,c=s*o;return this.set(l*r+n,l*o-i*a,l*a+i*o,0,l*o+i*a,c*o+n,c*a-i*r,0,l*a-i*o,c*a+i*r,s*a*a+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,r){return this.set(1,n,s,0,e,1,r,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,{_x:s,_y:r,_z:o,_w:a}=t,l=s+s,c=r+r,h=o+o,u=s*l,f=s*c,d=s*h,g=r*c,x=r*h,m=o*h,p=a*l,M=a*c,y=a*h,{x:S,y:C,z:R}=n;return i[0]=(1-(g+m))*S,i[1]=(f+y)*S,i[2]=(d-M)*S,i[3]=0,i[4]=(f-y)*C,i[5]=(1-(u+m))*C,i[6]=(x+p)*C,i[7]=0,i[8]=(d+M)*R,i[9]=(x-p)*R,i[10]=(1-(u+g))*R,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements,s=Rr.set(i[0],i[1],i[2]).length(),r=Rr.set(i[4],i[5],i[6]).length(),o=Rr.set(i[8],i[9],i[10]).length();if(this.determinant()<0)s=-s;e.x=i[12],e.y=i[13],e.z=i[14],oi.copy(this);let l=1/s,c=1/r,h=1/o;return oi.elements[0]*=l,oi.elements[1]*=l,oi.elements[2]*=l,oi.elements[4]*=c,oi.elements[5]*=c,oi.elements[6]*=c,oi.elements[8]*=h,oi.elements[9]*=h,oi.elements[10]*=h,t.setFromRotationMatrix(oi),n.x=s,n.y=r,n.z=o,this}makePerspective(e,t,n,i,s,r,o=2000,a=!1){let l=this.elements,c=2*s/(t-e),h=2*s/(n-i),u=(t+e)/(t-e),f=(n+i)/(n-i),d,g;if(a)d=s/(r-s),g=r*s/(r-s);else if(o===2000)d=-(r+s)/(r-s),g=-2*r*s/(r-s);else if(o===2001)d=-r/(r-s),g=-r*s/(r-s);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,s,r,o=2000,a=!1){let l=this.elements,c=2/(t-e),h=2/(n-i),u=-(t+e)/(t-e),f=-(n+i)/(n-i),d,g;if(a)d=1/(r-s),g=r/(r-s);else if(o===2000)d=-2/(r-s),g=-(r+s)/(r-s);else if(o===2001)d=-1/(r-s),g=-s/(r-s);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=h,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}var Rr=new I,oi=new He,Rx=new I(0,0,0),Cx=new I(1,1,1),ls=new I,zl=new I,zn=new I,jp=new He,Qp=new Nt;class gn{constructor(e=0,t=0,n=0,i=gn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,s=i[0],r=i[4],o=i[8],a=i[1],l=i[5],c=i[9],h=i[2],u=i[6],f=i[10];switch(t){case"XYZ":if(this._y=Math.asin(it(o,-1,1)),Math.abs(o)<0.9999999)this._x=Math.atan2(-c,f),this._z=Math.atan2(-r,s);else this._x=Math.atan2(u,l),this._z=0;break;case"YXZ":if(this._x=Math.asin(-it(c,-1,1)),Math.abs(c)<0.9999999)this._y=Math.atan2(o,f),this._z=Math.atan2(a,l);else this._y=Math.atan2(-h,s),this._z=0;break;case"ZXY":if(this._x=Math.asin(it(u,-1,1)),Math.abs(u)<0.9999999)this._y=Math.atan2(-h,f),this._z=Math.atan2(-r,l);else this._y=0,this._z=Math.atan2(a,s);break;case"ZYX":if(this._y=Math.asin(-it(h,-1,1)),Math.abs(h)<0.9999999)this._x=Math.atan2(u,f),this._z=Math.atan2(a,s);else this._x=0,this._z=Math.atan2(-r,l);break;case"YZX":if(this._z=Math.asin(it(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(-c,l),this._y=Math.atan2(-h,s);else this._x=0,this._y=Math.atan2(o,f);break;case"XZY":if(this._z=Math.asin(-it(r,-1,1)),Math.abs(r)<0.9999999)this._x=Math.atan2(u,l),this._y=Math.atan2(o,s);else this._x=Math.atan2(-c,f),this._y=0;break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}if(this._order=t,n===!0)this._onChangeCallback();return this}setFromQuaternion(e,t,n){return jp.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jp,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Qp.setFromEuler(this),this.setFromQuaternion(Qp,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){if(this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0)this._order=e[3];return this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gn.DEFAULT_ORDER="XYZ";class so{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}var Ix=0,$p=new I,Cr=new Nt,ki=new He,Hl=new I,Lo=new I,Px=new I,Dx=new Nt,em=new I(1,0,0),tm=new I(0,1,0),nm=new I(0,0,1),im={type:"added"},Lx={type:"removed"},Ir={type:"childadded",child:null},Tu={type:"childremoved",child:null};class dt extends ei{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ix++}),this.uuid=kn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dt.DEFAULT_UP.clone();let e=new I,t=new gn,n=new Nt,i=new I(1,1,1);function s(){n.setFromEuler(t,!1)}function r(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new He},normalMatrix:{value:new ht}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=dt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new so,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){if(this.matrixAutoUpdate)this.updateMatrix();this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Cr.setFromAxisAngle(e,t),this.quaternion.multiply(Cr),this}rotateOnWorldAxis(e,t){return Cr.setFromAxisAngle(e,t),this.quaternion.premultiply(Cr),this}rotateX(e){return this.rotateOnAxis(em,e)}rotateY(e){return this.rotateOnAxis(tm,e)}rotateZ(e){return this.rotateOnAxis(nm,e)}translateOnAxis(e,t){return $p.copy(e).applyQuaternion(this.quaternion),this.position.add($p.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(em,e)}translateY(e){return this.translateOnAxis(tm,e)}translateZ(e){return this.translateOnAxis(nm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ki.copy(this.matrixWorld).invert())}lookAt(e,t,n){if(e.isVector3)Hl.copy(e);else Hl.set(e,t,n);let i=this.parent;if(this.updateWorldMatrix(!0,!1),Lo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)ki.lookAt(Lo,Hl,this.up);else ki.lookAt(Hl,Lo,this.up);if(this.quaternion.setFromRotationMatrix(ki),i)ki.extractRotation(i.matrixWorld),Cr.setFromRotationMatrix(ki),this.quaternion.premultiply(Cr.invert())}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}if(e===this)return console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this;if(e&&e.isObject3D)e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(im),Ir.child=e,this.dispatchEvent(Ir),Ir.child=null;else console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e);return this}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);if(t!==-1)e.parent=null,this.children.splice(t,1),e.dispatchEvent(Lx),Tu.child=e,this.dispatchEvent(Tu),Tu.child=null;return this}removeFromParent(){let e=this.parent;if(e!==null)e.remove(this);return this}clear(){return this.remove(...this.children)}attach(e){if(this.updateWorldMatrix(!0,!1),ki.copy(this.matrixWorld).invert(),e.parent!==null)e.parent.updateWorldMatrix(!0,!1),ki.multiply(e.parent.matrixWorld);return e.applyMatrix4(ki),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(im),Ir.child=e,this.dispatchEvent(Ir),Ir.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}return}getObjectsByProperty(e,t,n=[]){if(this[e]===t)n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lo,e,Px),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lo,Dx,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;if(t!==null)e(t),t.traverseAncestors(e)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||e){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,e=!0}let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null)n.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);if(t===!0){let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==="string",n={};if(t)e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let i={};if(i.uuid=this.uuid,i.type=this.type,this.name!=="")i.name=this.name;if(this.castShadow===!0)i.castShadow=!0;if(this.receiveShadow===!0)i.receiveShadow=!0;if(this.visible===!1)i.visible=!1;if(this.frustumCulled===!1)i.frustumCulled=!1;if(this.renderOrder!==0)i.renderOrder=this.renderOrder;if(Object.keys(this.userData).length>0)i.userData=this.userData;if(i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1)i.matrixAutoUpdate=!1;if(this.isInstancedMesh){if(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)i.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map((o)=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map((o)=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null)i.colorsTexture=this._colorsTexture.toJSON(e);if(this.boundingSphere!==null)i.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)i.boundingBox=this.boundingBox.toJSON()}function s(o,a){if(o[a.uuid]===void 0)o[a.uuid]=a.toJSON(e);return a.uuid}if(this.isScene){if(this.background){if(this.background.isColor)i.background=this.background.toJSON();else if(this.background.isTexture)i.background=this.background.toJSON(e).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)i.environment=this.environment.toJSON(e).uuid}else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let a=o.shapes;if(Array.isArray(a))for(let l=0,c=a.length;l<c;l++){let h=a[l];s(e.shapes,h)}else s(e.shapes,a)}}if(this.isSkinnedMesh){if(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let a=0,l=this.material.length;a<l;a++)o.push(s(e.materials,this.material[a]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let a=this.animations[o];i.animations.push(s(e.animations,a))}}if(t){let o=r(e.geometries),a=r(e.materials),l=r(e.textures),c=r(e.images),h=r(e.shapes),u=r(e.skeletons),f=r(e.animations),d=r(e.nodes);if(o.length>0)n.geometries=o;if(a.length>0)n.materials=a;if(l.length>0)n.textures=l;if(c.length>0)n.images=c;if(h.length>0)n.shapes=h;if(u.length>0)n.skeletons=u;if(f.length>0)n.animations=f;if(d.length>0)n.nodes=d}return n.object=i,n;function r(o){let a=[];for(let l in o){let c=o[l];delete c.metadata,a.push(c)}return a}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}}dt.DEFAULT_UP=new I(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ai=new I,Gi=new I,Eu=new I,Wi=new I,Pr=new I,Dr=new I,sm=new I,Au=new I,Ru=new I,Cu=new I,Iu=new bt,Pu=new bt,Du=new bt;class bn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),ai.subVectors(e,t),i.cross(ai);let s=i.lengthSq();if(s>0)return i.multiplyScalar(1/Math.sqrt(s));return i.set(0,0,0)}static getBarycoord(e,t,n,i,s){ai.subVectors(i,t),Gi.subVectors(n,t),Eu.subVectors(e,t);let r=ai.dot(ai),o=ai.dot(Gi),a=ai.dot(Eu),l=Gi.dot(Gi),c=Gi.dot(Eu),h=r*l-o*o;if(h===0)return s.set(0,0,0),null;let u=1/h,f=(l*a-o*c)*u,d=(r*c-o*a)*u;return s.set(1-f-d,d,f)}static containsPoint(e,t,n,i){if(this.getBarycoord(e,t,n,i,Wi)===null)return!1;return Wi.x>=0&&Wi.y>=0&&Wi.x+Wi.y<=1}static getInterpolation(e,t,n,i,s,r,o,a){if(this.getBarycoord(e,t,n,i,Wi)===null){if(a.x=0,a.y=0,"z"in a)a.z=0;if("w"in a)a.w=0;return null}return a.setScalar(0),a.addScaledVector(s,Wi.x),a.addScaledVector(r,Wi.y),a.addScaledVector(o,Wi.z),a}static getInterpolatedAttribute(e,t,n,i,s,r){return Iu.setScalar(0),Pu.setScalar(0),Du.setScalar(0),Iu.fromBufferAttribute(e,t),Pu.fromBufferAttribute(e,n),Du.fromBufferAttribute(e,i),r.setScalar(0),r.addScaledVector(Iu,s.x),r.addScaledVector(Pu,s.y),r.addScaledVector(Du,s.z),r}static isFrontFacing(e,t,n,i){return ai.subVectors(n,t),Gi.subVectors(e,t),ai.cross(Gi).dot(i)<0?!0:!1}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ai.subVectors(this.c,this.b),Gi.subVectors(this.a,this.b),ai.cross(Gi).length()*0.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(e){return bn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return bn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return bn.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return bn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return bn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,s=this.c,r,o;Pr.subVectors(i,n),Dr.subVectors(s,n),Au.subVectors(e,n);let a=Pr.dot(Au),l=Dr.dot(Au);if(a<=0&&l<=0)return t.copy(n);Ru.subVectors(e,i);let c=Pr.dot(Ru),h=Dr.dot(Ru);if(c>=0&&h<=c)return t.copy(i);let u=a*h-c*l;if(u<=0&&a>=0&&c<=0)return r=a/(a-c),t.copy(n).addScaledVector(Pr,r);Cu.subVectors(e,s);let f=Pr.dot(Cu),d=Dr.dot(Cu);if(d>=0&&f<=d)return t.copy(s);let g=f*l-a*d;if(g<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(n).addScaledVector(Dr,o);let x=c*d-f*h;if(x<=0&&h-c>=0&&f-d>=0)return sm.subVectors(s,i),o=(h-c)/(h-c+(f-d)),t.copy(i).addScaledVector(sm,o);let m=1/(x+g+u);return r=g*m,o=u*m,t.copy(n).addScaledVector(Pr,r).addScaledVector(Dr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}var eg={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},cs={h:0,s:0,l:0},kl={h:0,s:0,l:0};function Lu(e,t,n){if(n<0)n+=1;if(n>1)n-=1;if(n<0.16666666666666666)return e+(t-e)*6*n;if(n<0.5)return t;if(n<0.6666666666666666)return e+(t-e)*6*(0.6666666666666666-n);return e}class fe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;if(i&&i.isColor)this.copy(i);else if(typeof i==="number")this.setHex(i);else if(typeof i==="string")this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t="srgb"){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,mt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=mt.workingColorSpace){return this.r=e,this.g=t,this.b=n,mt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=mt.workingColorSpace){if(e=Vf(e,1),t=it(t,0,1),n=it(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=0.5?n*(1+t):n+t-n*t,r=2*n-s;this.r=Lu(r,s,e+0.3333333333333333),this.g=Lu(r,s,e),this.b=Lu(r,s,e-0.3333333333333333)}return mt.colorSpaceToWorking(this,i),this}setStyle(e,t="srgb"){function n(s){if(s===void 0)return;if(parseFloat(s)<1)console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,r=i[1],o=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);else if(r===6)return this.setHex(parseInt(s,16),t);else console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t="srgb"){let n=eg[e.toLowerCase()];if(n!==void 0)this.setHex(n,t);else console.warn("THREE.Color: Unknown color "+e);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}copyLinearToSRGB(e){return this.r=Xr(e.r),this.g=Xr(e.g),this.b=Xr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e="srgb"){return mt.workingToColorSpace(dn.copy(this),e),Math.round(it(dn.r*255,0,255))*65536+Math.round(it(dn.g*255,0,255))*256+Math.round(it(dn.b*255,0,255))}getHexString(e="srgb"){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=mt.workingColorSpace){mt.workingToColorSpace(dn.copy(this),t);let{r:n,g:i,b:s}=dn,r=Math.max(n,i,s),o=Math.min(n,i,s),a,l,c=(o+r)/2;if(o===r)a=0,l=0;else{let h=r-o;switch(l=c<=0.5?h/(r+o):h/(2-r-o),r){case n:a=(i-s)/h+(i<s?6:0);break;case i:a=(s-n)/h+2;break;case s:a=(n-i)/h+4;break}a/=6}return e.h=a,e.s=l,e.l=c,e}getRGB(e,t=mt.workingColorSpace){return mt.workingToColorSpace(dn.copy(this),t),e.r=dn.r,e.g=dn.g,e.b=dn.b,e}getStyle(e="srgb"){mt.workingToColorSpace(dn.copy(this),e);let{r:t,g:n,b:i}=dn;if(e!=="srgb")return`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`;return`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(cs),this.setHSL(cs.h+e,cs.s+t,cs.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(cs),e.getHSL(kl);let n=Xo(cs.h,kl.h,t),i=Xo(cs.s,kl.s,t),s=Xo(cs.l,kl.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var dn=new fe;fe.NAMES=eg;var Nx=0;class Gt extends ei{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nx++}),this.uuid=kn(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new fe(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){if(this._alphaTest>0!==e>0)this.version++;this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e===void 0)return;for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}if(i&&i.isColor)i.set(n);else if(i&&i.isVector3&&(n&&n.isVector3))i.copy(n);else this[t]=n}}toJSON(e){let t=e===void 0||typeof e==="string";if(t)e={textures:{},images:{}};let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,this.name!=="")n.name=this.name;if(this.color&&this.color.isColor)n.color=this.color.getHex();if(this.roughness!==void 0)n.roughness=this.roughness;if(this.metalness!==void 0)n.metalness=this.metalness;if(this.sheen!==void 0)n.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)n.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)n.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)n.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1)n.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)n.specular=this.specular.getHex();if(this.specularIntensity!==void 0)n.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)n.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)n.shininess=this.shininess;if(this.clearcoat!==void 0)n.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)n.clearcoatRoughness=this.clearcoatRoughness;if(this.clearcoatMap&&this.clearcoatMap.isTexture)n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid;if(this.dispersion!==void 0)n.dispersion=this.dispersion;if(this.iridescence!==void 0)n.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)n.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessRange!==void 0)n.iridescenceThicknessRange=this.iridescenceThicknessRange;if(this.iridescenceMap&&this.iridescenceMap.isTexture)n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid;if(this.anisotropy!==void 0)n.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)n.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid;if(this.map&&this.map.isTexture)n.map=this.map.toJSON(e).uuid;if(this.matcap&&this.matcap.isTexture)n.matcap=this.matcap.toJSON(e).uuid;if(this.alphaMap&&this.alphaMap.isTexture)n.alphaMap=this.alphaMap.toJSON(e).uuid;if(this.lightMap&&this.lightMap.isTexture)n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)n.roughnessMap=this.roughnessMap.toJSON(e).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)n.metalnessMap=this.metalnessMap.toJSON(e).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)n.emissiveMap=this.emissiveMap.toJSON(e).uuid;if(this.specularMap&&this.specularMap.isTexture)n.specularMap=this.specularMap.toJSON(e).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)n.specularColorMap=this.specularColorMap.toJSON(e).uuid;if(this.envMap&&this.envMap.isTexture){if(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0)n.combine=this.combine}if(this.envMapRotation!==void 0)n.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)n.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)n.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)n.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)n.gradientMap=this.gradientMap.toJSON(e).uuid;if(this.transmission!==void 0)n.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)n.transmissionMap=this.transmissionMap.toJSON(e).uuid;if(this.thickness!==void 0)n.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)n.thicknessMap=this.thicknessMap.toJSON(e).uuid;if(this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0)n.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)n.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)n.size=this.size;if(this.shadowSide!==null)n.shadowSide=this.shadowSide;if(this.sizeAttenuation!==void 0)n.sizeAttenuation=this.sizeAttenuation;if(this.blending!==1)n.blending=this.blending;if(this.side!==0)n.side=this.side;if(this.vertexColors===!0)n.vertexColors=!0;if(this.opacity<1)n.opacity=this.opacity;if(this.transparent===!0)n.transparent=!0;if(this.blendSrc!==204)n.blendSrc=this.blendSrc;if(this.blendDst!==205)n.blendDst=this.blendDst;if(this.blendEquation!==100)n.blendEquation=this.blendEquation;if(this.blendSrcAlpha!==null)n.blendSrcAlpha=this.blendSrcAlpha;if(this.blendDstAlpha!==null)n.blendDstAlpha=this.blendDstAlpha;if(this.blendEquationAlpha!==null)n.blendEquationAlpha=this.blendEquationAlpha;if(this.blendColor&&this.blendColor.isColor)n.blendColor=this.blendColor.getHex();if(this.blendAlpha!==0)n.blendAlpha=this.blendAlpha;if(this.depthFunc!==3)n.depthFunc=this.depthFunc;if(this.depthTest===!1)n.depthTest=this.depthTest;if(this.depthWrite===!1)n.depthWrite=this.depthWrite;if(this.colorWrite===!1)n.colorWrite=this.colorWrite;if(this.stencilWriteMask!==255)n.stencilWriteMask=this.stencilWriteMask;if(this.stencilFunc!==519)n.stencilFunc=this.stencilFunc;if(this.stencilRef!==0)n.stencilRef=this.stencilRef;if(this.stencilFuncMask!==255)n.stencilFuncMask=this.stencilFuncMask;if(this.stencilFail!==7680)n.stencilFail=this.stencilFail;if(this.stencilZFail!==7680)n.stencilZFail=this.stencilZFail;if(this.stencilZPass!==7680)n.stencilZPass=this.stencilZPass;if(this.stencilWrite===!0)n.stencilWrite=this.stencilWrite;if(this.rotation!==void 0&&this.rotation!==0)n.rotation=this.rotation;if(this.polygonOffset===!0)n.polygonOffset=!0;if(this.polygonOffsetFactor!==0)n.polygonOffsetFactor=this.polygonOffsetFactor;if(this.polygonOffsetUnits!==0)n.polygonOffsetUnits=this.polygonOffsetUnits;if(this.linewidth!==void 0&&this.linewidth!==1)n.linewidth=this.linewidth;if(this.dashSize!==void 0)n.dashSize=this.dashSize;if(this.gapSize!==void 0)n.gapSize=this.gapSize;if(this.scale!==void 0)n.scale=this.scale;if(this.dithering===!0)n.dithering=!0;if(this.alphaTest>0)n.alphaTest=this.alphaTest;if(this.alphaHash===!0)n.alphaHash=!0;if(this.alphaToCoverage===!0)n.alphaToCoverage=!0;if(this.premultipliedAlpha===!0)n.premultipliedAlpha=!0;if(this.forceSinglePass===!0)n.forceSinglePass=!0;if(this.wireframe===!0)n.wireframe=!0;if(this.wireframeLinewidth>1)n.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!=="round")n.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!=="round")n.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading===!0)n.flatShading=!0;if(this.visible===!1)n.visible=!1;if(this.toneMapped===!1)n.toneMapped=!1;if(this.fog===!1)n.fog=!1;if(Object.keys(this.userData).length>0)n.userData=this.userData;function i(s){let r=[];for(let o in s){let a=s[o];delete a.metadata,r.push(a)}return r}if(t){let s=i(e.textures),r=i(e.images);if(s.length>0)n.textures=s;if(r.length>0)n.images=r}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){if(e===!0)this.version++}}class on extends Gt{constructor(e){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}var Xi=Ux();function Ux(){let e=new ArrayBuffer(4),t=new Float32Array(e),n=new Uint32Array(e),i=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){let c=l-127;if(c<-27)i[l]=0,i[l|256]=32768,s[l]=24,s[l|256]=24;else if(c<-14)i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1;else if(c<=15)i[l]=c+15<<10,i[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13;else if(c<128)i[l]=31744,i[l|256]=64512,s[l]=24,s[l|256]=24;else i[l]=31744,i[l|256]=64512,s[l]=13,s[l|256]=13}let r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;while((c&8388608)===0)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)if(l!==32)a[l]=1024;return{floatView:t,uint32View:n,baseTable:i,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function In(e){if(Math.abs(e)>65504)console.warn("THREE.DataUtils.toHalfFloat(): Value out of range.");e=it(e,-65504,65504),Xi.floatView[0]=e;let t=Xi.uint32View[0],n=t>>23&511;return Xi.baseTable[n]+((t&8388607)>>Xi.shiftTable[n])}function Wo(e){let t=e>>10;return Xi.uint32View[0]=Xi.mantissaTable[Xi.offsetTable[t]+(e&1023)]+Xi.exponentTable[t],Xi.floatView[0]}class mi{static toHalfFloat(e){return In(e)}static fromHalfFloat(e){return Wo(e)}}var Yt=new I,Gl=new se,Fx=0;class at{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Fx++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Gl.fromBufferAttribute(this,t),Gl.applyMatrix3(e),this.setXY(t,Gl.x,Gl.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix3(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyMatrix4(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.applyNormalMatrix(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Yt.fromBufferAttribute(this,t),Yt.transformDirection(e),this.setXYZ(t,Yt.x,Yt.y,Yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];if(this.normalized)n=wn(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=ft(n,this.array);return this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];if(this.normalized)t=wn(t,this.array);return t}setX(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];if(this.normalized)t=wn(t,this.array);return t}setY(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];if(this.normalized)t=wn(t,this.array);return t}setZ(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];if(this.normalized)t=wn(t,this.array);return t}setW(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array);return this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),s=ft(s,this.array);return this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};if(this.name!=="")e.name=this.name;if(this.usage!==35044)e.usage=this.usage;return e}}class Kf extends at{constructor(e,t,n){super(new Int8Array(e),t,n)}}class Jf extends at{constructor(e,t,n){super(new Uint8Array(e),t,n)}}class jf extends at{constructor(e,t,n){super(new Uint8ClampedArray(e),t,n)}}class Qf extends at{constructor(e,t,n){super(new Int16Array(e),t,n)}}class Ma extends at{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class $f extends at{constructor(e,t,n){super(new Int32Array(e),t,n)}}class Sa extends at{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ed extends at{constructor(e,t,n){super(new Uint16Array(e),t,n);this.isFloat16BufferAttribute=!0}getX(e){let t=Wo(this.array[e*this.itemSize]);if(this.normalized)t=wn(t,this.array);return t}setX(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize]=In(t),this}getY(e){let t=Wo(this.array[e*this.itemSize+1]);if(this.normalized)t=wn(t,this.array);return t}setY(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+1]=In(t),this}getZ(e){let t=Wo(this.array[e*this.itemSize+2]);if(this.normalized)t=wn(t,this.array);return t}setZ(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+2]=In(t),this}getW(e){let t=Wo(this.array[e*this.itemSize+3]);if(this.normalized)t=wn(t,this.array);return t}setW(e,t){if(this.normalized)t=ft(t,this.array);return this.array[e*this.itemSize+3]=In(t),this}setXY(e,t,n){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array);return this.array[e+0]=In(t),this.array[e+1]=In(n),this}setXYZ(e,t,n,i){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array);return this.array[e+0]=In(t),this.array[e+1]=In(n),this.array[e+2]=In(i),this}setXYZW(e,t,n,i,s){if(e*=this.itemSize,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),s=ft(s,this.array);return this.array[e+0]=In(t),this.array[e+1]=In(n),this.array[e+2]=In(i),this.array[e+3]=In(s),this}}class ze extends at{constructor(e,t,n){super(new Float32Array(e),t,n)}}var Ox=0,Yn=new He,Nu=new dt,Lr=new I,Hn=new zt,No=new zt,rn=new I;class Je extends ei{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ox++}),this.uuid=kn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){if(Array.isArray(e))this.index=new((Xf(e))?Sa:Ma)(e,1);else this.index=e;return this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;if(t!==void 0)t.applyMatrix4(e),t.needsUpdate=!0;let n=this.attributes.normal;if(n!==void 0){let s=new ht().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;if(i!==void 0)i.transformDirection(e),i.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this}applyQuaternion(e){return Yn.makeRotationFromQuaternion(e),this.applyMatrix4(Yn),this}rotateX(e){return Yn.makeRotationX(e),this.applyMatrix4(Yn),this}rotateY(e){return Yn.makeRotationY(e),this.applyMatrix4(Yn),this}rotateZ(e){return Yn.makeRotationZ(e),this.applyMatrix4(Yn),this}translate(e,t,n){return Yn.makeTranslation(e,t,n),this.applyMatrix4(Yn),this}scale(e,t,n){return Yn.makeScale(e,t,n),this.applyMatrix4(Yn),this}lookAt(e){return Nu.lookAt(e),Nu.updateMatrix(),this.applyMatrix4(Nu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Lr).negate(),this.translate(Lr.x,Lr.y,Lr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,s=e.length;i<s;i++){let r=e[i];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new ze(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}if(e.length>t.count)console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");t.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new zt;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let s=t[n];if(Hn.setFromBufferAttribute(s),this.morphTargetsRelative)rn.addVectors(this.boundingBox.min,Hn.min),this.boundingBox.expandByPoint(rn),rn.addVectors(this.boundingBox.max,Hn.max),this.boundingBox.expandByPoint(rn);else this.boundingBox.expandByPoint(Hn.min),this.boundingBox.expandByPoint(Hn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Xt;let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){let n=this.boundingSphere.center;if(Hn.setFromBufferAttribute(e),t)for(let s=0,r=t.length;s<r;s++){let o=t[s];if(No.setFromBufferAttribute(o),this.morphTargetsRelative)rn.addVectors(Hn.min,No.min),Hn.expandByPoint(rn),rn.addVectors(Hn.max,No.max),Hn.expandByPoint(rn);else Hn.expandByPoint(No.min),Hn.expandByPoint(No.max)}Hn.getCenter(n);let i=0;for(let s=0,r=e.count;s<r;s++)rn.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(rn));if(t)for(let s=0,r=t.length;s<r;s++){let o=t[s],a=this.morphTargetsRelative;for(let l=0,c=o.count;l<c;l++){if(rn.fromBufferAttribute(o,l),a)Lr.fromBufferAttribute(e,l),rn.add(Lr);i=Math.max(i,n.distanceToSquared(rn))}}if(this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius))console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:n,normal:i,uv:s}=t;if(this.hasAttribute("tangent")===!1)this.setAttribute("tangent",new at(new Float32Array(4*n.count),4));let r=this.getAttribute("tangent"),o=[],a=[];for(let E=0;E<n.count;E++)o[E]=new I,a[E]=new I;let l=new I,c=new I,h=new I,u=new se,f=new se,d=new se,g=new I,x=new I;function m(E,D,w){l.fromBufferAttribute(n,E),c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,w),u.fromBufferAttribute(s,E),f.fromBufferAttribute(s,D),d.fromBufferAttribute(s,w),c.sub(l),h.sub(l),f.sub(u),d.sub(u);let T=1/(f.x*d.y-d.x*f.y);if(!isFinite(T))return;g.copy(c).multiplyScalar(d.y).addScaledVector(h,-f.y).multiplyScalar(T),x.copy(h).multiplyScalar(f.x).addScaledVector(c,-d.x).multiplyScalar(T),o[E].add(g),o[D].add(g),o[w].add(g),a[E].add(x),a[D].add(x),a[w].add(x)}let p=this.groups;if(p.length===0)p=[{start:0,count:e.count}];for(let E=0,D=p.length;E<D;++E){let w=p[E],{start:T,count:P}=w;for(let B=T,H=T+P;B<H;B+=3)m(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let M=new I,y=new I,S=new I,C=new I;function R(E){S.fromBufferAttribute(i,E),C.copy(S);let D=o[E];M.copy(D),M.sub(S.multiplyScalar(S.dot(D))).normalize(),y.crossVectors(C,D);let T=y.dot(a[E])<0?-1:1;r.setXYZW(E,M.x,M.y,M.z,T)}for(let E=0,D=p.length;E<D;++E){let w=p[E],{start:T,count:P}=w;for(let B=T,H=T+P;B<H;B+=3)R(e.getX(B+0)),R(e.getX(B+1)),R(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new at(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let i=new I,s=new I,r=new I,o=new I,a=new I,l=new I,c=new I,h=new I;if(e)for(let u=0,f=e.count;u<f;u+=3){let d=e.getX(u+0),g=e.getX(u+1),x=e.getX(u+2);i.fromBufferAttribute(t,d),s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),o.fromBufferAttribute(n,d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),o.add(c),a.add(c),l.add(c),n.setXYZ(d,o.x,o.y,o.z),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z)}else for(let u=0,f=t.count;u<f;u+=3)i.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),r.fromBufferAttribute(t,u+2),c.subVectors(r,s),h.subVectors(i,s),c.cross(h),n.setXYZ(u+0,c.x,c.y,c.z),n.setXYZ(u+1,c.x,c.y,c.z),n.setXYZ(u+2,c.x,c.y,c.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)rn.fromBufferAttribute(e,t),rn.normalize(),e.setXYZ(t,rn.x,rn.y,rn.z)}toNonIndexed(){function e(o,a){let{array:l,itemSize:c,normalized:h}=o,u=new l.constructor(a.length*c),f=0,d=0;for(let g=0,x=a.length;g<x;g++){if(o.isInterleavedBufferAttribute)f=a[g]*o.data.stride+o.offset;else f=a[g]*c;for(let m=0;m<c;m++)u[d++]=l[f++]}return new at(u,c,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new Je,n=this.index.array,i=this.attributes;for(let o in i){let a=i[o],l=e(a,n);t.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let a=[],l=s[o];for(let c=0,h=l.length;c<h;c++){let u=l[c],f=e(u,n);a.push(f)}t.morphAttributes[o]=a}t.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,a=r.length;o<a;o++){let l=r[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!=="")e.name=this.name;if(Object.keys(this.userData).length>0)e.userData=this.userData;if(this.parameters!==void 0){let a=this.parameters;for(let l in a)if(a[l]!==void 0)e[l]=a[l];return e}e.data={attributes:{}};let t=this.index;if(t!==null)e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)};let n=this.attributes;for(let a in n){let l=n[a];e.data.attributes[a]=l.toJSON(e.data)}let i={},s=!1;for(let a in this.morphAttributes){let l=this.morphAttributes[a],c=[];for(let h=0,u=l.length;h<u;h++){let f=l[h];c.push(f.toJSON(e.data))}if(c.length>0)i[a]=c,s=!0}if(s)e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;if(r.length>0)e.data.groups=JSON.parse(JSON.stringify(r));let o=this.boundingSphere;if(o!==null)e.data.boundingSphere=o.toJSON();return e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;if(n!==null)this.setIndex(n.clone());let i=e.attributes;for(let l in i){let c=i[l];this.setAttribute(l,c.clone(t))}let s=e.morphAttributes;for(let l in s){let c=[],h=s[l];for(let u=0,f=h.length;u<f;u++)c.push(h[u].clone(t));this.morphAttributes[l]=c}this.morphTargetsRelative=e.morphTargetsRelative;let r=e.groups;for(let l=0,c=r.length;l<c;l++){let h=r[l];this.addGroup(h.start,h.count,h.materialIndex)}let o=e.boundingBox;if(o!==null)this.boundingBox=o.clone();let a=e.boundingSphere;if(a!==null)this.boundingSphere=a.clone();return this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}var rm=new He,Ds=new ys,Wl=new Xt,om=new I,Vl=new I,Xl=new I,ql=new I,Uu=new I,Yl=new I,am=new I,Zl=new I;class vt extends dt{constructor(e=new Je,t=new on){super();this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){if(super.copy(e,t),e.morphTargetInfluences!==void 0)this.morphTargetInfluences=e.morphTargetInfluences.slice();if(e.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary);return this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let o=this.morphTargetInfluences;if(s&&o){Yl.set(0,0,0);for(let a=0,l=s.length;a<l;a++){let c=o[a],h=s[a];if(c===0)continue;if(Uu.fromBufferAttribute(h,e),r)Yl.addScaledVector(Uu,c);else Yl.addScaledVector(Uu.sub(t),c)}t.add(Yl)}return t}raycast(e,t){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0)return;if(n.boundingSphere===null)n.computeBoundingSphere();if(Wl.copy(n.boundingSphere),Wl.applyMatrix4(s),Ds.copy(e.ray).recast(e.near),Wl.containsPoint(Ds.origin)===!1){if(Ds.intersectSphere(Wl,om)===null)return;if(Ds.origin.distanceToSquared(om)>(e.far-e.near)**2)return}if(rm.copy(s).invert(),Ds.copy(e.ray).applyMatrix4(rm),n.boundingBox!==null){if(Ds.intersectsBox(n.boundingBox)===!1)return}this._computeIntersections(e,t,Ds)}_computeIntersections(e,t,n){let i,s=this.geometry,r=this.material,o=s.index,a=s.attributes.position,l=s.attributes.uv,c=s.attributes.uv1,h=s.attributes.normal,{groups:u,drawRange:f}=s;if(o!==null)if(Array.isArray(r))for(let d=0,g=u.length;d<g;d++){let x=u[d],m=r[x.materialIndex],p=Math.max(x.start,f.start),M=Math.min(o.count,Math.min(x.start+x.count,f.start+f.count));for(let y=p,S=M;y<S;y+=3){let C=o.getX(y),R=o.getX(y+1),E=o.getX(y+2);if(i=Kl(this,m,e,n,l,c,h,C,R,E),i)i.faceIndex=Math.floor(y/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let d=Math.max(0,f.start),g=Math.min(o.count,f.start+f.count);for(let x=d,m=g;x<m;x+=3){let p=o.getX(x),M=o.getX(x+1),y=o.getX(x+2);if(i=Kl(this,r,e,n,l,c,h,p,M,y),i)i.faceIndex=Math.floor(x/3),t.push(i)}}else if(a!==void 0)if(Array.isArray(r))for(let d=0,g=u.length;d<g;d++){let x=u[d],m=r[x.materialIndex],p=Math.max(x.start,f.start),M=Math.min(a.count,Math.min(x.start+x.count,f.start+f.count));for(let y=p,S=M;y<S;y+=3){let C=y,R=y+1,E=y+2;if(i=Kl(this,m,e,n,l,c,h,C,R,E),i)i.faceIndex=Math.floor(y/3),i.face.materialIndex=x.materialIndex,t.push(i)}}else{let d=Math.max(0,f.start),g=Math.min(a.count,f.start+f.count);for(let x=d,m=g;x<m;x+=3){let p=x,M=x+1,y=x+2;if(i=Kl(this,r,e,n,l,c,h,p,M,y),i)i.faceIndex=Math.floor(x/3),t.push(i)}}}}function Bx(e,t,n,i,s,r,o,a){let l;if(t.side===1)l=i.intersectTriangle(o,r,s,!0,a);else l=i.intersectTriangle(s,r,o,t.side===0,a);if(l===null)return null;Zl.copy(a),Zl.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(Zl);if(c<n.near||c>n.far)return null;return{distance:c,point:Zl.clone(),object:e}}function Kl(e,t,n,i,s,r,o,a,l,c){e.getVertexPosition(a,Vl),e.getVertexPosition(l,Xl),e.getVertexPosition(c,ql);let h=Bx(e,t,n,i,Vl,Xl,ql,am);if(h){let u=new I;if(bn.getBarycoord(am,Vl,Xl,ql,u),s)h.uv=bn.getInterpolatedAttribute(s,a,l,c,u,new se);if(r)h.uv1=bn.getInterpolatedAttribute(r,a,l,c,u,new se);if(o){if(h.normal=bn.getInterpolatedAttribute(o,a,l,c,u,new I),h.normal.dot(i.direction)>0)h.normal.multiplyScalar(-1)}let f={a,b:l,c,normal:new I,materialIndex:0};bn.getNormal(Vl,Xl,ql,f.normal),h.face=f,h.barycoord=u}return h}class Dn extends Je{constructor(e=1,t=1,n=1,i=1,s=1,r=1){super();this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:r};let o=this;i=Math.floor(i),s=Math.floor(s),r=Math.floor(r);let a=[],l=[],c=[],h=[],u=0,f=0;d("z","y","x",-1,-1,n,t,e,r,s,0),d("z","y","x",1,-1,n,t,-e,r,s,1),d("x","z","y",1,1,e,n,t,i,r,2),d("x","z","y",1,-1,e,n,-t,i,r,3),d("x","y","z",1,-1,e,t,n,i,s,4),d("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(a),this.setAttribute("position",new ze(l,3)),this.setAttribute("normal",new ze(c,3)),this.setAttribute("uv",new ze(h,2));function d(g,x,m,p,M,y,S,C,R,E,D){let w=y/R,T=S/E,P=y/2,B=S/2,H=C/2,k=R+1,X=E+1,q=0,re=0,W=new I;for(let Q=0;Q<X;Q++){let ae=Q*T-B;for(let ge=0;ge<k;ge++){let ve=ge*w-P;W[g]=ve*p,W[x]=ae*M,W[m]=H,l.push(W.x,W.y,W.z),W[g]=0,W[x]=0,W[m]=C>0?1:-1,c.push(W.x,W.y,W.z),h.push(ge/R),h.push(1-Q/E),q+=1}}for(let Q=0;Q<E;Q++)for(let ae=0;ae<R;ae++){let ge=u+ae+k*Q,ve=u+ae+k*(Q+1),Ge=u+(ae+1)+k*(Q+1),Oe=u+(ae+1)+k*Q;a.push(ge,ve,Oe),a.push(ve,Ge,Oe),re+=6}o.addGroup(f,re,D),f+=re,u+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function tr(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion))if(s.isRenderTargetTexture)console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null;else t[n][i]=s.clone();else if(Array.isArray(s))t[n][i]=s.slice();else t[n][i]=s}}return t}function yn(e){let t={};for(let n=0;n<e.length;n++){let i=tr(e[n]);for(let s in i)t[s]=i[s]}return t}function zx(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function td(e){let t=e.getRenderTarget();if(t===null)return e.outputColorSpace;if(t.isXRRenderTarget===!0)return t.texture.colorSpace;return mt.workingColorSpace}var jt={clone:tr,merge:yn},Hx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,kx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class xt extends Gt{constructor(e){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Hx,this.fragmentShader=kx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0)this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=tr(e.uniforms),this.uniformsGroups=zx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let r=this.uniforms[i].value;if(r&&r.isTexture)t.uniforms[i]={type:"t",value:r.toJSON(e).uuid};else if(r&&r.isColor)t.uniforms[i]={type:"c",value:r.getHex()};else if(r&&r.isVector2)t.uniforms[i]={type:"v2",value:r.toArray()};else if(r&&r.isVector3)t.uniforms[i]={type:"v3",value:r.toArray()};else if(r&&r.isVector4)t.uniforms[i]={type:"v4",value:r.toArray()};else if(r&&r.isMatrix3)t.uniforms[i]={type:"m3",value:r.toArray()};else if(r&&r.isMatrix4)t.uniforms[i]={type:"m4",value:r.toArray()};else t.uniforms[i]={value:r}}if(Object.keys(this.defines).length>0)t.defines=this.defines;t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)if(this.extensions[i]===!0)n[i]=!0;if(Object.keys(n).length>0)t.extensions=n;return t}}class ro extends dt{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}var hs=new I,lm=new se,cm=new se;class Ot extends ro{constructor(e=50,t=1,n=0.1,i=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=0.5*this.getFilmHeight()/e;this.fov=Vs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ws*0.5*this.fov);return 0.5*this.getFilmHeight()/e}getEffectiveFOV(){return Vs*2*Math.atan(Math.tan(Ws*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hs.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),t.set(hs.x,hs.y).multiplyScalar(-e/hs.z),hs.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),n.set(hs.x,hs.y).multiplyScalar(-e/hs.z)}getViewSize(e,t){return this.getViewBounds(e,lm,cm),t.subVectors(cm,lm)}setViewOffset(e,t,n,i,s,r){if(this.aspect=e/t,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ws*0.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-0.5*i,r=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:a,fullHeight:l}=r;s+=r.offsetX*i/a,t-=r.offsetY*n/l,i*=r.width/a,n*=r.height/l}let o=this.filmOffset;if(o!==0)s+=e*o/this.getFilmWidth();this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null)t.object.view=Object.assign({},this.view);return t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}var Nr=-90,Ur=1;class gh extends dt{constructor(e,t,n){super();this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Ot(Nr,Ur,e,t);i.layers=this.layers,this.add(i);let s=new Ot(Nr,Ur,e,t);s.layers=this.layers,this.add(s);let r=new Ot(Nr,Ur,e,t);r.layers=this.layers,this.add(r);let o=new Ot(Nr,Ur,e,t);o.layers=this.layers,this.add(o);let a=new Ot(Nr,Ur,e,t);a.layers=this.layers,this.add(a);let l=new Ot(Nr,Ur,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,s,r,o,a]=t;for(let l of t)this.remove(l);if(e===2000)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),a.up.set(0,1,0),a.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),a.up.set(0,-1,0),a.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;if(this.coordinateSystem!==e.coordinateSystem)this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem();let[s,r,o,a,l,c]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),d=e.xr.enabled;e.xr.enabled=!1;let g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,s),e.setRenderTarget(n,1,i),e.render(t,r),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,a),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,i),e.render(t,c),e.setRenderTarget(h,u,f),e.xr.enabled=d,n.texture.needsPMREMUpdate=!0}}class nr extends Rt{constructor(e=[],t=301,n,i,s,r,o,a,l,c){super(e,t,n,i,s,r,o,a,l,c);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class vh extends Ft{constructor(e=1,t={}){super(e,e,t);this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new nr(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Dn(5,5,5),s=new xt({name:"CubemapFromEquirect",uniforms:tr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;let r=new vt(i,s),o=t.minFilter;if(t.minFilter===1008)t.minFilter=1006;return new gh(1,10,this).update(e,r),t.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let s=e.getRenderTarget();for(let r=0;r<6;r++)e.setRenderTarget(this,r),e.clear(t,n,i);e.setRenderTarget(s)}}class wt extends dt{constructor(){super();this.isGroup=!0,this.type="Group"}}var Gx={type:"move"};class oo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I;return this._grip}dispatchEvent(e){if(this._targetRay!==null)this._targetRay.dispatchEvent(e);if(this._grip!==null)this._grip.dispatchEvent(e);if(this._hand!==null)this._hand.dispatchEvent(e);return this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){if(this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(e,t,n){let i=null,s=null,r=null,o=this._targetRay,a=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){r=!0;for(let g of e.hand.values()){let x=t.getJointPose(g,n),m=this._getHandJoint(l,g);if(x!==null)m.matrix.fromArray(x.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=x.radius;m.visible=x!==null}let c=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],u=c.position.distanceTo(h.position),f=0.02,d=0.005;if(l.inputState.pinching&&u>f+d)l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this});else if(!l.inputState.pinching&&u<=f-d)l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this})}else if(a!==null&&e.gripSpace){if(s=t.getPose(e.gripSpace,n),s!==null){if(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity)a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity);else a.hasLinearVelocity=!1;if(s.angularVelocity)a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity);else a.hasAngularVelocity=!1}}if(o!==null){if(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null)i=s;if(i!==null){if(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity)o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity);else o.hasLinearVelocity=!1;if(i.angularVelocity)o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity);else o.hasAngularVelocity=!1;this.dispatchEvent(Gx)}}}if(o!==null)o.visible=i!==null;if(a!==null)a.visible=s!==null;if(l!==null)l.visible=r!==null;return this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new wt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class ir{constructor(e,t=0.00025){this.isFogExp2=!0,this.name="",this.color=new fe(e),this.density=t}clone(){return new ir(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class wa{constructor(e,t=1,n=1000){this.isFog=!0,this.name="",this.color=new fe(e),this.near=t,this.far=n}clone(){return new wa(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class sr extends dt{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gn,this.environmentIntensity=1,this.environmentRotation=new gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){if(super.copy(e,t),e.background!==null)this.background=e.background.clone();if(e.environment!==null)this.environment=e.environment.clone();if(e.fog!==null)this.fog=e.fog.clone();if(this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null)this.overrideMaterial=e.overrideMaterial.clone();return this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);if(this.fog!==null)t.object.fog=this.fog.toJSON();if(this.backgroundBlurriness>0)t.object.backgroundBlurriness=this.backgroundBlurriness;if(this.backgroundIntensity!==1)t.object.backgroundIntensity=this.backgroundIntensity;if(t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1)t.object.environmentIntensity=this.environmentIntensity;return t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Ii{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=kn()}onUploadCallback(){}set needsUpdate(e){if(e===!0)this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,s=this.stride;i<s;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=kn();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer;let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){if(e.arrayBuffers===void 0)e.arrayBuffers={};if(this.array.buffer._uuid===void 0)this.array.buffer._uuid=kn();if(e.arrayBuffers[this.array.buffer._uuid]===void 0)e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer));return{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}var Sn=new I;class Kn{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Sn.fromBufferAttribute(this,t),Sn.applyMatrix4(e),this.setXYZ(t,Sn.x,Sn.y,Sn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Sn.fromBufferAttribute(this,t),Sn.applyNormalMatrix(e),this.setXYZ(t,Sn.x,Sn.y,Sn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Sn.fromBufferAttribute(this,t),Sn.transformDirection(e),this.setXYZ(t,Sn.x,Sn.y,Sn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];if(this.normalized)n=wn(n,this.array);return n}setComponent(e,t,n){if(this.normalized)n=ft(n,this.array);return this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){if(this.normalized)t=ft(t,this.array);return this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){if(this.normalized)t=ft(t,this.array);return this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){if(this.normalized)t=ft(t,this.array);return this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){if(this.normalized)t=ft(t,this.array);return this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];if(this.normalized)t=wn(t,this.array);return t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];if(this.normalized)t=wn(t,this.array);return t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];if(this.normalized)t=wn(t,this.array);return t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];if(this.normalized)t=wn(t,this.array);return t}setXY(e,t,n){if(e=e*this.data.stride+this.offset,this.normalized)t=ft(t,this.array),n=ft(n,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){if(e=e*this.data.stride+this.offset,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,s){if(e=e*this.data.stride+this.offset,this.normalized)t=ft(t,this.array),n=ft(n,this.array),i=ft(i,this.array),s=ft(s,this.array);return this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return new at(new this.array.constructor(t),this.itemSize,this.normalized)}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.clone(e);return new Kn(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else{if(e.interleavedBuffers===void 0)e.interleavedBuffers={};if(e.interleavedBuffers[this.data.uuid]===void 0)e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}}class ba extends Gt{constructor(e){super();this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new fe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var Fr,Uo=new I,Or=new I,Br=new I,zr=new se,Fo=new se,tg=new He,Jl=new I,Oo=new I,jl=new I,hm=new se,Fu=new se,um=new se;class xh extends dt{constructor(e=new ba){super();if(this.isSprite=!0,this.type="Sprite",Fr===void 0){Fr=new Je;let t=new Float32Array([-0.5,-0.5,0,0,0,0.5,-0.5,0,1,0,0.5,0.5,0,1,1,-0.5,0.5,0,0,1]),n=new Ii(t,5);Fr.setIndex([0,1,2,0,2,3]),Fr.setAttribute("position",new Kn(n,3,0,!1)),Fr.setAttribute("uv",new Kn(n,2,3,!1))}this.geometry=Fr,this.material=e,this.center=new se(0.5,0.5),this.count=1}raycast(e,t){if(e.camera===null)console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');if(Or.setFromMatrixScale(this.matrixWorld),tg.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Br.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1)Or.multiplyScalar(-Br.z);let n=this.material.rotation,i,s;if(n!==0)s=Math.cos(n),i=Math.sin(n);let r=this.center;Ql(Jl.set(-0.5,-0.5,0),Br,r,Or,i,s),Ql(Oo.set(0.5,-0.5,0),Br,r,Or,i,s),Ql(jl.set(0.5,0.5,0),Br,r,Or,i,s),hm.set(0,0),Fu.set(1,0),um.set(1,1);let o=e.ray.intersectTriangle(Jl,Oo,jl,!1,Uo);if(o===null){if(Ql(Oo.set(-0.5,0.5,0),Br,r,Or,i,s),Fu.set(0,1),o=e.ray.intersectTriangle(Jl,jl,Oo,!1,Uo),o===null)return}let a=e.ray.origin.distanceTo(Uo);if(a<e.near||a>e.far)return;t.push({distance:a,point:Uo.clone(),uv:bn.getInterpolation(Uo,Jl,Oo,jl,hm,Fu,um,new se),face:null,object:this})}copy(e,t){if(super.copy(e,t),e.center!==void 0)this.center.copy(e.center);return this.material=e.material,this}}function Ql(e,t,n,i,s,r){if(zr.subVectors(e,n).addScalar(0.5).multiply(i),s!==void 0)Fo.x=r*zr.x-s*zr.y,Fo.y=s*zr.x+r*zr.y;else Fo.copy(zr);e.copy(t),e.x+=Fo.x,e.y+=Fo.y,e.applyMatrix4(tg)}var $l=new I,fm=new I;class yh extends dt{constructor(){super();this.isLOD=!0,this._currentLevel=0,this.type="LOD",Object.defineProperties(this,{levels:{enumerable:!0,value:[]}}),this.autoUpdate=!0}copy(e){super.copy(e,!1);let t=e.levels;for(let n=0,i=t.length;n<i;n++){let s=t[n];this.addLevel(s.object.clone(),s.distance,s.hysteresis)}return this.autoUpdate=e.autoUpdate,this}addLevel(e,t=0,n=0){t=Math.abs(t);let i=this.levels,s;for(s=0;s<i.length;s++)if(t<i[s].distance)break;return i.splice(s,0,{distance:t,hysteresis:n,object:e}),this.add(e),this}removeLevel(e){let t=this.levels;for(let n=0;n<t.length;n++)if(t[n].distance===e){let i=t.splice(n,1);return this.remove(i[0].object),!0}return!1}getCurrentLevel(){return this._currentLevel}getObjectForDistance(e){let t=this.levels;if(t.length>0){let n,i;for(n=1,i=t.length;n<i;n++){let s=t[n].distance;if(t[n].object.visible)s-=s*t[n].hysteresis;if(e<s)break}return t[n-1].object}return null}raycast(e,t){if(this.levels.length>0){$l.setFromMatrixPosition(this.matrixWorld);let i=e.ray.origin.distanceTo($l);this.getObjectForDistance(i).raycast(e,t)}}update(e){let t=this.levels;if(t.length>1){$l.setFromMatrixPosition(e.matrixWorld),fm.setFromMatrixPosition(this.matrixWorld);let n=$l.distanceTo(fm)/e.zoom;t[0].object.visible=!0;let i,s;for(i=1,s=t.length;i<s;i++){let r=t[i].distance;if(t[i].object.visible)r-=r*t[i].hysteresis;if(n>=r)t[i-1].object.visible=!1,t[i].object.visible=!0;else break}this._currentLevel=i-1;for(;i<s;i++)t[i].object.visible=!1}}toJSON(e){let t=super.toJSON(e);if(this.autoUpdate===!1)t.object.autoUpdate=!1;t.object.levels=[];let n=this.levels;for(let i=0,s=n.length;i<s;i++){let r=n[i];t.object.levels.push({object:r.object.uuid,distance:r.distance,hysteresis:r.hysteresis})}return t}}var dm=new I,pm=new bt,mm=new bt,Wx=new I,gm=new He,ec=new I,Ou=new Xt,vm=new He,Bu=new ys;class ao extends vt{constructor(e,t){super(e,t);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;if(this.boundingBox===null)this.boundingBox=new zt;this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ec),this.boundingBox.expandByPoint(ec)}computeBoundingSphere(){let e=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new Xt;this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ec),this.boundingSphere.expandByPoint(ec)}copy(e,t){if(super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}raycast(e,t){let n=this.material,i=this.matrixWorld;if(n===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(Ou.copy(this.boundingSphere),Ou.applyMatrix4(i),e.ray.intersectsSphere(Ou)===!1)return;if(vm.copy(i).invert(),Bu.copy(e.ray).applyMatrix4(vm),this.boundingBox!==null){if(Bu.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(e,t,Bu)}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){if(this.skeleton=e,t===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld;this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new bt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();if(s!==1/0)e.multiplyScalar(s);else e.set(1,0,0,0);t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;pm.fromBufferAttribute(i.attributes.skinIndex,e),mm.fromBufferAttribute(i.attributes.skinWeight,e),dm.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){let r=mm.getComponent(s);if(r!==0){let o=pm.getComponent(s);gm.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Wx.copy(dm).applyMatrix4(gm),r)}}return t.applyMatrix4(this.bindMatrixInverse)}}class rr extends dt{constructor(){super();this.isBone=!0,this.type="Bone"}}class mn extends Rt{constructor(e=null,t=1,n=1,i,s,r,o,a,l=1003,c=1003,h,u){super(null,r,o,a,l,c,i,s,h,u);this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var xm=new He,Vx=new He;class or{constructor(e=[],t=[]){this.uuid=kn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new He;if(this.bones[e])n.copy(this.bones[e].matrixWorld).invert();this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n)n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];if(n){if(n.parent&&n.parent.isBone)n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld);else n.matrix.copy(n.matrixWorld);n.matrix.decompose(n.position,n.quaternion,n.scale)}}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,r=e.length;s<r;s++){let o=e[s]?e[s].matrixWorld:Vx;xm.multiplyMatrices(o,t[s]),xm.toArray(n,s*16)}if(i!==null)i.needsUpdate=!0}clone(){return new or(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new mn(t,e,e,1023,1015);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let s=e.bones[n],r=t[s];if(r===void 0)console.warn("THREE.Skeleton: No bone found with UUID:",s),r=new rr;this.bones.push(r),this.boneInverses.push(new He().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,s=t.length;i<s;i++){let r=t[i];e.bones.push(r.uuid);let o=n[i];e.boneInverses.push(o.toArray())}return e}}class Tn extends at{constructor(e,t,n,i=1){super(e,t,n);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}var Hr=new He,ym=new He,tc=[],_m=new zt,Xx=new He,Bo=new vt,zo=new Xt;class Ln extends vt{constructor(e,t,n){super(e,t);this.isInstancedMesh=!0,this.instanceMatrix=new Tn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Xx)}computeBoundingBox(){let e=this.geometry,t=this.count;if(this.boundingBox===null)this.boundingBox=new zt;if(e.boundingBox===null)e.computeBoundingBox();this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Hr),_m.copy(e.boundingBox).applyMatrix4(Hr),this.boundingBox.union(_m)}computeBoundingSphere(){let e=this.geometry,t=this.count;if(this.boundingSphere===null)this.boundingSphere=new Xt;if(e.boundingSphere===null)e.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Hr),zo.copy(e.boundingSphere).applyMatrix4(Hr),this.boundingSphere.union(zo)}copy(e,t){if(super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null)this.morphTexture=e.morphTexture.clone();if(e.instanceColor!==null)this.instanceColor=e.instanceColor.clone();if(this.count=e.count,e.boundingBox!==null)this.boundingBox=e.boundingBox.clone();if(e.boundingSphere!==null)this.boundingSphere=e.boundingSphere.clone();return this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,r=e*s+1;for(let o=0;o<n.length;o++)n[o]=i[r+o]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Bo.geometry=this.geometry,Bo.material=this.material,Bo.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(zo.copy(this.boundingSphere),zo.applyMatrix4(n),e.ray.intersectsSphere(zo)===!1)return;for(let s=0;s<i;s++){this.getMatrixAt(s,Hr),ym.multiplyMatrices(n,Hr),Bo.matrixWorld=ym,Bo.raycast(e,tc);for(let r=0,o=tc.length;r<o;r++){let a=tc[r];a.instanceId=s,a.object=this,t.push(a)}tc.length=0}}setColorAt(e,t){if(this.instanceColor===null)this.instanceColor=new Tn(new Float32Array(this.instanceMatrix.count*3).fill(1),3);t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;if(this.morphTexture===null)this.morphTexture=new mn(new Float32Array(i*this.count),i,this.count,1028,1015);let s=this.morphTexture.source.data.data,r=0;for(let l=0;l<n.length;l++)r+=n[l];let o=this.geometry.morphTargetsRelative?1:1-r,a=i*e;s[a]=o,s.set(n,a+1)}updateMorphTargets(){}dispose(){if(this.dispatchEvent({type:"dispose"}),this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var zu=new I,qx=new I,Yx=new ht;class Ei{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=zu.subVectors(n,t).cross(qx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(zu),i=this.normal.dot(n);if(i===0){if(this.distanceToPoint(e.start)===0)return t.copy(e.start);return null}let s=-(e.start.dot(this.normal)+this.constant)/i;if(s<0||s>1)return null;return t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Yx.getNormalMatrix(e),i=this.coplanarPoint(zu).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}var Ls=new Xt,Zx=new se(0.5,0.5),nc=new I;class _s{constructor(e=new Ei,t=new Ei,n=new Ei,i=new Ei,s=new Ei,r=new Ei){this.planes=[e,t,n,i,s,r]}set(e,t,n,i,s,r){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(r),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=2000,n=!1){let i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],d=s[8],g=s[9],x=s[10],m=s[11],p=s[12],M=s[13],y=s[14],S=s[15];if(i[0].setComponents(l-r,f-c,m-d,S-p).normalize(),i[1].setComponents(l+r,f+c,m+d,S+p).normalize(),i[2].setComponents(l+o,f+h,m+g,S+M).normalize(),i[3].setComponents(l-o,f-h,m-g,S-M).normalize(),n)i[4].setComponents(a,u,x,y).normalize(),i[5].setComponents(l-a,f-u,m-x,S-y).normalize();else if(i[4].setComponents(l-a,f-u,m-x,S-y).normalize(),t===2000)i[5].setComponents(l+a,f+u,m+x,S+y).normalize();else if(t===2001)i[5].setComponents(a,u,x,y).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0){if(e.boundingSphere===null)e.computeBoundingSphere();Ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld)}else{let t=e.geometry;if(t.boundingSphere===null)t.computeBoundingSphere();Ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ls)}intersectsSprite(e){Ls.center.set(0,0,0);let t=Zx.distanceTo(e.center);return Ls.radius=0.7071067811865476+t,Ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ls)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(nc.x=i.normal.x>0?e.max.x:e.min.x,nc.y=i.normal.y>0?e.max.y:e.min.y,nc.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(nc)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var bi=new He,Ti=new _s;class Ta{constructor(){this.coordinateSystem=2000}intersectsObject(e,t){if(!t.isArrayCamera||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(bi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),Ti.setFromProjectionMatrix(bi,i.coordinateSystem,i.reversedDepth),Ti.intersectsObject(e))return!0}return!1}intersectsSprite(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(bi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),Ti.setFromProjectionMatrix(bi,i.coordinateSystem,i.reversedDepth),Ti.intersectsSprite(e))return!0}return!1}intersectsSphere(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(bi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),Ti.setFromProjectionMatrix(bi,i.coordinateSystem,i.reversedDepth),Ti.intersectsSphere(e))return!0}return!1}intersectsBox(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(bi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),Ti.setFromProjectionMatrix(bi,i.coordinateSystem,i.reversedDepth),Ti.intersectsBox(e))return!0}return!1}containsPoint(e,t){if(!t||!t.cameras||t.cameras.length===0)return!1;for(let n=0;n<t.cameras.length;n++){let i=t.cameras[n];if(bi.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),Ti.setFromProjectionMatrix(bi,i.coordinateSystem,i.reversedDepth),Ti.containsPoint(e))return!0}return!1}clone(){return new Ta}}function Hu(e,t){return e-t}function Kx(e,t){return e.z-t.z}function Jx(e,t){return t.z-e.z}class ng{constructor(){this.index=0,this.pool=[],this.list=[]}push(e,t,n,i){let s=this.pool,r=this.list;if(this.index>=s.length)s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];r.push(o),this.index++,o.start=e,o.count=t,o.z=n,o.index=i}reset(){this.list.length=0,this.index=0}}var Cn=new He,jx=new fe(1,1,1),Mm=new _s,Qx=new Ta,ic=new zt,Ns=new Xt,Ho=new I,Sm=new I,$x=new I,ku=new ng,pn=new vt,sc=[];function ey(e,t,n=0){let i=t.itemSize;if(e.isInterleavedBufferAttribute||e.array.constructor!==t.array.constructor){let s=e.count;for(let r=0;r<s;r++)for(let o=0;o<i;o++)t.setComponent(r+n,o,e.getComponent(r,o))}else t.array.set(e.array,n*i);t.needsUpdate=!0}function Us(e,t){if(e.constructor!==t.constructor){let n=Math.min(e.length,t.length);for(let i=0;i<n;i++)t[i]=e[i]}else{let n=Math.min(e.length,t.length);t.set(new e.constructor(e.buffer,0,n))}}class _h extends vt{constructor(e,t,n=t*2,i){super(new Je,i);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=e,this._maxVertexCount=t,this._maxIndexCount=n,this._multiDrawCounts=new Int32Array(e),this._multiDrawStarts=new Int32Array(e),this._multiDrawCount=0,this._multiDrawInstances=null,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let e=Math.sqrt(this._maxInstanceCount*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4),n=new mn(t,e,e,1023,1015);this._matricesTexture=n}_initIndirectTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Uint32Array(e*e),n=new mn(t,e,e,1029,1014);this._indirectTexture=n}_initColorsTexture(){let e=Math.sqrt(this._maxInstanceCount);e=Math.ceil(e);let t=new Float32Array(e*e*4).fill(1),n=new mn(t,e,e,1023,1015);n.colorSpace=mt.workingColorSpace,this._colorsTexture=n}_initializeGeometry(e){let t=this.geometry,n=this._maxVertexCount,i=this._maxIndexCount;if(this._geometryInitialized===!1){for(let s in e.attributes){let r=e.getAttribute(s),{array:o,itemSize:a,normalized:l}=r,c=new o.constructor(n*a),h=new at(c,a,l);t.setAttribute(s,h)}if(e.getIndex()!==null){let s=n>65535?new Uint32Array(i):new Uint16Array(i);t.setIndex(new at(s,1))}this._geometryInitialized=!0}}_validateGeometry(e){let t=this.geometry;if(Boolean(e.getIndex())!==Boolean(t.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let n in t.attributes){if(!e.hasAttribute(n))throw Error(`THREE.BatchedMesh: Added geometry missing "${n}". All geometries must have consistent attributes.`);let i=e.getAttribute(n),s=t.getAttribute(n);if(i.itemSize!==s.itemSize||i.normalized!==s.normalized)throw Error("THREE.BatchedMesh: All attributes must have a consistent itemSize and normalized value.")}}validateInstanceId(e){let t=this._instanceInfo;if(e<0||e>=t.length||t[e].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${e}. Instance is either out of range or has been deleted.`)}validateGeometryId(e){let t=this._geometryInfo;if(e<0||e>=t.length||t[e].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${e}. Geometry is either out of range or has been deleted.`)}setCustomSort(e){return this.customSort=e,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new zt;let e=this.boundingBox,t=this._instanceInfo;e.makeEmpty();for(let n=0,i=t.length;n<i;n++){if(t[n].active===!1)continue;let s=t[n].geometryIndex;this.getMatrixAt(n,Cn),this.getBoundingBoxAt(s,ic).applyMatrix4(Cn),e.union(ic)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Xt;let e=this.boundingSphere,t=this._instanceInfo;e.makeEmpty();for(let n=0,i=t.length;n<i;n++){if(t[n].active===!1)continue;let s=t[n].geometryIndex;this.getMatrixAt(n,Cn),this.getBoundingSphereAt(s,Ns).applyMatrix4(Cn),e.union(Ns)}}addInstance(e){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let n={visible:!0,active:!0,geometryIndex:e},i=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Hu),i=this._availableInstanceIds.shift(),this._instanceInfo[i]=n;else i=this._instanceInfo.length,this._instanceInfo.push(n);let s=this._matricesTexture;Cn.identity().toArray(s.image.data,i*16),s.needsUpdate=!0;let r=this._colorsTexture;if(r)jx.toArray(r.image.data,i*4),r.needsUpdate=!0;return this._visibilityChanged=!0,i}addGeometry(e,t=-1,n=-1){this._initializeGeometry(e),this._validateGeometry(e);let i={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},s=this._geometryInfo;i.vertexStart=this._nextVertexStart,i.reservedVertexCount=t===-1?e.getAttribute("position").count:t;let r=e.getIndex();if(r!==null)i.indexStart=this._nextIndexStart,i.reservedIndexCount=n===-1?r.count:n;if(i.indexStart!==-1&&i.indexStart+i.reservedIndexCount>this._maxIndexCount||i.vertexStart+i.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let a;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Hu),a=this._availableGeometryIds.shift(),s[a]=i;else a=this._geometryCount,this._geometryCount++,s.push(i);return this.setGeometryAt(a,e),this._nextIndexStart=i.indexStart+i.reservedIndexCount,this._nextVertexStart=i.vertexStart+i.reservedVertexCount,a}setGeometryAt(e,t){if(e>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(t);let n=this.geometry,i=n.getIndex()!==null,s=n.getIndex(),r=t.getIndex(),o=this._geometryInfo[e];if(i&&r.count>o.reservedIndexCount||t.attributes.position.count>o.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:a,reservedVertexCount:l}=o;o.vertexCount=t.getAttribute("position").count;for(let c in n.attributes){let h=t.getAttribute(c),u=n.getAttribute(c);ey(h,u,a);let f=h.itemSize;for(let d=h.count,g=l;d<g;d++){let x=a+d;for(let m=0;m<f;m++)u.setComponent(x,m,0)}u.needsUpdate=!0,u.addUpdateRange(a*f,l*f)}if(i){let{indexStart:c,reservedIndexCount:h}=o;o.indexCount=t.getIndex().count;for(let u=0;u<r.count;u++)s.setX(c+u,a+r.getX(u));for(let u=r.count,f=h;u<f;u++)s.setX(c+u,a);s.needsUpdate=!0,s.addUpdateRange(c,o.reservedIndexCount)}if(o.start=i?o.indexStart:o.vertexStart,o.count=i?o.indexCount:o.vertexCount,o.boundingBox=null,t.boundingBox!==null)o.boundingBox=t.boundingBox.clone();if(o.boundingSphere=null,t.boundingSphere!==null)o.boundingSphere=t.boundingSphere.clone();return this._visibilityChanged=!0,e}deleteGeometry(e){let t=this._geometryInfo;if(e>=t.length||t[e].active===!1)return this;let n=this._instanceInfo;for(let i=0,s=n.length;i<s;i++)if(n[i].active&&n[i].geometryIndex===e)this.deleteInstance(i);return t[e].active=!1,this._availableGeometryIds.push(e),this._visibilityChanged=!0,this}deleteInstance(e){return this.validateInstanceId(e),this._instanceInfo[e].active=!1,this._availableInstanceIds.push(e),this._visibilityChanged=!0,this}optimize(){let e=0,t=0,n=this._geometryInfo,i=n.map((r,o)=>o).sort((r,o)=>n[r].vertexStart-n[o].vertexStart),s=this.geometry;for(let r=0,o=n.length;r<o;r++){let a=i[r],l=n[a];if(l.active===!1)continue;if(s.index!==null){if(l.indexStart!==t){let{indexStart:c,vertexStart:h,reservedIndexCount:u}=l,f=s.index,d=f.array,g=e-h;for(let x=c;x<c+u;x++)d[x]=d[x]+g;f.array.copyWithin(t,c,c+u),f.addUpdateRange(t,u),l.indexStart=t}t+=l.reservedIndexCount}if(l.vertexStart!==e){let{vertexStart:c,reservedVertexCount:h}=l,u=s.attributes;for(let f in u){let d=u[f],{array:g,itemSize:x}=d;g.copyWithin(e*x,c*x,(c+h)*x),d.addUpdateRange(e*x,h*x)}l.vertexStart=e}e+=l.reservedVertexCount,l.start=s.index?l.indexStart:l.vertexStart,this._nextIndexStart=s.index?l.indexStart+l.reservedIndexCount:0,this._nextVertexStart=l.vertexStart+l.reservedVertexCount}return this}getBoundingBoxAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,i=this._geometryInfo[e];if(i.boundingBox===null){let s=new zt,r=n.index,o=n.attributes.position;for(let a=i.start,l=i.start+i.count;a<l;a++){let c=a;if(r)c=r.getX(c);s.expandByPoint(Ho.fromBufferAttribute(o,c))}i.boundingBox=s}return t.copy(i.boundingBox),t}getBoundingSphereAt(e,t){if(e>=this._geometryCount)return null;let n=this.geometry,i=this._geometryInfo[e];if(i.boundingSphere===null){let s=new Xt;this.getBoundingBoxAt(e,ic),ic.getCenter(s.center);let r=n.index,o=n.attributes.position,a=0;for(let l=i.start,c=i.start+i.count;l<c;l++){let h=l;if(r)h=r.getX(h);Ho.fromBufferAttribute(o,h),a=Math.max(a,s.center.distanceToSquared(Ho))}s.radius=Math.sqrt(a),i.boundingSphere=s}return t.copy(i.boundingSphere),t}setMatrixAt(e,t){this.validateInstanceId(e);let n=this._matricesTexture,i=this._matricesTexture.image.data;return t.toArray(i,e*16),n.needsUpdate=!0,this}getMatrixAt(e,t){return this.validateInstanceId(e),t.fromArray(this._matricesTexture.image.data,e*16)}setColorAt(e,t){if(this.validateInstanceId(e),this._colorsTexture===null)this._initColorsTexture();return t.toArray(this._colorsTexture.image.data,e*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(e,t){return this.validateInstanceId(e),t.fromArray(this._colorsTexture.image.data,e*4)}setVisibleAt(e,t){if(this.validateInstanceId(e),this._instanceInfo[e].visible===t)return this;return this._instanceInfo[e].visible=t,this._visibilityChanged=!0,this}getVisibleAt(e){return this.validateInstanceId(e),this._instanceInfo[e].visible}setGeometryIdAt(e,t){return this.validateInstanceId(e),this.validateGeometryId(t),this._instanceInfo[e].geometryIndex=t,this}getGeometryIdAt(e){return this.validateInstanceId(e),this._instanceInfo[e].geometryIndex}getGeometryRangeAt(e,t={}){this.validateGeometryId(e);let n=this._geometryInfo[e];return t.vertexStart=n.vertexStart,t.vertexCount=n.vertexCount,t.reservedVertexCount=n.reservedVertexCount,t.indexStart=n.indexStart,t.indexCount=n.indexCount,t.reservedIndexCount=n.reservedIndexCount,t.start=n.start,t.count=n.count,t}setInstanceCount(e){let t=this._availableInstanceIds,n=this._instanceInfo;t.sort(Hu);while(t[t.length-1]===n.length-1)n.pop(),t.pop();if(e<n.length)throw Error(`BatchedMesh: Instance ids outside the range ${e} are being used. Cannot shrink instance count.`);let i=new Int32Array(e),s=new Int32Array(e);Us(this._multiDrawCounts,i),Us(this._multiDrawStarts,s),this._multiDrawCounts=i,this._multiDrawStarts=s,this._maxInstanceCount=e;let r=this._indirectTexture,o=this._matricesTexture,a=this._colorsTexture;if(r.dispose(),this._initIndirectTexture(),Us(r.image.data,this._indirectTexture.image.data),o.dispose(),this._initMatricesTexture(),Us(o.image.data,this._matricesTexture.image.data),a)a.dispose(),this._initColorsTexture(),Us(a.image.data,this._colorsTexture.image.data)}setGeometrySize(e,t){let n=[...this._geometryInfo].filter((o)=>o.active);if(Math.max(...n.map((o)=>o.vertexStart+o.reservedVertexCount))>e)throw Error(`BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...n.map((a)=>a.indexStart+a.reservedIndexCount))>t)throw Error(`BatchedMesh: Geometry index values are being used outside the range ${t}. Cannot shrink further.`)}let s=this.geometry;if(s.dispose(),this._maxVertexCount=e,this._maxIndexCount=t,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new Je,this._initializeGeometry(s);let r=this.geometry;if(s.index)Us(s.index.array,r.index.array);for(let o in s.attributes)Us(s.attributes[o].array,r.attributes[o].array)}raycast(e,t){let n=this._instanceInfo,i=this._geometryInfo,s=this.matrixWorld,r=this.geometry;if(pn.material=this.material,pn.geometry.index=r.index,pn.geometry.attributes=r.attributes,pn.geometry.boundingBox===null)pn.geometry.boundingBox=new zt;if(pn.geometry.boundingSphere===null)pn.geometry.boundingSphere=new Xt;for(let o=0,a=n.length;o<a;o++){if(!n[o].visible||!n[o].active)continue;let l=n[o].geometryIndex,c=i[l];pn.geometry.setDrawRange(c.start,c.count),this.getMatrixAt(o,pn.matrixWorld).premultiply(s),this.getBoundingBoxAt(l,pn.geometry.boundingBox),this.getBoundingSphereAt(l,pn.geometry.boundingSphere),pn.raycast(e,sc);for(let h=0,u=sc.length;h<u;h++){let f=sc[h];f.object=this,f.batchId=o,t.push(f)}sc.length=0}pn.material=null,pn.geometry.index=null,pn.geometry.attributes={},pn.geometry.setDrawRange(0,1/0)}copy(e){if(super.copy(e),this.geometry=e.geometry.clone(),this.perObjectFrustumCulled=e.perObjectFrustumCulled,this.sortObjects=e.sortObjects,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this._geometryInfo=e._geometryInfo.map((t)=>({...t,boundingBox:t.boundingBox!==null?t.boundingBox.clone():null,boundingSphere:t.boundingSphere!==null?t.boundingSphere.clone():null})),this._instanceInfo=e._instanceInfo.map((t)=>({...t})),this._availableInstanceIds=e._availableInstanceIds.slice(),this._availableGeometryIds=e._availableGeometryIds.slice(),this._nextIndexStart=e._nextIndexStart,this._nextVertexStart=e._nextVertexStart,this._geometryCount=e._geometryCount,this._maxInstanceCount=e._maxInstanceCount,this._maxVertexCount=e._maxVertexCount,this._maxIndexCount=e._maxIndexCount,this._geometryInitialized=e._geometryInitialized,this._multiDrawCounts=e._multiDrawCounts.slice(),this._multiDrawStarts=e._multiDrawStarts.slice(),this._indirectTexture=e._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=e._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),this._colorsTexture!==null)this._colorsTexture=e._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();return this}dispose(){if(this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null}onBeforeRender(e,t,n,i,s){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let r=i.getIndex(),o=r===null?1:r.array.BYTES_PER_ELEMENT,a=this._instanceInfo,l=this._multiDrawStarts,c=this._multiDrawCounts,h=this._geometryInfo,u=this.perObjectFrustumCulled,f=this._indirectTexture,d=f.image.data,g=n.isArrayCamera?Qx:Mm;if(u&&!n.isArrayCamera)Cn.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse).multiply(this.matrixWorld),Mm.setFromProjectionMatrix(Cn,n.coordinateSystem,n.reversedDepth);let x=0;if(this.sortObjects){Cn.copy(this.matrixWorld).invert(),Ho.setFromMatrixPosition(n.matrixWorld).applyMatrix4(Cn),Sm.set(0,0,-1).transformDirection(n.matrixWorld).transformDirection(Cn);for(let M=0,y=a.length;M<y;M++)if(a[M].visible&&a[M].active){let S=a[M].geometryIndex;this.getMatrixAt(M,Cn),this.getBoundingSphereAt(S,Ns).applyMatrix4(Cn);let C=!1;if(u)C=!g.intersectsSphere(Ns,n);if(!C){let R=h[S],E=$x.subVectors(Ns.center,Ho).dot(Sm);ku.push(R.start,R.count,E,M)}}let m=ku.list,p=this.customSort;if(p===null)m.sort(s.transparent?Jx:Kx);else p.call(this,m,n);for(let M=0,y=m.length;M<y;M++){let S=m[M];l[x]=S.start*o,c[x]=S.count,d[x]=S.index,x++}ku.reset()}else for(let m=0,p=a.length;m<p;m++)if(a[m].visible&&a[m].active){let M=a[m].geometryIndex,y=!1;if(u)this.getMatrixAt(m,Cn),this.getBoundingSphereAt(M,Ns).applyMatrix4(Cn),y=!g.intersectsSphere(Ns,n);if(!y){let S=h[M];l[x]=S.start*o,c[x]=S.count,d[x]=m,x++}}f.needsUpdate=!0,this._multiDrawCount=x,this._visibilityChanged=!1}onBeforeShadow(e,t,n,i,s,r){this.onBeforeRender(e,null,i,s,r)}}class tn extends Gt{constructor(e){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new fe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}var Sc=new I,wc=new I,wm=new He,ko=new ys,rc=new Xt,Gu=new I,bm=new I;class Jn extends dt{constructor(e=new Je,t=new tn){super();this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,s=t.count;i<s;i++)Sc.fromBufferAttribute(t,i-1),wc.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Sc.distanceTo(wc);e.setAttribute("lineDistance",new ze(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Line.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(rc.copy(n.boundingSphere),rc.applyMatrix4(i),rc.radius+=s,e.ray.intersectsSphere(rc)===!1)return;wm.copy(i).invert(),ko.copy(e.ray).applyMatrix4(wm);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),a=o*o,l=this.isLineSegments?2:1,c=n.index,u=n.attributes.position;if(c!==null){let f=Math.max(0,r.start),d=Math.min(c.count,r.start+r.count);for(let g=f,x=d-1;g<x;g+=l){let m=c.getX(g),p=c.getX(g+1),M=oc(this,e,ko,a,m,p,g);if(M)t.push(M)}if(this.isLineLoop){let g=c.getX(d-1),x=c.getX(f),m=oc(this,e,ko,a,g,x,d-1);if(m)t.push(m)}}else{let f=Math.max(0,r.start),d=Math.min(u.count,r.start+r.count);for(let g=f,x=d-1;g<x;g+=l){let m=oc(this,e,ko,a,g,g+1,g);if(m)t.push(m)}if(this.isLineLoop){let g=oc(this,e,ko,a,d-1,f,d-1);if(g)t.push(g)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function oc(e,t,n,i,s,r,o){let a=e.geometry.attributes.position;if(Sc.fromBufferAttribute(a,s),wc.fromBufferAttribute(a,r),n.distanceSqToSegment(Sc,wc,Gu,bm)>i)return;Gu.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Gu);if(c<t.near||c>t.far)return;return{distance:c,point:bm.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Tm=new I,Em=new I;class _n extends Jn{constructor(e,t){super(e,t);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,s=t.count;i<s;i+=2)Tm.fromBufferAttribute(t,i),Em.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Tm.distanceTo(Em);e.setAttribute("lineDistance",new ze(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class lo extends Jn{constructor(e,t){super(e,t);this.isLineLoop=!0,this.type="LineLoop"}}class ar extends Gt{constructor(e){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new fe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}var Am=new He,ef=new ys,ac=new Xt,lc=new I;class co extends dt{constructor(e=new Je,t=new ar){super();this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,i=this.matrixWorld,s=e.params.Points.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(ac.copy(n.boundingSphere),ac.applyMatrix4(i),ac.radius+=s,e.ray.intersectsSphere(ac)===!1)return;Am.copy(i).invert(),ef.copy(e.ray).applyMatrix4(Am);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),a=o*o,l=n.index,h=n.attributes.position;if(l!==null){let u=Math.max(0,r.start),f=Math.min(l.count,r.start+r.count);for(let d=u,g=f;d<g;d++){let x=l.getX(d);lc.fromBufferAttribute(h,x),Rm(lc,x,a,i,e,t,this)}}else{let u=Math.max(0,r.start),f=Math.min(h.count,r.start+r.count);for(let d=u,g=f;d<g;d++)lc.fromBufferAttribute(h,d),Rm(lc,d,a,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Rm(e,t,n,i,s,r,o){let a=ef.distanceSqToPoint(e);if(a<n){let l=new I;ef.closestPointToPoint(e,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class Mh extends Rt{constructor(e,t,n,i,s=1006,r=1006,o,a,l){super(e,t,n,i,s,r,o,a,l);this.isVideoTexture=!0,this.generateMipmaps=!1,this._requestVideoFrameCallbackId=0;let c=this;function h(){c.needsUpdate=!0,c._requestVideoFrameCallbackId=e.requestVideoFrameCallback(h)}if("requestVideoFrameCallback"in e)this._requestVideoFrameCallbackId=e.requestVideoFrameCallback(h)}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;if("requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA)this.needsUpdate=!0}dispose(){if(this._requestVideoFrameCallbackId!==0)this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId);super.dispose()}}class nd extends Mh{constructor(e,t,n,i,s,r,o,a){super({},e,t,n,i,s,r,o,a);this.isVideoFrameTexture=!0}update(){}clone(){return new this.constructor().copy(this)}setFrame(e){this.image=e,this.needsUpdate=!0}}class id extends Rt{constructor(e,t){super({width:e,height:t});this.isFramebufferTexture=!0,this.magFilter=1003,this.minFilter=1003,this.generateMipmaps=!1,this.needsUpdate=!0}}class ho extends Rt{constructor(e,t,n,i,s,r,o,a,l,c,h,u){super(null,r,o,a,l,c,i,s,h,u);this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class sd extends ho{constructor(e,t,n,i,s,r){super(e,t,n,s,r);this.isCompressedArrayTexture=!0,this.image.depth=i,this.wrapR=1001,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class rd extends ho{constructor(e,t,n){super(void 0,e[0].width,e[0].height,t,n,301);this.isCompressedCubeTexture=!0,this.isCubeTexture=!0,this.image=e}}class Pi extends Rt{constructor(e,t,n,i,s,r,o,a,l){super(e,t,n,i,s,r,o,a,l);this.isCanvasTexture=!0,this.needsUpdate=!0}}class lr extends Rt{constructor(e,t,n=1014,i,s,r,o=1003,a=1003,l,c=1026,h=1){if(c!==1026&&c!==1027)throw Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:h};super(u,i,s,r,o,a,c,n,l);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ai(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);if(this.compareFunction!==null)t.compareFunction=this.compareFunction;return t}}class Ea extends Rt{constructor(e=null){super();this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Aa extends Je{constructor(e=1,t=1,n=4,i=8,s=1){super();this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:s},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),s=Math.max(1,Math.floor(s));let r=[],o=[],a=[],l=[],c=t/2,h=Math.PI/2*e,u=t,f=2*h+u,d=n*2+s,g=i+1,x=new I,m=new I;for(let p=0;p<=d;p++){let M=0,y=0,S=0,C=0;if(p<=n){let D=p/n,w=D*Math.PI/2;y=-c-e*Math.cos(w),S=e*Math.sin(w),C=-e*Math.cos(w),M=D*h}else if(p<=n+s){let D=(p-n)/s;y=-c+D*t,S=e,C=0,M=h+D*u}else{let D=(p-n-s)/n,w=D*Math.PI/2;y=c+e*Math.sin(w),S=e*Math.cos(w),C=e*Math.sin(w),M=h+u+D*h}let R=Math.max(0,Math.min(1,M/f)),E=0;if(p===0)E=0.5/i;else if(p===d)E=-0.5/i;for(let D=0;D<=i;D++){let w=D/i,T=w*Math.PI*2,P=Math.sin(T),B=Math.cos(T);m.x=-S*B,m.y=y,m.z=S*P,o.push(m.x,m.y,m.z),x.set(-S*B,C,S*P),x.normalize(),a.push(x.x,x.y,x.z),l.push(w+E,R)}if(p>0){let D=(p-1)*g;for(let w=0;w<i;w++){let T=D+w,P=D+w+1,B=p*g+w,H=p*g+w+1;r.push(T,P,B),r.push(P,H,B)}}}this.setIndex(r),this.setAttribute("position",new ze(o,3)),this.setAttribute("normal",new ze(a,3)),this.setAttribute("uv",new ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Aa(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Ms extends Je{constructor(e=1,t=32,n=0,i=Math.PI*2){super();this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let s=[],r=[],o=[],a=[],l=new I,c=new se;r.push(0,0,0),o.push(0,0,1),a.push(0.5,0.5);for(let h=0,u=3;h<=t;h++,u+=3){let f=n+h/t*i;l.x=e*Math.cos(f),l.y=e*Math.sin(f),r.push(l.x,l.y,l.z),o.push(0,0,1),c.x=(r[u]/e+1)/2,c.y=(r[u+1]/e+1)/2,a.push(c.x,c.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new ze(r,3)),this.setAttribute("normal",new ze(o,3)),this.setAttribute("uv",new ze(a,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ms(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class En extends Je{constructor(e=1,t=1,n=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super();this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a};let l=this;i=Math.floor(i),s=Math.floor(s);let c=[],h=[],u=[],f=[],d=0,g=[],x=n/2,m=0;if(p(),r===!1){if(e>0)M(!0);if(t>0)M(!1)}this.setIndex(c),this.setAttribute("position",new ze(h,3)),this.setAttribute("normal",new ze(u,3)),this.setAttribute("uv",new ze(f,2));function p(){let y=new I,S=new I,C=0,R=(t-e)/n;for(let E=0;E<=s;E++){let D=[],w=E/s,T=w*(t-e)+e;for(let P=0;P<=i;P++){let B=P/i,H=B*a+o,k=Math.sin(H),X=Math.cos(H);S.x=T*k,S.y=-w*n+x,S.z=T*X,h.push(S.x,S.y,S.z),y.set(k,R,X).normalize(),u.push(y.x,y.y,y.z),f.push(B,1-w),D.push(d++)}g.push(D)}for(let E=0;E<i;E++)for(let D=0;D<s;D++){let w=g[D][E],T=g[D+1][E],P=g[D+1][E+1],B=g[D][E+1];if(e>0||D!==0)c.push(w,T,B),C+=3;if(t>0||D!==s-1)c.push(T,P,B),C+=3}l.addGroup(m,C,0),m+=C}function M(y){let S=d,C=new se,R=new I,E=0,D=y===!0?e:t,w=y===!0?1:-1;for(let P=1;P<=i;P++)h.push(0,x*w,0),u.push(0,w,0),f.push(0.5,0.5),d++;let T=d;for(let P=0;P<=i;P++){let H=P/i*a+o,k=Math.cos(H),X=Math.sin(H);R.x=D*X,R.y=x*w,R.z=D*k,h.push(R.x,R.y,R.z),u.push(0,w,0),C.x=k*0.5+0.5,C.y=X*0.5*w+0.5,f.push(C.x,C.y),d++}for(let P=0;P<i;P++){let B=S+P,H=T+P;if(y===!0)c.push(H,H+1,B);else c.push(H+1,H,B);E+=3}l.addGroup(m,E,y===!0?1:2),m+=E}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new En(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ji extends En{constructor(e=1,t=1,n=32,i=1,s=!1,r=0,o=Math.PI*2){super(0,e,t,n,i,s,r,o);this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:r,thetaLength:o}}static fromJSON(e){return new ji(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Qi extends Je{constructor(e=[],t=[],n=1,i=0){super();this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let s=[],r=[];if(o(i),l(n),c(),this.setAttribute("position",new ze(s,3)),this.setAttribute("normal",new ze(s.slice(),3)),this.setAttribute("uv",new ze(r,2)),i===0)this.computeVertexNormals();else this.normalizeNormals();function o(p){let M=new I,y=new I,S=new I;for(let C=0;C<t.length;C+=3)f(t[C+0],M),f(t[C+1],y),f(t[C+2],S),a(M,y,S,p)}function a(p,M,y,S){let C=S+1,R=[];for(let E=0;E<=C;E++){R[E]=[];let D=p.clone().lerp(y,E/C),w=M.clone().lerp(y,E/C),T=C-E;for(let P=0;P<=T;P++)if(P===0&&E===C)R[E][P]=D;else R[E][P]=D.clone().lerp(w,P/T)}for(let E=0;E<C;E++)for(let D=0;D<2*(C-E)-1;D++){let w=Math.floor(D/2);if(D%2===0)u(R[E][w+1]),u(R[E+1][w]),u(R[E][w]);else u(R[E][w+1]),u(R[E+1][w+1]),u(R[E+1][w])}}function l(p){let M=new I;for(let y=0;y<s.length;y+=3)M.x=s[y+0],M.y=s[y+1],M.z=s[y+2],M.normalize().multiplyScalar(p),s[y+0]=M.x,s[y+1]=M.y,s[y+2]=M.z}function c(){let p=new I;for(let M=0;M<s.length;M+=3){p.x=s[M+0],p.y=s[M+1],p.z=s[M+2];let y=x(p)/2/Math.PI+0.5,S=m(p)/Math.PI+0.5;r.push(y,1-S)}d(),h()}function h(){for(let p=0;p<r.length;p+=6){let M=r[p+0],y=r[p+2],S=r[p+4],C=Math.max(M,y,S),R=Math.min(M,y,S);if(C>0.9&&R<0.1){if(M<0.2)r[p+0]+=1;if(y<0.2)r[p+2]+=1;if(S<0.2)r[p+4]+=1}}}function u(p){s.push(p.x,p.y,p.z)}function f(p,M){let y=p*3;M.x=e[y+0],M.y=e[y+1],M.z=e[y+2]}function d(){let p=new I,M=new I,y=new I,S=new I,C=new se,R=new se,E=new se;for(let D=0,w=0;D<s.length;D+=9,w+=6){p.set(s[D+0],s[D+1],s[D+2]),M.set(s[D+3],s[D+4],s[D+5]),y.set(s[D+6],s[D+7],s[D+8]),C.set(r[w+0],r[w+1]),R.set(r[w+2],r[w+3]),E.set(r[w+4],r[w+5]),S.copy(p).add(M).add(y).divideScalar(3);let T=x(S);g(C,w+0,p,T),g(R,w+2,M,T),g(E,w+4,y,T)}}function g(p,M,y,S){if(S<0&&p.x===1)r[M]=p.x-1;if(y.x===0&&y.z===0)r[M]=S/2/Math.PI+0.5}function x(p){return Math.atan2(p.z,-p.x)}function m(p){return Math.atan2(-p.y,Math.sqrt(p.x*p.x+p.z*p.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qi(e.vertices,e.indices,e.radius,e.details)}}class Ra extends Qi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],r=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,r,e,t);this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ra(e.radius,e.detail)}}var cc=new I,hc=new I,Wu=new I,uc=new bn;class Sh extends Je{constructor(e=null,t=1){super();if(this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let i=Math.pow(10,4),s=Math.cos(Ws*t),r=e.getIndex(),o=e.getAttribute("position"),a=r?r.count:o.count,l=[0,0,0],c=["a","b","c"],h=[,,,],u={},f=[];for(let d=0;d<a;d+=3){if(r)l[0]=r.getX(d),l[1]=r.getX(d+1),l[2]=r.getX(d+2);else l[0]=d,l[1]=d+1,l[2]=d+2;let{a:g,b:x,c:m}=uc;if(g.fromBufferAttribute(o,l[0]),x.fromBufferAttribute(o,l[1]),m.fromBufferAttribute(o,l[2]),uc.getNormal(Wu),h[0]=`${Math.round(g.x*i)},${Math.round(g.y*i)},${Math.round(g.z*i)}`,h[1]=`${Math.round(x.x*i)},${Math.round(x.y*i)},${Math.round(x.z*i)}`,h[2]=`${Math.round(m.x*i)},${Math.round(m.y*i)},${Math.round(m.z*i)}`,h[0]===h[1]||h[1]===h[2]||h[2]===h[0])continue;for(let p=0;p<3;p++){let M=(p+1)%3,y=h[p],S=h[M],C=uc[c[p]],R=uc[c[M]],E=`${y}_${S}`,D=`${S}_${y}`;if(D in u&&u[D]){if(Wu.dot(u[D].normal)<=s)f.push(C.x,C.y,C.z),f.push(R.x,R.y,R.z);u[D]=null}else if(!(E in u))u[E]={index0:l[p],index1:l[M],normal:Wu.clone()}}}for(let d in u)if(u[d]){let{index0:g,index1:x}=u[d];cc.fromBufferAttribute(o,g),hc.fromBufferAttribute(o,x),f.push(cc.x,cc.y,cc.z),f.push(hc.x,hc.y,hc.z)}this.setAttribute("position",new ze(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Gn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),s=0;t.push(0);for(let r=1;r<=e;r++)n=this.getPoint(r/e),s+=n.distanceTo(i),t.push(s),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,s=n.length,r;if(t)r=t;else r=e*n[s-1];let o=0,a=s-1,l;while(o<=a)if(i=Math.floor(o+(a-o)/2),l=n[i]-r,l<0)o=i+1;else if(l>0)a=i-1;else{a=i;break}if(i=a,n[i]===r)return i/(s-1);let c=n[i],u=n[i+1]-c,f=(r-c)/u;return(i+f)/(s-1)}getTangent(e,t){let i=e-0.0001,s=e+0.0001;if(i<0)i=0;if(s>1)s=1;let r=this.getPoint(i),o=this.getPoint(s),a=t||(r.isVector2?new se:new I);return a.copy(o).sub(r).normalize(),a}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new I,i=[],s=[],r=[],o=new I,a=new He;for(let f=0;f<=e;f++){let d=f/e;i[f]=this.getTangentAt(d,new I)}s[0]=new I,r[0]=new I;let l=Number.MAX_VALUE,c=Math.abs(i[0].x),h=Math.abs(i[0].y),u=Math.abs(i[0].z);if(c<=l)l=c,n.set(1,0,0);if(h<=l)l=h,n.set(0,1,0);if(u<=l)n.set(0,0,1);o.crossVectors(i[0],n).normalize(),s[0].crossVectors(i[0],o),r[0].crossVectors(i[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),r[f]=r[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();let d=Math.acos(it(i[f-1].dot(i[f]),-1,1));s[f].applyMatrix4(a.makeRotationAxis(o,d))}r[f].crossVectors(i[f],s[f])}if(t===!0){let f=Math.acos(it(s[0].dot(s[e]),-1,1));if(f/=e,i[0].dot(o.crossVectors(s[0],s[e]))>0)f=-f;for(let d=1;d<=e;d++)s[d].applyMatrix4(a.makeRotationAxis(i[d],f*d)),r[d].crossVectors(i[d],s[d])}return{tangents:i,normals:s,binormals:r}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class uo extends Gn{constructor(e=0,t=0,n=1,i=1,s=0,r=Math.PI*2,o=!1,a=0){super();this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=s,this.aEndAngle=r,this.aClockwise=o,this.aRotation=a}getPoint(e,t=new se){let n=t,i=Math.PI*2,s=this.aEndAngle-this.aStartAngle,r=Math.abs(s)<Number.EPSILON;while(s<0)s+=i;while(s>i)s-=i;if(s<Number.EPSILON)if(r)s=0;else s=i;if(this.aClockwise===!0&&!r)if(s===i)s=-i;else s=s-i;let o=this.aStartAngle+e*s,a=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let c=Math.cos(this.aRotation),h=Math.sin(this.aRotation),u=a-this.aX,f=l-this.aY;a=u*c-f*h+this.aX,l=u*h+f*c+this.aY}return n.set(a,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class wh extends uo{constructor(e,t,n,i,s,r){super(e,t,n,n,i,s,r);this.isArcCurve=!0,this.type="ArcCurve"}}function od(){let e=0,t=0,n=0,i=0;function s(r,o,a,l){e=r,t=a,n=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,d=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,d*=h,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return e+t*r+n*o+i*a}}}var fc=new I,Vu=new od,Xu=new od,qu=new od;class bh extends Gn{constructor(e=[],t=!1,n="centripetal",i=0.5){super();this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new I){let n=t,i=this.points,s=i.length,r=(s-(this.closed?0:1))*e,o=Math.floor(r),a=r-o;if(this.closed)o+=o>0?0:(Math.floor(Math.abs(o)/s)+1)*s;else if(a===0&&o===s-1)o=s-2,a=1;let l,c;if(this.closed||o>0)l=i[(o-1)%s];else fc.subVectors(i[0],i[1]).add(i[0]),l=fc;let h=i[o%s],u=i[(o+1)%s];if(this.closed||o+2<s)c=i[(o+2)%s];else fc.subVectors(i[s-1],i[s-2]).add(i[s-1]),c=fc;if(this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?0.5:0.25,d=Math.pow(l.distanceToSquared(h),f),g=Math.pow(h.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(c),f);if(g<0.0001)g=1;if(d<0.0001)d=g;if(x<0.0001)x=g;Vu.initNonuniformCatmullRom(l.x,h.x,u.x,c.x,d,g,x),Xu.initNonuniformCatmullRom(l.y,h.y,u.y,c.y,d,g,x),qu.initNonuniformCatmullRom(l.z,h.z,u.z,c.z,d,g,x)}else if(this.curveType==="catmullrom")Vu.initCatmullRom(l.x,h.x,u.x,c.x,this.tension),Xu.initCatmullRom(l.y,h.y,u.y,c.y,this.tension),qu.initCatmullRom(l.z,h.z,u.z,c.z,this.tension);return n.set(Vu.calc(a),Xu.calc(a),qu.calc(a)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new I().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Cm(e,t,n,i,s){let r=(i-t)*0.5,o=(s-n)*0.5,a=e*e,l=e*a;return(2*n-2*i+r+o)*l+(-3*n+3*i-2*r-o)*a+r*e+n}function ty(e,t){let n=1-e;return n*n*t}function ny(e,t){return 2*(1-e)*e*t}function iy(e,t){return e*e*t}function qo(e,t,n,i){return ty(e,t)+ny(e,n)+iy(e,i)}function sy(e,t){let n=1-e;return n*n*n*t}function ry(e,t){let n=1-e;return 3*n*n*e*t}function oy(e,t){return 3*(1-e)*e*e*t}function ay(e,t){return e*e*e*t}function Yo(e,t,n,i,s){return sy(e,t)+ry(e,n)+oy(e,i)+ay(e,s)}class Ca extends Gn{constructor(e=new se,t=new se,n=new se,i=new se){super();this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new se){let n=t,i=this.v0,s=this.v1,r=this.v2,o=this.v3;return n.set(Yo(e,i.x,s.x,r.x,o.x),Yo(e,i.y,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Th extends Gn{constructor(e=new I,t=new I,n=new I,i=new I){super();this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new I){let n=t,i=this.v0,s=this.v1,r=this.v2,o=this.v3;return n.set(Yo(e,i.x,s.x,r.x,o.x),Yo(e,i.y,s.y,r.y,o.y),Yo(e,i.z,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Ia extends Gn{constructor(e=new se,t=new se){super();this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new se){let n=t;if(e===1)n.copy(this.v2);else n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1);return n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new se){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Eh extends Gn{constructor(e=new I,t=new I){super();this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let n=t;if(e===1)n.copy(this.v2);else n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1);return n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Pa extends Gn{constructor(e=new se,t=new se,n=new se){super();this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new se){let n=t,i=this.v0,s=this.v1,r=this.v2;return n.set(qo(e,i.x,s.x,r.x),qo(e,i.y,s.y,r.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class cr extends Gn{constructor(e=new I,t=new I,n=new I){super();this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){let n=t,i=this.v0,s=this.v1,r=this.v2;return n.set(qo(e,i.x,s.x,r.x),qo(e,i.y,s.y,r.y),qo(e,i.z,s.z,r.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Da extends Gn{constructor(e=[]){super();this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new se){let n=t,i=this.points,s=(i.length-1)*e,r=Math.floor(s),o=s-r,a=i[r===0?r:r-1],l=i[r],c=i[r>i.length-2?i.length-1:r+1],h=i[r>i.length-3?i.length-1:r+2];return n.set(Cm(o,a.x,l.x,c.x,h.x),Cm(o,a.y,l.y,c.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new se().fromArray(i))}return this}}var bc=Object.freeze({__proto__:null,ArcCurve:wh,CatmullRomCurve3:bh,CubicBezierCurve:Ca,CubicBezierCurve3:Th,EllipseCurve:uo,LineCurve:Ia,LineCurve3:Eh,QuadraticBezierCurve:Pa,QuadraticBezierCurve3:cr,SplineCurve:Da});class Ah extends Gn{constructor(){super();this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new bc[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),s=0;while(s<i.length){if(i[s]>=n){let r=i[s]-n,o=this.curves[s],a=o.getLength(),l=a===0?0:1-r/a;return o.getPointAt(l,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));if(this.autoClose)t.push(t[0]);return t}getPoints(e=12){let t=[],n;for(let i=0,s=this.curves;i<s.length;i++){let r=s[i],o=r.isEllipseCurve?e*2:r.isLineCurve||r.isLineCurve3?1:r.isSplineCurve?e*r.points.length:e,a=r.getPoints(o);for(let l=0;l<a.length;l++){let c=a[l];if(n&&n.equals(c))continue;t.push(c),n=c}}if(this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0]))t.push(t[0]);return t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new bc[i.type]().fromJSON(i))}return this}}class Zr extends Ah{constructor(e){super();if(this.type="Path",this.currentPoint=new se,e)this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ia(this.currentPoint.clone(),new se(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let s=new Pa(this.currentPoint.clone(),new se(e,t),new se(n,i));return this.curves.push(s),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,s,r){let o=new Ca(this.currentPoint.clone(),new se(e,t),new se(n,i),new se(s,r));return this.curves.push(o),this.currentPoint.set(s,r),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Da(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,s,r){let o=this.currentPoint.x,a=this.currentPoint.y;return this.absarc(e+o,t+a,n,i,s,r),this}absarc(e,t,n,i,s,r){return this.absellipse(e,t,n,n,i,s,r),this}ellipse(e,t,n,i,s,r,o,a){let l=this.currentPoint.x,c=this.currentPoint.y;return this.absellipse(e+l,t+c,n,i,s,r,o,a),this}absellipse(e,t,n,i,s,r,o,a){let l=new uo(e,t,n,i,s,r,o,a);if(this.curves.length>0){let h=l.getPoint(0);if(!h.equals(this.currentPoint))this.lineTo(h.x,h.y)}this.curves.push(l);let c=l.getPoint(1);return this.currentPoint.copy(c),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class ci extends Zr{constructor(e){super(e);this.uuid=kn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Zr().fromJSON(i))}return this}}function ly(e,t,n=2){let i=t&&t.length,s=i?t[0]*n:e.length,r=ig(e,0,s,n,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(i)r=dy(e,t,r,n);if(e.length>80*n){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let f=n;f<s;f+=n){let d=e[f],g=e[f+1];if(d<a)a=d;if(g<l)l=g;if(d>h)h=d;if(g>u)u=g}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return Zo(r,o,n,a,l,c,0),o}function ig(e,t,n,i,s){let r;if(s===by(e,t,n,i)>0)for(let o=t;o<n;o+=i)r=Im(o/i|0,e[o],e[o+1],r);else for(let o=n-i;o>=t;o-=i)r=Im(o/i|0,e[o],e[o+1],r);if(r&&Kr(r,r.next))Jo(r),r=r.next;return r}function Xs(e,t){if(!e)return e;if(!t)t=e;let n=e,i;do if(i=!1,!n.steiner&&(Kr(n,n.next)||Bt(n.prev,n,n.next)===0)){if(Jo(n),n=t=n.prev,n===n.next)break;i=!0}else n=n.next;while(i||n!==t);return t}function Zo(e,t,n,i,s,r,o){if(!e)return;if(!o&&r)xy(e,i,s,r);let a=e;while(e.prev!==e.next){let l=e.prev,c=e.next;if(r?hy(e,i,s,r):cy(e)){t.push(l.i,e.i,c.i),Jo(e),e=c.next,a=c.next;continue}if(e=c,e===a){if(!o)Zo(Xs(e),t,n,i,s,r,1);else if(o===1)e=uy(Xs(e),t),Zo(e,t,n,i,s,r,2);else if(o===2)fy(e,t,n,i,s,r);break}}}function cy(e){let t=e.prev,n=e,i=e.next;if(Bt(t,n,i)>=0)return!1;let s=t.x,r=n.x,o=i.x,a=t.y,l=n.y,c=i.y,h=Math.min(s,r,o),u=Math.min(a,l,c),f=Math.max(s,r,o),d=Math.max(a,l,c),g=i.next;while(g!==t){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&Vo(s,a,r,l,o,c,g.x,g.y)&&Bt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function hy(e,t,n,i){let s=e.prev,r=e,o=e.next;if(Bt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,f=o.y,d=Math.min(a,l,c),g=Math.min(h,u,f),x=Math.max(a,l,c),m=Math.max(h,u,f),p=tf(d,g,t,n,i),M=tf(x,m,t,n,i),{prevZ:y,nextZ:S}=e;while(y&&y.z>=p&&S&&S.z<=M){if(y.x>=d&&y.x<=x&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&Vo(a,h,l,u,c,f,y.x,y.y)&&Bt(y.prev,y,y.next)>=0)return!1;if(y=y.prevZ,S.x>=d&&S.x<=x&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Vo(a,h,l,u,c,f,S.x,S.y)&&Bt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}while(y&&y.z>=p){if(y.x>=d&&y.x<=x&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&Vo(a,h,l,u,c,f,y.x,y.y)&&Bt(y.prev,y,y.next)>=0)return!1;y=y.prevZ}while(S&&S.z<=M){if(S.x>=d&&S.x<=x&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Vo(a,h,l,u,c,f,S.x,S.y)&&Bt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function uy(e,t){let n=e;do{let i=n.prev,s=n.next.next;if(!Kr(i,s)&&rg(i,n,n.next,s)&&Ko(i,s)&&Ko(s,i))t.push(i.i,n.i,s.i),Jo(n),Jo(n.next),n=e=s;n=n.next}while(n!==e);return Xs(n)}function fy(e,t,n,i,s,r){let o=e;do{let a=o.next.next;while(a!==o.prev){if(o.i!==a.i&&My(o,a)){let l=og(o,a);o=Xs(o,o.next),l=Xs(l,l.next),Zo(o,t,n,i,s,r,0),Zo(l,t,n,i,s,r,0);return}a=a.next}o=o.next}while(o!==e)}function dy(e,t,n,i){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*i,l=r<o-1?t[r+1]*i:e.length,c=ig(e,a,l,i,!1);if(c===c.next)c.steiner=!0;s.push(_y(c))}s.sort(py);for(let r=0;r<s.length;r++)n=my(s[r],n);return n}function py(e,t){let n=e.x-t.x;if(n===0){if(n=e.y-t.y,n===0){let i=(e.next.y-e.y)/(e.next.x-e.x),s=(t.next.y-t.y)/(t.next.x-t.x);n=i-s}}return n}function my(e,t){let n=gy(e,t);if(!n)return t;let i=og(n,e);return Xs(i,i.next),Xs(n,n.next)}function gy(e,t){let n=t,{x:i,y:s}=e,r=-1/0,o;if(Kr(e,n))return n;do{if(Kr(e,n.next))return n.next;else if(s<=n.y&&s>=n.next.y&&n.next.y!==n.y){let u=n.x+(s-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(u<=i&&u>r){if(r=u,o=n.x<n.next.x?n:n.next,u===i)return o}}n=n.next}while(n!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;n=o;do{if(i>=n.x&&n.x>=l&&i!==n.x&&sg(s<c?i:r,s,l,c,s<c?r:i,s,n.x,n.y)){let u=Math.abs(s-n.y)/(i-n.x);if(Ko(n,e)&&(u<h||u===h&&(n.x>o.x||n.x===o.x&&vy(o,n))))o=n,h=u}n=n.next}while(n!==a);return o}function vy(e,t){return Bt(e.prev,e,t.prev)<0&&Bt(t.next,e,e.next)<0}function xy(e,t,n,i){let s=e;do{if(s.z===0)s.z=tf(s.x,s.y,t,n,i);s.prevZ=s.prev,s.nextZ=s.next,s=s.next}while(s!==e);s.prevZ.nextZ=null,s.prevZ=null,yy(s)}function yy(e){let t,n=1;do{let i=e,s;e=null;let r=null;t=0;while(i){t++;let o=i,a=0;for(let c=0;c<n;c++)if(a++,o=o.nextZ,!o)break;let l=n;while(a>0||l>0&&o){if(a!==0&&(l===0||!o||i.z<=o.z))s=i,i=i.nextZ,a--;else s=o,o=o.nextZ,l--;if(r)r.nextZ=s;else e=s;s.prevZ=r,r=s}i=o}r.nextZ=null,n*=2}while(t>1);return e}function tf(e,t,n,i,s){return e=(e-n)*s|0,t=(t-i)*s|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function _y(e){let t=e,n=e;do{if(t.x<n.x||t.x===n.x&&t.y<n.y)n=t;t=t.next}while(t!==e);return n}function sg(e,t,n,i,s,r,o,a){return(s-o)*(t-a)>=(e-o)*(r-a)&&(e-o)*(i-a)>=(n-o)*(t-a)&&(n-o)*(r-a)>=(s-o)*(i-a)}function Vo(e,t,n,i,s,r,o,a){return!(e===o&&t===a)&&sg(e,t,n,i,s,r,o,a)}function My(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Sy(e,t)&&(Ko(e,t)&&Ko(t,e)&&wy(e,t)&&(Bt(e.prev,e,t.prev)||Bt(e,t.prev,t))||Kr(e,t)&&Bt(e.prev,e,e.next)>0&&Bt(t.prev,t,t.next)>0)}function Bt(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Kr(e,t){return e.x===t.x&&e.y===t.y}function rg(e,t,n,i){let s=pc(Bt(e,t,n)),r=pc(Bt(e,t,i)),o=pc(Bt(n,i,e)),a=pc(Bt(n,i,t));if(s!==r&&o!==a)return!0;if(s===0&&dc(e,n,t))return!0;if(r===0&&dc(e,i,t))return!0;if(o===0&&dc(n,e,i))return!0;if(a===0&&dc(n,t,i))return!0;return!1}function dc(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function pc(e){return e>0?1:e<0?-1:0}function Sy(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&rg(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Ko(e,t){return Bt(e.prev,e,e.next)<0?Bt(e,t,e.next)>=0&&Bt(e,e.prev,t)>=0:Bt(e,t,e.prev)<0||Bt(e,e.next,t)<0}function wy(e,t){let n=e,i=!1,s=(e.x+t.x)/2,r=(e.y+t.y)/2;do{if(n.y>r!==n.next.y>r&&n.next.y!==n.y&&s<(n.next.x-n.x)*(r-n.y)/(n.next.y-n.y)+n.x)i=!i;n=n.next}while(n!==e);return i}function og(e,t){let n=nf(e.i,e.x,e.y),i=nf(t.i,t.x,t.y),s=e.next,r=t.prev;return e.next=t,t.prev=e,n.next=s,s.prev=n,i.next=n,n.prev=i,r.next=i,i.prev=r,i}function Im(e,t,n,i){let s=nf(e,t,n);if(!i)s.prev=s,s.next=s;else s.next=i.next,s.prev=i,i.next.prev=s,i.next=s;return s}function Jo(e){if(e.next.prev=e.prev,e.prev.next=e.next,e.prevZ)e.prevZ.nextZ=e.nextZ;if(e.nextZ)e.nextZ.prevZ=e.prevZ}function nf(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function by(e,t,n,i){let s=0;for(let r=t,o=n-i;r<n;r+=i)s+=(e[o]-e[r])*(e[r+1]+e[o+1]),o=r;return s}class ag{static triangulate(e,t,n=2){return ly(e,t,n)}}class Zn{static area(e){let t=e.length,n=0;for(let i=t-1,s=0;s<t;i=s++)n+=e[i].x*e[s].y-e[s].x*e[i].y;return n*0.5}static isClockWise(e){return Zn.area(e)<0}static triangulateShape(e,t){let n=[],i=[],s=[];Pm(e),Dm(n,e);let r=e.length;t.forEach(Pm);for(let a=0;a<t.length;a++)i.push(r),r+=t[a].length,Dm(n,t[a]);let o=ag.triangulate(n,i);for(let a=0;a<o.length;a+=3)s.push(o.slice(a,a+3));return s}}function Pm(e){let t=e.length;if(t>2&&e[t-1].equals(e[0]))e.pop()}function Dm(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}class hr extends Je{constructor(e=new ci([new se(0.5,0.5),new se(-0.5,0.5),new se(-0.5,-0.5),new se(0.5,-0.5)]),t={}){super();this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,i=[],s=[];for(let o=0,a=e.length;o<a;o++){let l=e[o];r(l)}this.setAttribute("position",new ze(i,3)),this.setAttribute("uv",new ze(s,2)),this.computeVertexNormals();function r(o){let a=[],l=t.curveSegments!==void 0?t.curveSegments:12,c=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:0.2,d=t.bevelSize!==void 0?t.bevelSize:f-0.1,g=t.bevelOffset!==void 0?t.bevelOffset:0,x=t.bevelSegments!==void 0?t.bevelSegments:3,m=t.extrudePath,p=t.UVGenerator!==void 0?t.UVGenerator:Ty,M,y=!1,S,C,R,E;if(m)M=m.getSpacedPoints(c),y=!0,u=!1,S=m.computeFrenetFrames(c,!1),C=new I,R=new I,E=new I;if(!u)x=0,f=0,d=0,g=0;let D=o.extractPoints(l),{shape:w,holes:T}=D;if(!Zn.isClockWise(w)){w=w.reverse();for(let ce=0,pe=T.length;ce<pe;ce++){let me=T[ce];if(Zn.isClockWise(me))T[ce]=me.reverse()}}function B(ce){let de=ce[0];for(let Ie=1;Ie<=ce.length;Ie++){let be=Ie%ce.length,Se=ce[be],st=Se.x-de.x,tt=Se.y-de.y,rt=st*st+tt*tt,U=Math.max(Math.abs(Se.x),Math.abs(Se.y),Math.abs(de.x),Math.abs(de.y)),A=0.000000000000000000010000000000000001*U*U;if(rt<=A){ce.splice(be,1),Ie--;continue}de=Se}}B(w),T.forEach(B);let H=T.length,k=w;for(let ce=0;ce<H;ce++){let pe=T[ce];w=w.concat(pe)}function X(ce,pe,me){if(!pe)console.error("THREE.ExtrudeGeometry: vec does not exist");return ce.clone().addScaledVector(pe,me)}let q=w.length;function re(ce,pe,me){let de,Ie,be,Se=ce.x-pe.x,st=ce.y-pe.y,tt=me.x-ce.x,rt=me.y-ce.y,U=Se*Se+st*st,A=Se*rt-st*tt;if(Math.abs(A)>Number.EPSILON){let Z=Math.sqrt(U),ue=Math.sqrt(tt*tt+rt*rt),ye=pe.x-st/Z,oe=pe.y+Se/Z,Fe=me.x-rt/ue,Ae=me.y+tt/ue,Ve=((Fe-ye)*rt-(Ae-oe)*tt)/(Se*rt-st*tt);de=ye+Se*Ve-ce.x,Ie=oe+st*Ve-ce.y;let Ke=de*de+Ie*Ie;if(Ke<=2)return new se(de,Ie);else be=Math.sqrt(Ke/2)}else{let Z=!1;if(Se>Number.EPSILON){if(tt>Number.EPSILON)Z=!0}else if(Se<-Number.EPSILON){if(tt<-Number.EPSILON)Z=!0}else if(Math.sign(st)===Math.sign(rt))Z=!0;if(Z)de=-st,Ie=Se,be=Math.sqrt(U);else de=Se,Ie=st,be=Math.sqrt(U/2)}return new se(de/be,Ie/be)}let W=[];for(let ce=0,pe=k.length,me=pe-1,de=ce+1;ce<pe;ce++,me++,de++){if(me===pe)me=0;if(de===pe)de=0;W[ce]=re(k[ce],k[me],k[de])}let Q=[],ae,ge=W.concat();for(let ce=0,pe=H;ce<pe;ce++){let me=T[ce];ae=[];for(let de=0,Ie=me.length,be=Ie-1,Se=de+1;de<Ie;de++,be++,Se++){if(be===Ie)be=0;if(Se===Ie)Se=0;ae[de]=re(me[de],me[be],me[Se])}Q.push(ae),ge=ge.concat(ae)}let ve;if(x===0)ve=Zn.triangulateShape(k,T);else{let ce=[],pe=[];for(let me=0;me<x;me++){let de=me/x,Ie=f*Math.cos(de*Math.PI/2),be=d*Math.sin(de*Math.PI/2)+g;for(let Se=0,st=k.length;Se<st;Se++){let tt=X(k[Se],W[Se],be);if(le(tt.x,tt.y,-Ie),de===0)ce.push(tt)}for(let Se=0,st=H;Se<st;Se++){let tt=T[Se];ae=Q[Se];let rt=[];for(let U=0,A=tt.length;U<A;U++){let Z=X(tt[U],ae[U],be);if(le(Z.x,Z.y,-Ie),de===0)rt.push(Z)}if(de===0)pe.push(rt)}}ve=Zn.triangulateShape(ce,pe)}let Ge=ve.length,Oe=d+g;for(let ce=0;ce<q;ce++){let pe=u?X(w[ce],ge[ce],Oe):w[ce];if(!y)le(pe.x,pe.y,0);else R.copy(S.normals[0]).multiplyScalar(pe.x),C.copy(S.binormals[0]).multiplyScalar(pe.y),E.copy(M[0]).add(R).add(C),le(E.x,E.y,E.z)}for(let ce=1;ce<=c;ce++)for(let pe=0;pe<q;pe++){let me=u?X(w[pe],ge[pe],Oe):w[pe];if(!y)le(me.x,me.y,h/c*ce);else R.copy(S.normals[ce]).multiplyScalar(me.x),C.copy(S.binormals[ce]).multiplyScalar(me.y),E.copy(M[ce]).add(R).add(C),le(E.x,E.y,E.z)}for(let ce=x-1;ce>=0;ce--){let pe=ce/x,me=f*Math.cos(pe*Math.PI/2),de=d*Math.sin(pe*Math.PI/2)+g;for(let Ie=0,be=k.length;Ie<be;Ie++){let Se=X(k[Ie],W[Ie],de);le(Se.x,Se.y,h+me)}for(let Ie=0,be=T.length;Ie<be;Ie++){let Se=T[Ie];ae=Q[Ie];for(let st=0,tt=Se.length;st<tt;st++){let rt=X(Se[st],ae[st],de);if(!y)le(rt.x,rt.y,h+me);else le(rt.x,rt.y+M[c-1].y,M[c-1].x+me)}}}G(),Y();function G(){let ce=i.length/3;if(u){let pe=0,me=q*pe;for(let de=0;de<Ge;de++){let Ie=ve[de];Ee(Ie[2]+me,Ie[1]+me,Ie[0]+me)}pe=c+x*2,me=q*pe;for(let de=0;de<Ge;de++){let Ie=ve[de];Ee(Ie[0]+me,Ie[1]+me,Ie[2]+me)}}else{for(let pe=0;pe<Ge;pe++){let me=ve[pe];Ee(me[2],me[1],me[0])}for(let pe=0;pe<Ge;pe++){let me=ve[pe];Ee(me[0]+q*c,me[1]+q*c,me[2]+q*c)}}n.addGroup(ce,i.length/3-ce,0)}function Y(){let ce=i.length/3,pe=0;te(k,pe),pe+=k.length;for(let me=0,de=T.length;me<de;me++){let Ie=T[me];te(Ie,pe),pe+=Ie.length}n.addGroup(ce,i.length/3-ce,1)}function te(ce,pe){let me=ce.length;while(--me>=0){let de=me,Ie=me-1;if(Ie<0)Ie=ce.length-1;for(let be=0,Se=c+x*2;be<Se;be++){let st=q*be,tt=q*(be+1),rt=pe+de+st,U=pe+Ie+st,A=pe+Ie+tt,Z=pe+de+tt;We(rt,U,A,Z)}}}function le(ce,pe,me){a.push(ce),a.push(pe),a.push(me)}function Ee(ce,pe,me){ct(ce),ct(pe),ct(me);let de=i.length/3,Ie=p.generateTopUV(n,i,de-3,de-2,de-1);z(Ie[0]),z(Ie[1]),z(Ie[2])}function We(ce,pe,me,de){ct(ce),ct(pe),ct(de),ct(pe),ct(me),ct(de);let Ie=i.length/3,be=p.generateSideWallUV(n,i,Ie-6,Ie-3,Ie-2,Ie-1);z(be[0]),z(be[1]),z(be[3]),z(be[1]),z(be[2]),z(be[3])}function ct(ce){i.push(a[ce*3+0]),i.push(a[ce*3+1]),i.push(a[ce*3+2])}function z(ce){s.push(ce.x),s.push(ce.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Ey(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];n.push(o)}let i=e.options.extrudePath;if(i!==void 0)e.options.extrudePath=new bc[i.type]().fromJSON(i);return new hr(n,e.options)}}var Ty={generateTopUV:function(e,t,n,i,s){let r=t[n*3],o=t[n*3+1],a=t[i*3],l=t[i*3+1],c=t[s*3],h=t[s*3+1];return[new se(r,o),new se(a,l),new se(c,h)]},generateSideWallUV:function(e,t,n,i,s,r){let o=t[n*3],a=t[n*3+1],l=t[n*3+2],c=t[i*3],h=t[i*3+1],u=t[i*3+2],f=t[s*3],d=t[s*3+1],g=t[s*3+2],x=t[r*3],m=t[r*3+1],p=t[r*3+2];if(Math.abs(a-h)<Math.abs(o-c))return[new se(o,1-l),new se(c,1-u),new se(f,1-g),new se(x,1-p)];else return[new se(a,1-l),new se(h,1-u),new se(d,1-g),new se(m,1-p)]}};function Ey(e,t,n){if(n.shapes=[],Array.isArray(e))for(let i=0,s=e.length;i<s;i++){let r=e[i];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);if(n.options=Object.assign({},t),t.extrudePath!==void 0)n.options.extrudePath=t.extrudePath.toJSON();return n}class La extends Qi{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t);this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new La(e.radius,e.detail)}}class ur extends Je{constructor(e=[new se(0,-0.5),new se(0.5,0),new se(0,0.5)],t=12,n=0,i=Math.PI*2){super();this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=it(i,0,Math.PI*2);let s=[],r=[],o=[],a=[],l=[],c=1/t,h=new I,u=new se,f=new I,d=new I,g=new I,x=0,m=0;for(let p=0;p<=e.length-1;p++)switch(p){case 0:x=e[p+1].x-e[p].x,m=e[p+1].y-e[p].y,f.x=m*1,f.y=-x,f.z=m*0,g.copy(f),f.normalize(),a.push(f.x,f.y,f.z);break;case e.length-1:a.push(g.x,g.y,g.z);break;default:x=e[p+1].x-e[p].x,m=e[p+1].y-e[p].y,f.x=m*1,f.y=-x,f.z=m*0,d.copy(f),f.x+=g.x,f.y+=g.y,f.z+=g.z,f.normalize(),a.push(f.x,f.y,f.z),g.copy(d)}for(let p=0;p<=t;p++){let M=n+p*c*i,y=Math.sin(M),S=Math.cos(M);for(let C=0;C<=e.length-1;C++){h.x=e[C].x*y,h.y=e[C].y,h.z=e[C].x*S,r.push(h.x,h.y,h.z),u.x=p/t,u.y=C/(e.length-1),o.push(u.x,u.y);let R=a[3*C+0]*y,E=a[3*C+1],D=a[3*C+0]*S;l.push(R,E,D)}}for(let p=0;p<t;p++)for(let M=0;M<e.length-1;M++){let y=M+p*e.length,S=y,C=y+e.length,R=y+e.length+1,E=y+1;s.push(S,C,E),s.push(R,E,C)}this.setIndex(s),this.setAttribute("position",new ze(r,3)),this.setAttribute("uv",new ze(o,2)),this.setAttribute("normal",new ze(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ur(e.points,e.segments,e.phiStart,e.phiLength)}}class fo extends Qi{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t);this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new fo(e.radius,e.detail)}}class Qt extends Je{constructor(e=1,t=1,n=1,i=1){super();this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let s=e/2,r=t/2,o=Math.floor(n),a=Math.floor(i),l=o+1,c=a+1,h=e/o,u=t/a,f=[],d=[],g=[],x=[];for(let m=0;m<c;m++){let p=m*u-r;for(let M=0;M<l;M++){let y=M*h-s;d.push(y,-p,0),g.push(0,0,1),x.push(M/o),x.push(1-m/a)}}for(let m=0;m<a;m++)for(let p=0;p<o;p++){let M=p+l*m,y=p+l*(m+1),S=p+1+l*(m+1),C=p+1+l*m;f.push(M,y,C),f.push(y,S,C)}this.setIndex(f),this.setAttribute("position",new ze(d,3)),this.setAttribute("normal",new ze(g,3)),this.setAttribute("uv",new ze(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qt(e.width,e.height,e.widthSegments,e.heightSegments)}}class Na extends Je{constructor(e=0.5,t=1,n=32,i=1,s=0,r=Math.PI*2){super();this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:s,thetaLength:r},n=Math.max(3,n),i=Math.max(1,i);let o=[],a=[],l=[],c=[],h=e,u=(t-e)/i,f=new I,d=new se;for(let g=0;g<=i;g++){for(let x=0;x<=n;x++){let m=s+x/n*r;f.x=h*Math.cos(m),f.y=h*Math.sin(m),a.push(f.x,f.y,f.z),l.push(0,0,1),d.x=(f.x/t+1)/2,d.y=(f.y/t+1)/2,c.push(d.x,d.y)}h+=u}for(let g=0;g<i;g++){let x=g*(n+1);for(let m=0;m<n;m++){let p=m+x,M=p,y=p+n+1,S=p+n+2,C=p+1;o.push(M,y,C),o.push(y,S,C)}}this.setIndex(o),this.setAttribute("position",new ze(a,3)),this.setAttribute("normal",new ze(l,3)),this.setAttribute("uv",new ze(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Na(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Ua extends Je{constructor(e=new ci([new se(0,0.5),new se(-0.5,-0.5),new se(0.5,-0.5)]),t=12){super();this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],s=[],r=[],o=0,a=0;if(Array.isArray(e)===!1)l(e);else for(let c=0;c<e.length;c++)l(e[c]),this.addGroup(o,a,c),o+=a,a=0;this.setIndex(n),this.setAttribute("position",new ze(i,3)),this.setAttribute("normal",new ze(s,3)),this.setAttribute("uv",new ze(r,2));function l(c){let h=i.length/3,u=c.extractPoints(t),{shape:f,holes:d}=u;if(Zn.isClockWise(f)===!1)f=f.reverse();for(let x=0,m=d.length;x<m;x++){let p=d[x];if(Zn.isClockWise(p)===!0)d[x]=p.reverse()}let g=Zn.triangulateShape(f,d);for(let x=0,m=d.length;x<m;x++){let p=d[x];f=f.concat(p)}for(let x=0,m=f.length;x<m;x++){let p=f[x];i.push(p.x,p.y,0),s.push(0,0,1),r.push(p.x,p.y)}for(let x=0,m=g.length;x<m;x++){let p=g[x],M=p[0]+h,y=p[1]+h,S=p[2]+h;n.push(M,y,S),a+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Ay(t,e)}static fromJSON(e,t){let n=[];for(let i=0,s=e.shapes.length;i<s;i++){let r=t[e.shapes[i]];n.push(r)}return new Ua(n,e.curveSegments)}}function Ay(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,i=e.length;n<i;n++){let s=e[n];t.shapes.push(s.uuid)}else t.shapes.push(e.uuid);return t}class un extends Je{constructor(e=1,t=32,n=16,i=0,s=Math.PI*2,r=0,o=Math.PI){super();this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:s,thetaStart:r,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let a=Math.min(r+o,Math.PI),l=0,c=[],h=new I,u=new I,f=[],d=[],g=[],x=[];for(let m=0;m<=n;m++){let p=[],M=m/n,y=0;if(m===0&&r===0)y=0.5/t;else if(m===n&&a===Math.PI)y=-0.5/t;for(let S=0;S<=t;S++){let C=S/t;h.x=-e*Math.cos(i+C*s)*Math.sin(r+M*o),h.y=e*Math.cos(r+M*o),h.z=e*Math.sin(i+C*s)*Math.sin(r+M*o),d.push(h.x,h.y,h.z),u.copy(h).normalize(),g.push(u.x,u.y,u.z),x.push(C+y,1-M),p.push(l++)}c.push(p)}for(let m=0;m<n;m++)for(let p=0;p<t;p++){let M=c[m][p+1],y=c[m][p],S=c[m+1][p],C=c[m+1][p+1];if(m!==0||r>0)f.push(M,y,C);if(m!==n-1||a<Math.PI)f.push(y,S,C)}this.setIndex(f),this.setAttribute("position",new ze(d,3)),this.setAttribute("normal",new ze(g,3)),this.setAttribute("uv",new ze(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new un(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Fa extends Qi{constructor(e=1,t=0){let n=[1,1,1,-1,-1,1,-1,1,-1,1,-1,-1],i=[2,1,0,0,3,2,1,3,0,2,3,1];super(n,i,e,t);this.type="TetrahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Fa(e.radius,e.detail)}}class Oa extends Je{constructor(e=1,t=0.4,n=12,i=48,s=Math.PI*2){super();this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);let r=[],o=[],a=[],l=[],c=new I,h=new I,u=new I;for(let f=0;f<=n;f++)for(let d=0;d<=i;d++){let g=d/i*s,x=f/n*Math.PI*2;h.x=(e+t*Math.cos(x))*Math.cos(g),h.y=(e+t*Math.cos(x))*Math.sin(g),h.z=t*Math.sin(x),o.push(h.x,h.y,h.z),c.x=e*Math.cos(g),c.y=e*Math.sin(g),u.subVectors(h,c).normalize(),a.push(u.x,u.y,u.z),l.push(d/i),l.push(f/n)}for(let f=1;f<=n;f++)for(let d=1;d<=i;d++){let g=(i+1)*f+d-1,x=(i+1)*(f-1)+d-1,m=(i+1)*(f-1)+d,p=(i+1)*f+d;r.push(g,x,p),r.push(x,m,p)}this.setIndex(r),this.setAttribute("position",new ze(o,3)),this.setAttribute("normal",new ze(a,3)),this.setAttribute("uv",new ze(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Oa(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ba extends Je{constructor(e=1,t=0.4,n=64,i=8,s=2,r=3){super();this.type="TorusKnotGeometry",this.parameters={radius:e,tube:t,tubularSegments:n,radialSegments:i,p:s,q:r},n=Math.floor(n),i=Math.floor(i);let o=[],a=[],l=[],c=[],h=new I,u=new I,f=new I,d=new I,g=new I,x=new I,m=new I;for(let M=0;M<=n;++M){let y=M/n*s*Math.PI*2;p(y,s,r,e,f),p(y+0.01,s,r,e,d),x.subVectors(d,f),m.addVectors(d,f),g.crossVectors(x,m),m.crossVectors(g,x),g.normalize(),m.normalize();for(let S=0;S<=i;++S){let C=S/i*Math.PI*2,R=-t*Math.cos(C),E=t*Math.sin(C);h.x=f.x+(R*m.x+E*g.x),h.y=f.y+(R*m.y+E*g.y),h.z=f.z+(R*m.z+E*g.z),a.push(h.x,h.y,h.z),u.subVectors(h,f).normalize(),l.push(u.x,u.y,u.z),c.push(M/n),c.push(S/i)}}for(let M=1;M<=n;M++)for(let y=1;y<=i;y++){let S=(i+1)*(M-1)+(y-1),C=(i+1)*M+(y-1),R=(i+1)*M+y,E=(i+1)*(M-1)+y;o.push(S,C,E),o.push(C,R,E)}this.setIndex(o),this.setAttribute("position",new ze(a,3)),this.setAttribute("normal",new ze(l,3)),this.setAttribute("uv",new ze(c,2));function p(M,y,S,C,R){let E=Math.cos(M),D=Math.sin(M),w=S/y*M,T=Math.cos(w);R.x=C*(2+T)*0.5*E,R.y=C*(2+T)*D*0.5,R.z=C*Math.sin(w)*0.5}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ba(e.radius,e.tube,e.tubularSegments,e.radialSegments,e.p,e.q)}}class fr extends Je{constructor(e=new cr(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,i=8,s=!1){super();this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:s};let r=e.computeFrenetFrames(t,s);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let o=new I,a=new I,l=new se,c=new I,h=[],u=[],f=[],d=[];g(),this.setIndex(d),this.setAttribute("position",new ze(h,3)),this.setAttribute("normal",new ze(u,3)),this.setAttribute("uv",new ze(f,2));function g(){for(let M=0;M<t;M++)x(M);x(s===!1?t:0),p(),m()}function x(M){c=e.getPointAt(M/t,c);let y=r.normals[M],S=r.binormals[M];for(let C=0;C<=i;C++){let R=C/i*Math.PI*2,E=Math.sin(R),D=-Math.cos(R);a.x=D*y.x+E*S.x,a.y=D*y.y+E*S.y,a.z=D*y.z+E*S.z,a.normalize(),u.push(a.x,a.y,a.z),o.x=c.x+n*a.x,o.y=c.y+n*a.y,o.z=c.z+n*a.z,h.push(o.x,o.y,o.z)}}function m(){for(let M=1;M<=t;M++)for(let y=1;y<=i;y++){let S=(i+1)*(M-1)+(y-1),C=(i+1)*M+(y-1),R=(i+1)*M+y,E=(i+1)*(M-1)+y;d.push(S,C,E),d.push(C,R,E)}}function p(){for(let M=0;M<=t;M++)for(let y=0;y<=i;y++)l.x=M/t,l.y=y/i,f.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new fr(new bc[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class Rh extends Je{constructor(e=null){super();if(this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,i=new I,s=new I;if(e.index!==null){let r=e.attributes.position,{index:o,groups:a}=e;if(a.length===0)a=[{start:0,count:o.count,materialIndex:0}];for(let l=0,c=a.length;l<c;++l){let h=a[l],{start:u,count:f}=h;for(let d=u,g=u+f;d<g;d+=3)for(let x=0;x<3;x++){let m=o.getX(d+x),p=o.getX(d+(x+1)%3);if(i.fromBufferAttribute(r,m),s.fromBufferAttribute(r,p),Lm(i,s,n)===!0)t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z)}}}else{let r=e.attributes.position;for(let o=0,a=r.count/3;o<a;o++)for(let l=0;l<3;l++){let c=3*o+l,h=3*o+(l+1)%3;if(i.fromBufferAttribute(r,c),s.fromBufferAttribute(r,h),Lm(i,s,n)===!0)t.push(i.x,i.y,i.z),t.push(s.x,s.y,s.z)}}this.setAttribute("position",new ze(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}function Lm(e,t,n){let i=`${e.x},${e.y},${e.z}-${t.x},${t.y},${t.z}`,s=`${t.x},${t.y},${t.z}-${e.x},${e.y},${e.z}`;if(n.has(i)===!0||n.has(s)===!0)return!1;else return n.add(i),n.add(s),!0}var Nm=Object.freeze({__proto__:null,BoxGeometry:Dn,CapsuleGeometry:Aa,CircleGeometry:Ms,ConeGeometry:ji,CylinderGeometry:En,DodecahedronGeometry:Ra,EdgesGeometry:Sh,ExtrudeGeometry:hr,IcosahedronGeometry:La,LatheGeometry:ur,OctahedronGeometry:fo,PlaneGeometry:Qt,PolyhedronGeometry:Qi,RingGeometry:Na,ShapeGeometry:Ua,SphereGeometry:un,TetrahedronGeometry:Fa,TorusGeometry:Oa,TorusKnotGeometry:Ba,TubeGeometry:fr,WireframeGeometry:Rh});class Ch extends Gt{constructor(e){super();this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new fe(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}}class po extends xt{constructor(e){super(e);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Pt extends Gt{constructor(e){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ht extends Pt{constructor(e){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new se(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return it(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+0.4*t)/(1-0.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new fe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new fe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new fe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){if(this._anisotropy>0!==e>0)this.version++;this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){if(this._clearcoat>0!==e>0)this.version++;this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){if(this._iridescence>0!==e>0)this.version++;this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){if(this._dispersion>0!==e>0)this.version++;this._dispersion=e}get sheen(){return this._sheen}set sheen(e){if(this._sheen>0!==e>0)this.version++;this._sheen=e}get transmission(){return this._transmission}set transmission(e){if(this._transmission>0!==e>0)this.version++;this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Ih extends Gt{constructor(e){super();this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new fe(16777215),this.specular=new fe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ph extends Gt{constructor(e){super();this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new fe(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}class mo extends Gt{constructor(e){super();this.isMeshNormalMaterial=!0,this.type="MeshNormalMaterial",this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.setValues(e)}copy(e){return super.copy(e),this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.flatShading=e.flatShading,this}}class Dh extends Gt{constructor(e){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class za extends Gt{constructor(e){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Ha extends Gt{constructor(e){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Lh extends Gt{constructor(e){super();this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new fe(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={MATCAP:""},this.color.copy(e.color),this.matcap=e.matcap,this.map=e.map,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Nh extends tn{constructor(e){super();this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}function Gs(e,t){if(!e||e.constructor===t)return e;if(typeof t.BYTES_PER_ELEMENT==="number")return new t(e);return Array.prototype.slice.call(e)}function lg(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function cg(e){function t(s,r){return e[s]-e[r]}let n=e.length,i=Array(n);for(let s=0;s!==n;++s)i[s]=s;return i.sort(t),i}function sf(e,t,n){let i=e.length,s=new e.constructor(i);for(let r=0,o=0;o!==i;++r){let a=n[r]*t;for(let l=0;l!==t;++l)s[o++]=e[a+l]}return s}function ad(e,t,n,i){let s=1,r=e[0];while(r!==void 0&&r[i]===void 0)r=e[s++];if(r===void 0)return;let o=r[i];if(o===void 0)return;if(Array.isArray(o))do{if(o=r[i],o!==void 0)t.push(r.time),n.push(...o);r=e[s++]}while(r!==void 0);else if(o.toArray!==void 0)do{if(o=r[i],o!==void 0)t.push(r.time),o.toArray(n,n.length);r=e[s++]}while(r!==void 0);else do{if(o=r[i],o!==void 0)t.push(r.time),n.push(o);r=e[s++]}while(r!==void 0)}function Ry(e,t,n,i,s=30){let r=e.clone();r.name=t;let o=[];for(let l=0;l<r.tracks.length;++l){let c=r.tracks[l],h=c.getValueSize(),u=[],f=[];for(let d=0;d<c.times.length;++d){let g=c.times[d]*s;if(g<n||g>=i)continue;u.push(c.times[d]);for(let x=0;x<h;++x)f.push(c.values[d*h+x])}if(u.length===0)continue;c.times=Gs(u,c.times.constructor),c.values=Gs(f,c.values.constructor),o.push(c)}r.tracks=o;let a=1/0;for(let l=0;l<r.tracks.length;++l)if(a>r.tracks[l].times[0])a=r.tracks[l].times[0];for(let l=0;l<r.tracks.length;++l)r.tracks[l].shift(-1*a);return r.resetDuration(),r}function Cy(e,t=0,n=e,i=30){if(i<=0)i=30;let s=n.tracks.length,r=t/i;for(let o=0;o<s;++o){let a=n.tracks[o],l=a.ValueTypeName;if(l==="bool"||l==="string")continue;let c=e.tracks.find(function(p){return p.name===a.name&&p.ValueTypeName===l});if(c===void 0)continue;let h=0,u=a.getValueSize();if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)h=u/3;let f=0,d=c.getValueSize();if(c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)f=d/3;let g=a.times.length-1,x;if(r<=a.times[0]){let p=h,M=u-h;x=a.values.slice(p,M)}else if(r>=a.times[g]){let p=g*u+h,M=p+u-h;x=a.values.slice(p,M)}else{let p=a.createInterpolant(),M=h,y=u-h;p.evaluate(r),x=p.resultBuffer.slice(M,y)}if(l==="quaternion")new Nt().fromArray(x).normalize().conjugate().toArray(x);let m=c.times.length;for(let p=0;p<m;++p){let M=p*d+f;if(l==="quaternion")Nt.multiplyQuaternionsFlat(c.values,M,x,0,c.values,M);else{let y=d-f*2;for(let S=0;S<y;++S)c.values[M+S]-=x[S]}}}return e.blendMode=2501,e}class ld{static convertArray(e,t){return Gs(e,t)}static isTypedArray(e){return lg(e)}static getKeyframeOrder(e){return cg(e)}static sortedArray(e,t,n){return sf(e,t,n)}static flattenJSON(e,t,n,i){ad(e,t,n,i)}static subclip(e,t,n,i,s=30){return Ry(e,t,n,i,s)}static makeClipAdditive(e,t=0,n=e,i=30){return Cy(e,t,n,i)}}class $i{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],s=t[n-1];e:{t:{let r;n:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=t[++n],e<i)break t}r=t.length;break n}if(!(e>=s)){let o=t[1];if(e<o)n=2,s=o;for(let a=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(i=s,s=t[--n-1],e>=s)break t}r=n,n=0;break n}break e}while(n<r){let o=n+r>>>1;if(e<t[o])r=o;else n=o+1}if(i=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i;for(let r=0;r!==i;++r)t[r]=n[s+r];return t}interpolate_(){throw Error("call to abstract method")}intervalChanged_(){}}class Uh extends $i{constructor(e,t,n,i){super(e,t,n,i);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,n){let i=this.parameterPositions,s=e-2,r=e+1,o=i[s],a=i[r];if(o===void 0)switch(this.getSettings_().endingStart){case 2401:s=e,o=2*t-n;break;case 2402:s=i.length-2,o=t+i[s]-i[s+1];break;default:s=e,o=n}if(a===void 0)switch(this.getSettings_().endingEnd){case 2401:r=e,a=2*n-t;break;case 2402:r=1,a=n+i[1]-i[0];break;default:r=e-1,a=t}let l=(n-t)*0.5,c=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(a-n),this._offsetPrev=s*c,this._offsetNext=r*c}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=e*o,l=a-o,c=this._offsetPrev,h=this._offsetNext,u=this._weightPrev,f=this._weightNext,d=(n-t)/(i-t),g=d*d,x=g*d,m=-u*x+2*u*g-u*d,p=(1+u)*x+(-1.5-2*u)*g+(-0.5+u)*d+1,M=(-1-f)*x+(1.5+f)*g+0.5*d,y=f*x-f*g;for(let S=0;S!==o;++S)s[S]=m*r[c+S]+p*r[l+S]+M*r[a+S]+y*r[h+S];return s}}class ka extends $i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=e*o,l=a-o,c=(n-t)/(i-t),h=1-c;for(let u=0;u!==o;++u)s[u]=r[l+u]*h+r[a+u]*c;return s}}class Fh extends $i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Nn{constructor(e,t,n,i){if(e===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Gs(t,this.TimeBufferType),this.values=Gs(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Gs(e.times,Array),values:Gs(e.values,Array)};let i=e.getInterpolation();if(i!==e.DefaultInterpolation)n.interpolation=i}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Fh(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ka(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Uh(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){let n=this.times,i=n.length,s=0,r=i-1;while(s!==i&&n[s]<e)++s;while(r!==-1&&n[r]>t)--r;if(++r,s!==0||r!==i){if(s>=r)r=Math.max(r,1),s=r-1;let o=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*o,r*o)}return this}validate(){let e=!0,t=this.getValueSize();if(t-Math.floor(t)!==0)console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1;let n=this.times,i=this.values,s=n.length;if(s===0)console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1;let r=null;for(let o=0;o!==s;o++){let a=n[o];if(typeof a==="number"&&isNaN(a)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,a),e=!1;break}if(r!==null&&r>a){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,a,r),e=!1;break}r=a}if(i!==void 0){if(lg(i))for(let o=0,a=i.length;o!==a;++o){let l=i[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===2302,s=e.length-1,r=1;for(let o=1;o<s;++o){let a=!1,l=e[o],c=e[o+1];if(l!==c&&(o!==1||l!==e[0]))if(!i){let h=o*n,u=h-n,f=h+n;for(let d=0;d!==n;++d){let g=t[h+d];if(g!==t[u+d]||g!==t[f+d]){a=!0;break}}}else a=!0;if(a){if(o!==r){e[r]=e[o];let h=o*n,u=r*n;for(let f=0;f!==n;++f)t[u+f]=t[h+f]}++r}}if(s>0){e[r]=e[s];for(let o=s*n,a=r*n,l=0;l!==n;++l)t[a+l]=t[o+l];++r}if(r!==e.length)this.times=e.slice(0,r),this.values=t.slice(0,r*n);else this.times=e,this.values=t;return this}clone(){let e=this.times.slice(),t=this.values.slice(),i=new this.constructor(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Nn.prototype.ValueTypeName="";Nn.prototype.TimeBufferType=Float32Array;Nn.prototype.ValueBufferType=Float32Array;Nn.prototype.DefaultInterpolation=2301;class es extends Nn{constructor(e,t,n){super(e,t,n)}}es.prototype.ValueTypeName="bool";es.prototype.ValueBufferType=Array;es.prototype.DefaultInterpolation=2300;es.prototype.InterpolantFactoryMethodLinear=void 0;es.prototype.InterpolantFactoryMethodSmooth=void 0;class Ga extends Nn{constructor(e,t,n,i){super(e,t,n,i)}}Ga.prototype.ValueTypeName="color";class Ri extends Nn{constructor(e,t,n,i){super(e,t,n,i)}}Ri.prototype.ValueTypeName="number";class Oh extends $i{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=(n-t)/(i-t),l=e*o;for(let c=l+o;l!==c;l+=4)Nt.slerpFlat(s,0,r,l-o,r,l,a);return s}}class ti extends Nn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new Oh(this.times,this.values,this.getValueSize(),e)}}ti.prototype.ValueTypeName="quaternion";ti.prototype.InterpolantFactoryMethodSmooth=void 0;class ts extends Nn{constructor(e,t,n){super(e,t,n)}}ts.prototype.ValueTypeName="string";ts.prototype.ValueBufferType=Array;ts.prototype.DefaultInterpolation=2300;ts.prototype.InterpolantFactoryMethodLinear=void 0;ts.prototype.InterpolantFactoryMethodSmooth=void 0;class jn extends Nn{constructor(e,t,n,i){super(e,t,n,i)}}jn.prototype.ValueTypeName="vector";class hi{constructor(e="",t=-1,n=[],i=2500){if(this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=kn(),this.userData={},this.duration<0)this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let r=0,o=n.length;r!==o;++r)t.push(Py(n[r]).scale(i));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,r=n.length;s!==r;++s)t.push(Nn.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let s=t.length,r=[];for(let o=0;o<s;o++){let a=[],l=[];a.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);let c=cg(a);if(a=sf(a,1,c),l=sf(l,1,c),!i&&a[0]===0)a.push(s),l.push(l[0]);r.push(new Ri(".morphTargetInfluences["+t[o].name+"]",a,l).scale(1/n))}return new this(e,-1,r)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,a=e.length;o<a;o++){let l=e[o],c=l.name.match(s);if(c&&c.length>1){let h=c[1],u=i[h];if(!u)i[h]=u=[];u.push(l)}}let r=[];for(let o in i)r.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return r}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,u,f,d,g){if(f.length!==0){let x=[],m=[];if(ad(f,x,m,d),x.length!==0)g.push(new h(u,x,m))}},i=[],s=e.name||"default",r=e.fps||30,o=e.blendMode,a=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let u=l[h].keys;if(!u||u.length===0)continue;if(u[0].morphTargets){let f={},d;for(d=0;d<u.length;d++)if(u[d].morphTargets)for(let g=0;g<u[d].morphTargets.length;g++)f[u[d].morphTargets[g]]=-1;for(let g in f){let x=[],m=[];for(let p=0;p!==u[d].morphTargets.length;++p){let M=u[d];x.push(M.time),m.push(M.morphTarget===g?1:0)}i.push(new Ri(".morphTargetInfluence["+g+"]",x,m))}a=f.length*r}else{let f=".bones["+t[h].name+"]";n(jn,f+".position",u,"pos",i),n(ti,f+".quaternion",u,"rot",i),n(jn,f+".scale",u,"scl",i)}}if(i.length===0)return null;return new this(s,a,i,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Iy(e){switch(e.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ri;case"vector":case"vector2":case"vector3":case"vector4":return jn;case"color":return Ga;case"quaternion":return ti;case"bool":case"boolean":return es;case"string":return ts}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+e)}function Py(e){if(e.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=Iy(e.type);if(e.times===void 0){let n=[],i=[];ad(e.keys,n,i,"value"),e.times=n,e.values=i}if(t.parse!==void 0)return t.parse(e);else return new t(e.name,e.times,e.values,e.interpolation)}var li={enabled:!1,files:{},add:function(e,t){if(this.enabled===!1)return;this.files[e]=t},get:function(e){if(this.enabled===!1)return;return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};class Wa{constructor(e,t,n){let i=this,s=!1,r=0,o=0,a=void 0,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(c){if(o++,s===!1){if(i.onStart!==void 0)i.onStart(c,r,o)}s=!0},this.itemEnd=function(c){if(r++,i.onProgress!==void 0)i.onProgress(c,r,o);if(r===o){if(s=!1,i.onLoad!==void 0)i.onLoad()}},this.itemError=function(c){if(i.onError!==void 0)i.onError(c)},this.resolveURL=function(c){if(a)return a(c);return c},this.setURLModifier=function(c){return a=c,this},this.addHandler=function(c,h){return l.push(c,h),this},this.removeHandler=function(c){let h=l.indexOf(c);if(h!==-1)l.splice(h,2);return this},this.getHandler=function(c){for(let h=0,u=l.length;h<u;h+=2){let f=l[h],d=l[h+1];if(f.global)f.lastIndex=0;if(f.test(c))return d}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}var cd=new Wa;class an{constructor(e){this.manager=e!==void 0?e:cd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,s){n.load(e,i,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}an.DEFAULT_MATERIAL_NAME="__DEFAULT";var Vi={};class hg extends Error{constructor(e,t){super(e);this.response=t}}class Pn extends an{constructor(e){super(e);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=li.get(`file:${e}`);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{if(t)t(s);this.manager.itemEnd(e)},0),s;if(Vi[e]!==void 0){Vi[e].push({onLoad:t,onProgress:n,onError:i});return}Vi[e]=[],Vi[e].push({onLoad:t,onProgress:n,onError:i});let r=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,a=this.responseType;fetch(r).then((l)=>{if(l.status===200||l.status===0){if(l.status===0)console.warn("THREE.FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let c=Vi[e],h=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=u?parseInt(u):0,d=f!==0,g=0,x=new ReadableStream({start(m){p();function p(){h.read().then(({done:M,value:y})=>{if(M)m.close();else{g+=y.byteLength;let S=new ProgressEvent("progress",{lengthComputable:d,loaded:g,total:f});for(let C=0,R=c.length;C<R;C++){let E=c[C];if(E.onProgress)E.onProgress(S)}m.enqueue(y),p()}},(M)=>{m.error(M)})}}});return new Response(x)}else throw new hg(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then((l)=>{switch(a){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then((c)=>new DOMParser().parseFromString(c,o));case"json":return l.json();default:if(o==="")return l.text();else{let h=/charset="?([^;"\s]*)"?/i.exec(o),u=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(u);return l.arrayBuffer().then((d)=>f.decode(d))}}}).then((l)=>{li.add(`file:${e}`,l);let c=Vi[e];delete Vi[e];for(let h=0,u=c.length;h<u;h++){let f=c[h];if(f.onLoad)f.onLoad(l)}}).catch((l)=>{let c=Vi[e];if(c===void 0)throw this.manager.itemError(e),l;delete Vi[e];for(let h=0,u=c.length;h<u;h++){let f=c[h];if(f.onError)f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class hd extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=new Pn(this.manager);r.setPath(this.path),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials),r.load(e,function(o){try{t(s.parse(JSON.parse(o)))}catch(a){if(i)i(a);else console.error(a);s.manager.itemError(e)}},n,i)}parse(e){let t=[];for(let n=0;n<e.length;n++){let i=hi.parse(e[n]);t.push(i)}return t}}class ud extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=[],o=new ho,a=new Pn(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(s.withCredentials);let l=0;function c(h){a.load(e[h],function(u){let f=s.parse(u,!0);if(r[h]={width:f.width,height:f.height,format:f.format,mipmaps:f.mipmaps},l+=1,l===6){if(f.mipmapCount===1)o.minFilter=1006;if(o.image=r,o.format=f.format,o.needsUpdate=!0,t)t(o)}},n,i)}if(Array.isArray(e))for(let h=0,u=e.length;h<u;++h)c(h);else a.load(e,function(h){let u=s.parse(h,!0);if(u.isCubemap){let f=u.mipmaps.length/u.mipmapCount;for(let d=0;d<f;d++){r[d]={mipmaps:[]};for(let g=0;g<u.mipmapCount;g++)r[d].mipmaps.push(u.mipmaps[d*u.mipmapCount+g]),r[d].format=u.format,r[d].width=u.width,r[d].height=u.height}o.image=r}else o.image.width=u.width,o.image.height=u.height,o.mipmaps=u.mipmaps;if(u.mipmapCount===1)o.minFilter=1006;if(o.format=u.format,o.needsUpdate=!0,t)t(o)},n,i);return o}}var kr=new WeakMap;class qs extends an{constructor(e){super(e)}load(e,t,n,i){if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=li.get(`image:${e}`);if(r!==void 0){if(r.complete===!0)s.manager.itemStart(e),setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0);else{let h=kr.get(r);if(h===void 0)h=[],kr.set(r,h);h.push({onLoad:t,onError:i})}return r}let o=qr("img");function a(){if(c(),t)t(this);let h=kr.get(this)||[];for(let u=0;u<h.length;u++){let f=h[u];if(f.onLoad)f.onLoad(this)}kr.delete(this),s.manager.itemEnd(e)}function l(h){if(c(),i)i(h);li.remove(`image:${e}`);let u=kr.get(this)||[];for(let f=0;f<u.length;f++){let d=u[f];if(d.onError)d.onError(h)}kr.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function c(){o.removeEventListener("load",a,!1),o.removeEventListener("error",l,!1)}if(o.addEventListener("load",a,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)o.crossOrigin=this.crossOrigin}return li.add(`image:${e}`,o),s.manager.itemStart(e),o.src=e,o}}class fd extends an{constructor(e){super(e)}load(e,t,n,i){let s=new nr;s.colorSpace="srgb";let r=new qs(this.manager);r.setCrossOrigin(this.crossOrigin),r.setPath(this.path);let o=0;function a(l){r.load(e[l],function(c){if(s.images[l]=c,o++,o===6){if(s.needsUpdate=!0,t)t(s)}},void 0,i)}for(let l=0;l<e.length;++l)a(l);return s}}class dr extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=new mn,o=new Pn(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(a){let l;try{l=s.parse(a)}catch(c){if(i!==void 0)i(c);else{console.error(c);return}}if(l.image!==void 0)r.image=l.image;else if(l.data!==void 0)r.image.width=l.width,r.image.height=l.height,r.image.data=l.data;if(r.wrapS=l.wrapS!==void 0?l.wrapS:1001,r.wrapT=l.wrapT!==void 0?l.wrapT:1001,r.magFilter=l.magFilter!==void 0?l.magFilter:1006,r.minFilter=l.minFilter!==void 0?l.minFilter:1006,r.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.colorSpace!==void 0)r.colorSpace=l.colorSpace;if(l.flipY!==void 0)r.flipY=l.flipY;if(l.format!==void 0)r.format=l.format;if(l.type!==void 0)r.type=l.type;if(l.mipmaps!==void 0)r.mipmaps=l.mipmaps,r.minFilter=1008;if(l.mipmapCount===1)r.minFilter=1006;if(l.generateMipmaps!==void 0)r.generateMipmaps=l.generateMipmaps;if(r.needsUpdate=!0,t)t(r,l)},n,i),r}}class Va extends an{constructor(e){super(e)}load(e,t,n,i){let s=new Rt,r=new qs(this.manager);return r.setCrossOrigin(this.crossOrigin),r.setPath(this.path),r.load(e,function(o){if(s.image=o,s.needsUpdate=!0,t!==void 0)t(s)},n,i),s}}class Di extends dt{constructor(e,t=1){super();this.isLight=!0,this.type="Light",this.color=new fe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);if(t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0)t.object.groundColor=this.groundColor.getHex();if(this.distance!==void 0)t.object.distance=this.distance;if(this.angle!==void 0)t.object.angle=this.angle;if(this.decay!==void 0)t.object.decay=this.decay;if(this.penumbra!==void 0)t.object.penumbra=this.penumbra;if(this.shadow!==void 0)t.object.shadow=this.shadow.toJSON();if(this.target!==void 0)t.object.target=this.target.uuid;return t}}class go extends Di{constructor(e,t,n){super(e,n);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new fe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}var Yu=new He,Um=new I,Fm=new I;class Bh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new se(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new _s,this._frameExtents=new se(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;if(Um.setFromMatrixPosition(e.matrixWorld),t.position.copy(Um),Fm.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Fm),t.updateMatrixWorld(),Yu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yu,t.coordinateSystem,t.reversedDepth),t.reversedDepth)n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,1,0,0,0,0,1);else n.set(0.5,0,0,0.5,0,0.5,0,0.5,0,0,0.5,0.5,0,0,0,1);n.multiply(Yu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};if(this.intensity!==1)e.intensity=this.intensity;if(this.bias!==0)e.bias=this.bias;if(this.normalBias!==0)e.normalBias=this.normalBias;if(this.radius!==1)e.radius=this.radius;if(this.mapSize.x!==512||this.mapSize.y!==512)e.mapSize=this.mapSize.toArray();return e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class ug extends Bh{constructor(){super(new Ot(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Vs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;if(n!==t.fov||i!==t.aspect||s!==t.far)t.fov=n,t.aspect=i,t.far=s,t.updateProjectionMatrix();super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Ss extends Di{constructor(e,t,n=0,i=Math.PI/3,s=0,r=2){super(e,t);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.distance=n,this.angle=i,this.penumbra=s,this.decay=r,this.map=null,this.shadow=new ug}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}var Om=new He,Go=new I,Zu=new I;class fg extends Bh{constructor(){super(new Ot(90,1,0.5,500));this.isPointLightShadow=!0,this._frameExtents=new se(4,2),this._viewportCount=6,this._viewports=[new bt(2,1,1,1),new bt(0,1,1,1),new bt(3,1,1,1),new bt(1,1,1,1),new bt(3,0,1,1),new bt(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,i=this.matrix,s=e.distance||n.far;if(s!==n.far)n.far=s,n.updateProjectionMatrix();Go.setFromMatrixPosition(e.matrixWorld),n.position.copy(Go),Zu.copy(n.position),Zu.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Zu),n.updateMatrixWorld(),i.makeTranslation(-Go.x,-Go.y,-Go.z),Om.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Om,n.coordinateSystem,n.reversedDepth)}}class vo extends Di{constructor(e,t,n=0,i=2){super(e,t);this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new fg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Li extends ro{constructor(e=-1,t=1,n=1,i=-1,s=0.1,r=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,r){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-e,r=n+e,o=i+t,a=i-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,o-=c*this.view.offsetY,a=o-c*this.view.height}this.projectionMatrix.makeOrthographic(s,r,o,a,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);if(t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null)t.object.view=Object.assign({},this.view);return t}}class dg extends Bh{constructor(){super(new Li(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class ws extends Di{constructor(e,t){super(e,t);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new dg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class zh extends Di{constructor(e,t){super(e,t);this.isAmbientLight=!0,this.type="AmbientLight"}}class Hh extends Di{constructor(e,t,n=10,i=10){super(e,t);this.isRectAreaLight=!0,this.type="RectAreaLight",this.width=n,this.height=i}get power(){return this.intensity*this.width*this.height*Math.PI}set power(e){this.intensity=e/(this.width*this.height*Math.PI)}copy(e){return super.copy(e),this.width=e.width,this.height=e.height,this}toJSON(e){let t=super.toJSON(e);return t.object.width=this.width,t.object.height=this.height,t}}class kh{constructor(){this.isSphericalHarmonics3=!0,this.coefficients=[];for(let e=0;e<9;e++)this.coefficients.push(new I)}set(e){for(let t=0;t<9;t++)this.coefficients[t].copy(e[t]);return this}zero(){for(let e=0;e<9;e++)this.coefficients[e].set(0,0,0);return this}getAt(e,t){let{x:n,y:i,z:s}=e,r=this.coefficients;return t.copy(r[0]).multiplyScalar(0.282095),t.addScaledVector(r[1],0.488603*i),t.addScaledVector(r[2],0.488603*s),t.addScaledVector(r[3],0.488603*n),t.addScaledVector(r[4],1.092548*(n*i)),t.addScaledVector(r[5],1.092548*(i*s)),t.addScaledVector(r[6],0.315392*(3*s*s-1)),t.addScaledVector(r[7],1.092548*(n*s)),t.addScaledVector(r[8],0.546274*(n*n-i*i)),t}getIrradianceAt(e,t){let{x:n,y:i,z:s}=e,r=this.coefficients;return t.copy(r[0]).multiplyScalar(0.886227),t.addScaledVector(r[1],1.023328*i),t.addScaledVector(r[2],1.023328*s),t.addScaledVector(r[3],1.023328*n),t.addScaledVector(r[4],0.858086*n*i),t.addScaledVector(r[5],0.858086*i*s),t.addScaledVector(r[6],0.743125*s*s-0.247708),t.addScaledVector(r[7],0.858086*n*s),t.addScaledVector(r[8],0.429043*(n*n-i*i)),t}add(e){for(let t=0;t<9;t++)this.coefficients[t].add(e.coefficients[t]);return this}addScaledSH(e,t){for(let n=0;n<9;n++)this.coefficients[n].addScaledVector(e.coefficients[n],t);return this}scale(e){for(let t=0;t<9;t++)this.coefficients[t].multiplyScalar(e);return this}lerp(e,t){for(let n=0;n<9;n++)this.coefficients[n].lerp(e.coefficients[n],t);return this}equals(e){for(let t=0;t<9;t++)if(!this.coefficients[t].equals(e.coefficients[t]))return!1;return!0}copy(e){return this.set(e.coefficients)}clone(){return new this.constructor().copy(this)}fromArray(e,t=0){let n=this.coefficients;for(let i=0;i<9;i++)n[i].fromArray(e,t+i*3);return this}toArray(e=[],t=0){let n=this.coefficients;for(let i=0;i<9;i++)n[i].toArray(e,t+i*3);return e}static getBasisAt(e,t){let{x:n,y:i,z:s}=e;t[0]=0.282095,t[1]=0.488603*i,t[2]=0.488603*s,t[3]=0.488603*n,t[4]=1.092548*n*i,t[5]=1.092548*i*s,t[6]=0.315392*(3*s*s-1),t[7]=1.092548*n*s,t[8]=0.546274*(n*n-i*i)}}class Gh extends Di{constructor(e=new kh,t=1){super(void 0,t);this.isLightProbe=!0,this.sh=e}copy(e){return super.copy(e),this.sh.copy(e.sh),this}fromJSON(e){return this.intensity=e.intensity,this.sh.fromArray(e.sh),this}toJSON(e){let t=super.toJSON(e);return t.object.sh=this.sh.toArray(),t}}class Xa extends an{constructor(e){super(e);this.textures={}}load(e,t,n,i){let s=this,r=new Pn(s.manager);r.setPath(s.path),r.setRequestHeader(s.requestHeader),r.setWithCredentials(s.withCredentials),r.load(e,function(o){try{t(s.parse(JSON.parse(o)))}catch(a){if(i)i(a);else console.error(a);s.manager.itemError(e)}},n,i)}parse(e){let t=this.textures;function n(s){if(t[s]===void 0)console.warn("THREE.MaterialLoader: Undefined texture",s);return t[s]}let i=this.createMaterialFromType(e.type);if(e.uuid!==void 0)i.uuid=e.uuid;if(e.name!==void 0)i.name=e.name;if(e.color!==void 0&&i.color!==void 0)i.color.setHex(e.color);if(e.roughness!==void 0)i.roughness=e.roughness;if(e.metalness!==void 0)i.metalness=e.metalness;if(e.sheen!==void 0)i.sheen=e.sheen;if(e.sheenColor!==void 0)i.sheenColor=new fe().setHex(e.sheenColor);if(e.sheenRoughness!==void 0)i.sheenRoughness=e.sheenRoughness;if(e.emissive!==void 0&&i.emissive!==void 0)i.emissive.setHex(e.emissive);if(e.specular!==void 0&&i.specular!==void 0)i.specular.setHex(e.specular);if(e.specularIntensity!==void 0)i.specularIntensity=e.specularIntensity;if(e.specularColor!==void 0&&i.specularColor!==void 0)i.specularColor.setHex(e.specularColor);if(e.shininess!==void 0)i.shininess=e.shininess;if(e.clearcoat!==void 0)i.clearcoat=e.clearcoat;if(e.clearcoatRoughness!==void 0)i.clearcoatRoughness=e.clearcoatRoughness;if(e.dispersion!==void 0)i.dispersion=e.dispersion;if(e.iridescence!==void 0)i.iridescence=e.iridescence;if(e.iridescenceIOR!==void 0)i.iridescenceIOR=e.iridescenceIOR;if(e.iridescenceThicknessRange!==void 0)i.iridescenceThicknessRange=e.iridescenceThicknessRange;if(e.transmission!==void 0)i.transmission=e.transmission;if(e.thickness!==void 0)i.thickness=e.thickness;if(e.attenuationDistance!==void 0)i.attenuationDistance=e.attenuationDistance;if(e.attenuationColor!==void 0&&i.attenuationColor!==void 0)i.attenuationColor.setHex(e.attenuationColor);if(e.anisotropy!==void 0)i.anisotropy=e.anisotropy;if(e.anisotropyRotation!==void 0)i.anisotropyRotation=e.anisotropyRotation;if(e.fog!==void 0)i.fog=e.fog;if(e.flatShading!==void 0)i.flatShading=e.flatShading;if(e.blending!==void 0)i.blending=e.blending;if(e.combine!==void 0)i.combine=e.combine;if(e.side!==void 0)i.side=e.side;if(e.shadowSide!==void 0)i.shadowSide=e.shadowSide;if(e.opacity!==void 0)i.opacity=e.opacity;if(e.transparent!==void 0)i.transparent=e.transparent;if(e.alphaTest!==void 0)i.alphaTest=e.alphaTest;if(e.alphaHash!==void 0)i.alphaHash=e.alphaHash;if(e.depthFunc!==void 0)i.depthFunc=e.depthFunc;if(e.depthTest!==void 0)i.depthTest=e.depthTest;if(e.depthWrite!==void 0)i.depthWrite=e.depthWrite;if(e.colorWrite!==void 0)i.colorWrite=e.colorWrite;if(e.blendSrc!==void 0)i.blendSrc=e.blendSrc;if(e.blendDst!==void 0)i.blendDst=e.blendDst;if(e.blendEquation!==void 0)i.blendEquation=e.blendEquation;if(e.blendSrcAlpha!==void 0)i.blendSrcAlpha=e.blendSrcAlpha;if(e.blendDstAlpha!==void 0)i.blendDstAlpha=e.blendDstAlpha;if(e.blendEquationAlpha!==void 0)i.blendEquationAlpha=e.blendEquationAlpha;if(e.blendColor!==void 0&&i.blendColor!==void 0)i.blendColor.setHex(e.blendColor);if(e.blendAlpha!==void 0)i.blendAlpha=e.blendAlpha;if(e.stencilWriteMask!==void 0)i.stencilWriteMask=e.stencilWriteMask;if(e.stencilFunc!==void 0)i.stencilFunc=e.stencilFunc;if(e.stencilRef!==void 0)i.stencilRef=e.stencilRef;if(e.stencilFuncMask!==void 0)i.stencilFuncMask=e.stencilFuncMask;if(e.stencilFail!==void 0)i.stencilFail=e.stencilFail;if(e.stencilZFail!==void 0)i.stencilZFail=e.stencilZFail;if(e.stencilZPass!==void 0)i.stencilZPass=e.stencilZPass;if(e.stencilWrite!==void 0)i.stencilWrite=e.stencilWrite;if(e.wireframe!==void 0)i.wireframe=e.wireframe;if(e.wireframeLinewidth!==void 0)i.wireframeLinewidth=e.wireframeLinewidth;if(e.wireframeLinecap!==void 0)i.wireframeLinecap=e.wireframeLinecap;if(e.wireframeLinejoin!==void 0)i.wireframeLinejoin=e.wireframeLinejoin;if(e.rotation!==void 0)i.rotation=e.rotation;if(e.linewidth!==void 0)i.linewidth=e.linewidth;if(e.dashSize!==void 0)i.dashSize=e.dashSize;if(e.gapSize!==void 0)i.gapSize=e.gapSize;if(e.scale!==void 0)i.scale=e.scale;if(e.polygonOffset!==void 0)i.polygonOffset=e.polygonOffset;if(e.polygonOffsetFactor!==void 0)i.polygonOffsetFactor=e.polygonOffsetFactor;if(e.polygonOffsetUnits!==void 0)i.polygonOffsetUnits=e.polygonOffsetUnits;if(e.dithering!==void 0)i.dithering=e.dithering;if(e.alphaToCoverage!==void 0)i.alphaToCoverage=e.alphaToCoverage;if(e.premultipliedAlpha!==void 0)i.premultipliedAlpha=e.premultipliedAlpha;if(e.forceSinglePass!==void 0)i.forceSinglePass=e.forceSinglePass;if(e.visible!==void 0)i.visible=e.visible;if(e.toneMapped!==void 0)i.toneMapped=e.toneMapped;if(e.userData!==void 0)i.userData=e.userData;if(e.vertexColors!==void 0)if(typeof e.vertexColors==="number")i.vertexColors=e.vertexColors>0?!0:!1;else i.vertexColors=e.vertexColors;if(e.uniforms!==void 0)for(let s in e.uniforms){let r=e.uniforms[s];switch(i.uniforms[s]={},r.type){case"t":i.uniforms[s].value=n(r.value);break;case"c":i.uniforms[s].value=new fe().setHex(r.value);break;case"v2":i.uniforms[s].value=new se().fromArray(r.value);break;case"v3":i.uniforms[s].value=new I().fromArray(r.value);break;case"v4":i.uniforms[s].value=new bt().fromArray(r.value);break;case"m3":i.uniforms[s].value=new ht().fromArray(r.value);break;case"m4":i.uniforms[s].value=new He().fromArray(r.value);break;default:i.uniforms[s].value=r.value}}if(e.defines!==void 0)i.defines=e.defines;if(e.vertexShader!==void 0)i.vertexShader=e.vertexShader;if(e.fragmentShader!==void 0)i.fragmentShader=e.fragmentShader;if(e.glslVersion!==void 0)i.glslVersion=e.glslVersion;if(e.extensions!==void 0)for(let s in e.extensions)i.extensions[s]=e.extensions[s];if(e.lights!==void 0)i.lights=e.lights;if(e.clipping!==void 0)i.clipping=e.clipping;if(e.size!==void 0)i.size=e.size;if(e.sizeAttenuation!==void 0)i.sizeAttenuation=e.sizeAttenuation;if(e.map!==void 0)i.map=n(e.map);if(e.matcap!==void 0)i.matcap=n(e.matcap);if(e.alphaMap!==void 0)i.alphaMap=n(e.alphaMap);if(e.bumpMap!==void 0)i.bumpMap=n(e.bumpMap);if(e.bumpScale!==void 0)i.bumpScale=e.bumpScale;if(e.normalMap!==void 0)i.normalMap=n(e.normalMap);if(e.normalMapType!==void 0)i.normalMapType=e.normalMapType;if(e.normalScale!==void 0){let s=e.normalScale;if(Array.isArray(s)===!1)s=[s,s];i.normalScale=new se().fromArray(s)}if(e.displacementMap!==void 0)i.displacementMap=n(e.displacementMap);if(e.displacementScale!==void 0)i.displacementScale=e.displacementScale;if(e.displacementBias!==void 0)i.displacementBias=e.displacementBias;if(e.roughnessMap!==void 0)i.roughnessMap=n(e.roughnessMap);if(e.metalnessMap!==void 0)i.metalnessMap=n(e.metalnessMap);if(e.emissiveMap!==void 0)i.emissiveMap=n(e.emissiveMap);if(e.emissiveIntensity!==void 0)i.emissiveIntensity=e.emissiveIntensity;if(e.specularMap!==void 0)i.specularMap=n(e.specularMap);if(e.specularIntensityMap!==void 0)i.specularIntensityMap=n(e.specularIntensityMap);if(e.specularColorMap!==void 0)i.specularColorMap=n(e.specularColorMap);if(e.envMap!==void 0)i.envMap=n(e.envMap);if(e.envMapRotation!==void 0)i.envMapRotation.fromArray(e.envMapRotation);if(e.envMapIntensity!==void 0)i.envMapIntensity=e.envMapIntensity;if(e.reflectivity!==void 0)i.reflectivity=e.reflectivity;if(e.refractionRatio!==void 0)i.refractionRatio=e.refractionRatio;if(e.lightMap!==void 0)i.lightMap=n(e.lightMap);if(e.lightMapIntensity!==void 0)i.lightMapIntensity=e.lightMapIntensity;if(e.aoMap!==void 0)i.aoMap=n(e.aoMap);if(e.aoMapIntensity!==void 0)i.aoMapIntensity=e.aoMapIntensity;if(e.gradientMap!==void 0)i.gradientMap=n(e.gradientMap);if(e.clearcoatMap!==void 0)i.clearcoatMap=n(e.clearcoatMap);if(e.clearcoatRoughnessMap!==void 0)i.clearcoatRoughnessMap=n(e.clearcoatRoughnessMap);if(e.clearcoatNormalMap!==void 0)i.clearcoatNormalMap=n(e.clearcoatNormalMap);if(e.clearcoatNormalScale!==void 0)i.clearcoatNormalScale=new se().fromArray(e.clearcoatNormalScale);if(e.iridescenceMap!==void 0)i.iridescenceMap=n(e.iridescenceMap);if(e.iridescenceThicknessMap!==void 0)i.iridescenceThicknessMap=n(e.iridescenceThicknessMap);if(e.transmissionMap!==void 0)i.transmissionMap=n(e.transmissionMap);if(e.thicknessMap!==void 0)i.thicknessMap=n(e.thicknessMap);if(e.anisotropyMap!==void 0)i.anisotropyMap=n(e.anisotropyMap);if(e.sheenColorMap!==void 0)i.sheenColorMap=n(e.sheenColorMap);if(e.sheenRoughnessMap!==void 0)i.sheenRoughnessMap=n(e.sheenRoughnessMap);return i}setTextures(e){return this.textures=e,this}createMaterialFromType(e){return Xa.createMaterialFromType(e)}static createMaterialFromType(e){return new{ShadowMaterial:Ch,SpriteMaterial:ba,RawShaderMaterial:po,ShaderMaterial:xt,PointsMaterial:ar,MeshPhysicalMaterial:Ht,MeshStandardMaterial:Pt,MeshPhongMaterial:Ih,MeshToonMaterial:Ph,MeshNormalMaterial:mo,MeshLambertMaterial:Dh,MeshDepthMaterial:za,MeshDistanceMaterial:Ha,MeshBasicMaterial:on,MeshMatcapMaterial:Lh,LineDashedMaterial:Nh,LineBasicMaterial:tn,Material:Gt}[e]}}class ui{static extractUrlBase(e){let t=e.lastIndexOf("/");if(t===-1)return"./";return e.slice(0,t+1)}static resolveURL(e,t){if(typeof e!=="string"||e==="")return"";if(/^https?:\/\//i.test(t)&&/^\//.test(e))t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(e))return e;if(/^data:.*,.*$/i.test(e))return e;if(/^blob:.*$/i.test(e))return e;return t+e}}class Wh extends Je{constructor(){super();this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class Vh extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=new Pn(s.manager);r.setPath(s.path),r.setRequestHeader(s.requestHeader),r.setWithCredentials(s.withCredentials),r.load(e,function(o){try{t(s.parse(JSON.parse(o)))}catch(a){if(i)i(a);else console.error(a);s.manager.itemError(e)}},n,i)}parse(e){let t={},n={};function i(f,d){if(t[d]!==void 0)return t[d];let x=f.interleavedBuffers[d],m=s(f,x.buffer),p=Vr(x.type,m),M=new Ii(p,x.stride);return M.uuid=x.uuid,t[d]=M,M}function s(f,d){if(n[d]!==void 0)return n[d];let x=f.arrayBuffers[d],m=new Uint32Array(x).buffer;return n[d]=m,m}let r=e.isInstancedBufferGeometry?new Wh:new Je,o=e.data.index;if(o!==void 0){let f=Vr(o.type,o.array);r.setIndex(new at(f,1))}let a=e.data.attributes;for(let f in a){let d=a[f],g;if(d.isInterleavedBufferAttribute){let x=i(e.data,d.data);g=new Kn(x,d.itemSize,d.offset,d.normalized)}else{let x=Vr(d.type,d.array);g=new(d.isInstancedBufferAttribute?Tn:at)(x,d.itemSize,d.normalized)}if(d.name!==void 0)g.name=d.name;if(d.usage!==void 0)g.setUsage(d.usage);r.setAttribute(f,g)}let l=e.data.morphAttributes;if(l)for(let f in l){let d=l[f],g=[];for(let x=0,m=d.length;x<m;x++){let p=d[x],M;if(p.isInterleavedBufferAttribute){let y=i(e.data,p.data);M=new Kn(y,p.itemSize,p.offset,p.normalized)}else{let y=Vr(p.type,p.array);M=new at(y,p.itemSize,p.normalized)}if(p.name!==void 0)M.name=p.name;g.push(M)}r.morphAttributes[f]=g}if(e.data.morphTargetsRelative)r.morphTargetsRelative=!0;let h=e.data.groups||e.data.drawcalls||e.data.offsets;if(h!==void 0)for(let f=0,d=h.length;f!==d;++f){let g=h[f];r.addGroup(g.start,g.count,g.materialIndex)}let u=e.data.boundingSphere;if(u!==void 0)r.boundingSphere=new Xt().fromJSON(u);if(e.name)r.name=e.name;if(e.userData)r.userData=e.userData;return r}}class dd extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=this.path===""?ui.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||r;let o=new Pn(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){let l=null;try{l=JSON.parse(a)}catch(h){if(i!==void 0)i(h);console.error("THREE:ObjectLoader: Can't parse "+e+".",h.message);return}let c=l.metadata;if(c===void 0||c.type===void 0||c.type.toLowerCase()==="geometry"){if(i!==void 0)i(Error("THREE.ObjectLoader: Can't load "+e));console.error("THREE.ObjectLoader: Can't load "+e);return}s.parse(l,t)},n,i)}async loadAsync(e,t){let n=this,i=this.path===""?ui.extractUrlBase(e):this.path;this.resourcePath=this.resourcePath||i;let s=new Pn(this.manager);s.setPath(this.path),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials);let r=await s.loadAsync(e,t),o=JSON.parse(r),a=o.metadata;if(a===void 0||a.type===void 0||a.type.toLowerCase()==="geometry")throw Error("THREE.ObjectLoader: Can't load "+e);return await n.parseAsync(o)}parse(e,t){let n=this.parseAnimations(e.animations),i=this.parseShapes(e.shapes),s=this.parseGeometries(e.geometries,i),r=this.parseImages(e.images,function(){if(t!==void 0)t(l)}),o=this.parseTextures(e.textures,r),a=this.parseMaterials(e.materials,o),l=this.parseObject(e.object,s,a,o,n),c=this.parseSkeletons(e.skeletons,l);if(this.bindSkeletons(l,c),this.bindLightTargets(l),t!==void 0){let h=!1;for(let u in r)if(r[u].data instanceof HTMLImageElement){h=!0;break}if(h===!1)t(l)}return l}async parseAsync(e){let t=this.parseAnimations(e.animations),n=this.parseShapes(e.shapes),i=this.parseGeometries(e.geometries,n),s=await this.parseImagesAsync(e.images),r=this.parseTextures(e.textures,s),o=this.parseMaterials(e.materials,r),a=this.parseObject(e.object,i,o,r,t),l=this.parseSkeletons(e.skeletons,a);return this.bindSkeletons(a,l),this.bindLightTargets(a),a}parseShapes(e){let t={};if(e!==void 0)for(let n=0,i=e.length;n<i;n++){let s=new ci().fromJSON(e[n]);t[s.uuid]=s}return t}parseSkeletons(e,t){let n={},i={};if(t.traverse(function(s){if(s.isBone)i[s.uuid]=s}),e!==void 0)for(let s=0,r=e.length;s<r;s++){let o=new or().fromJSON(e[s],i);n[o.uuid]=o}return n}parseGeometries(e,t){let n={};if(e!==void 0){let i=new Vh;for(let s=0,r=e.length;s<r;s++){let o,a=e[s];switch(a.type){case"BufferGeometry":case"InstancedBufferGeometry":o=i.parse(a);break;default:if(a.type in Nm)o=Nm[a.type].fromJSON(a,t);else console.warn(`THREE.ObjectLoader: Unsupported geometry type "${a.type}"`)}if(o.uuid=a.uuid,a.name!==void 0)o.name=a.name;if(a.userData!==void 0)o.userData=a.userData;n[a.uuid]=o}}return n}parseMaterials(e,t){let n={},i={};if(e!==void 0){let s=new Xa;s.setTextures(t);for(let r=0,o=e.length;r<o;r++){let a=e[r];if(n[a.uuid]===void 0)n[a.uuid]=s.parse(a);i[a.uuid]=n[a.uuid]}}return i}parseAnimations(e){let t={};if(e!==void 0)for(let n=0;n<e.length;n++){let i=e[n],s=hi.parse(i);t[s.uuid]=s}return t}parseImages(e,t){let n=this,i={},s;function r(a){return n.manager.itemStart(a),s.load(a,function(){n.manager.itemEnd(a)},void 0,function(){n.manager.itemError(a),n.manager.itemEnd(a)})}function o(a){if(typeof a==="string"){let l=a,c=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(l)?l:n.resourcePath+l;return r(c)}else if(a.data)return{data:Vr(a.type,a.data),width:a.width,height:a.height};else return null}if(e!==void 0&&e.length>0){let a=new Wa(t);s=new qs(a),s.setCrossOrigin(this.crossOrigin);for(let l=0,c=e.length;l<c;l++){let h=e[l],u=h.url;if(Array.isArray(u)){let f=[];for(let d=0,g=u.length;d<g;d++){let x=u[d],m=o(x);if(m!==null)if(m instanceof HTMLImageElement)f.push(m);else f.push(new mn(m.data,m.width,m.height))}i[h.uuid]=new Ai(f)}else{let f=o(h.url);i[h.uuid]=new Ai(f)}}}return i}async parseImagesAsync(e){let t=this,n={},i;async function s(r){if(typeof r==="string"){let o=r,a=/^(\/\/)|([a-z]+:(\/\/)?)/i.test(o)?o:t.resourcePath+o;return await i.loadAsync(a)}else if(r.data)return{data:Vr(r.type,r.data),width:r.width,height:r.height};else return null}if(e!==void 0&&e.length>0){i=new qs(this.manager),i.setCrossOrigin(this.crossOrigin);for(let r=0,o=e.length;r<o;r++){let a=e[r],l=a.url;if(Array.isArray(l)){let c=[];for(let h=0,u=l.length;h<u;h++){let f=l[h],d=await s(f);if(d!==null)if(d instanceof HTMLImageElement)c.push(d);else c.push(new mn(d.data,d.width,d.height))}n[a.uuid]=new Ai(c)}else{let c=await s(a.url);n[a.uuid]=new Ai(c)}}}return n}parseTextures(e,t){function n(s,r){if(typeof s==="number")return s;return console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.",s),r[s]}let i={};if(e!==void 0)for(let s=0,r=e.length;s<r;s++){let o=e[s];if(o.image===void 0)console.warn('THREE.ObjectLoader: No "image" specified for',o.uuid);if(t[o.image]===void 0)console.warn("THREE.ObjectLoader: Undefined image",o.image);let a=t[o.image],l=a.data,c;if(Array.isArray(l)){if(c=new nr,l.length===6)c.needsUpdate=!0}else{if(l&&l.data)c=new mn;else c=new Rt;if(l)c.needsUpdate=!0}if(c.source=a,c.uuid=o.uuid,o.name!==void 0)c.name=o.name;if(o.mapping!==void 0)c.mapping=n(o.mapping,Dy);if(o.channel!==void 0)c.channel=o.channel;if(o.offset!==void 0)c.offset.fromArray(o.offset);if(o.repeat!==void 0)c.repeat.fromArray(o.repeat);if(o.center!==void 0)c.center.fromArray(o.center);if(o.rotation!==void 0)c.rotation=o.rotation;if(o.wrap!==void 0)c.wrapS=n(o.wrap[0],Bm),c.wrapT=n(o.wrap[1],Bm);if(o.format!==void 0)c.format=o.format;if(o.internalFormat!==void 0)c.internalFormat=o.internalFormat;if(o.type!==void 0)c.type=o.type;if(o.colorSpace!==void 0)c.colorSpace=o.colorSpace;if(o.minFilter!==void 0)c.minFilter=n(o.minFilter,zm);if(o.magFilter!==void 0)c.magFilter=n(o.magFilter,zm);if(o.anisotropy!==void 0)c.anisotropy=o.anisotropy;if(o.flipY!==void 0)c.flipY=o.flipY;if(o.generateMipmaps!==void 0)c.generateMipmaps=o.generateMipmaps;if(o.premultiplyAlpha!==void 0)c.premultiplyAlpha=o.premultiplyAlpha;if(o.unpackAlignment!==void 0)c.unpackAlignment=o.unpackAlignment;if(o.compareFunction!==void 0)c.compareFunction=o.compareFunction;if(o.userData!==void 0)c.userData=o.userData;i[o.uuid]=c}return i}parseObject(e,t,n,i,s){let r;function o(u){if(t[u]===void 0)console.warn("THREE.ObjectLoader: Undefined geometry",u);return t[u]}function a(u){if(u===void 0)return;if(Array.isArray(u)){let f=[];for(let d=0,g=u.length;d<g;d++){let x=u[d];if(n[x]===void 0)console.warn("THREE.ObjectLoader: Undefined material",x);f.push(n[x])}return f}if(n[u]===void 0)console.warn("THREE.ObjectLoader: Undefined material",u);return n[u]}function l(u){if(i[u]===void 0)console.warn("THREE.ObjectLoader: Undefined texture",u);return i[u]}let c,h;switch(e.type){case"Scene":if(r=new sr,e.background!==void 0)if(Number.isInteger(e.background))r.background=new fe(e.background);else r.background=l(e.background);if(e.environment!==void 0)r.environment=l(e.environment);if(e.fog!==void 0){if(e.fog.type==="Fog")r.fog=new wa(e.fog.color,e.fog.near,e.fog.far);else if(e.fog.type==="FogExp2")r.fog=new ir(e.fog.color,e.fog.density);if(e.fog.name!=="")r.fog.name=e.fog.name}if(e.backgroundBlurriness!==void 0)r.backgroundBlurriness=e.backgroundBlurriness;if(e.backgroundIntensity!==void 0)r.backgroundIntensity=e.backgroundIntensity;if(e.backgroundRotation!==void 0)r.backgroundRotation.fromArray(e.backgroundRotation);if(e.environmentIntensity!==void 0)r.environmentIntensity=e.environmentIntensity;if(e.environmentRotation!==void 0)r.environmentRotation.fromArray(e.environmentRotation);break;case"PerspectiveCamera":if(r=new Ot(e.fov,e.aspect,e.near,e.far),e.focus!==void 0)r.focus=e.focus;if(e.zoom!==void 0)r.zoom=e.zoom;if(e.filmGauge!==void 0)r.filmGauge=e.filmGauge;if(e.filmOffset!==void 0)r.filmOffset=e.filmOffset;if(e.view!==void 0)r.view=Object.assign({},e.view);break;case"OrthographicCamera":if(r=new Li(e.left,e.right,e.top,e.bottom,e.near,e.far),e.zoom!==void 0)r.zoom=e.zoom;if(e.view!==void 0)r.view=Object.assign({},e.view);break;case"AmbientLight":r=new zh(e.color,e.intensity);break;case"DirectionalLight":r=new ws(e.color,e.intensity),r.target=e.target||"";break;case"PointLight":r=new vo(e.color,e.intensity,e.distance,e.decay);break;case"RectAreaLight":r=new Hh(e.color,e.intensity,e.width,e.height);break;case"SpotLight":r=new Ss(e.color,e.intensity,e.distance,e.angle,e.penumbra,e.decay),r.target=e.target||"";break;case"HemisphereLight":r=new go(e.color,e.groundColor,e.intensity);break;case"LightProbe":r=new Gh().fromJSON(e);break;case"SkinnedMesh":if(c=o(e.geometry),h=a(e.material),r=new ao(c,h),e.bindMode!==void 0)r.bindMode=e.bindMode;if(e.bindMatrix!==void 0)r.bindMatrix.fromArray(e.bindMatrix);if(e.skeleton!==void 0)r.skeleton=e.skeleton;break;case"Mesh":c=o(e.geometry),h=a(e.material),r=new vt(c,h);break;case"InstancedMesh":c=o(e.geometry),h=a(e.material);let{count:u,instanceMatrix:f,instanceColor:d}=e;if(r=new Ln(c,h,u),r.instanceMatrix=new Tn(new Float32Array(f.array),16),d!==void 0)r.instanceColor=new Tn(new Float32Array(d.array),d.itemSize);break;case"BatchedMesh":if(c=o(e.geometry),h=a(e.material),r=new _h(e.maxInstanceCount,e.maxVertexCount,e.maxIndexCount,h),r.geometry=c,r.perObjectFrustumCulled=e.perObjectFrustumCulled,r.sortObjects=e.sortObjects,r._drawRanges=e.drawRanges,r._reservedRanges=e.reservedRanges,r._geometryInfo=e.geometryInfo.map((g)=>{let x=null,m=null;if(g.boundingBox!==void 0)x=new zt().fromJSON(g.boundingBox);if(g.boundingSphere!==void 0)m=new Xt().fromJSON(g.boundingSphere);return{...g,boundingBox:x,boundingSphere:m}}),r._instanceInfo=e.instanceInfo,r._availableInstanceIds=e._availableInstanceIds,r._availableGeometryIds=e._availableGeometryIds,r._nextIndexStart=e.nextIndexStart,r._nextVertexStart=e.nextVertexStart,r._geometryCount=e.geometryCount,r._maxInstanceCount=e.maxInstanceCount,r._maxVertexCount=e.maxVertexCount,r._maxIndexCount=e.maxIndexCount,r._geometryInitialized=e.geometryInitialized,r._matricesTexture=l(e.matricesTexture.uuid),r._indirectTexture=l(e.indirectTexture.uuid),e.colorsTexture!==void 0)r._colorsTexture=l(e.colorsTexture.uuid);if(e.boundingSphere!==void 0)r.boundingSphere=new Xt().fromJSON(e.boundingSphere);if(e.boundingBox!==void 0)r.boundingBox=new zt().fromJSON(e.boundingBox);break;case"LOD":r=new yh;break;case"Line":r=new Jn(o(e.geometry),a(e.material));break;case"LineLoop":r=new lo(o(e.geometry),a(e.material));break;case"LineSegments":r=new _n(o(e.geometry),a(e.material));break;case"PointCloud":case"Points":r=new co(o(e.geometry),a(e.material));break;case"Sprite":r=new xh(a(e.material));break;case"Group":r=new wt;break;case"Bone":r=new rr;break;default:r=new dt}if(r.uuid=e.uuid,e.name!==void 0)r.name=e.name;if(e.matrix!==void 0){if(r.matrix.fromArray(e.matrix),e.matrixAutoUpdate!==void 0)r.matrixAutoUpdate=e.matrixAutoUpdate;if(r.matrixAutoUpdate)r.matrix.decompose(r.position,r.quaternion,r.scale)}else{if(e.position!==void 0)r.position.fromArray(e.position);if(e.rotation!==void 0)r.rotation.fromArray(e.rotation);if(e.quaternion!==void 0)r.quaternion.fromArray(e.quaternion);if(e.scale!==void 0)r.scale.fromArray(e.scale)}if(e.up!==void 0)r.up.fromArray(e.up);if(e.castShadow!==void 0)r.castShadow=e.castShadow;if(e.receiveShadow!==void 0)r.receiveShadow=e.receiveShadow;if(e.shadow){if(e.shadow.intensity!==void 0)r.shadow.intensity=e.shadow.intensity;if(e.shadow.bias!==void 0)r.shadow.bias=e.shadow.bias;if(e.shadow.normalBias!==void 0)r.shadow.normalBias=e.shadow.normalBias;if(e.shadow.radius!==void 0)r.shadow.radius=e.shadow.radius;if(e.shadow.mapSize!==void 0)r.shadow.mapSize.fromArray(e.shadow.mapSize);if(e.shadow.camera!==void 0)r.shadow.camera=this.parseObject(e.shadow.camera)}if(e.visible!==void 0)r.visible=e.visible;if(e.frustumCulled!==void 0)r.frustumCulled=e.frustumCulled;if(e.renderOrder!==void 0)r.renderOrder=e.renderOrder;if(e.userData!==void 0)r.userData=e.userData;if(e.layers!==void 0)r.layers.mask=e.layers;if(e.children!==void 0){let u=e.children;for(let f=0;f<u.length;f++)r.add(this.parseObject(u[f],t,n,i,s))}if(e.animations!==void 0){let u=e.animations;for(let f=0;f<u.length;f++){let d=u[f];r.animations.push(s[d])}}if(e.type==="LOD"){if(e.autoUpdate!==void 0)r.autoUpdate=e.autoUpdate;let u=e.levels;for(let f=0;f<u.length;f++){let d=u[f],g=r.getObjectByProperty("uuid",d.object);if(g!==void 0)r.addLevel(g,d.distance,d.hysteresis)}}return r}bindSkeletons(e,t){if(Object.keys(t).length===0)return;e.traverse(function(n){if(n.isSkinnedMesh===!0&&n.skeleton!==void 0){let i=t[n.skeleton];if(i===void 0)console.warn("THREE.ObjectLoader: No skeleton found with UUID:",n.skeleton);else n.bind(i,n.bindMatrix)}})}bindLightTargets(e){e.traverse(function(t){if(t.isDirectionalLight||t.isSpotLight){let n=t.target,i=e.getObjectByProperty("uuid",n);if(i!==void 0)t.target=i;else t.target=new dt}})}}var Dy={UVMapping:300,CubeReflectionMapping:301,CubeRefractionMapping:302,EquirectangularReflectionMapping:303,EquirectangularRefractionMapping:304,CubeUVReflectionMapping:306},Bm={RepeatWrapping:1000,ClampToEdgeWrapping:1001,MirroredRepeatWrapping:1002},zm={NearestFilter:1003,NearestMipmapNearestFilter:1004,NearestMipmapLinearFilter:1005,LinearFilter:1006,LinearMipmapNearestFilter:1007,LinearMipmapLinearFilter:1008},Ku=new WeakMap;class qa extends an{constructor(e){super(e);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")console.warn("THREE.ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){if(e===void 0)e="";if(this.path!==void 0)e=this.path+e;e=this.manager.resolveURL(e);let s=this,r=li.get(`image-bitmap:${e}`);if(r!==void 0){if(s.manager.itemStart(e),r.then){r.then((l)=>{if(Ku.has(r)===!0){if(i)i(Ku.get(r));s.manager.itemError(e),s.manager.itemEnd(e)}else{if(t)t(l);return s.manager.itemEnd(e),l}});return}return setTimeout(function(){if(t)t(r);s.manager.itemEnd(e)},0),r}let o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let a=fetch(e,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(l){if(li.add(`image-bitmap:${e}`,l),t)t(l);return s.manager.itemEnd(e),l}).catch(function(l){if(i)i(l);Ku.set(a,l),li.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});li.add(`image-bitmap:${e}`,a),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var mc;class Ya{static getContext(){if(mc===void 0)mc=new(window.AudioContext||window.webkitAudioContext);return mc}static setContext(e){mc=e}}class pd extends an{constructor(e){super(e)}load(e,t,n,i){let s=this,r=new Pn(this.manager);r.setResponseType("arraybuffer"),r.setPath(this.path),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials),r.load(e,function(a){try{let l=a.slice(0);Ya.getContext().decodeAudioData(l,function(h){t(h)}).catch(o)}catch(l){o(l)}},n,i);function o(a){if(i)i(a);else console.error(a);s.manager.itemError(e)}}}var Hm=new He,km=new He,Fs=new He;class md{constructor(){this.type="StereoCamera",this.aspect=1,this.eyeSep=0.064,this.cameraL=new Ot,this.cameraL.layers.enable(1),this.cameraL.matrixAutoUpdate=!1,this.cameraR=new Ot,this.cameraR.layers.enable(2),this.cameraR.matrixAutoUpdate=!1,this._cache={focus:null,fov:null,aspect:null,near:null,far:null,zoom:null,eyeSep:null}}update(e){let t=this._cache;if(t.focus!==e.focus||t.fov!==e.fov||t.aspect!==e.aspect*this.aspect||t.near!==e.near||t.far!==e.far||t.zoom!==e.zoom||t.eyeSep!==this.eyeSep){t.focus=e.focus,t.fov=e.fov,t.aspect=e.aspect*this.aspect,t.near=e.near,t.far=e.far,t.zoom=e.zoom,t.eyeSep=this.eyeSep,Fs.copy(e.projectionMatrix);let i=t.eyeSep/2,s=i*t.near/t.focus,r=t.near*Math.tan(Ws*t.fov*0.5)/t.zoom,o,a;km.elements[12]=-i,Hm.elements[12]=i,o=-r*t.aspect+s,a=r*t.aspect+s,Fs.elements[0]=2*t.near/(a-o),Fs.elements[8]=(a+o)/(a-o),this.cameraL.projectionMatrix.copy(Fs),o=-r*t.aspect-s,a=r*t.aspect-s,Fs.elements[0]=2*t.near/(a-o),Fs.elements[8]=(a+o)/(a-o),this.cameraR.projectionMatrix.copy(Fs)}this.cameraL.matrixWorld.copy(e.matrixWorld).multiply(km),this.cameraR.matrixWorld.copy(e.matrixWorld).multiply(Hm)}}class Xh extends Ot{constructor(e=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class bs{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=performance.now();e=(t-this.oldTime)/1000,this.oldTime=t,this.elapsedTime+=e}return e}}var Os=new I,Ju=new Nt,Ly=new I,Bs=new I,zs=new I;class gd extends dt{constructor(){super();this.type="AudioListener",this.context=Ya.getContext(),this.gain=this.context.createGain(),this.gain.connect(this.context.destination),this.filter=null,this.timeDelta=0,this._clock=new bs}getInput(){return this.gain}removeFilter(){if(this.filter!==null)this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination),this.gain.connect(this.context.destination),this.filter=null;return this}getFilter(){return this.filter}setFilter(e){if(this.filter!==null)this.gain.disconnect(this.filter),this.filter.disconnect(this.context.destination);else this.gain.disconnect(this.context.destination);return this.filter=e,this.gain.connect(this.filter),this.filter.connect(this.context.destination),this}getMasterVolume(){return this.gain.gain.value}setMasterVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,0.01),this}updateMatrixWorld(e){super.updateMatrixWorld(e);let t=this.context.listener;if(this.timeDelta=this._clock.getDelta(),this.matrixWorld.decompose(Os,Ju,Ly),Bs.set(0,0,-1).applyQuaternion(Ju),zs.set(0,1,0).applyQuaternion(Ju),t.positionX){let n=this.context.currentTime+this.timeDelta;t.positionX.linearRampToValueAtTime(Os.x,n),t.positionY.linearRampToValueAtTime(Os.y,n),t.positionZ.linearRampToValueAtTime(Os.z,n),t.forwardX.linearRampToValueAtTime(Bs.x,n),t.forwardY.linearRampToValueAtTime(Bs.y,n),t.forwardZ.linearRampToValueAtTime(Bs.z,n),t.upX.linearRampToValueAtTime(zs.x,n),t.upY.linearRampToValueAtTime(zs.y,n),t.upZ.linearRampToValueAtTime(zs.z,n)}else t.setPosition(Os.x,Os.y,Os.z),t.setOrientation(Bs.x,Bs.y,Bs.z,zs.x,zs.y,zs.z)}}class qh extends dt{constructor(e){super();this.type="Audio",this.listener=e,this.context=e.context,this.gain=this.context.createGain(),this.gain.connect(e.getInput()),this.autoplay=!1,this.buffer=null,this.detune=0,this.loop=!1,this.loopStart=0,this.loopEnd=0,this.offset=0,this.duration=void 0,this.playbackRate=1,this.isPlaying=!1,this.hasPlaybackControl=!0,this.source=null,this.sourceType="empty",this._startedAt=0,this._progress=0,this._connected=!1,this.filters=[]}getOutput(){return this.gain}setNodeSource(e){return this.hasPlaybackControl=!1,this.sourceType="audioNode",this.source=e,this.connect(),this}setMediaElementSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaNode",this.source=this.context.createMediaElementSource(e),this.connect(),this}setMediaStreamSource(e){return this.hasPlaybackControl=!1,this.sourceType="mediaStreamNode",this.source=this.context.createMediaStreamSource(e),this.connect(),this}setBuffer(e){if(this.buffer=e,this.sourceType="buffer",this.autoplay)this.play();return this}play(e=0){if(this.isPlaying===!0){console.warn("THREE.Audio: Audio is already playing.");return}if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}this._startedAt=this.context.currentTime+e;let t=this.context.createBufferSource();return t.buffer=this.buffer,t.loop=this.loop,t.loopStart=this.loopStart,t.loopEnd=this.loopEnd,t.onended=this.onEnded.bind(this),t.start(this._startedAt,this._progress+this.offset,this.duration),this.isPlaying=!0,this.source=t,this.setDetune(this.detune),this.setPlaybackRate(this.playbackRate),this.connect()}pause(){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}if(this.isPlaying===!0){if(this._progress+=Math.max(this.context.currentTime-this._startedAt,0)*this.playbackRate,this.loop===!0)this._progress=this._progress%(this.duration||this.buffer.duration);this.source.stop(),this.source.onended=null,this.isPlaying=!1}return this}stop(e=0){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}if(this._progress=0,this.source!==null)this.source.stop(this.context.currentTime+e),this.source.onended=null;return this.isPlaying=!1,this}connect(){if(this.filters.length>0){this.source.connect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].connect(this.filters[e]);this.filters[this.filters.length-1].connect(this.getOutput())}else this.source.connect(this.getOutput());return this._connected=!0,this}disconnect(){if(this._connected===!1)return;if(this.filters.length>0){this.source.disconnect(this.filters[0]);for(let e=1,t=this.filters.length;e<t;e++)this.filters[e-1].disconnect(this.filters[e]);this.filters[this.filters.length-1].disconnect(this.getOutput())}else this.source.disconnect(this.getOutput());return this._connected=!1,this}getFilters(){return this.filters}setFilters(e){if(!e)e=[];if(this._connected===!0)this.disconnect(),this.filters=e.slice(),this.connect();else this.filters=e.slice();return this}setDetune(e){if(this.detune=e,this.isPlaying===!0&&this.source.detune!==void 0)this.source.detune.setTargetAtTime(this.detune,this.context.currentTime,0.01);return this}getDetune(){return this.detune}getFilter(){return this.getFilters()[0]}setFilter(e){return this.setFilters(e?[e]:[])}setPlaybackRate(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}if(this.playbackRate=e,this.isPlaying===!0)this.source.playbackRate.setTargetAtTime(this.playbackRate,this.context.currentTime,0.01);return this}getPlaybackRate(){return this.playbackRate}onEnded(){this.isPlaying=!1,this._progress=0}getLoop(){if(this.hasPlaybackControl===!1)return console.warn("THREE.Audio: this Audio has no playback control."),!1;return this.loop}setLoop(e){if(this.hasPlaybackControl===!1){console.warn("THREE.Audio: this Audio has no playback control.");return}if(this.loop=e,this.isPlaying===!0)this.source.loop=this.loop;return this}setLoopStart(e){return this.loopStart=e,this}setLoopEnd(e){return this.loopEnd=e,this}getVolume(){return this.gain.gain.value}setVolume(e){return this.gain.gain.setTargetAtTime(e,this.context.currentTime,0.01),this}copy(e,t){if(super.copy(e,t),e.sourceType!=="buffer")return console.warn("THREE.Audio: Audio source type cannot be copied."),this;return this.autoplay=e.autoplay,this.buffer=e.buffer,this.detune=e.detune,this.loop=e.loop,this.loopStart=e.loopStart,this.loopEnd=e.loopEnd,this.offset=e.offset,this.duration=e.duration,this.playbackRate=e.playbackRate,this.hasPlaybackControl=e.hasPlaybackControl,this.sourceType=e.sourceType,this.filters=e.filters.slice(),this}clone(e){return new this.constructor(this.listener).copy(this,e)}}var Hs=new I,Gm=new Nt,Ny=new I,ks=new I;class vd extends qh{constructor(e){super(e);this.panner=this.context.createPanner(),this.panner.panningModel="HRTF",this.panner.connect(this.gain)}connect(){return super.connect(),this.panner.connect(this.gain),this}disconnect(){return super.disconnect(),this.panner.disconnect(this.gain),this}getOutput(){return this.panner}getRefDistance(){return this.panner.refDistance}setRefDistance(e){return this.panner.refDistance=e,this}getRolloffFactor(){return this.panner.rolloffFactor}setRolloffFactor(e){return this.panner.rolloffFactor=e,this}getDistanceModel(){return this.panner.distanceModel}setDistanceModel(e){return this.panner.distanceModel=e,this}getMaxDistance(){return this.panner.maxDistance}setMaxDistance(e){return this.panner.maxDistance=e,this}setDirectionalCone(e,t,n){return this.panner.coneInnerAngle=e,this.panner.coneOuterAngle=t,this.panner.coneOuterGain=n,this}updateMatrixWorld(e){if(super.updateMatrixWorld(e),this.hasPlaybackControl===!0&&this.isPlaying===!1)return;this.matrixWorld.decompose(Hs,Gm,Ny),ks.set(0,0,1).applyQuaternion(Gm);let t=this.panner;if(t.positionX){let n=this.context.currentTime+this.listener.timeDelta;t.positionX.linearRampToValueAtTime(Hs.x,n),t.positionY.linearRampToValueAtTime(Hs.y,n),t.positionZ.linearRampToValueAtTime(Hs.z,n),t.orientationX.linearRampToValueAtTime(ks.x,n),t.orientationY.linearRampToValueAtTime(ks.y,n),t.orientationZ.linearRampToValueAtTime(ks.z,n)}else t.setPosition(Hs.x,Hs.y,Hs.z),t.setOrientation(ks.x,ks.y,ks.z)}}class xd{constructor(e,t=2048){this.analyser=e.context.createAnalyser(),this.analyser.fftSize=t,this.data=new Uint8Array(this.analyser.frequencyBinCount),e.getOutput().connect(this.analyser)}getFrequencyData(){return this.analyser.getByteFrequencyData(this.data),this.data}getAverageFrequency(){let e=0,t=this.getFrequencyData();for(let n=0;n<t.length;n++)e+=t[n];return e/t.length}}class Yh{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,s,r;switch(t){case"quaternion":i=this._slerp,s=this._slerpAdditive,r=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,s=this._select,r=this._setAdditiveIdentityOther,this.buffer=Array(n*5);break;default:i=this._lerp,s=this._lerpAdditive,r=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=s,this._setIdentity=r,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,s=e*i+i,r=this.cumulativeWeight;if(r===0){for(let o=0;o!==i;++o)n[s+o]=n[o];r=t}else{r+=t;let o=t/r;this._mixBufferRegion(n,s,0,o,i)}this.cumulativeWeight=r}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;if(this.cumulativeWeightAdditive===0)this._setIdentity();this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,s=this.cumulativeWeight,r=this.cumulativeWeightAdditive,o=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,s<1){let a=t*this._origIndex;this._mixBufferRegion(n,i,a,1-s,t)}if(r>0)this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let a=t,l=t+t;a!==l;++a)if(n[a]!==n[a+t]){o.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let s=n,r=i;s!==r;++s)t[s]=t[i+s%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,s){if(i>=0.5)for(let r=0;r!==s;++r)e[t+r]=e[n+r]}_slerp(e,t,n,i){Nt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,s){let r=this._workIndex*s;Nt.multiplyQuaternionsFlat(e,r,e,t,e,n),Nt.slerpFlat(e,t,e,t,e,r,i)}_lerp(e,t,n,i,s){let r=1-i;for(let o=0;o!==s;++o){let a=t+o;e[a]=e[a]*r+e[n+o]*i}}_lerpAdditive(e,t,n,i,s){for(let r=0;r!==s;++r){let o=t+r;e[o]=e[o]+e[n+r]*i}}}var yd="\\[\\]\\.:\\/",Uy=new RegExp("["+yd+"]","g"),_d="[^"+yd+"]",Fy="[^"+yd.replace("\\.","")+"]",Oy=/((?:WC+[\/:])*)/.source.replace("WC",_d),By=/(WCOD+)?/.source.replace("WCOD",Fy),zy=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",_d),Hy=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",_d),ky=new RegExp("^"+Oy+By+zy+Hy+"$"),Gy=["material","materials","bones","map"];class pg{constructor(e,t,n){let i=n||St.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];if(i!==void 0)i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class St{constructor(e,t,n){this.path=t,this.parsedPath=n||St.parseTrackName(t),this.node=St.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){if(!(e&&e.isAnimationObjectGroup))return new St(e,t,n);else return new St.Composite(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Uy,"")}static parseTrackName(e){let t=ky.exec(e);if(t===null)throw Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);if(Gy.indexOf(s)!==-1)n.nodeName=n.nodeName.substring(0,i),n.objectName=s}if(n.propertyName===null||n.propertyName.length===0)throw Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let r=0;r<s.length;r++){let o=s[r];if(o.name===t||o.uuid===t)return o;let a=n(o.children);if(a)return a}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,{objectName:n,propertyName:i,propertyIndex:s}=t;if(!e)e=St.findNode(this.rootNode,t.nodeName),this.node=e;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let c=0;c<e.length;c++)if(e[c].name===l){l=c;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let r=e[i];if(r===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;if(this.targetObject=e,e.isMaterial===!0)o=this.Versioning.NeedsUpdate;else if(e.isObject3D===!0)o=this.Versioning.MatrixWorldNeedsUpdate;let a=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(e.morphTargetDictionary[s]!==void 0)s=e.morphTargetDictionary[s]}a=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else if(r.fromArray!==void 0&&r.toArray!==void 0)a=this.BindingType.HasFromToArray,this.resolvedProperty=r;else if(Array.isArray(r))a=this.BindingType.EntireArray,this.resolvedProperty=r;else this.propertyName=i;this.getValue=this.GetterByBindingType[a],this.setValue=this.SetterByBindingTypeAndVersioning[a][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}St.Composite=pg;St.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};St.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};St.prototype.GetterByBindingType=[St.prototype._getValue_direct,St.prototype._getValue_array,St.prototype._getValue_arrayElement,St.prototype._getValue_toArray];St.prototype.SetterByBindingTypeAndVersioning=[[St.prototype._setValue_direct,St.prototype._setValue_direct_setNeedsUpdate,St.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[St.prototype._setValue_array,St.prototype._setValue_array_setNeedsUpdate,St.prototype._setValue_array_setMatrixWorldNeedsUpdate],[St.prototype._setValue_arrayElement,St.prototype._setValue_arrayElement_setNeedsUpdate,St.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[St.prototype._setValue_fromArray,St.prototype._setValue_fromArray_setNeedsUpdate,St.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Md{constructor(){this.isAnimationObjectGroup=!0,this.uuid=kn(),this._objects=Array.prototype.slice.call(arguments),this.nCachedObjects_=0;let e={};this._indicesByUUID=e;for(let n=0,i=arguments.length;n!==i;++n)e[arguments[n].uuid]=n;this._paths=[],this._parsedPaths=[],this._bindings=[],this._bindingsIndicesByPath={};let t=this;this.stats={objects:{get total(){return t._objects.length},get inUse(){return this.total-t.nCachedObjects_}},get bindingsPerObject(){return t._bindings.length}}}add(){let e=this._objects,t=this._indicesByUUID,n=this._paths,i=this._parsedPaths,s=this._bindings,r=s.length,o=void 0,a=e.length,l=this.nCachedObjects_;for(let c=0,h=arguments.length;c!==h;++c){let u=arguments[c],f=u.uuid,d=t[f];if(d===void 0){d=a++,t[f]=d,e.push(u);for(let g=0,x=r;g!==x;++g)s[g].push(new St(u,n[g],i[g]))}else if(d<l){o=e[d];let g=--l,x=e[g];t[x.uuid]=d,e[d]=x,t[f]=g,e[g]=u;for(let m=0,p=r;m!==p;++m){let M=s[m],y=M[g],S=M[d];if(M[d]=y,S===void 0)S=new St(u,n[m],i[m]);M[g]=S}}else if(e[d]!==o)console.error("THREE.AnimationObjectGroup: Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes.")}this.nCachedObjects_=l}remove(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length,s=this.nCachedObjects_;for(let r=0,o=arguments.length;r!==o;++r){let a=arguments[r],l=a.uuid,c=t[l];if(c!==void 0&&c>=s){let h=s++,u=e[h];t[u.uuid]=c,e[c]=u,t[l]=h,e[h]=a;for(let f=0,d=i;f!==d;++f){let g=n[f],x=g[h],m=g[c];g[c]=x,g[h]=m}}}this.nCachedObjects_=s}uncache(){let e=this._objects,t=this._indicesByUUID,n=this._bindings,i=n.length,s=this.nCachedObjects_,r=e.length;for(let o=0,a=arguments.length;o!==a;++o){let l=arguments[o],c=l.uuid,h=t[c];if(h!==void 0)if(delete t[c],h<s){let u=--s,f=e[u],d=--r,g=e[d];t[f.uuid]=h,e[h]=f,t[g.uuid]=u,e[u]=g,e.pop();for(let x=0,m=i;x!==m;++x){let p=n[x],M=p[u],y=p[d];p[h]=M,p[u]=y,p.pop()}}else{let u=--r,f=e[u];if(u>0)t[f.uuid]=h;e[h]=f,e.pop();for(let d=0,g=i;d!==g;++d){let x=n[d];x[h]=x[u],x.pop()}}}this.nCachedObjects_=s}subscribe_(e,t){let n=this._bindingsIndicesByPath,i=n[e],s=this._bindings;if(i!==void 0)return s[i];let r=this._paths,o=this._parsedPaths,a=this._objects,l=a.length,c=this.nCachedObjects_,h=Array(l);i=s.length,n[e]=i,r.push(e),o.push(t),s.push(h);for(let u=c,f=a.length;u!==f;++u){let d=a[u];h[u]=new St(d,e,t)}return h}unsubscribe_(e){let t=this._bindingsIndicesByPath,n=t[e];if(n!==void 0){let i=this._paths,s=this._parsedPaths,r=this._bindings,o=r.length-1,a=r[o],l=e[o];t[l]=n,r[n]=a,r.pop(),s[n]=s[o],s.pop(),i[n]=i[o],i.pop()}}}class Zh{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let s=t.tracks,r=s.length,o=Array(r),a={endingStart:2400,endingEnd:2400};for(let l=0;l!==r;++l){let c=s[l].createInterpolant(null);o[l]=c,c.settings=a}this._interpolantSettings=a,this._interpolants=o,this._propertyBindings=Array(r),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=2201,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,s=e._clip.duration,r=s/i,o=i/s;e.warp(1,r,t),this.warp(o,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;if(e!==null)this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e);return this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,s=i.time,r=this.timeScale,o=this._timeScaleInterpolant;if(o===null)o=i._lendControlInterpolant(),this._timeScaleInterpolant=o;let a=o.parameterPositions,l=o.sampleValues;return a[0]=s,a[1]=s+n,l[0]=e/r,l[1]=t/r,this}stopWarping(){let e=this._timeScaleInterpolant;if(e!==null)this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e);return this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let s=this._startTime;if(s!==null){let a=(e-s)*n;if(a<0||n===0)t=0;else this._startTime=null,t=n*a}t*=this._updateTimeScale(e);let r=this._updateTime(t),o=this._updateWeight(e);if(o>0){let a=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case 2501:for(let c=0,h=a.length;c!==h;++c)a[c].evaluate(r),l[c].accumulateAdditive(o);break;case 2500:default:for(let c=0,h=a.length;c!==h;++c)a[c].evaluate(r),l[c].accumulate(i,o)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];if(t*=i,e>n.parameterPositions[1]){if(this.stopFading(),i===0)this.enabled=!1}}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];if(t*=i,e>n.parameterPositions[1])if(this.stopWarping(),t===0)this.paused=!0;else this.timeScale=t}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,s=this._loopCount,r=n===2202;if(e===0){if(s===-1)return i;return r&&(s&1)===1?t-i:i}if(n===2200){if(s===-1)this._loopCount=0,this._setEndings(!0,!0,!1);e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}if(this.clampWhenFinished)this.paused=!0;else this.enabled=!1;this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(s===-1)if(e>=0)s=0,this._setEndings(!0,this.repetitions===0,r);else this._setEndings(this.repetitions===0,!0,r);if(i>=t||i<0){let o=Math.floor(i/t);i-=t*o,s+=Math.abs(o);let a=this.repetitions-s;if(a<=0){if(this.clampWhenFinished)this.paused=!0;else this.enabled=!1;i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1})}else{if(a===1){let l=e<0;this._setEndings(l,!l,r)}else this._setEndings(!1,!1,r);this._loopCount=s,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:o})}}else this.time=i;if(r&&(s&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;if(n)i.endingStart=2401,i.endingEnd=2401;else{if(e)i.endingStart=this.zeroSlopeAtStart?2401:2400;else i.endingStart=2402;if(t)i.endingEnd=this.zeroSlopeAtEnd?2401:2400;else i.endingEnd=2402}}_scheduleFading(e,t,n){let i=this._mixer,s=i.time,r=this._weightInterpolant;if(r===null)r=i._lendControlInterpolant(),this._weightInterpolant=r;let o=r.parameterPositions,a=r.sampleValues;return o[0]=s,a[0]=t,o[1]=s+e,a[1]=n,this}}var Wy=new Float32Array(1);class pr extends ei{constructor(e){super();this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,s=i.length,{_propertyBindings:r,_interpolants:o}=e,a=n.uuid,l=this._bindingsByRootAndName,c=l[a];if(c===void 0)c={},l[a]=c;for(let h=0;h!==s;++h){let u=i[h],f=u.name,d=c[f];if(d!==void 0)++d.referenceCount,r[h]=d;else{if(d=r[h],d!==void 0){if(d._cacheIndex===null)++d.referenceCount,this._addInactiveBinding(d,a,f);continue}let g=t&&t._propertyBindings[h].binding.parsedPath;d=new Yh(St.create(n,f,g),u.ValueTypeName,u.getValueSize()),++d.referenceCount,this._addInactiveBinding(d,a,f),r[h]=d}o[h].resultBuffer=d.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,s=this._actionsByClip[i];this._bindAction(e,s&&s.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];if(s.useCount++===0)this._lendBinding(s),s.saveOriginalState()}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];if(--s.useCount===0)s.restoreOriginalState(),this._takeBackBinding(s)}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,s=this._actionsByClip,r=s[t];if(r===void 0)r={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,s[t]=r;else{let o=r.knownActions;e._byClipCacheIndex=o.length,o.push(e)}e._cacheIndex=i.length,i.push(e),r.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let s=e._clip.uuid,r=this._actionsByClip,o=r[s],a=o.knownActions,l=a[a.length-1],c=e._byClipCacheIndex;l._byClipCacheIndex=c,a[c]=l,a.pop(),e._byClipCacheIndex=null;let h=o.actionByRoot,u=(e._localRoot||this._root).uuid;if(delete h[u],a.length===0)delete r[s];this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let s=t[n];if(--s.referenceCount===0)this._removeInactiveBinding(s)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,s=this._bindings,r=i[t];if(r===void 0)r={},i[t]=r;r[n]=e,e._cacheIndex=s.length,s.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,s=n.path,r=this._bindingsByRootAndName,o=r[i],a=t[t.length-1],l=e._cacheIndex;if(a._cacheIndex=l,t[l]=a,t.pop(),delete o[s],Object.keys(o).length===0)delete r[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,s=t[i];e._cacheIndex=i,t[i]=e,s._cacheIndex=n,t[n]=s}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];if(n===void 0)n=new ka(new Float32Array(2),new Float32Array(2),1,Wy),n.__cacheIndex=t,e[t]=n;return n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,s=t[i];e.__cacheIndex=i,t[i]=e,s.__cacheIndex=n,t[n]=s}clipAction(e,t,n){let i=t||this._root,s=i.uuid,r=typeof e==="string"?hi.findByName(i,e):e,o=r!==null?r.uuid:e,a=this._actionsByClip[o],l=null;if(n===void 0)if(r!==null)n=r.blendMode;else n=2500;if(a!==void 0){let h=a.actionByRoot[s];if(h!==void 0&&h.blendMode===n)return h;if(l=a.knownActions[0],r===null)r=l._clip}if(r===null)return null;let c=new Zh(this,r,t,n);return this._bindAction(c,l),this._addInactiveAction(c,o,s),c}existingAction(e,t){let n=t||this._root,i=n.uuid,s=typeof e==="string"?hi.findByName(n,e):e,r=s?s.uuid:e,o=this._actionsByClip[r];if(o!==void 0)return o.actionByRoot[i]||null;return null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,s=Math.sign(e),r=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(i,e,s,r);let o=this._bindings,a=this._nActiveBindings;for(let l=0;l!==a;++l)o[l].apply(r);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,s=i[n];if(s!==void 0){let r=s.knownActions;for(let o=0,a=r.length;o!==a;++o){let l=r[o];this._deactivateAction(l);let c=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=c,t[c]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let r in n){let o=n[r].actionByRoot,a=o[t];if(a!==void 0)this._deactivateAction(a),this._removeInactiveAction(a)}let i=this._bindingsByRootAndName,s=i[t];if(s!==void 0)for(let r in s){let o=s[r];o.restoreOriginalState(),this._removeInactiveBinding(o)}}uncacheAction(e,t){let n=this.existingAction(e,t);if(n!==null)this._deactivateAction(n),this._removeInactiveAction(n)}}class Sd extends _a{constructor(e=1,t=1,n=1,i={}){super(e,t,i);this.isRenderTarget3D=!0,this.depth=n,this.texture=new io(null,e,t,n),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}}class Kh{constructor(e){this.value=e}clone(){return new Kh(this.value.clone===void 0?this.value:this.value.clone())}}var Vy=0;class wd extends ei{constructor(){super();this.isUniformsGroup=!0,Object.defineProperty(this,"id",{value:Vy++}),this.name="",this.usage=35044,this.uniforms=[]}add(e){return this.uniforms.push(e),this}remove(e){let t=this.uniforms.indexOf(e);if(t!==-1)this.uniforms.splice(t,1);return this}setName(e){return this.name=e,this}setUsage(e){return this.usage=e,this}dispose(){this.dispatchEvent({type:"dispose"})}copy(e){this.name=e.name,this.usage=e.usage;let t=e.uniforms;this.uniforms.length=0;for(let n=0,i=t.length;n<i;n++){let s=Array.isArray(t[n])?t[n]:[t[n]];for(let r=0;r<s.length;r++)this.uniforms.push(s[r].clone())}return this}clone(){return new this.constructor().copy(this)}}class bd extends Ii{constructor(e,t,n=1){super(e,t);this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}}class Td{constructor(e,t,n,i,s,r=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=i,this.count=s,this.normalized=r,this.version=0}set needsUpdate(e){if(e===!0)this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}}var Wm=new He;class Ed{constructor(e,t,n=0,i=1/0){this.ray=new ys(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new so,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){if(t.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,0.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t;else if(t.isOrthographicCamera)this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t;else console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Wm.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wm),this}intersectObject(e,t=!0,n=[]){return rf(e,this,n,t),n.sort(Vm),n}intersectObjects(e,t=!0,n=[]){for(let i=0,s=e.length;i<s;i++)rf(e[i],this,n,t);return n.sort(Vm),n}}function Vm(e,t){return e.distance-t.distance}function rf(e,t,n,i){let s=!0;if(e.layers.test(t.layers)){if(e.raycast(t,n)===!1)s=!1}if(s===!0&&i===!0){let r=e.children;for(let o=0,a=r.length;o<a;o++)rf(r[o],t,n,!0)}}class Ad{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){if(this._document=e,e.hidden!==void 0)this._pageVisibilityHandler=Xy.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1)}disconnect(){if(this._pageVisibilityHandler!==null)this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null;this._document=null}getDelta(){return this._delta/1000}getElapsed(){return this._elapsed/1000}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){if(this._pageVisibilityHandler!==null&&this._document.hidden===!0)this._delta=0;else this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta;return this}}function Xy(){if(this._document.hidden===!1)this.reset()}class Rd{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=it(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){if(this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(e,n),this.phi=Math.acos(it(t/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class Cd{constructor(e=1,t=0,n=0){this.radius=e,this.theta=t,this.y=n}set(e,t,n){return this.radius=e,this.theta=t,this.y=n,this}copy(e){return this.radius=e.radius,this.theta=e.theta,this.y=e.y,this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+n*n),this.theta=Math.atan2(e,n),this.y=t,this}clone(){return new this.constructor().copy(this)}}class Jh{constructor(e,t,n,i){if(Jh.prototype.isMatrix2=!0,this.elements=[1,0,0,1],e!==void 0)this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){let s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=i,this}}var Xm=new se;class Id{constructor(e=new se(1/0,1/0),t=new se(-1/0,-1/0)){this.isBox2=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xm.copy(t).multiplyScalar(0.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=1/0,this.max.x=this.max.y=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y}getCenter(e){return this.isEmpty()?e.set(0,0):e.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(e){return this.isEmpty()?e.set(0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xm).distanceTo(e)}intersect(e){if(this.min.max(e.min),this.max.min(e.max),this.isEmpty())this.makeEmpty();return this}union(e){return this.min.min(e.min),this.max.max(e.max),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}var qm=new I,gc=new I,Gr=new I,Wr=new I,ju=new I,qy=new I,Yy=new I;class Pd{constructor(e=new I,t=new I){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){qm.subVectors(e,this.start),gc.subVectors(this.end,this.start);let n=gc.dot(gc),s=gc.dot(qm)/n;if(t)s=it(s,0,1);return s}closestPointToPoint(e,t,n){let i=this.closestPointToPointParameter(e,t);return this.delta(n).multiplyScalar(i).add(this.start)}distanceSqToLine3(e,t=qy,n=Yy){let s,r,o=this.start,a=e.start,l=this.end,c=e.end;Gr.subVectors(l,o),Wr.subVectors(c,a),ju.subVectors(o,a);let h=Gr.dot(Gr),u=Wr.dot(Wr),f=Wr.dot(ju);if(h<=0.00000000000000010000000000000001&&u<=0.00000000000000010000000000000001)return t.copy(o),n.copy(a),t.sub(n),t.dot(t);if(h<=0.00000000000000010000000000000001)s=0,r=f/u,r=it(r,0,1);else{let d=Gr.dot(ju);if(u<=0.00000000000000010000000000000001)r=0,s=it(-d/h,0,1);else{let g=Gr.dot(Wr),x=h*u-g*g;if(x!==0)s=it((g*f-d*u)/x,0,1);else s=0;if(r=(g*s+f)/u,r<0)r=0,s=it(-d/h,0,1);else if(r>1)r=1,s=it((g-d)/h,0,1)}}return t.copy(o).add(Gr.multiplyScalar(s)),n.copy(a).add(Wr.multiplyScalar(r)),t.sub(n),t.dot(t)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}var Ym=new I;class Dd extends dt{constructor(e,t){super();this.light=e,this.matrixAutoUpdate=!1,this.color=t,this.type="SpotLightHelper";let n=new Je,i=[0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,-1,0,1,0,0,0,0,1,1,0,0,0,0,-1,1];for(let r=0,o=1,a=32;r<a;r++,o++){let l=r/a*Math.PI*2,c=o/a*Math.PI*2;i.push(Math.cos(l),Math.sin(l),1,Math.cos(c),Math.sin(c),1)}n.setAttribute("position",new ze(i,3));let s=new tn({fog:!1,toneMapped:!1});this.cone=new _n(n,s),this.add(this.cone),this.update()}dispose(){this.cone.geometry.dispose(),this.cone.material.dispose()}update(){if(this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),this.parent)this.parent.updateWorldMatrix(!0),this.matrix.copy(this.parent.matrixWorld).invert().multiply(this.light.matrixWorld);else this.matrix.copy(this.light.matrixWorld);this.matrixWorld.copy(this.light.matrixWorld);let e=this.light.distance?this.light.distance:1000,t=e*Math.tan(this.light.angle);if(this.cone.scale.set(t,t,e),Ym.setFromMatrixPosition(this.light.target.matrixWorld),this.cone.lookAt(Ym),this.color!==void 0)this.cone.material.color.set(this.color);else this.cone.material.color.copy(this.light.color)}}var us=new I,vc=new He,Qu=new He;class Za extends _n{constructor(e){let t=mg(e),n=new Je,i=[],s=[];for(let l=0;l<t.length;l++){let c=t[l];if(c.parent&&c.parent.isBone)i.push(0,0,0),i.push(0,0,0),s.push(0,0,0),s.push(0,0,0)}n.setAttribute("position",new ze(i,3)),n.setAttribute("color",new ze(s,3));let r=new tn({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(n,r);this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1;let o=new fe(255),a=new fe(65280);this.setColors(o,a)}updateMatrixWorld(e){let t=this.bones,n=this.geometry,i=n.getAttribute("position");Qu.copy(this.root.matrixWorld).invert();for(let s=0,r=0;s<t.length;s++){let o=t[s];if(o.parent&&o.parent.isBone)vc.multiplyMatrices(Qu,o.matrixWorld),us.setFromMatrixPosition(vc),i.setXYZ(r,us.x,us.y,us.z),vc.multiplyMatrices(Qu,o.parent.matrixWorld),us.setFromMatrixPosition(vc),i.setXYZ(r+1,us.x,us.y,us.z),r+=2}n.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}setColors(e,t){let i=this.geometry.getAttribute("color");for(let s=0;s<i.count;s+=2)i.setXYZ(s,e.r,e.g,e.b),i.setXYZ(s+1,t.r,t.g,t.b);return i.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}function mg(e){let t=[];if(e.isBone===!0)t.push(e);for(let n=0;n<e.children.length;n++)t.push(...mg(e.children[n]));return t}class Ld extends vt{constructor(e,t,n){let i=new un(t,4,2),s=new on({wireframe:!0,fog:!1,toneMapped:!1});super(i,s);this.light=e,this.color=n,this.type="PointLightHelper",this.matrix=this.light.matrixWorld,this.matrixAutoUpdate=!1,this.update()}dispose(){this.geometry.dispose(),this.material.dispose()}update(){if(this.light.updateWorldMatrix(!0,!1),this.color!==void 0)this.material.color.set(this.color);else this.material.color.copy(this.light.color)}}var Zy=new I,Zm=new fe,Km=new fe;class Nd extends dt{constructor(e,t,n){super();this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="HemisphereLightHelper";let i=new fo(t);if(i.rotateY(Math.PI*0.5),this.material=new on({wireframe:!0,fog:!1,toneMapped:!1}),this.color===void 0)this.material.vertexColors=!0;let s=i.getAttribute("position"),r=new Float32Array(s.count*3);i.setAttribute("color",new at(r,3)),this.add(new vt(i,this.material)),this.update()}dispose(){this.children[0].geometry.dispose(),this.children[0].material.dispose()}update(){let e=this.children[0];if(this.color!==void 0)this.material.color.set(this.color);else{let t=e.geometry.getAttribute("color");Zm.copy(this.light.color),Km.copy(this.light.groundColor);for(let n=0,i=t.count;n<i;n++){let s=n<i/2?Zm:Km;t.setXYZ(n,s.r,s.g,s.b)}t.needsUpdate=!0}this.light.updateWorldMatrix(!0,!1),e.lookAt(Zy.setFromMatrixPosition(this.light.matrixWorld).negate())}}class Ud extends _n{constructor(e=10,t=10,n=4473924,i=8947848){n=new fe(n),i=new fe(i);let s=t/2,r=e/t,o=e/2,a=[],l=[];for(let u=0,f=0,d=-o;u<=t;u++,d+=r){a.push(-o,0,d,o,0,d),a.push(d,0,-o,d,0,o);let g=u===s?n:i;g.toArray(l,f),f+=3,g.toArray(l,f),f+=3,g.toArray(l,f),f+=3,g.toArray(l,f),f+=3}let c=new Je;c.setAttribute("position",new ze(a,3)),c.setAttribute("color",new ze(l,3));let h=new tn({vertexColors:!0,toneMapped:!1});super(c,h);this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Fd extends _n{constructor(e=10,t=16,n=8,i=64,s=4473924,r=8947848){s=new fe(s),r=new fe(r);let o=[],a=[];if(t>1)for(let h=0;h<t;h++){let u=h/t*(Math.PI*2),f=Math.sin(u)*e,d=Math.cos(u)*e;o.push(0,0,0),o.push(f,0,d);let g=h&1?s:r;a.push(g.r,g.g,g.b),a.push(g.r,g.g,g.b)}for(let h=0;h<n;h++){let u=h&1?s:r,f=e-e/n*h;for(let d=0;d<i;d++){let g=d/i*(Math.PI*2),x=Math.sin(g)*f,m=Math.cos(g)*f;o.push(x,0,m),a.push(u.r,u.g,u.b),g=(d+1)/i*(Math.PI*2),x=Math.sin(g)*f,m=Math.cos(g)*f,o.push(x,0,m),a.push(u.r,u.g,u.b)}}let l=new Je;l.setAttribute("position",new ze(o,3)),l.setAttribute("color",new ze(a,3));let c=new tn({vertexColors:!0,toneMapped:!1});super(l,c);this.type="PolarGridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}var Jm=new I,xc=new I,jm=new I;class Od extends dt{constructor(e,t,n){super();if(this.light=e,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.color=n,this.type="DirectionalLightHelper",t===void 0)t=1;let i=new Je;i.setAttribute("position",new ze([-t,t,0,t,t,0,t,-t,0,-t,-t,0,-t,t,0],3));let s=new tn({fog:!1,toneMapped:!1});this.lightPlane=new Jn(i,s),this.add(this.lightPlane),i=new Je,i.setAttribute("position",new ze([0,0,0,0,0,1],3)),this.targetLine=new Jn(i,s),this.add(this.targetLine),this.update()}dispose(){this.lightPlane.geometry.dispose(),this.lightPlane.material.dispose(),this.targetLine.geometry.dispose(),this.targetLine.material.dispose()}update(){if(this.light.updateWorldMatrix(!0,!1),this.light.target.updateWorldMatrix(!0,!1),Jm.setFromMatrixPosition(this.light.matrixWorld),xc.setFromMatrixPosition(this.light.target.matrixWorld),jm.subVectors(xc,Jm),this.lightPlane.lookAt(xc),this.color!==void 0)this.lightPlane.material.color.set(this.color),this.targetLine.material.color.set(this.color);else this.lightPlane.material.color.copy(this.light.color),this.targetLine.material.color.copy(this.light.color);this.targetLine.lookAt(xc),this.targetLine.scale.z=jm.length()}}var yc=new I,kt=new ro;class Bd extends _n{constructor(e){let t=new Je,n=new tn({color:16777215,vertexColors:!0,toneMapped:!1}),i=[],s=[],r={};o("n1","n2"),o("n2","n4"),o("n4","n3"),o("n3","n1"),o("f1","f2"),o("f2","f4"),o("f4","f3"),o("f3","f1"),o("n1","f1"),o("n2","f2"),o("n3","f3"),o("n4","f4"),o("p","n1"),o("p","n2"),o("p","n3"),o("p","n4"),o("u1","u2"),o("u2","u3"),o("u3","u1"),o("c","t"),o("p","c"),o("cn1","cn2"),o("cn3","cn4"),o("cf1","cf2"),o("cf3","cf4");function o(d,g){a(d),a(g)}function a(d){if(i.push(0,0,0),s.push(0,0,0),r[d]===void 0)r[d]=[];r[d].push(i.length/3-1)}t.setAttribute("position",new ze(i,3)),t.setAttribute("color",new ze(s,3));super(t,n);if(this.type="CameraHelper",this.camera=e,this.camera.updateProjectionMatrix)this.camera.updateProjectionMatrix();this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1,this.pointMap=r,this.update();let l=new fe(16755200),c=new fe(16711680),h=new fe(43775),u=new fe(16777215),f=new fe(3355443);this.setColors(l,c,h,u,f)}setColors(e,t,n,i,s){let o=this.geometry.getAttribute("color");return o.setXYZ(0,e.r,e.g,e.b),o.setXYZ(1,e.r,e.g,e.b),o.setXYZ(2,e.r,e.g,e.b),o.setXYZ(3,e.r,e.g,e.b),o.setXYZ(4,e.r,e.g,e.b),o.setXYZ(5,e.r,e.g,e.b),o.setXYZ(6,e.r,e.g,e.b),o.setXYZ(7,e.r,e.g,e.b),o.setXYZ(8,e.r,e.g,e.b),o.setXYZ(9,e.r,e.g,e.b),o.setXYZ(10,e.r,e.g,e.b),o.setXYZ(11,e.r,e.g,e.b),o.setXYZ(12,e.r,e.g,e.b),o.setXYZ(13,e.r,e.g,e.b),o.setXYZ(14,e.r,e.g,e.b),o.setXYZ(15,e.r,e.g,e.b),o.setXYZ(16,e.r,e.g,e.b),o.setXYZ(17,e.r,e.g,e.b),o.setXYZ(18,e.r,e.g,e.b),o.setXYZ(19,e.r,e.g,e.b),o.setXYZ(20,e.r,e.g,e.b),o.setXYZ(21,e.r,e.g,e.b),o.setXYZ(22,e.r,e.g,e.b),o.setXYZ(23,e.r,e.g,e.b),o.setXYZ(24,t.r,t.g,t.b),o.setXYZ(25,t.r,t.g,t.b),o.setXYZ(26,t.r,t.g,t.b),o.setXYZ(27,t.r,t.g,t.b),o.setXYZ(28,t.r,t.g,t.b),o.setXYZ(29,t.r,t.g,t.b),o.setXYZ(30,t.r,t.g,t.b),o.setXYZ(31,t.r,t.g,t.b),o.setXYZ(32,n.r,n.g,n.b),o.setXYZ(33,n.r,n.g,n.b),o.setXYZ(34,n.r,n.g,n.b),o.setXYZ(35,n.r,n.g,n.b),o.setXYZ(36,n.r,n.g,n.b),o.setXYZ(37,n.r,n.g,n.b),o.setXYZ(38,i.r,i.g,i.b),o.setXYZ(39,i.r,i.g,i.b),o.setXYZ(40,s.r,s.g,s.b),o.setXYZ(41,s.r,s.g,s.b),o.setXYZ(42,s.r,s.g,s.b),o.setXYZ(43,s.r,s.g,s.b),o.setXYZ(44,s.r,s.g,s.b),o.setXYZ(45,s.r,s.g,s.b),o.setXYZ(46,s.r,s.g,s.b),o.setXYZ(47,s.r,s.g,s.b),o.setXYZ(48,s.r,s.g,s.b),o.setXYZ(49,s.r,s.g,s.b),o.needsUpdate=!0,this}update(){let e=this.geometry,t=this.pointMap,n=1,i=1,s,r;if(kt.projectionMatrixInverse.copy(this.camera.projectionMatrixInverse),this.camera.reversedDepth===!0)s=1,r=0;else if(this.camera.coordinateSystem===2000)s=-1,r=1;else if(this.camera.coordinateSystem===2001)s=0,r=1;else throw Error("THREE.CameraHelper.update(): Invalid coordinate system: "+this.camera.coordinateSystem);Vt("c",t,e,kt,0,0,s),Vt("t",t,e,kt,0,0,r),Vt("n1",t,e,kt,-1,-1,s),Vt("n2",t,e,kt,1,-1,s),Vt("n3",t,e,kt,-1,1,s),Vt("n4",t,e,kt,1,1,s),Vt("f1",t,e,kt,-1,-1,r),Vt("f2",t,e,kt,1,-1,r),Vt("f3",t,e,kt,-1,1,r),Vt("f4",t,e,kt,1,1,r),Vt("u1",t,e,kt,0.7,1.1,s),Vt("u2",t,e,kt,-0.7,1.1,s),Vt("u3",t,e,kt,0,2,s),Vt("cf1",t,e,kt,-1,0,r),Vt("cf2",t,e,kt,1,0,r),Vt("cf3",t,e,kt,0,-1,r),Vt("cf4",t,e,kt,0,1,r),Vt("cn1",t,e,kt,-1,0,s),Vt("cn2",t,e,kt,1,0,s),Vt("cn3",t,e,kt,0,-1,s),Vt("cn4",t,e,kt,0,1,s),e.getAttribute("position").needsUpdate=!0}dispose(){this.geometry.dispose(),this.material.dispose()}}function Vt(e,t,n,i,s,r,o){yc.set(s,r,o).unproject(i);let a=t[e];if(a!==void 0){let l=n.getAttribute("position");for(let c=0,h=a.length;c<h;c++)l.setXYZ(a[c],yc.x,yc.y,yc.z)}}var _c=new zt;class zd extends _n{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=new Float32Array(24),s=new Je;s.setIndex(new at(n,1)),s.setAttribute("position",new at(i,3));super(s,new tn({color:t,toneMapped:!1}));this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0)_c.setFromObject(this.object);if(_c.isEmpty())return;let{min:e,max:t}=_c,n=this.geometry.attributes.position,i=n.array;i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=e.x,i[4]=t.y,i[5]=t.z,i[6]=e.x,i[7]=e.y,i[8]=t.z,i[9]=t.x,i[10]=e.y,i[11]=t.z,i[12]=t.x,i[13]=t.y,i[14]=e.z,i[15]=e.x,i[16]=t.y,i[17]=e.z,i[18]=e.x,i[19]=e.y,i[20]=e.z,i[21]=t.x,i[22]=e.y,i[23]=e.z,n.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Hd extends _n{constructor(e,t=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],s=new Je;s.setIndex(new at(n,1)),s.setAttribute("position",new ze(i,3));super(s,new tn({color:t,toneMapped:!1}));this.box=e,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(e){let t=this.box;if(t.isEmpty())return;t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(e)}dispose(){this.geometry.dispose(),this.material.dispose()}}class kd extends Jn{constructor(e,t=1,n=16776960){let i=n,s=[1,-1,0,-1,1,0,-1,-1,0,1,1,0,-1,1,0,-1,-1,0,1,-1,0,1,1,0],r=new Je;r.setAttribute("position",new ze(s,3)),r.computeBoundingSphere();super(r,new tn({color:i,toneMapped:!1}));this.type="PlaneHelper",this.plane=e,this.size=t;let o=[1,1,0,-1,1,0,-1,-1,0,1,1,0,-1,-1,0,1,-1,0],a=new Je;a.setAttribute("position",new ze(o,3)),a.computeBoundingSphere(),this.add(new vt(a,new on({color:i,opacity:0.2,transparent:!0,depthWrite:!1,toneMapped:!1})))}updateMatrixWorld(e){this.position.set(0,0,0),this.scale.set(0.5*this.size,0.5*this.size,1),this.lookAt(this.plane.normal),this.translateZ(-this.plane.constant),super.updateMatrixWorld(e)}dispose(){this.geometry.dispose(),this.material.dispose(),this.children[0].geometry.dispose(),this.children[0].material.dispose()}}var Qm=new I,Mc,$u;class Gd extends dt{constructor(e=new I(0,0,1),t=new I(0,0,0),n=1,i=16776960,s=n*0.2,r=s*0.2){super();if(this.type="ArrowHelper",Mc===void 0)Mc=new Je,Mc.setAttribute("position",new ze([0,0,0,0,1,0],3)),$u=new ji(0.5,1,5,1),$u.translate(0,-0.5,0);this.position.copy(t),this.line=new Jn(Mc,new tn({color:i,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new vt($u,new on({color:i,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,s,r)}setDirection(e){if(e.y>0.99999)this.quaternion.set(0,0,0,1);else if(e.y<-0.99999)this.quaternion.set(1,0,0,0);else{Qm.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Qm,t)}}setLength(e,t=e*0.2,n=t*0.2){this.line.scale.set(1,Math.max(0.0001,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class Wd extends _n{constructor(e=1){let t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,0.6,0,0,1,0,0.6,1,0,0,0,1,0,0.6,1],i=new Je;i.setAttribute("position",new ze(t,3)),i.setAttribute("color",new ze(n,3));let s=new tn({vertexColors:!0,toneMapped:!1});super(i,s);this.type="AxesHelper"}setColors(e,t,n){let i=new fe,s=this.geometry.attributes.color.array;return i.set(e),i.toArray(s,0),i.toArray(s,3),i.set(t),i.toArray(s,6),i.toArray(s,9),i.set(n),i.toArray(s,12),i.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Vd{constructor(){this.type="ShapePath",this.color=new fe,this.subPaths=[],this.currentPath=null}moveTo(e,t){return this.currentPath=new Zr,this.subPaths.push(this.currentPath),this.currentPath.moveTo(e,t),this}lineTo(e,t){return this.currentPath.lineTo(e,t),this}quadraticCurveTo(e,t,n,i){return this.currentPath.quadraticCurveTo(e,t,n,i),this}bezierCurveTo(e,t,n,i,s,r){return this.currentPath.bezierCurveTo(e,t,n,i,s,r),this}splineThru(e){return this.currentPath.splineThru(e),this}toShapes(e){function t(m){let p=[];for(let M=0,y=m.length;M<y;M++){let S=m[M],C=new ci;C.curves=S.curves,p.push(C)}return p}function n(m,p){let M=p.length,y=!1;for(let S=M-1,C=0;C<M;S=C++){let R=p[S],E=p[C],D=E.x-R.x,w=E.y-R.y;if(Math.abs(w)>Number.EPSILON){if(w<0)R=p[C],D=-D,E=p[S],w=-w;if(m.y<R.y||m.y>E.y)continue;if(m.y===R.y){if(m.x===R.x)return!0}else{let T=w*(m.x-R.x)-D*(m.y-R.y);if(T===0)return!0;if(T<0)continue;y=!y}}else{if(m.y!==R.y)continue;if(E.x<=m.x&&m.x<=R.x||R.x<=m.x&&m.x<=E.x)return!0}}return y}let i=Zn.isClockWise,s=this.subPaths;if(s.length===0)return[];let r,o,a,l=[];if(s.length===1)return o=s[0],a=new ci,a.curves=o.curves,l.push(a),l;let c=!i(s[0].getPoints());c=e?!c:c;let h=[],u=[],f=[],d=0,g;u[d]=void 0,f[d]=[];for(let m=0,p=s.length;m<p;m++)if(o=s[m],g=o.getPoints(),r=i(g),r=e?!r:r,r){if(!c&&u[d])d++;if(u[d]={s:new ci,p:g},u[d].s.curves=o.curves,c)d++;f[d]=[]}else f[d].push({h:o,p:g[0]});if(!u[0])return t(s);if(u.length>1){let m=!1,p=0;for(let M=0,y=u.length;M<y;M++)h[M]=[];for(let M=0,y=u.length;M<y;M++){let S=f[M];for(let C=0;C<S.length;C++){let R=S[C],E=!0;for(let D=0;D<u.length;D++)if(n(R.p,u[D].p)){if(M!==D)p++;if(E)E=!1,h[D].push(R);else m=!0}if(E)h[M].push(R)}}if(p>0&&m===!1)f=h}let x;for(let m=0,p=u.length;m<p;m++){a=u[m].s,l.push(a),x=f[m];for(let M=0,y=x.length;M<y;M++)a.holes.push(x[M].h)}return l}}class Xd extends ei{constructor(e,t=null){super();this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}if(this.domElement!==null)this.disconnect();this.domElement=e}disconnect(){}dispose(){}update(){}}function Ky(e,t){let n=e.image&&e.image.width?e.image.width/e.image.height:1;if(n>t)e.repeat.x=1,e.repeat.y=n/t,e.offset.x=0,e.offset.y=(1-e.repeat.y)/2;else e.repeat.x=t/n,e.repeat.y=1,e.offset.x=(1-e.repeat.x)/2,e.offset.y=0;return e}function Jy(e,t){let n=e.image&&e.image.width?e.image.width/e.image.height:1;if(n>t)e.repeat.x=t/n,e.repeat.y=1,e.offset.x=(1-e.repeat.x)/2,e.offset.y=0;else e.repeat.x=1,e.repeat.y=n/t,e.offset.x=0,e.offset.y=(1-e.repeat.y)/2;return e}function jy(e){return e.repeat.x=1,e.repeat.y=1,e.offset.x=0,e.offset.y=0,e}function jh(e,t,n,i){let s=Qy(i);switch(n){case 1021:return e*t;case 1028:return e*t/s.components*s.byteLength;case 1029:return e*t/s.components*s.byteLength;case 1030:return e*t*2/s.components*s.byteLength;case 1031:return e*t*2/s.components*s.byteLength;case 1022:return e*t*3/s.components*s.byteLength;case 1023:return e*t*4/s.components*s.byteLength;case 1033:return e*t*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 33778:case 33779:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 35841:case 35843:return Math.max(e,16)*Math.max(t,8)/4;case 35840:case 35842:return Math.max(e,8)*Math.max(t,8)/2;case 36196:case 37492:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 37496:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37808:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37809:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case 37810:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case 37811:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case 37812:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case 37813:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case 37814:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case 37815:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case 37816:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case 37817:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case 37818:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case 37819:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case 37820:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case 37821:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(e/4)*Math.ceil(t/4)*16;case 36283:case 36284:return Math.ceil(e/4)*Math.ceil(t/4)*8;case 36285:case 36286:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Qy(e){switch(e){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}class qd{static contain(e,t){return Ky(e,t)}static cover(e,t){return Jy(e,t)}static fill(e){return jy(e)}static getByteLength(e,t,n,i){return jh(e,t,n,i)}}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));if(typeof window<"u")if(window.__THREE__)console.warn("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="180";function zg(){let e=null,t=!1,n=null,i=null;function s(r,o){n(r,o),i=e.requestAnimationFrame(s)}return{start:function(){if(t===!0)return;if(n===null)return;i=e.requestAnimationFrame(s),t=!0},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){n=r},setContext:function(r){e=r}}}function $y(e){let t=new WeakMap;function n(a,l){let{array:c,usage:h}=a,u=c.byteLength,f=e.createBuffer();e.bindBuffer(l,f),e.bufferData(l,c,h),a.onUploadCallback();let d;if(c instanceof Float32Array)d=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=e.HALF_FLOAT;else if(c instanceof Uint16Array)if(a.isFloat16BufferAttribute)d=e.HALF_FLOAT;else d=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=e.SHORT;else if(c instanceof Uint32Array)d=e.UNSIGNED_INT;else if(c instanceof Int32Array)d=e.INT;else if(c instanceof Int8Array)d=e.BYTE;else if(c instanceof Uint8Array)d=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=e.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let{array:h,updateRanges:u}=l;if(e.bindBuffer(c,a),u.length===0)e.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){let g=u[f],x=u[d];if(x.start<=g.start+g.count+1)g.count=Math.max(g.count,x.start+x.count-g.start);else++f,u[f]=x}u.length=f+1;for(let d=0,g=u.length;d<g;d++){let x=u[d];e.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){if(a.isInterleavedBufferAttribute)a=a.data;return t.get(a)}function r(a){if(a.isInterleavedBufferAttribute)a=a.data;let l=t.get(a);if(l)e.deleteBuffer(l.buffer),t.delete(a)}function o(a,l){if(a.isInterleavedBufferAttribute)a=a.data;if(a.isGLBufferAttribute){let h=t.get(a);if(!h||h.version<a.version)t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,n(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var e_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,t_=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,n_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,i_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,s_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,r_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,o_=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,a_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,l_=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,c_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,h_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,u_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,f_=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,d_=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,p_=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,m_=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,g_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,v_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,x_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,y_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,__=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,M_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,S_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,w_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,b_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,T_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,E_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,A_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,R_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,C_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,I_="gl_FragColor = linearToOutputTexel( gl_FragColor );",P_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,D_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,L_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,N_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,U_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,F_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,O_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,B_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,z_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,H_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,k_=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,G_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,W_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,V_=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,X_=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,q_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Y_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Z_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,K_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,J_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,j_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Q_=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,$_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,eM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,nM=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,iM=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sM=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rM=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,oM=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,aM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,lM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,uM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,fM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,dM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,pM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mM=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,gM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,xM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,yM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_M=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,MM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,SM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,wM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,bM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,TM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,EM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,AM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,RM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,CM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,IM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,PM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,DM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,LM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,NM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,UM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,FM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,OM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,BM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,zM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,HM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,kM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,GM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,WM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,VM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,XM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,qM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,YM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ZM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,KM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,JM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,QM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,$M=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,eS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,iS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,oS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,aS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,cS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uS=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,pS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`;var gS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vS=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,xS=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,_S=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,MS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,SS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,bS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TS=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ES=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,AS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,RS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,CS=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,IS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,PS=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,DS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pt={alphahash_fragment:e_,alphahash_pars_fragment:t_,alphamap_fragment:n_,alphamap_pars_fragment:i_,alphatest_fragment:s_,alphatest_pars_fragment:r_,aomap_fragment:o_,aomap_pars_fragment:a_,batching_pars_vertex:l_,batching_vertex:c_,begin_vertex:h_,beginnormal_vertex:u_,bsdfs:f_,iridescence_fragment:d_,bumpmap_pars_fragment:p_,clipping_planes_fragment:m_,clipping_planes_pars_fragment:g_,clipping_planes_pars_vertex:v_,clipping_planes_vertex:x_,color_fragment:y_,color_pars_fragment:__,color_pars_vertex:M_,color_vertex:S_,common:w_,cube_uv_reflection_fragment:b_,defaultnormal_vertex:T_,displacementmap_pars_vertex:E_,displacementmap_vertex:A_,emissivemap_fragment:R_,emissivemap_pars_fragment:C_,colorspace_fragment:I_,colorspace_pars_fragment:P_,envmap_fragment:D_,envmap_common_pars_fragment:L_,envmap_pars_fragment:N_,envmap_pars_vertex:U_,envmap_physical_pars_fragment:q_,envmap_vertex:F_,fog_vertex:O_,fog_pars_vertex:B_,fog_fragment:z_,fog_pars_fragment:H_,gradientmap_pars_fragment:k_,lightmap_pars_fragment:G_,lights_lambert_fragment:W_,lights_lambert_pars_fragment:V_,lights_pars_begin:X_,lights_toon_fragment:Y_,lights_toon_pars_fragment:Z_,lights_phong_fragment:K_,lights_phong_pars_fragment:J_,lights_physical_fragment:j_,lights_physical_pars_fragment:Q_,lights_fragment_begin:$_,lights_fragment_maps:eM,lights_fragment_end:tM,logdepthbuf_fragment:nM,logdepthbuf_pars_fragment:iM,logdepthbuf_pars_vertex:sM,logdepthbuf_vertex:rM,map_fragment:oM,map_pars_fragment:aM,map_particle_fragment:lM,map_particle_pars_fragment:cM,metalnessmap_fragment:hM,metalnessmap_pars_fragment:uM,morphinstance_vertex:fM,morphcolor_vertex:dM,morphnormal_vertex:pM,morphtarget_pars_vertex:mM,morphtarget_vertex:gM,normal_fragment_begin:vM,normal_fragment_maps:xM,normal_pars_fragment:yM,normal_pars_vertex:_M,normal_vertex:MM,normalmap_pars_fragment:SM,clearcoat_normal_fragment_begin:wM,clearcoat_normal_fragment_maps:bM,clearcoat_pars_fragment:TM,iridescence_pars_fragment:EM,opaque_fragment:AM,packing:RM,premultiplied_alpha_fragment:CM,project_vertex:IM,dithering_fragment:PM,dithering_pars_fragment:DM,roughnessmap_fragment:LM,roughnessmap_pars_fragment:NM,shadowmap_pars_fragment:UM,shadowmap_pars_vertex:FM,shadowmap_vertex:OM,shadowmask_pars_fragment:BM,skinbase_vertex:zM,skinning_pars_vertex:HM,skinning_vertex:kM,skinnormal_vertex:GM,specularmap_fragment:WM,specularmap_pars_fragment:VM,tonemapping_fragment:XM,tonemapping_pars_fragment:qM,transmission_fragment:YM,transmission_pars_fragment:ZM,uv_pars_fragment:KM,uv_pars_vertex:JM,uv_vertex:jM,worldpos_vertex:QM,background_vert:$M,background_frag:eS,backgroundCube_vert:tS,backgroundCube_frag:nS,cube_vert:iS,cube_frag:sS,depth_vert:rS,depth_frag:oS,distanceRGBA_vert:aS,distanceRGBA_frag:lS,equirect_vert:cS,equirect_frag:hS,linedashed_vert:uS,linedashed_frag:fS,meshbasic_vert:dS,meshbasic_frag:pS,meshlambert_vert:mS,meshlambert_frag:gS,meshmatcap_vert:vS,meshmatcap_frag:xS,meshnormal_vert:yS,meshnormal_frag:_S,meshphong_vert:MS,meshphong_frag:SS,meshphysical_vert:wS,meshphysical_frag:bS,meshtoon_vert:TS,meshtoon_frag:ES,points_vert:AS,points_frag:RS,shadow_vert:CS,shadow_frag:IS,sprite_vert:PS,sprite_frag:DS},Be={common:{diffuse:{value:new fe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ht},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ht}},envmap:{envMap:{value:null},envMapRotation:{value:new ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ht},normalScale:{value:new se(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new fe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new fe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0},uvTransform:{value:new ht}},sprite:{diffuse:{value:new fe(16777215)},opacity:{value:1},center:{value:new se(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ht},alphaMap:{value:null},alphaMapTransform:{value:new ht},alphaTest:{value:0}}},gi={basic:{uniforms:yn([Be.common,Be.specularmap,Be.envmap,Be.aomap,Be.lightmap,Be.fog]),vertexShader:pt.meshbasic_vert,fragmentShader:pt.meshbasic_frag},lambert:{uniforms:yn([Be.common,Be.specularmap,Be.envmap,Be.aomap,Be.lightmap,Be.emissivemap,Be.bumpmap,Be.normalmap,Be.displacementmap,Be.fog,Be.lights,{emissive:{value:new fe(0)}}]),vertexShader:pt.meshlambert_vert,fragmentShader:pt.meshlambert_frag},phong:{uniforms:yn([Be.common,Be.specularmap,Be.envmap,Be.aomap,Be.lightmap,Be.emissivemap,Be.bumpmap,Be.normalmap,Be.displacementmap,Be.fog,Be.lights,{emissive:{value:new fe(0)},specular:{value:new fe(1118481)},shininess:{value:30}}]),vertexShader:pt.meshphong_vert,fragmentShader:pt.meshphong_frag},standard:{uniforms:yn([Be.common,Be.envmap,Be.aomap,Be.lightmap,Be.emissivemap,Be.bumpmap,Be.normalmap,Be.displacementmap,Be.roughnessmap,Be.metalnessmap,Be.fog,Be.lights,{emissive:{value:new fe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag},toon:{uniforms:yn([Be.common,Be.aomap,Be.lightmap,Be.emissivemap,Be.bumpmap,Be.normalmap,Be.displacementmap,Be.gradientmap,Be.fog,Be.lights,{emissive:{value:new fe(0)}}]),vertexShader:pt.meshtoon_vert,fragmentShader:pt.meshtoon_frag},matcap:{uniforms:yn([Be.common,Be.bumpmap,Be.normalmap,Be.displacementmap,Be.fog,{matcap:{value:null}}]),vertexShader:pt.meshmatcap_vert,fragmentShader:pt.meshmatcap_frag},points:{uniforms:yn([Be.points,Be.fog]),vertexShader:pt.points_vert,fragmentShader:pt.points_frag},dashed:{uniforms:yn([Be.common,Be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pt.linedashed_vert,fragmentShader:pt.linedashed_frag},depth:{uniforms:yn([Be.common,Be.displacementmap]),vertexShader:pt.depth_vert,fragmentShader:pt.depth_frag},normal:{uniforms:yn([Be.common,Be.bumpmap,Be.normalmap,Be.displacementmap,{opacity:{value:1}}]),vertexShader:pt.meshnormal_vert,fragmentShader:pt.meshnormal_frag},sprite:{uniforms:yn([Be.sprite,Be.fog]),vertexShader:pt.sprite_vert,fragmentShader:pt.sprite_frag},background:{uniforms:{uvTransform:{value:new ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pt.background_vert,fragmentShader:pt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ht}},vertexShader:pt.backgroundCube_vert,fragmentShader:pt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pt.cube_vert,fragmentShader:pt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pt.equirect_vert,fragmentShader:pt.equirect_frag},distanceRGBA:{uniforms:yn([Be.common,Be.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:pt.distanceRGBA_vert,fragmentShader:pt.distanceRGBA_frag},shadow:{uniforms:yn([Be.lights,Be.fog,{color:{value:new fe(0)},opacity:{value:1}}]),vertexShader:pt.shadow_vert,fragmentShader:pt.shadow_frag}};gi.physical={uniforms:yn([gi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ht},clearcoatNormalScale:{value:new se(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ht},sheen:{value:0},sheenColor:{value:new fe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ht},transmissionSamplerSize:{value:new se},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ht},attenuationDistance:{value:0},attenuationColor:{value:new fe(0)},specularColor:{value:new fe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ht},anisotropyVector:{value:new se},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ht}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag};var Qh={r:0,b:0,g:0},mr=new gn,LS=new He;function NS(e,t,n,i,s,r,o){let a=new fe(0),l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(y){let S=y.isScene===!0?y.background:null;if(S&&S.isTexture)S=(y.backgroundBlurriness>0?n:t).get(S);return S}function x(y){let S=!1,C=g(y);if(C===null)p(a,l);else if(C&&C.isColor)p(C,1),S=!0;let R=e.xr.getEnvironmentBlendMode();if(R==="additive")i.buffers.color.setClear(0,0,0,1,o);else if(R==="alpha-blend")i.buffers.color.setClear(0,0,0,0,o);if(e.autoClear||S)i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)}function m(y,S){let C=g(S);if(C&&(C.isCubeTexture||C.mapping===$r)){if(h===void 0)h=new vt(new Dn(1,1,1),new xt({name:"BackgroundCubeMaterial",uniforms:tr(gi.backgroundCube.uniforms),vertexShader:gi.backgroundCube.vertexShader,fragmentShader:gi.backgroundCube.fragmentShader,side:vn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,E,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h);if(mr.copy(S.backgroundRotation),mr.x*=-1,mr.y*=-1,mr.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1)mr.y*=-1,mr.z*=-1;if(h.material.uniforms.envMap.value=C,h.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(LS.makeRotationFromEuler(mr)),h.material.toneMapped=mt.getTransfer(C.colorSpace)!==Ct,u!==C||f!==C.version||d!==e.toneMapping)h.material.needsUpdate=!0,u=C,f=C.version,d=e.toneMapping;h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)}else if(C&&C.isTexture){if(c===void 0)c=new vt(new Qt(2,2),new xt({name:"BackgroundMaterial",uniforms:tr(gi.background.uniforms),vertexShader:gi.background.vertexShader,fragmentShader:gi.background.fragmentShader,side:Yi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c);if(c.material.uniforms.t2D.value=C,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=mt.getTransfer(C.colorSpace)!==Ct,C.matrixAutoUpdate===!0)C.updateMatrix();if(c.material.uniforms.uvTransform.value.copy(C.matrix),u!==C||f!==C.version||d!==e.toneMapping)c.material.needsUpdate=!0,u=C,f=C.version,d=e.toneMapping;c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)}}function p(y,S){y.getRGB(Qh,td(e)),i.buffers.color.setClear(Qh.r,Qh.g,Qh.b,S,o)}function M(){if(h!==void 0)h.geometry.dispose(),h.material.dispose(),h=void 0;if(c!==void 0)c.geometry.dispose(),c.material.dispose(),c=void 0}return{getClearColor:function(){return a},setClearColor:function(y,S=1){a.set(y),l=S,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:x,addToRenderList:m,dispose:M}}function US(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,o=!1;function a(T,P,B,H,k){let X=!1,q=u(H,B,P);if(r!==q)r=q,c(r.object);if(X=d(T,H,B,k),X)g(T,H,B,k);if(k!==null)t.update(k,e.ELEMENT_ARRAY_BUFFER);if(X||o){if(o=!1,S(T,P,B,H),k!==null)e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(k).buffer)}}function l(){return e.createVertexArray()}function c(T){return e.bindVertexArray(T)}function h(T){return e.deleteVertexArray(T)}function u(T,P,B){let H=B.wireframe===!0,k=i[T.id];if(k===void 0)k={},i[T.id]=k;let X=k[P.id];if(X===void 0)X={},k[P.id]=X;let q=X[H];if(q===void 0)q=f(l()),X[H]=q;return q}function f(T){let P=[],B=[],H=[];for(let k=0;k<n;k++)P[k]=0,B[k]=0,H[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:B,attributeDivisors:H,object:T,attributes:{},index:null}}function d(T,P,B,H){let k=r.attributes,X=P.attributes,q=0,re=B.getAttributes();for(let W in re)if(re[W].location>=0){let ae=k[W],ge=X[W];if(ge===void 0){if(W==="instanceMatrix"&&T.instanceMatrix)ge=T.instanceMatrix;if(W==="instanceColor"&&T.instanceColor)ge=T.instanceColor}if(ae===void 0)return!0;if(ae.attribute!==ge)return!0;if(ge&&ae.data!==ge.data)return!0;q++}if(r.attributesNum!==q)return!0;if(r.index!==H)return!0;return!1}function g(T,P,B,H){let k={},X=P.attributes,q=0,re=B.getAttributes();for(let W in re)if(re[W].location>=0){let ae=X[W];if(ae===void 0){if(W==="instanceMatrix"&&T.instanceMatrix)ae=T.instanceMatrix;if(W==="instanceColor"&&T.instanceColor)ae=T.instanceColor}let ge={};if(ge.attribute=ae,ae&&ae.data)ge.data=ae.data;k[W]=ge,q++}r.attributes=k,r.attributesNum=q,r.index=H}function x(){let T=r.newAttributes;for(let P=0,B=T.length;P<B;P++)T[P]=0}function m(T){p(T,0)}function p(T,P){let B=r.newAttributes,H=r.enabledAttributes,k=r.attributeDivisors;if(B[T]=1,H[T]===0)e.enableVertexAttribArray(T),H[T]=1;if(k[T]!==P)e.vertexAttribDivisor(T,P),k[T]=P}function M(){let T=r.newAttributes,P=r.enabledAttributes;for(let B=0,H=P.length;B<H;B++)if(P[B]!==T[B])e.disableVertexAttribArray(B),P[B]=0}function y(T,P,B,H,k,X,q){if(q===!0)e.vertexAttribIPointer(T,P,B,k,X);else e.vertexAttribPointer(T,P,B,H,k,X)}function S(T,P,B,H){x();let k=H.attributes,X=B.getAttributes(),q=P.defaultAttributeValues;for(let re in X){let W=X[re];if(W.location>=0){let Q=k[re];if(Q===void 0){if(re==="instanceMatrix"&&T.instanceMatrix)Q=T.instanceMatrix;if(re==="instanceColor"&&T.instanceColor)Q=T.instanceColor}if(Q!==void 0){let ae=Q.normalized,ge=Q.itemSize,ve=t.get(Q);if(ve===void 0)continue;let{buffer:Ge,type:Oe,bytesPerElement:G}=ve,Y=Oe===e.INT||Oe===e.UNSIGNED_INT||Q.gpuType===Cc;if(Q.isInterleavedBufferAttribute){let te=Q.data,le=te.stride,Ee=Q.offset;if(te.isInstancedInterleavedBuffer){for(let We=0;We<W.locationSize;We++)p(W.location+We,te.meshPerAttribute);if(T.isInstancedMesh!==!0&&H._maxInstanceCount===void 0)H._maxInstanceCount=te.meshPerAttribute*te.count}else for(let We=0;We<W.locationSize;We++)m(W.location+We);e.bindBuffer(e.ARRAY_BUFFER,Ge);for(let We=0;We<W.locationSize;We++)y(W.location+We,ge/W.locationSize,Oe,ae,le*G,(Ee+ge/W.locationSize*We)*G,Y)}else{if(Q.isInstancedBufferAttribute){for(let te=0;te<W.locationSize;te++)p(W.location+te,Q.meshPerAttribute);if(T.isInstancedMesh!==!0&&H._maxInstanceCount===void 0)H._maxInstanceCount=Q.meshPerAttribute*Q.count}else for(let te=0;te<W.locationSize;te++)m(W.location+te);e.bindBuffer(e.ARRAY_BUFFER,Ge);for(let te=0;te<W.locationSize;te++)y(W.location+te,ge/W.locationSize,Oe,ae,ge*G,ge/W.locationSize*te*G,Y)}}else if(q!==void 0){let ae=q[re];if(ae!==void 0)switch(ae.length){case 2:e.vertexAttrib2fv(W.location,ae);break;case 3:e.vertexAttrib3fv(W.location,ae);break;case 4:e.vertexAttrib4fv(W.location,ae);break;default:e.vertexAttrib1fv(W.location,ae)}}}}M()}function C(){D();for(let T in i){let P=i[T];for(let B in P){let H=P[B];for(let k in H)h(H[k].object),delete H[k];delete P[B]}delete i[T]}}function R(T){if(i[T.id]===void 0)return;let P=i[T.id];for(let B in P){let H=P[B];for(let k in H)h(H[k].object),delete H[k];delete P[B]}delete i[T.id]}function E(T){for(let P in i){let B=i[P];if(B[T.id]===void 0)continue;let H=B[T.id];for(let k in H)h(H[k].object),delete H[k];delete B[T.id]}}function D(){if(w(),o=!0,r===s)return;r=s,c(r.object)}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:w,dispose:C,releaseStatesOfGeometry:R,releaseStatesOfProgram:E,initAttributes:x,enableAttribute:m,disableUnusedAttributes:M}}function FS(e,t,n){let i;function s(c){i=c}function r(c,h){e.drawArrays(i,c,h),n.update(h,i,1)}function o(c,h,u){if(u===0)return;e.drawArraysInstanced(i,c,h,u),n.update(h,i,u)}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];n.update(d,i,1)}function l(c,h,u,f){if(u===0)return;let d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,h,0,f,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*f[x];n.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function OS(e,t,n,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let E=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(E){if(E!==Jt&&i.convert(E)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function a(E){let D=E===It&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));if(E!==pi&&i.convert(E)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==hn&&!D)return!1;return!0}function l(E){if(E==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";E="mediump"}if(E==="mediump"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=l(c);if(h!==c)console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h;let u=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),d=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),p=e.getParameter(e.MAX_VERTEX_ATTRIBS),M=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),S=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,R=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:y,maxFragmentUniforms:S,vertexTextures:C,maxSamples:R}}function BS(e){let t=this,n=null,i=0,s=!1,r=!1,o=new Ei,a=new ht,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||i!==0||s;return s=f,i=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){n=h(u,f,0)},this.setState=function(u,f,d){let{clippingPlanes:g,clipIntersection:x,clipShadows:m}=u,p=e.get(u);if(!s||g===null||g.length===0||r&&!m)if(r)h(null);else c();else{let M=r?0:i,y=M*4,S=p.clippingState||null;l.value=S,S=h(g,f,y,d);for(let C=0;C!==y;++C)S[C]=n[C];p.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=M}};function c(){if(l.value!==n)l.value=n,l.needsUpdate=i>0;t.numPlanes=i,t.numIntersection=0}function h(u,f,d,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=l.value,g!==!0||m===null){let p=d+x*4,M=f.matrixWorldInverse;if(a.getNormalMatrix(M),m===null||m.length<p)m=new Float32Array(p);for(let y=0,S=d;y!==x;++y,S+=4)o.copy(u[y]).applyMatrix4(M,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}function zS(e){let t=new WeakMap;function n(o,a){if(a===Js)o.mapping=Ks;else if(a===ha)o.mapping=ps;return o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===Js||a===ha)if(t.has(o)){let l=t.get(o).texture;return n(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new vh(l.height);return c.fromEquirectangularTexture(e,o),t.set(o,c),o.addEventListener("dispose",s),n(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);if(l!==void 0)t.delete(a),l.dispose()}function r(){t=new WeakMap}return{get:i,dispose:r}}var yo=4,gg=[0.125,0.215,0.35,0.446,0.526,0.582],xr=20,Yd=new Li,vg=new fe,Zd=null,Kd=0,Jd=0,jd=!1,vr=(1+Math.sqrt(5))/2,xo=1/vr,xg=[new I(-vr,xo,0),new I(vr,xo,0),new I(-xo,0,vr),new I(xo,0,vr),new I(0,vr,-xo),new I(0,vr,xo),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],HS=new I;class _o{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=0.1,i=100,s={}){let{size:r=256,position:o=HS}=s;Zd=this._renderer.getRenderTarget(),Kd=this._renderer.getActiveCubeFace(),Jd=this._renderer.getActiveMipmapLevel(),jd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let a=this._allocateTargets();if(a.depthBuffer=!0,this._sceneToCubeUV(e,n,i,a,o),t>0)this._blur(a,0,0,t);return this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Mg(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=_g(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._dispose(),this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._pingPongRenderTarget!==null)this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Zd,Kd,Jd),this._renderer.xr.enabled=jd,e.scissorTest=!1,$h(e,0,0,e.width,e.height)}_fromTexture(e,t){if(e.mapping===Ks||e.mapping===ps)this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width);else this._setSize(e.image.width/4);Zd=this._renderer.getRenderTarget(),Kd=this._renderer.getActiveCubeFace(),Jd=this._renderer.getActiveMipmapLevel(),jd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Kt,minFilter:Kt,generateMipmaps:!1,type:It,format:Jt,colorSpace:Dt,depthBuffer:!1},i=yg(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){if(this._pingPongRenderTarget!==null)this._dispose();this._pingPongRenderTarget=yg(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kS(s)),this._blurMaterial=GS(s,e,t)}return i}_compileMaterial(e){let t=new vt(this._lodPlanes[0],e);this._renderer.compile(t,Yd)}_sceneToCubeUV(e,t,n,i,s){let a=new Ot(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,{autoClear:u,toneMapping:f}=h;if(h.getClearColor(vg),h.toneMapping=Ci,h.autoClear=!1,h.state.buffers.depth.getReversed())h.setRenderTarget(i),h.clearDepth(),h.setRenderTarget(null);let g=new on({name:"PMREM.Background",side:vn,depthWrite:!1,depthTest:!1}),x=new vt(new Dn,g),m=!1,p=e.background;if(p){if(p.isColor)g.color.copy(p),e.background=null,m=!0}else g.color.copy(vg),m=!0;for(let M=0;M<6;M++){let y=M%3;if(y===0)a.up.set(0,l[M],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x+c[M],s.y,s.z);else if(y===1)a.up.set(0,0,l[M]),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y+c[M],s.z);else a.up.set(0,l[M],0),a.position.set(s.x,s.y,s.z),a.lookAt(s.x,s.y,s.z+c[M]);let S=this._cubeSize;if($h(i,y*S,M>2?S:0,S,S),h.setRenderTarget(i),m)h.render(x,a);h.render(e,a)}x.geometry.dispose(),x.material.dispose(),h.toneMapping=f,h.autoClear=u,e.background=p}_textureToCubeUV(e,t){let n=this._renderer,i=e.mapping===Ks||e.mapping===ps;if(i){if(this._cubemapMaterial===null)this._cubemapMaterial=Mg();this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1}else if(this._equirectMaterial===null)this._equirectMaterial=_g();let s=i?this._cubemapMaterial:this._equirectMaterial,r=new vt(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;let a=this._cubeSize;$h(t,0,0,3*a,2*a),n.setRenderTarget(t),n.render(r,Yd)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let i=this._lodPlanes.length;for(let s=1;s<i;s++){let r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=xg[(i-s-1)%xg.length];this._blur(e,s-1,s,r,o)}t.autoClear=n}_blur(e,t,n,i,s){let r=this._pingPongRenderTarget;this._halfBlur(e,r,t,n,i,"latitudinal",s),this._halfBlur(r,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,r,o){let a=this._renderer,l=this._blurMaterial;if(r!=="latitudinal"&&r!=="longitudinal")console.error("blur direction must be either latitudinal or longitudinal!");let c=3,h=new vt(this._lodPlanes[i],l),u=l.uniforms,f=this._sizeLods[n]-1,d=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*xr-1),g=s/d,x=isFinite(s)?1+Math.floor(c*g):xr;if(x>xr)console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${xr}`);let m=[],p=0;for(let R=0;R<xr;++R){let E=R/g,D=Math.exp(-E*E/2);if(m.push(D),R===0)p+=D;else if(R<x)p+=2*D}for(let R=0;R<m.length;R++)m[R]=m[R]/p;if(u.envMap.value=e.texture,u.samples.value=x,u.weights.value=m,u.latitudinal.value=r==="latitudinal",o)u.poleAxis.value=o;let{_lodMax:M}=this;u.dTheta.value=d,u.mipInt.value=M-n;let y=this._sizeLods[i],S=3*y*(i>M-yo?i-M+yo:0),C=4*(this._cubeSize-y);$h(t,S,C,3*y,2*y),a.setRenderTarget(t),a.render(h,Yd)}}function kS(e){let t=[],n=[],i=[],s=e,r=e-yo+1+gg.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);n.push(a);let l=1/a;if(o>e-yo)l=gg[o-e+yo-1];else if(o===0)l=0;i.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,x=3,m=2,p=1,M=new Float32Array(x*g*d),y=new Float32Array(m*g*d),S=new Float32Array(p*g*d);for(let R=0;R<d;R++){let E=R%3*2/3-1,D=R>2?0:-1,w=[E,D,0,E+0.6666666666666666,D,0,E+0.6666666666666666,D+1,0,E,D,0,E+0.6666666666666666,D+1,0,E,D+1,0];M.set(w,x*g*R),y.set(f,m*g*R);let T=[R,R,R,R,R,R];S.set(T,p*g*R)}let C=new Je;if(C.setAttribute("position",new at(M,x)),C.setAttribute("uv",new at(y,m)),C.setAttribute("faceIndex",new at(S,p)),t.push(C),s>yo)s--}return{lodPlanes:t,sizeLods:n,sigmas:i}}function yg(e,t,n){let i=new Ft(e,t,n);return i.texture.mapping=$r,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function $h(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function GS(e,t,n){let i=new Float32Array(xr),s=new I(0,1,0);return new xt({name:"SphericalGaussianBlur",defines:{n:xr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ep(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Zt,depthTest:!1,depthWrite:!1})}function _g(){return new xt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ep(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Zt,depthTest:!1,depthWrite:!1})}function Mg(){return new xt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ep(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Zt,depthTest:!1,depthWrite:!1})}function ep(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function WS(e){let t=new WeakMap,n=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===Js||l===ha,h=l===Ks||l===ps;if(c||h){let u=t.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f){if(n===null)n=new _o(e);return u=c?n.fromEquirectangular(a,u):n.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture}else if(u!==void 0)return u.texture;else{let d=a.image;if(c&&d&&d.height>0||h&&d&&s(d)){if(n===null)n=new _o(e);return u=c?n.fromEquirectangular(a):n.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture}else return null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)if(a[h]!==void 0)l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);if(c!==void 0)t.delete(l),c.dispose()}function o(){if(t=new WeakMap,n!==null)n.dispose(),n=null}return{get:i,dispose:o}}function VS(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s;switch(i){case"WEBGL_depth_texture":s=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=e.getExtension(i)}return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);if(s===null)Yr("THREE.WebGLRenderer: "+i+" extension not supported.");return s}}}function XS(e,t,n,i){let s={},r=new WeakMap;function o(u){let f=u.target;if(f.index!==null)t.remove(f.index);for(let g in f.attributes)t.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);if(d)t.remove(d),r.delete(f);if(i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0)delete f._maxInstanceCount;n.memory.geometries--}function a(u,f){if(s[f.id]===!0)return f;return f.addEventListener("dispose",o),s[f.id]=!0,n.memory.geometries++,f}function l(u){let f=u.attributes;for(let d in f)t.update(f[d],e.ARRAY_BUFFER)}function c(u){let f=[],d=u.index,g=u.attributes.position,x=0;if(d!==null){let M=d.array;x=d.version;for(let y=0,S=M.length;y<S;y+=3){let C=M[y+0],R=M[y+1],E=M[y+2];f.push(C,R,R,E,E,C)}}else if(g!==void 0){let M=g.array;x=g.version;for(let y=0,S=M.length/3-1;y<S;y+=3){let C=y+0,R=y+1,E=y+2;f.push(C,R,R,E,E,C)}}else return;let m=new((Xf(f))?Sa:Ma)(f,1);m.version=x;let p=r.get(u);if(p)t.remove(p);r.set(u,m)}function h(u){let f=r.get(u);if(f){let d=u.index;if(d!==null){if(f.version<d.version)c(u)}}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function qS(e,t,n){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){e.drawElements(i,d,r,f*o),n.update(d,i,1)}function c(f,d,g){if(g===0)return;e.drawElementsInstanced(i,d,r,f*o,g),n.update(d,i,g)}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];n.update(m,i,1)}function u(f,d,g,x){if(g===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/o,d[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(i,d,0,r,f,0,x,0,g);let p=0;for(let M=0;M<g;M++)p+=d[M]*x[M];n.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function YS(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(n.calls++,o){case e.TRIANGLES:n.triangles+=a*(r/3);break;case e.LINES:n.lines+=a*(r/2);break;case e.LINE_STRIP:n.lines+=a*(r-1);break;case e.LINE_LOOP:n.lines+=a*r;break;case e.POINTS:n.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function ZS(e,t,n){let i=new WeakMap,s=new bt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=i.get(a);if(f===void 0||f.count!==u){let w=function(){E.dispose(),i.delete(a),a.removeEventListener("dispose",w)};if(f!==void 0)f.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],M=a.morphAttributes.color||[],y=0;if(d===!0)y=1;if(g===!0)y=2;if(x===!0)y=3;let S=a.attributes.position.count*y,C=1;if(S>t.maxTextureSize)C=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize;let R=new Float32Array(S*C*4*u),E=new no(R,S,C,u);E.type=hn,E.needsUpdate=!0;let D=y*4;for(let T=0;T<u;T++){let P=m[T],B=p[T],H=M[T],k=S*C*4*T;for(let X=0;X<P.count;X++){let q=X*D;if(d===!0)s.fromBufferAttribute(P,X),R[k+q+0]=s.x,R[k+q+1]=s.y,R[k+q+2]=s.z,R[k+q+3]=0;if(g===!0)s.fromBufferAttribute(B,X),R[k+q+4]=s.x,R[k+q+5]=s.y,R[k+q+6]=s.z,R[k+q+7]=0;if(x===!0)s.fromBufferAttribute(H,X),R[k+q+8]=s.x,R[k+q+9]=s.y,R[k+q+10]=s.z,R[k+q+11]=H.itemSize===4?s.w:1}}f={count:u,texture:E,size:new se(S,C)},i.set(a,f),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",o.morphTexture,n);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(e,"morphTargetBaseInfluence",g),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",f.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",f.size)}return{update:r}}function KS(e,t,n,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c)t.update(u),s.set(u,c);if(l.isInstancedMesh){if(l.hasEventListener("dispose",a)===!1)l.addEventListener("dispose",a);if(s.get(l)!==c){if(n.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null)n.update(l.instanceColor,e.ARRAY_BUFFER);s.set(l,c)}}if(l.isSkinnedMesh){let f=l.skeleton;if(s.get(f)!==c)f.update(),s.set(f,c)}return u}function o(){s=new WeakMap}function a(l){let c=l.target;if(c.removeEventListener("dispose",a),n.remove(c.instanceMatrix),c.instanceColor!==null)n.remove(c.instanceColor)}return{update:r,dispose:o}}var Hg=new Rt,Sg=new lr(1,1),kg=new no,Gg=new io,Wg=new nr,wg=[],bg=[],Tg=new Float32Array(16),Eg=new Float32Array(9),Ag=new Float32Array(4);function Mo(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,r=wg[s];if(r===void 0)r=new Float32Array(s),wg[s]=r;if(t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=n,e[o].toArray(r,a)}return r}function nn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function sn(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function tu(e,t){let n=bg[t];if(n===void 0)n=new Int32Array(t),bg[t]=n;for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function JS(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1f(this.addr,t),n[0]=t}function jS(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(nn(n,t))return;e.uniform2fv(this.addr,t),sn(n,t)}}function QS(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else if(t.r!==void 0){if(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b}else{if(nn(n,t))return;e.uniform3fv(this.addr,t),sn(n,t)}}function $S(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(nn(n,t))return;e.uniform4fv(this.addr,t),sn(n,t)}}function e1(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;Ag.set(i),e.uniformMatrix2fv(this.addr,!1,Ag),sn(n,i)}}function t1(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;Eg.set(i),e.uniformMatrix3fv(this.addr,!1,Eg),sn(n,i)}}function n1(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(nn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),sn(n,t)}else{if(nn(n,i))return;Tg.set(i),e.uniformMatrix4fv(this.addr,!1,Tg),sn(n,i)}}function i1(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1i(this.addr,t),n[0]=t}function s1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(nn(n,t))return;e.uniform2iv(this.addr,t),sn(n,t)}}function r1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(nn(n,t))return;e.uniform3iv(this.addr,t),sn(n,t)}}function o1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(nn(n,t))return;e.uniform4iv(this.addr,t),sn(n,t)}}function a1(e,t){let n=this.cache;if(n[0]===t)return;e.uniform1ui(this.addr,t),n[0]=t}function l1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y)e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y}else{if(nn(n,t))return;e.uniform2uiv(this.addr,t),sn(n,t)}}function c1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z}else{if(nn(n,t))return;e.uniform3uiv(this.addr,t),sn(n,t)}}function h1(e,t){let n=this.cache;if(t.x!==void 0){if(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w}else{if(nn(n,t))return;e.uniform4uiv(this.addr,t),sn(n,t)}}function u1(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===e.SAMPLER_2D_SHADOW)Sg.compareFunction=fh,r=Sg;else r=Hg;n.setTexture2D(t||r,s)}function f1(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture3D(t||Gg,s)}function d1(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTextureCube(t||Wg,s)}function p1(e,t,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)e.uniform1i(this.addr,s),i[0]=s;n.setTexture2DArray(t||kg,s)}function m1(e){switch(e){case 5126:return JS;case 35664:return jS;case 35665:return QS;case 35666:return $S;case 35674:return e1;case 35675:return t1;case 35676:return n1;case 5124:case 35670:return i1;case 35667:case 35671:return s1;case 35668:case 35672:return r1;case 35669:case 35673:return o1;case 5125:return a1;case 36294:return l1;case 36295:return c1;case 36296:return h1;case 35678:case 36198:case 36298:case 36306:case 35682:return u1;case 35679:case 36299:case 36307:return f1;case 35680:case 36300:case 36308:case 36293:return d1;case 36289:case 36303:case 36311:case 36292:return p1}}function g1(e,t){e.uniform1fv(this.addr,t)}function v1(e,t){let n=Mo(t,this.size,2);e.uniform2fv(this.addr,n)}function x1(e,t){let n=Mo(t,this.size,3);e.uniform3fv(this.addr,n)}function y1(e,t){let n=Mo(t,this.size,4);e.uniform4fv(this.addr,n)}function _1(e,t){let n=Mo(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function M1(e,t){let n=Mo(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function S1(e,t){let n=Mo(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function w1(e,t){e.uniform1iv(this.addr,t)}function b1(e,t){e.uniform2iv(this.addr,t)}function T1(e,t){e.uniform3iv(this.addr,t)}function E1(e,t){e.uniform4iv(this.addr,t)}function A1(e,t){e.uniform1uiv(this.addr,t)}function R1(e,t){e.uniform2uiv(this.addr,t)}function C1(e,t){e.uniform3uiv(this.addr,t)}function I1(e,t){e.uniform4uiv(this.addr,t)}function P1(e,t,n){let i=this.cache,s=t.length,r=tu(n,s);if(!nn(i,r))e.uniform1iv(this.addr,r),sn(i,r);for(let o=0;o!==s;++o)n.setTexture2D(t[o]||Hg,r[o])}function D1(e,t,n){let i=this.cache,s=t.length,r=tu(n,s);if(!nn(i,r))e.uniform1iv(this.addr,r),sn(i,r);for(let o=0;o!==s;++o)n.setTexture3D(t[o]||Gg,r[o])}function L1(e,t,n){let i=this.cache,s=t.length,r=tu(n,s);if(!nn(i,r))e.uniform1iv(this.addr,r),sn(i,r);for(let o=0;o!==s;++o)n.setTextureCube(t[o]||Wg,r[o])}function N1(e,t,n){let i=this.cache,s=t.length,r=tu(n,s);if(!nn(i,r))e.uniform1iv(this.addr,r),sn(i,r);for(let o=0;o!==s;++o)n.setTexture2DArray(t[o]||kg,r[o])}function U1(e){switch(e){case 5126:return g1;case 35664:return v1;case 35665:return x1;case 35666:return y1;case 35674:return _1;case 35675:return M1;case 35676:return S1;case 5124:case 35670:return w1;case 35667:case 35671:return b1;case 35668:case 35672:return T1;case 35669:case 35673:return E1;case 5125:return A1;case 36294:return R1;case 36295:return C1;case 36296:return I1;case 35678:case 36198:case 36298:case 36306:case 35682:return P1;case 35679:case 36299:case 36307:return D1;case 35680:case 36300:case 36308:case 36293:return L1;case 36289:case 36303:case 36311:case 36292:return N1}}class Vg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=m1(t.type)}}class Xg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=U1(t.type)}}class qg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let s=0,r=i.length;s!==r;++s){let o=i[s];o.setValue(e,t[o.id],n)}}}var Qd=/(\w+)(\])?(\[|\.)?/g;function Rg(e,t){e.seq.push(t),e.map[t.id]=t}function F1(e,t,n){let i=e.name,s=i.length;Qd.lastIndex=0;while(!0){let r=Qd.exec(i),o=Qd.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l)a=a|0;if(c===void 0||c==="["&&o+2===s){Rg(n,c===void 0?new Vg(a,e,t):new Xg(a,e,t));break}else{let u=n.map[a];if(u===void 0)u=new qg(a),Rg(n,u);n=u}}}class Ja{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){let s=e.getActiveUniform(t,i),r=e.getUniformLocation(t,s.name);F1(s,r,this)}}setValue(e,t,n,i){let s=this.map[t];if(s!==void 0)s.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];if(i!==void 0)this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,r=t.length;s!==r;++s){let o=t[s],a=n[o.id];if(a.needsUpdate!==!1)o.setValue(e,a.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,s=e.length;i!==s;++i){let r=e[i];if(r.id in t)n.push(r)}return n}}function Cg(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var O1=37297,B1=0;function z1(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,n.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}var Ig=new ht;function H1(e){mt._getMatrix(Ig,mt.workingColorSpace,e);let t=`mat3( ${Ig.elements.map((n)=>n.toFixed(4))} )`;switch(mt.getTransfer(e)){case uh:return[t,"LinearTransferOETF"];case Ct:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Pg(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return n.toUpperCase()+`

`+r+`

`+z1(e.getShaderSource(t),a)}else return r}function k1(e,t){let n=H1(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function G1(e,t){let n;switch(t){case oa:n="Linear";break;case aa:n="Reinhard";break;case la:n="Cineon";break;case Zi:n="ACESFilmic";break;case Ys:n="AgX";break;case Zs:n="Neutral";break;case ca:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),n="Linear"}return"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var eu=new I;function W1(){mt.getLuminanceCoefficients(eu);let e=eu.x.toFixed(4),t=eu.y.toFixed(4),n=eu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function V1(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ka).join(`
`)}function X1(e){let t=[];for(let n in e){let i=e[n];if(i===!1)continue;t.push("#define "+n+" "+i)}return t.join(`
`)}function q1(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=e.getActiveAttrib(t,s),o=r.name,a=1;if(r.type===e.FLOAT_MAT2)a=2;if(r.type===e.FLOAT_MAT3)a=3;if(r.type===e.FLOAT_MAT4)a=4;n[o]={type:r.type,location:e.getAttribLocation(t,o),locationSize:a}}return n}function Ka(e){return e!==""}function Dg(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Lg(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Y1=/^[ \t]*#include +<([\w\d./]+)>/gm;function $d(e){return e.replace(Y1,K1)}var Z1=new Map;function K1(e,t){let n=pt[t];if(n===void 0){let i=Z1.get(t);if(i!==void 0)n=pt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw Error("Can not resolve #include <"+t+">")}return $d(n)}var J1=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ng(e){return e.replace(J1,j1)}function j1(e,t,n,i){let s="";for(let r=parseInt(t);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ug(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;if(e.precision==="highp")t+=`
#define HIGH_PRECISION`;else if(e.precision==="mediump")t+=`
#define MEDIUM_PRECISION`;else if(e.precision==="lowp")t+=`
#define LOW_PRECISION`;return t}function Q1(e){let t="SHADOWMAP_TYPE_BASIC";if(e.shadowMapType===Ec)t="SHADOWMAP_TYPE_PCF";else if(e.shadowMapType===jo)t="SHADOWMAP_TYPE_PCF_SOFT";else if(e.shadowMapType===fi)t="SHADOWMAP_TYPE_VSM";return t}function $1(e){let t="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case Ks:case ps:t="ENVMAP_TYPE_CUBE";break;case $r:t="ENVMAP_TYPE_CUBE_UV";break}return t}function ew(e){let t="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case ps:t="ENVMAP_MODE_REFRACTION";break}return t}function tw(e){let t="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case Tf:t="ENVMAP_BLENDING_MULTIPLY";break;case Ef:t="ENVMAP_BLENDING_MIX";break;case Af:t="ENVMAP_BLENDING_ADD";break}return t}function nw(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function iw(e,t,n,i){let s=e.getContext(),{defines:r,vertexShader:o,fragmentShader:a}=n,l=Q1(n),c=$1(n),h=ew(n),u=tw(n),f=nw(n),d=V1(n),g=X1(r),x=s.createProgram(),m,p,M=n.glslVersion?"#version "+n.glslVersion+`
`:"";if(n.isRawShaderMaterial){if(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Ka).join(`
`),m.length>0)m+=`
`;if(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(Ka).join(`
`),p.length>0)p+=`
`}else m=[Ug(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(Ka).join(`
`),p=[Ug(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ci?"#define TONE_MAPPING":"",n.toneMapping!==Ci?pt.tonemapping_pars_fragment:"",n.toneMapping!==Ci?G1("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",pt.colorspace_pars_fragment,k1("linearToOutputTexel",n.outputColorSpace),W1(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Ka).join(`
`);if(o=$d(o),o=Dg(o,n),o=Lg(o,n),a=$d(a),a=Dg(a,n),a=Lg(a,n),o=Ng(o),a=Ng(a),n.isRawShaderMaterial!==!0)M=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",n.glslVersion===dh?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===dh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p;let y=M+m+o,S=M+p+a,C=Cg(s,s.VERTEX_SHADER,y),R=Cg(s,s.FRAGMENT_SHADER,S);if(s.attachShader(x,C),s.attachShader(x,R),n.index0AttributeName!==void 0)s.bindAttribLocation(x,0,n.index0AttributeName);else if(n.morphTargets===!0)s.bindAttribLocation(x,0,"position");s.linkProgram(x);function E(P){if(e.debug.checkShaderErrors){let B=s.getProgramInfoLog(x)||"",H=s.getShaderInfoLog(C)||"",k=s.getShaderInfoLog(R)||"",X=B.trim(),q=H.trim(),re=k.trim(),W=!0,Q=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(W=!1,typeof e.debug.onShaderError==="function")e.debug.onShaderError(s,x,C,R);else{let ae=Pg(s,C,"vertex"),ge=Pg(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+X+`
`+ae+`
`+ge)}else if(X!=="")console.warn("THREE.WebGLProgram: Program Info Log:",X);else if(q===""||re==="")Q=!1;if(Q)P.diagnostics={runnable:W,programLog:X,vertexShader:{log:q,prefix:m},fragmentShader:{log:re,prefix:p}}}s.deleteShader(C),s.deleteShader(R),D=new Ja(s,x),w=q1(s,x)}let D;this.getUniforms=function(){if(D===void 0)E(this);return D};let w;this.getAttributes=function(){if(w===void 0)E(this);return w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(T===!1)T=s.getProgramParameter(x,O1);return T},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=B1++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=C,this.fragmentShader=R,this}var sw=0;class Yg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let{vertexShader:t,fragmentShader:n}=e,i=this._getShaderStage(t),s=this._getShaderStage(n),r=this._getShaderCacheForMaterial(e);if(r.has(i)===!1)r.add(i),i.usedTimes++;if(r.has(s)===!1)r.add(s),s.usedTimes++;return this}remove(e){let t=this.materialCache.get(e);for(let n of t)if(n.usedTimes--,n.usedTimes===0)this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);if(n===void 0)n=new Set,t.set(e,n);return n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);if(n===void 0)n=new Zg(e),t.set(e,n);return n}}class Zg{constructor(e){this.id=sw++,this.code=e,this.usedTimes=0}}function rw(e,t,n,i,s,r,o){let a=new so,l=new Yg,c=new Set,h=[],{logarithmicDepthBuffer:u,vertexTextures:f,precision:d}=s,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(w){if(c.add(w),w===0)return"uv";return`uv${w}`}function m(w,T,P,B,H){let k=B.fog,X=H.geometry,q=w.isMeshStandardMaterial?B.environment:null,re=(w.isMeshStandardMaterial?n:t).get(w.envMap||q),W=!!re&&re.mapping===$r?re.image.height:null,Q=g[w.type];if(w.precision!==null){if(d=s.getMaxPrecision(w.precision),d!==w.precision)console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",d,"instead.")}let ae=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ge=ae!==void 0?ae.length:0,ve=0;if(X.morphAttributes.position!==void 0)ve=1;if(X.morphAttributes.normal!==void 0)ve=2;if(X.morphAttributes.color!==void 0)ve=3;let Ge,Oe,G,Y;if(Q){let Et=gi[Q];Ge=Et.vertexShader,Oe=Et.fragmentShader}else Ge=w.vertexShader,Oe=w.fragmentShader,l.update(w),G=l.getVertexShaderID(w),Y=l.getFragmentShaderID(w);let te=e.getRenderTarget(),le=e.state.buffers.depth.getReversed(),Ee=H.isInstancedMesh===!0,We=H.isBatchedMesh===!0,ct=!!w.map,z=!!w.matcap,ce=!!re,pe=!!w.aoMap,me=!!w.lightMap,de=!!w.bumpMap,Ie=!!w.normalMap,be=!!w.displacementMap,Se=!!w.emissiveMap,st=!!w.metalnessMap,tt=!!w.roughnessMap,rt=w.anisotropy>0,U=w.clearcoat>0,A=w.dispersion>0,Z=w.iridescence>0,ue=w.sheen>0,ye=w.transmission>0,oe=rt&&!!w.anisotropyMap,Fe=U&&!!w.clearcoatMap,Ae=U&&!!w.clearcoatNormalMap,Ve=U&&!!w.clearcoatRoughnessMap,Ke=Z&&!!w.iridescenceMap,Me=Z&&!!w.iridescenceThicknessMap,Pe=ue&&!!w.sheenColorMap,Ze=ue&&!!w.sheenRoughnessMap,ke=!!w.specularMap,Ce=!!w.specularColorMap,qe=!!w.specularIntensityMap,V=ye&&!!w.transmissionMap,ne=ye&&!!w.thicknessMap,Ne=!!w.gradientMap,Xe=!!w.alphaMap,Te=w.alphaTest>0,xe=!!w.alphaHash,Ye=!!w.extensions,lt=Ci;if(w.toneMapped){if(te===null||te.isXRRenderTarget===!0)lt=e.toneMapping}let At={shaderID:Q,shaderType:w.type,shaderName:w.name,vertexShader:Ge,fragmentShader:Oe,defines:w.defines,customVertexShaderID:G,customFragmentShaderID:Y,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:d,batching:We,batchingColor:We&&H._colorsTexture!==null,instancing:Ee,instancingColor:Ee&&H.instanceColor!==null,instancingMorph:Ee&&H.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:te===null?e.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Dt,alphaToCoverage:!!w.alphaToCoverage,map:ct,matcap:z,envMap:ce,envMapMode:ce&&re.mapping,envMapCubeUVHeight:W,aoMap:pe,lightMap:me,bumpMap:de,normalMap:Ie,displacementMap:f&&be,emissiveMap:Se,normalMapObjectSpace:Ie&&w.normalMapType===Ff,normalMapTangentSpace:Ie&&w.normalMapType===Uf,metalnessMap:st,roughnessMap:tt,anisotropy:rt,anisotropyMap:oe,clearcoat:U,clearcoatMap:Fe,clearcoatNormalMap:Ae,clearcoatRoughnessMap:Ve,dispersion:A,iridescence:Z,iridescenceMap:Ke,iridescenceThicknessMap:Me,sheen:ue,sheenColorMap:Pe,sheenRoughnessMap:Ze,specularMap:ke,specularColorMap:Ce,specularIntensityMap:qe,transmission:ye,transmissionMap:V,thicknessMap:ne,gradientMap:Ne,opaque:w.transparent===!1&&w.blending===fs&&w.alphaToCoverage===!1,alphaMap:Xe,alphaTest:Te,alphaHash:xe,combine:w.combine,mapUv:ct&&x(w.map.channel),aoMapUv:pe&&x(w.aoMap.channel),lightMapUv:me&&x(w.lightMap.channel),bumpMapUv:de&&x(w.bumpMap.channel),normalMapUv:Ie&&x(w.normalMap.channel),displacementMapUv:be&&x(w.displacementMap.channel),emissiveMapUv:Se&&x(w.emissiveMap.channel),metalnessMapUv:st&&x(w.metalnessMap.channel),roughnessMapUv:tt&&x(w.roughnessMap.channel),anisotropyMapUv:oe&&x(w.anisotropyMap.channel),clearcoatMapUv:Fe&&x(w.clearcoatMap.channel),clearcoatNormalMapUv:Ae&&x(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ve&&x(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Ke&&x(w.iridescenceMap.channel),iridescenceThicknessMapUv:Me&&x(w.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&x(w.sheenColorMap.channel),sheenRoughnessMapUv:Ze&&x(w.sheenRoughnessMap.channel),specularMapUv:ke&&x(w.specularMap.channel),specularColorMapUv:Ce&&x(w.specularColorMap.channel),specularIntensityMapUv:qe&&x(w.specularIntensityMap.channel),transmissionMapUv:V&&x(w.transmissionMap.channel),thicknessMapUv:ne&&x(w.thicknessMap.channel),alphaMapUv:Xe&&x(w.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(Ie||rt),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!X.attributes.uv&&(ct||Xe),fog:!!k,useFog:w.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:le,skinning:H.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:ve,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:w.dithering,shadowMapEnabled:e.shadowMap.enabled&&P.length>0,shadowMapType:e.shadowMap.type,toneMapping:lt,decodeVideoTexture:ct&&w.map.isVideoTexture===!0&&mt.getTransfer(w.map.colorSpace)===Ct,decodeVideoTextureEmissive:Se&&w.emissiveMap.isVideoTexture===!0&&mt.getTransfer(w.emissiveMap.colorSpace)===Ct,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===$t,flipSided:w.side===vn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Ye&&w.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ye&&w.extensions.multiDraw===!0||We)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return At.vertexUv1s=c.has(1),At.vertexUv2s=c.has(2),At.vertexUv3s=c.has(3),c.clear(),At}function p(w){let T=[];if(w.shaderID)T.push(w.shaderID);else T.push(w.customVertexShaderID),T.push(w.customFragmentShaderID);if(w.defines!==void 0)for(let P in w.defines)T.push(P),T.push(w.defines[P]);if(w.isRawShaderMaterial===!1)M(T,w),y(T,w),T.push(e.outputColorSpace);return T.push(w.customProgramCacheKey),T.join()}function M(w,T){w.push(T.precision),w.push(T.outputColorSpace),w.push(T.envMapMode),w.push(T.envMapCubeUVHeight),w.push(T.mapUv),w.push(T.alphaMapUv),w.push(T.lightMapUv),w.push(T.aoMapUv),w.push(T.bumpMapUv),w.push(T.normalMapUv),w.push(T.displacementMapUv),w.push(T.emissiveMapUv),w.push(T.metalnessMapUv),w.push(T.roughnessMapUv),w.push(T.anisotropyMapUv),w.push(T.clearcoatMapUv),w.push(T.clearcoatNormalMapUv),w.push(T.clearcoatRoughnessMapUv),w.push(T.iridescenceMapUv),w.push(T.iridescenceThicknessMapUv),w.push(T.sheenColorMapUv),w.push(T.sheenRoughnessMapUv),w.push(T.specularMapUv),w.push(T.specularColorMapUv),w.push(T.specularIntensityMapUv),w.push(T.transmissionMapUv),w.push(T.thicknessMapUv),w.push(T.combine),w.push(T.fogExp2),w.push(T.sizeAttenuation),w.push(T.morphTargetsCount),w.push(T.morphAttributeCount),w.push(T.numDirLights),w.push(T.numPointLights),w.push(T.numSpotLights),w.push(T.numSpotLightMaps),w.push(T.numHemiLights),w.push(T.numRectAreaLights),w.push(T.numDirLightShadows),w.push(T.numPointLightShadows),w.push(T.numSpotLightShadows),w.push(T.numSpotLightShadowsWithMaps),w.push(T.numLightProbes),w.push(T.shadowMapType),w.push(T.toneMapping),w.push(T.numClippingPlanes),w.push(T.numClipIntersection),w.push(T.depthPacking)}function y(w,T){if(a.disableAll(),T.supportsVertexTextures)a.enable(0);if(T.instancing)a.enable(1);if(T.instancingColor)a.enable(2);if(T.instancingMorph)a.enable(3);if(T.matcap)a.enable(4);if(T.envMap)a.enable(5);if(T.normalMapObjectSpace)a.enable(6);if(T.normalMapTangentSpace)a.enable(7);if(T.clearcoat)a.enable(8);if(T.iridescence)a.enable(9);if(T.alphaTest)a.enable(10);if(T.vertexColors)a.enable(11);if(T.vertexAlphas)a.enable(12);if(T.vertexUv1s)a.enable(13);if(T.vertexUv2s)a.enable(14);if(T.vertexUv3s)a.enable(15);if(T.vertexTangents)a.enable(16);if(T.anisotropy)a.enable(17);if(T.alphaHash)a.enable(18);if(T.batching)a.enable(19);if(T.dispersion)a.enable(20);if(T.batchingColor)a.enable(21);if(T.gradientMap)a.enable(22);if(w.push(a.mask),a.disableAll(),T.fog)a.enable(0);if(T.useFog)a.enable(1);if(T.flatShading)a.enable(2);if(T.logarithmicDepthBuffer)a.enable(3);if(T.reversedDepthBuffer)a.enable(4);if(T.skinning)a.enable(5);if(T.morphTargets)a.enable(6);if(T.morphNormals)a.enable(7);if(T.morphColors)a.enable(8);if(T.premultipliedAlpha)a.enable(9);if(T.shadowMapEnabled)a.enable(10);if(T.doubleSided)a.enable(11);if(T.flipSided)a.enable(12);if(T.useDepthPacking)a.enable(13);if(T.dithering)a.enable(14);if(T.transmission)a.enable(15);if(T.sheen)a.enable(16);if(T.opaque)a.enable(17);if(T.pointsUvs)a.enable(18);if(T.decodeVideoTexture)a.enable(19);if(T.decodeVideoTextureEmissive)a.enable(20);if(T.alphaToCoverage)a.enable(21);w.push(a.mask)}function S(w){let T=g[w.type],P;if(T){let B=gi[T];P=jt.clone(B.uniforms)}else P=w.uniforms;return P}function C(w,T){let P;for(let B=0,H=h.length;B<H;B++){let k=h[B];if(k.cacheKey===T){P=k,++P.usedTimes;break}}if(P===void 0)P=new iw(e,T,w,r),h.push(P);return P}function R(w){if(--w.usedTimes===0){let T=h.indexOf(w);h[T]=h[h.length-1],h.pop(),w.destroy()}}function E(w){l.remove(w)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:S,acquireProgram:C,releaseProgram:R,releaseShaderCache:E,programs:h,dispose:D}}function ow(){let e=new WeakMap;function t(o){return e.has(o)}function n(o){let a=e.get(o);if(a===void 0)a={},e.set(o,a);return a}function i(o){e.delete(o)}function s(o,a,l){e.get(o)[a]=l}function r(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:r}}function aw(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.material.id!==t.material.id)return e.material.id-t.material.id;else if(e.z!==t.z)return e.z-t.z;else return e.id-t.id}function Fg(e,t){if(e.groupOrder!==t.groupOrder)return e.groupOrder-t.groupOrder;else if(e.renderOrder!==t.renderOrder)return e.renderOrder-t.renderOrder;else if(e.z!==t.z)return t.z-e.z;else return e.id-t.id}function Og(){let e=[],t=0,n=[],i=[],s=[];function r(){t=0,n.length=0,i.length=0,s.length=0}function o(u,f,d,g,x,m){let p=e[t];if(p===void 0)p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},e[t]=p;else p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m;return t++,p}function a(u,f,d,g,x,m){let p=o(u,f,d,g,x,m);if(d.transmission>0)i.push(p);else if(d.transparent===!0)s.push(p);else n.push(p)}function l(u,f,d,g,x,m){let p=o(u,f,d,g,x,m);if(d.transmission>0)i.unshift(p);else if(d.transparent===!0)s.unshift(p);else n.unshift(p)}function c(u,f){if(n.length>1)n.sort(u||aw);if(i.length>1)i.sort(f||Fg);if(s.length>1)s.sort(f||Fg)}function h(){for(let u=t,f=e.length;u<f;u++){let d=e[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function lw(){let e=new WeakMap;function t(i,s){let r=e.get(i),o;if(r===void 0)o=new Og,e.set(i,[o]);else if(s>=r.length)o=new Og,r.push(o);else o=r[s];return o}function n(){e=new WeakMap}return{get:t,dispose:n}}function cw(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new I,color:new fe};break;case"SpotLight":n={position:new I,direction:new I,color:new fe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new I,color:new fe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new I,skyColor:new fe,groundColor:new fe};break;case"RectAreaLight":n={color:new fe,position:new I,halfWidth:new I,halfHeight:new I};break}return e[t.id]=n,n}}}function hw(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new se};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new se};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new se,shadowCameraNear:1,shadowCameraFar:1000};break}return e[t.id]=n,n}}}var uw=0;function fw(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function dw(e){let t=new cw,n=hw(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);let s=new I,r=new He,o=new He;function a(c){let h=0,u=0,f=0;for(let w=0;w<9;w++)i.probe[w].set(0,0,0);let d=0,g=0,x=0,m=0,p=0,M=0,y=0,S=0,C=0,R=0,E=0;c.sort(fw);for(let w=0,T=c.length;w<T;w++){let P=c[w],{color:B,intensity:H,distance:k}=P,X=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=B.r*H,u+=B.g*H,f+=B.b*H;else if(P.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(P.sh.coefficients[q],H);E++}else if(P.isDirectionalLight){let q=t.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let re=P.shadow,W=n.get(P);W.shadowIntensity=re.intensity,W.shadowBias=re.bias,W.shadowNormalBias=re.normalBias,W.shadowRadius=re.radius,W.shadowMapSize=re.mapSize,i.directionalShadow[d]=W,i.directionalShadowMap[d]=X,i.directionalShadowMatrix[d]=P.shadow.matrix,M++}i.directional[d]=q,d++}else if(P.isSpotLight){let q=t.get(P);q.position.setFromMatrixPosition(P.matrixWorld),q.color.copy(B).multiplyScalar(H),q.distance=k,q.coneCos=Math.cos(P.angle),q.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),q.decay=P.decay,i.spot[x]=q;let re=P.shadow;if(P.map){if(i.spotLightMap[C]=P.map,C++,re.updateMatrices(P),P.castShadow)R++}if(i.spotLightMatrix[x]=re.matrix,P.castShadow){let W=n.get(P);W.shadowIntensity=re.intensity,W.shadowBias=re.bias,W.shadowNormalBias=re.normalBias,W.shadowRadius=re.radius,W.shadowMapSize=re.mapSize,i.spotShadow[x]=W,i.spotShadowMap[x]=X,S++}x++}else if(P.isRectAreaLight){let q=t.get(P);q.color.copy(B).multiplyScalar(H),q.halfWidth.set(P.width*0.5,0,0),q.halfHeight.set(0,P.height*0.5,0),i.rectArea[m]=q,m++}else if(P.isPointLight){let q=t.get(P);if(q.color.copy(P.color).multiplyScalar(P.intensity),q.distance=P.distance,q.decay=P.decay,P.castShadow){let re=P.shadow,W=n.get(P);W.shadowIntensity=re.intensity,W.shadowBias=re.bias,W.shadowNormalBias=re.normalBias,W.shadowRadius=re.radius,W.shadowMapSize=re.mapSize,W.shadowCameraNear=re.camera.near,W.shadowCameraFar=re.camera.far,i.pointShadow[g]=W,i.pointShadowMap[g]=X,i.pointShadowMatrix[g]=P.shadow.matrix,y++}i.point[g]=q,g++}else if(P.isHemisphereLight){let q=t.get(P);q.skyColor.copy(P.color).multiplyScalar(H),q.groundColor.copy(P.groundColor).multiplyScalar(H),i.hemi[p]=q,p++}}if(m>0)if(e.has("OES_texture_float_linear")===!0)i.rectAreaLTC1=Be.LTC_FLOAT_1,i.rectAreaLTC2=Be.LTC_FLOAT_2;else i.rectAreaLTC1=Be.LTC_HALF_1,i.rectAreaLTC2=Be.LTC_HALF_2;i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=f;let D=i.hash;if(D.directionalLength!==d||D.pointLength!==g||D.spotLength!==x||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==M||D.numPointShadows!==y||D.numSpotShadows!==S||D.numSpotMaps!==C||D.numLightProbes!==E)i.directional.length=d,i.spot.length=x,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=S+C-R,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=E,D.directionalLength=d,D.pointLength=g,D.spotLength=x,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=M,D.numPointShadows=y,D.numSpotShadows=S,D.numSpotMaps=C,D.numLightProbes=E,i.version=uw++}function l(c,h){let u=0,f=0,d=0,g=0,x=0,m=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){let y=c[p];if(y.isDirectionalLight){let S=i.directional[u];S.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),u++}else if(y.isSpotLight){let S=i.spot[d];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),d++}else if(y.isRectAreaLight){let S=i.rectArea[g];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),S.halfWidth.set(y.width*0.5,0,0),S.halfHeight.set(0,y.height*0.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){let S=i.point[f];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){let S=i.hemi[x];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),x++}}}return{setup:a,setupView:l,state:i}}function Bg(e){let t=new dw(e),n=[],i=[];function s(h){c.camera=h,n.length=0,i.length=0}function r(h){n.push(h)}function o(h){i.push(h)}function a(){t.setup(n)}function l(h){t.setupView(n,h)}let c={lightsArray:n,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function pw(e){let t=new WeakMap;function n(s,r=0){let o=t.get(s),a;if(o===void 0)a=new Bg(e),t.set(s,[a]);else if(r>=o.length)a=new Bg(e),o.push(a);else a=o[r];return a}function i(){t=new WeakMap}return{get:n,dispose:i}}var mw=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gw=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function vw(e,t,n){let i=new _s,s=new se,r=new se,o=new bt,a=new za({depthPacking:Nf}),l=new Ha,c={},h=n.maxTextureSize,u={[Yi]:vn,[vn]:Yi,[$t]:$t},f=new xt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new se},radius:{value:4}},vertexShader:mw,fragmentShader:gw}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Je;g.setAttribute("position",new at(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let x=new vt(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ec;let p=this.type;this.render=function(R,E,D){if(m.enabled===!1)return;if(m.autoUpdate===!1&&m.needsUpdate===!1)return;if(R.length===0)return;let w=e.getRenderTarget(),T=e.getActiveCubeFace(),P=e.getActiveMipmapLevel(),B=e.state;if(B.setBlending(Zt),B.buffers.depth.getReversed()===!0)B.buffers.color.setClear(0,0,0,0);else B.buffers.color.setClear(1,1,1,1);B.buffers.depth.setTest(!0),B.setScissorTest(!1);let H=p!==fi&&this.type===fi,k=p===fi&&this.type!==fi;for(let X=0,q=R.length;X<q;X++){let re=R[X],W=re.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",re,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);let Q=W.getFrameExtents();if(s.multiply(Q),r.copy(W.mapSize),s.x>h||s.y>h){if(s.x>h)r.x=Math.floor(h/Q.x),s.x=r.x*Q.x,W.mapSize.x=r.x;if(s.y>h)r.y=Math.floor(h/Q.y),s.y=r.y*Q.y,W.mapSize.y=r.y}if(W.map===null||H===!0||k===!0){let ge=this.type!==fi?{minFilter:xn,magFilter:xn}:{};if(W.map!==null)W.map.dispose();W.map=new Ft(s.x,s.y,ge),W.map.texture.name=re.name+".shadowMap",W.camera.updateProjectionMatrix()}e.setRenderTarget(W.map),e.clear();let ae=W.getViewportCount();for(let ge=0;ge<ae;ge++){let ve=W.getViewport(ge);o.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),B.viewport(o),W.updateMatrices(re,ge),i=W.getFrustum(),S(E,D,W.camera,re,this.type)}if(W.isPointLightShadow!==!0&&this.type===fi)M(W,D);W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,e.setRenderTarget(w,T,P)};function M(R,E){let D=t.update(x);if(f.defines.VSM_SAMPLES!==R.blurSamples)f.defines.VSM_SAMPLES=R.blurSamples,d.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0;if(R.mapPass===null)R.mapPass=new Ft(s.x,s.y);f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,e.setRenderTarget(R.mapPass),e.clear(),e.renderBufferDirect(E,null,D,f,x,null),d.uniforms.shadow_pass.value=R.mapPass.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,e.setRenderTarget(R.map),e.clear(),e.renderBufferDirect(E,null,D,d,x,null)}function y(R,E,D,w){let T=null,P=D.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)T=P;else if(T=D.isPointLight===!0?l:a,e.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let B=T.uuid,H=E.uuid,k=c[B];if(k===void 0)k={},c[B]=k;let X=k[H];if(X===void 0)X=T.clone(),k[H]=X,E.addEventListener("dispose",C);T=X}if(T.visible=E.visible,T.wireframe=E.wireframe,w===fi)T.side=E.shadowSide!==null?E.shadowSide:E.side;else T.side=E.shadowSide!==null?E.shadowSide:u[E.side];if(T.alphaMap=E.alphaMap,T.alphaTest=E.alphaToCoverage===!0?0.5:E.alphaTest,T.map=E.map,T.clipShadows=E.clipShadows,T.clippingPlanes=E.clippingPlanes,T.clipIntersection=E.clipIntersection,T.displacementMap=E.displacementMap,T.displacementScale=E.displacementScale,T.displacementBias=E.displacementBias,T.wireframeLinewidth=E.wireframeLinewidth,T.linewidth=E.linewidth,D.isPointLight===!0&&T.isMeshDistanceMaterial===!0){let B=e.properties.get(T);B.light=D}return T}function S(R,E,D,w,T){if(R.visible===!1)return;if(R.layers.test(E.layers)&&(R.isMesh||R.isLine||R.isPoints)){if((R.castShadow||R.receiveShadow&&T===fi)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,R.matrixWorld);let H=t.update(R),k=R.material;if(Array.isArray(k)){let X=H.groups;for(let q=0,re=X.length;q<re;q++){let W=X[q],Q=k[W.materialIndex];if(Q&&Q.visible){let ae=y(R,Q,w,T);R.onBeforeShadow(e,R,E,D,H,ae,W),e.renderBufferDirect(D,null,H,ae,R,W),R.onAfterShadow(e,R,E,D,H,ae,W)}}}else if(k.visible){let X=y(R,k,w,T);R.onBeforeShadow(e,R,E,D,H,X,null),e.renderBufferDirect(D,null,H,X,R,null),R.onAfterShadow(e,R,E,D,H,X,null)}}}let B=R.children;for(let H=0,k=B.length;H<k;H++)S(B[H],E,D,w,T)}function C(R){R.target.removeEventListener("dispose",C);for(let D in c){let w=c[D],T=R.target.uuid;if(T in w)w[T].dispose(),delete w[T]}}}var xw={[$o]:ea,[ta]:sa,[na]:ra,[Qr]:ia,[ea]:$o,[sa]:ta,[ra]:na,[ia]:Qr};function yw(e,t){function n(){let V=!1,ne=new bt,Ne=null,Xe=new bt(0,0,0,0);return{setMask:function(Te){if(Ne!==Te&&!V)e.colorMask(Te,Te,Te,Te),Ne=Te},setLocked:function(Te){V=Te},setClear:function(Te,xe,Ye,lt,At){if(At===!0)Te*=lt,xe*=lt,Ye*=lt;if(ne.set(Te,xe,Ye,lt),Xe.equals(ne)===!1)e.clearColor(Te,xe,Ye,lt),Xe.copy(ne)},reset:function(){V=!1,Ne=null,Xe.set(-1,0,0,0)}}}function i(){let V=!1,ne=!1,Ne=null,Xe=null,Te=null;return{setReversed:function(xe){if(ne!==xe){let Ye=t.get("EXT_clip_control");if(xe)Ye.clipControlEXT(Ye.LOWER_LEFT_EXT,Ye.ZERO_TO_ONE_EXT);else Ye.clipControlEXT(Ye.LOWER_LEFT_EXT,Ye.NEGATIVE_ONE_TO_ONE_EXT);ne=xe;let lt=Te;Te=null,this.setClear(lt)}},getReversed:function(){return ne},setTest:function(xe){if(xe)te(e.DEPTH_TEST);else le(e.DEPTH_TEST)},setMask:function(xe){if(Ne!==xe&&!V)e.depthMask(xe),Ne=xe},setFunc:function(xe){if(ne)xe=xw[xe];if(Xe!==xe){switch(xe){case $o:e.depthFunc(e.NEVER);break;case ea:e.depthFunc(e.ALWAYS);break;case ta:e.depthFunc(e.LESS);break;case Qr:e.depthFunc(e.LEQUAL);break;case na:e.depthFunc(e.EQUAL);break;case ia:e.depthFunc(e.GEQUAL);break;case sa:e.depthFunc(e.GREATER);break;case ra:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}Xe=xe}},setLocked:function(xe){V=xe},setClear:function(xe){if(Te!==xe){if(ne)xe=1-xe;e.clearDepth(xe),Te=xe}},reset:function(){V=!1,Ne=null,Xe=null,Te=null,ne=!1}}}function s(){let V=!1,ne=null,Ne=null,Xe=null,Te=null,xe=null,Ye=null,lt=null,At=null;return{setTest:function(Et){if(!V)if(Et)te(e.STENCIL_TEST);else le(e.STENCIL_TEST)},setMask:function(Et){if(ne!==Et&&!V)e.stencilMask(Et),ne=Et},setFunc:function(Et,Vn,Xn){if(Ne!==Et||Xe!==Vn||Te!==Xn)e.stencilFunc(Et,Vn,Xn),Ne=Et,Xe=Vn,Te=Xn},setOp:function(Et,Vn,Xn){if(xe!==Et||Ye!==Vn||lt!==Xn)e.stencilOp(Et,Vn,Xn),xe=Et,Ye=Vn,lt=Xn},setLocked:function(Et){V=Et},setClear:function(Et){if(At!==Et)e.clearStencil(Et),At=Et},reset:function(){V=!1,ne=null,Ne=null,Xe=null,Te=null,xe=null,Ye=null,lt=null,At=null}}}let r=new n,o=new i,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,d=[],g=null,x=!1,m=null,p=null,M=null,y=null,S=null,C=null,R=null,E=new fe(0,0,0),D=0,w=!1,T=null,P=null,B=null,H=null,k=null,X=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,re=0,W=e.getParameter(e.VERSION);if(W.indexOf("WebGL")!==-1)re=parseFloat(/^WebGL (\d)/.exec(W)[1]),q=re>=1;else if(W.indexOf("OpenGL ES")!==-1)re=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),q=re>=2;let Q=null,ae={},ge=e.getParameter(e.SCISSOR_BOX),ve=e.getParameter(e.VIEWPORT),Ge=new bt().fromArray(ge),Oe=new bt().fromArray(ve);function G(V,ne,Ne,Xe){let Te=new Uint8Array(4),xe=e.createTexture();e.bindTexture(V,xe),e.texParameteri(V,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(V,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Ye=0;Ye<Ne;Ye++)if(V===e.TEXTURE_3D||V===e.TEXTURE_2D_ARRAY)e.texImage3D(ne,0,e.RGBA,1,1,Xe,0,e.RGBA,e.UNSIGNED_BYTE,Te);else e.texImage2D(ne+Ye,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Te);return xe}let Y={};Y[e.TEXTURE_2D]=G(e.TEXTURE_2D,e.TEXTURE_2D,1),Y[e.TEXTURE_CUBE_MAP]=G(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[e.TEXTURE_2D_ARRAY]=G(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Y[e.TEXTURE_3D]=G(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),te(e.DEPTH_TEST),o.setFunc(Qr),de(!1),Ie(Tc),te(e.CULL_FACE),pe(Zt);function te(V){if(h[V]!==!0)e.enable(V),h[V]=!0}function le(V){if(h[V]!==!1)e.disable(V),h[V]=!1}function Ee(V,ne){if(u[V]!==ne){if(e.bindFramebuffer(V,ne),u[V]=ne,V===e.DRAW_FRAMEBUFFER)u[e.FRAMEBUFFER]=ne;if(V===e.FRAMEBUFFER)u[e.DRAW_FRAMEBUFFER]=ne;return!0}return!1}function We(V,ne){let Ne=d,Xe=!1;if(V){if(Ne=f.get(ne),Ne===void 0)Ne=[],f.set(ne,Ne);let Te=V.textures;if(Ne.length!==Te.length||Ne[0]!==e.COLOR_ATTACHMENT0){for(let xe=0,Ye=Te.length;xe<Ye;xe++)Ne[xe]=e.COLOR_ATTACHMENT0+xe;Ne.length=Te.length,Xe=!0}}else if(Ne[0]!==e.BACK)Ne[0]=e.BACK,Xe=!0;if(Xe)e.drawBuffers(Ne)}function ct(V){if(g!==V)return e.useProgram(V),g=V,!0;return!1}let z={[Qn]:e.FUNC_ADD,[cf]:e.FUNC_SUBTRACT,[hf]:e.FUNC_REVERSE_SUBTRACT};z[uf]=e.MIN,z[ff]=e.MAX;let ce={[ds]:e.ZERO,[df]:e.ONE,[pf]:e.SRC_COLOR,[gf]:e.SRC_ALPHA,[_f]:e.SRC_ALPHA_SATURATE,[jr]:e.DST_COLOR,[Jr]:e.DST_ALPHA,[mf]:e.ONE_MINUS_SRC_COLOR,[vf]:e.ONE_MINUS_SRC_ALPHA,[yf]:e.ONE_MINUS_DST_COLOR,[xf]:e.ONE_MINUS_DST_ALPHA,[Mf]:e.CONSTANT_COLOR,[Sf]:e.ONE_MINUS_CONSTANT_COLOR,[wf]:e.CONSTANT_ALPHA,[bf]:e.ONE_MINUS_CONSTANT_ALPHA};function pe(V,ne,Ne,Xe,Te,xe,Ye,lt,At,Et){if(V===Zt){if(x===!0)le(e.BLEND),x=!1;return}if(x===!1)te(e.BLEND),x=!0;if(V!==Qo){if(V!==m||Et!==w){if(p!==Qn||S!==Qn)e.blendEquation(e.FUNC_ADD),p=Qn,S=Qn;if(Et)switch(V){case fs:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case di:e.blendFunc(e.ONE,e.ONE);break;case Ac:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Rc:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case fs:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case di:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Ac:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Rc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}M=null,y=null,C=null,R=null,E.set(0,0,0),D=0,m=V,w=Et}return}if(Te=Te||ne,xe=xe||Ne,Ye=Ye||Xe,ne!==p||Te!==S)e.blendEquationSeparate(z[ne],z[Te]),p=ne,S=Te;if(Ne!==M||Xe!==y||xe!==C||Ye!==R)e.blendFuncSeparate(ce[Ne],ce[Xe],ce[xe],ce[Ye]),M=Ne,y=Xe,C=xe,R=Ye;if(lt.equals(E)===!1||At!==D)e.blendColor(lt.r,lt.g,lt.b,At),E.copy(lt),D=At;m=V,w=!1}function me(V,ne){V.side===$t?le(e.CULL_FACE):te(e.CULL_FACE);let Ne=V.side===vn;if(ne)Ne=!Ne;de(Ne),V.blending===fs&&V.transparent===!1?pe(Zt):pe(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),o.setFunc(V.depthFunc),o.setTest(V.depthTest),o.setMask(V.depthWrite),r.setMask(V.colorWrite);let Xe=V.stencilWrite;if(a.setTest(Xe),Xe)a.setMask(V.stencilWriteMask),a.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),a.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass);Se(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?te(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function de(V){if(T!==V){if(V)e.frontFace(e.CW);else e.frontFace(e.CCW);T=V}}function Ie(V){if(V!==af){if(te(e.CULL_FACE),V!==P)if(V===Tc)e.cullFace(e.BACK);else if(V===lf)e.cullFace(e.FRONT);else e.cullFace(e.FRONT_AND_BACK)}else le(e.CULL_FACE);P=V}function be(V){if(V!==B){if(q)e.lineWidth(V);B=V}}function Se(V,ne,Ne){if(V){if(te(e.POLYGON_OFFSET_FILL),H!==ne||k!==Ne)e.polygonOffset(ne,Ne),H=ne,k=Ne}else le(e.POLYGON_OFFSET_FILL)}function st(V){if(V)te(e.SCISSOR_TEST);else le(e.SCISSOR_TEST)}function tt(V){if(V===void 0)V=e.TEXTURE0+X-1;if(Q!==V)e.activeTexture(V),Q=V}function rt(V,ne,Ne){if(Ne===void 0)if(Q===null)Ne=e.TEXTURE0+X-1;else Ne=Q;let Xe=ae[Ne];if(Xe===void 0)Xe={type:void 0,texture:void 0},ae[Ne]=Xe;if(Xe.type!==V||Xe.texture!==ne){if(Q!==Ne)e.activeTexture(Ne),Q=Ne;e.bindTexture(V,ne||Y[V]),Xe.type=V,Xe.texture=ne}}function U(){let V=ae[Q];if(V!==void 0&&V.type!==void 0)e.bindTexture(V.type,null),V.type=void 0,V.texture=void 0}function A(){try{e.compressedTexImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Z(){try{e.compressedTexImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ue(){try{e.texSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function ye(){try{e.texSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function oe(){try{e.compressedTexSubImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Fe(){try{e.compressedTexSubImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ae(){try{e.texStorage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ve(){try{e.texStorage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ke(){try{e.texImage2D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Me(){try{e.texImage3D(...arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Pe(V){if(Ge.equals(V)===!1)e.scissor(V.x,V.y,V.z,V.w),Ge.copy(V)}function Ze(V){if(Oe.equals(V)===!1)e.viewport(V.x,V.y,V.z,V.w),Oe.copy(V)}function ke(V,ne){let Ne=c.get(ne);if(Ne===void 0)Ne=new WeakMap,c.set(ne,Ne);let Xe=Ne.get(V);if(Xe===void 0)Xe=e.getUniformBlockIndex(ne,V.name),Ne.set(V,Xe)}function Ce(V,ne){let Xe=c.get(ne).get(V);if(l.get(ne)!==Xe)e.uniformBlockBinding(ne,Xe,V.__bindingPointIndex),l.set(ne,Xe)}function qe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),h={},Q=null,ae={},u={},f=new WeakMap,d=[],g=null,x=!1,m=null,p=null,M=null,y=null,S=null,C=null,R=null,E=new fe(0,0,0),D=0,w=!1,T=null,P=null,B=null,H=null,k=null,Ge.set(0,0,e.canvas.width,e.canvas.height),Oe.set(0,0,e.canvas.width,e.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:te,disable:le,bindFramebuffer:Ee,drawBuffers:We,useProgram:ct,setBlending:pe,setMaterial:me,setFlipSided:de,setCullFace:Ie,setLineWidth:be,setPolygonOffset:Se,setScissorTest:st,activeTexture:tt,bindTexture:rt,unbindTexture:U,compressedTexImage2D:A,compressedTexImage3D:Z,texImage2D:Ke,texImage3D:Me,updateUBOMapping:ke,uniformBlockBinding:Ce,texStorage2D:Ae,texStorage3D:Ve,texSubImage2D:ue,texSubImage3D:ye,compressedTexSubImage2D:oe,compressedTexSubImage3D:Fe,scissor:Pe,viewport:Ze,reset:qe}}function _w(e,t,n,i,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new se,h=new WeakMap,u,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(U){}function g(U,A){return d?new OffscreenCanvas(U,A):qr("canvas")}function x(U,A,Z){let ue=1,ye=rt(U);if(ye.width>Z||ye.height>Z)ue=Z/Math.max(ye.width,ye.height);if(ue<1)if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&U instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&U instanceof ImageBitmap||typeof VideoFrame<"u"&&U instanceof VideoFrame){let oe=Math.floor(ue*ye.width),Fe=Math.floor(ue*ye.height);if(u===void 0)u=g(oe,Fe);let Ae=A?g(oe,Fe):u;return Ae.width=oe,Ae.height=Fe,Ae.getContext("2d").drawImage(U,0,0,oe,Fe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ye.width+"x"+ye.height+") to ("+oe+"x"+Fe+")."),Ae}else{if("data"in U)console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ye.width+"x"+ye.height+").");return U}return U}function m(U){return U.generateMipmaps}function p(U){e.generateMipmap(U)}function M(U){if(U.isWebGLCubeRenderTarget)return e.TEXTURE_CUBE_MAP;if(U.isWebGL3DRenderTarget)return e.TEXTURE_3D;if(U.isWebGLArrayRenderTarget||U.isCompressedArrayTexture)return e.TEXTURE_2D_ARRAY;return e.TEXTURE_2D}function y(U,A,Z,ue,ye=!1){if(U!==null){if(e[U]!==void 0)return e[U];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+U+"'")}let oe=A;if(A===e.RED){if(Z===e.FLOAT)oe=e.R32F;if(Z===e.HALF_FLOAT)oe=e.R16F;if(Z===e.UNSIGNED_BYTE)oe=e.R8}if(A===e.RED_INTEGER){if(Z===e.UNSIGNED_BYTE)oe=e.R8UI;if(Z===e.UNSIGNED_SHORT)oe=e.R16UI;if(Z===e.UNSIGNED_INT)oe=e.R32UI;if(Z===e.BYTE)oe=e.R8I;if(Z===e.SHORT)oe=e.R16I;if(Z===e.INT)oe=e.R32I}if(A===e.RG){if(Z===e.FLOAT)oe=e.RG32F;if(Z===e.HALF_FLOAT)oe=e.RG16F;if(Z===e.UNSIGNED_BYTE)oe=e.RG8}if(A===e.RG_INTEGER){if(Z===e.UNSIGNED_BYTE)oe=e.RG8UI;if(Z===e.UNSIGNED_SHORT)oe=e.RG16UI;if(Z===e.UNSIGNED_INT)oe=e.RG32UI;if(Z===e.BYTE)oe=e.RG8I;if(Z===e.SHORT)oe=e.RG16I;if(Z===e.INT)oe=e.RG32I}if(A===e.RGB_INTEGER){if(Z===e.UNSIGNED_BYTE)oe=e.RGB8UI;if(Z===e.UNSIGNED_SHORT)oe=e.RGB16UI;if(Z===e.UNSIGNED_INT)oe=e.RGB32UI;if(Z===e.BYTE)oe=e.RGB8I;if(Z===e.SHORT)oe=e.RGB16I;if(Z===e.INT)oe=e.RGB32I}if(A===e.RGBA_INTEGER){if(Z===e.UNSIGNED_BYTE)oe=e.RGBA8UI;if(Z===e.UNSIGNED_SHORT)oe=e.RGBA16UI;if(Z===e.UNSIGNED_INT)oe=e.RGBA32UI;if(Z===e.BYTE)oe=e.RGBA8I;if(Z===e.SHORT)oe=e.RGBA16I;if(Z===e.INT)oe=e.RGBA32I}if(A===e.RGB){if(Z===e.UNSIGNED_INT_5_9_9_9_REV)oe=e.RGB9_E5;if(Z===e.UNSIGNED_INT_10F_11F_11F_REV)oe=e.R11F_G11F_B10F}if(A===e.RGBA){let Fe=ye?uh:mt.getTransfer(ue);if(Z===e.FLOAT)oe=e.RGBA32F;if(Z===e.HALF_FLOAT)oe=e.RGBA16F;if(Z===e.UNSIGNED_BYTE)oe=Fe===Ct?e.SRGB8_ALPHA8:e.RGBA8;if(Z===e.UNSIGNED_SHORT_4_4_4_4)oe=e.RGBA4;if(Z===e.UNSIGNED_SHORT_5_5_5_1)oe=e.RGB5_A1}if(oe===e.R16F||oe===e.R32F||oe===e.RG16F||oe===e.RG32F||oe===e.RGBA16F||oe===e.RGBA32F)t.get("EXT_color_buffer_float");return oe}function S(U,A){let Z;if(U){if(A===null||A===Qs||A===Ki)Z=e.DEPTH24_STENCIL8;else if(A===hn)Z=e.DEPTH32F_STENCIL8;else if(A===eo)Z=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(A===null||A===Qs||A===Ki)Z=e.DEPTH_COMPONENT24;else if(A===hn)Z=e.DEPTH_COMPONENT32F;else if(A===eo)Z=e.DEPTH_COMPONENT16;return Z}function C(U,A){if(m(U)===!0||U.isFramebufferTexture&&U.minFilter!==xn&&U.minFilter!==Kt)return Math.log2(Math.max(A.width,A.height))+1;else if(U.mipmaps!==void 0&&U.mipmaps.length>0)return U.mipmaps.length;else if(U.isCompressedTexture&&Array.isArray(U.image))return A.mipmaps.length;else return 1}function R(U){let A=U.target;if(A.removeEventListener("dispose",R),D(A),A.isVideoTexture)h.delete(A)}function E(U){let A=U.target;A.removeEventListener("dispose",E),T(A)}function D(U){let A=i.get(U);if(A.__webglInit===void 0)return;let Z=U.source,ue=f.get(Z);if(ue){let ye=ue[A.__cacheKey];if(ye.usedTimes--,ye.usedTimes===0)w(U);if(Object.keys(ue).length===0)f.delete(Z)}i.remove(U)}function w(U){let A=i.get(U);e.deleteTexture(A.__webglTexture);let Z=U.source,ue=f.get(Z);delete ue[A.__cacheKey],o.memory.textures--}function T(U){let A=i.get(U);if(U.depthTexture)U.depthTexture.dispose(),i.remove(U.depthTexture);if(U.isWebGLCubeRenderTarget)for(let ue=0;ue<6;ue++){if(Array.isArray(A.__webglFramebuffer[ue]))for(let ye=0;ye<A.__webglFramebuffer[ue].length;ye++)e.deleteFramebuffer(A.__webglFramebuffer[ue][ye]);else e.deleteFramebuffer(A.__webglFramebuffer[ue]);if(A.__webglDepthbuffer)e.deleteRenderbuffer(A.__webglDepthbuffer[ue])}else{if(Array.isArray(A.__webglFramebuffer))for(let ue=0;ue<A.__webglFramebuffer.length;ue++)e.deleteFramebuffer(A.__webglFramebuffer[ue]);else e.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer)e.deleteRenderbuffer(A.__webglDepthbuffer);if(A.__webglMultisampledFramebuffer)e.deleteFramebuffer(A.__webglMultisampledFramebuffer);if(A.__webglColorRenderbuffer){for(let ue=0;ue<A.__webglColorRenderbuffer.length;ue++)if(A.__webglColorRenderbuffer[ue])e.deleteRenderbuffer(A.__webglColorRenderbuffer[ue])}if(A.__webglDepthRenderbuffer)e.deleteRenderbuffer(A.__webglDepthRenderbuffer)}let Z=U.textures;for(let ue=0,ye=Z.length;ue<ye;ue++){let oe=i.get(Z[ue]);if(oe.__webglTexture)e.deleteTexture(oe.__webglTexture),o.memory.textures--;i.remove(Z[ue])}i.remove(U)}let P=0;function B(){P=0}function H(){let U=P;if(U>=s.maxTextures)console.warn("THREE.WebGLTextures: Trying to use "+U+" texture units while this GPU supports only "+s.maxTextures);return P+=1,U}function k(U){let A=[];return A.push(U.wrapS),A.push(U.wrapT),A.push(U.wrapR||0),A.push(U.magFilter),A.push(U.minFilter),A.push(U.anisotropy),A.push(U.internalFormat),A.push(U.format),A.push(U.type),A.push(U.generateMipmaps),A.push(U.premultiplyAlpha),A.push(U.flipY),A.push(U.unpackAlignment),A.push(U.colorSpace),A.join()}function X(U,A){let Z=i.get(U);if(U.isVideoTexture)st(U);if(U.isRenderTargetTexture===!1&&U.isExternalTexture!==!0&&U.version>0&&Z.__version!==U.version){let ue=U.image;if(ue===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ue.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(Z,U,A);return}}else if(U.isExternalTexture)Z.__webglTexture=U.sourceTexture?U.sourceTexture:null;n.bindTexture(e.TEXTURE_2D,Z.__webglTexture,e.TEXTURE0+A)}function q(U,A){let Z=i.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&Z.__version!==U.version){Y(Z,U,A);return}n.bindTexture(e.TEXTURE_2D_ARRAY,Z.__webglTexture,e.TEXTURE0+A)}function re(U,A){let Z=i.get(U);if(U.isRenderTargetTexture===!1&&U.version>0&&Z.__version!==U.version){Y(Z,U,A);return}n.bindTexture(e.TEXTURE_3D,Z.__webglTexture,e.TEXTURE0+A)}function W(U,A){let Z=i.get(U);if(U.version>0&&Z.__version!==U.version){te(Z,U,A);return}n.bindTexture(e.TEXTURE_CUBE_MAP,Z.__webglTexture,e.TEXTURE0+A)}let Q={[cn]:e.REPEAT,[ua]:e.CLAMP_TO_EDGE,[fa]:e.MIRRORED_REPEAT},ae={[xn]:e.NEAREST,[da]:e.NEAREST_MIPMAP_NEAREST,[ms]:e.NEAREST_MIPMAP_LINEAR,[Kt]:e.LINEAR,[js]:e.LINEAR_MIPMAP_NEAREST,[$n]:e.LINEAR_MIPMAP_LINEAR},ge={[Of]:e.NEVER,[Wf]:e.ALWAYS,[Bf]:e.LESS,[fh]:e.LEQUAL,[zf]:e.EQUAL,[Gf]:e.GEQUAL,[Hf]:e.GREATER,[kf]:e.NOTEQUAL};function ve(U,A){if(A.type===hn&&t.has("OES_texture_float_linear")===!1&&(A.magFilter===Kt||A.magFilter===js||A.magFilter===ms||A.magFilter===$n||A.minFilter===Kt||A.minFilter===js||A.minFilter===ms||A.minFilter===$n))console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(e.texParameteri(U,e.TEXTURE_WRAP_S,Q[A.wrapS]),e.texParameteri(U,e.TEXTURE_WRAP_T,Q[A.wrapT]),U===e.TEXTURE_3D||U===e.TEXTURE_2D_ARRAY)e.texParameteri(U,e.TEXTURE_WRAP_R,Q[A.wrapR]);if(e.texParameteri(U,e.TEXTURE_MAG_FILTER,ae[A.magFilter]),e.texParameteri(U,e.TEXTURE_MIN_FILTER,ae[A.minFilter]),A.compareFunction)e.texParameteri(U,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(U,e.TEXTURE_COMPARE_FUNC,ge[A.compareFunction]);if(t.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===xn)return;if(A.minFilter!==ms&&A.minFilter!==$n)return;if(A.type===hn&&t.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||i.get(A).__currentAnisotropy){let Z=t.get("EXT_texture_filter_anisotropic");e.texParameterf(U,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,s.getMaxAnisotropy())),i.get(A).__currentAnisotropy=A.anisotropy}}}function Ge(U,A){let Z=!1;if(U.__webglInit===void 0)U.__webglInit=!0,A.addEventListener("dispose",R);let ue=A.source,ye=f.get(ue);if(ye===void 0)ye={},f.set(ue,ye);let oe=k(A);if(oe!==U.__cacheKey){if(ye[oe]===void 0)ye[oe]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,Z=!0;ye[oe].usedTimes++;let Fe=ye[U.__cacheKey];if(Fe!==void 0){if(ye[U.__cacheKey].usedTimes--,Fe.usedTimes===0)w(A)}U.__cacheKey=oe,U.__webglTexture=ye[oe].texture}return Z}function Oe(U,A,Z){return Math.floor(Math.floor(U/Z)/A)}function G(U,A,Z,ue){let oe=U.updateRanges;if(oe.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,A.width,A.height,Z,ue,A.data);else{oe.sort((Me,Pe)=>Me.start-Pe.start);let Fe=0;for(let Me=1;Me<oe.length;Me++){let Pe=oe[Fe],Ze=oe[Me],ke=Pe.start+Pe.count,Ce=Oe(Ze.start,A.width,4),qe=Oe(Pe.start,A.width,4);if(Ze.start<=ke+1&&Ce===qe&&Oe(Ze.start+Ze.count-1,A.width,4)===Ce)Pe.count=Math.max(Pe.count,Ze.start+Ze.count-Pe.start);else++Fe,oe[Fe]=Ze}oe.length=Fe+1;let Ae=e.getParameter(e.UNPACK_ROW_LENGTH),Ve=e.getParameter(e.UNPACK_SKIP_PIXELS),Ke=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,A.width);for(let Me=0,Pe=oe.length;Me<Pe;Me++){let Ze=oe[Me],ke=Math.floor(Ze.start/4),Ce=Math.ceil(Ze.count/4),qe=ke%A.width,V=Math.floor(ke/A.width),ne=Ce,Ne=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,qe),e.pixelStorei(e.UNPACK_SKIP_ROWS,V),n.texSubImage2D(e.TEXTURE_2D,0,qe,V,ne,1,Z,ue,A.data)}U.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,Ae),e.pixelStorei(e.UNPACK_SKIP_PIXELS,Ve),e.pixelStorei(e.UNPACK_SKIP_ROWS,Ke)}}function Y(U,A,Z){let ue=e.TEXTURE_2D;if(A.isDataArrayTexture||A.isCompressedArrayTexture)ue=e.TEXTURE_2D_ARRAY;if(A.isData3DTexture)ue=e.TEXTURE_3D;let ye=Ge(U,A),oe=A.source;n.bindTexture(ue,U.__webglTexture,e.TEXTURE0+Z);let Fe=i.get(oe);if(oe.version!==Fe.__version||ye===!0){n.activeTexture(e.TEXTURE0+Z);let Ae=mt.getPrimaries(mt.workingColorSpace),Ve=A.colorSpace===xs?null:mt.getPrimaries(A.colorSpace),Ke=A.colorSpace===xs||Ae===Ve?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,A.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,A.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ke);let Me=x(A.image,!1,s.maxTextureSize);Me=tt(A,Me);let Pe=r.convert(A.format,A.colorSpace),Ze=r.convert(A.type),ke=y(A.internalFormat,Pe,Ze,A.colorSpace,A.isVideoTexture);ve(ue,A);let Ce,qe=A.mipmaps,V=A.isVideoTexture!==!0,ne=Fe.__version===void 0||ye===!0,Ne=oe.dataReady,Xe=C(A,Me);if(A.isDepthTexture){if(ke=S(A.format===gs,A.type),ne)if(V)n.texStorage2D(e.TEXTURE_2D,1,ke,Me.width,Me.height);else n.texImage2D(e.TEXTURE_2D,0,ke,Me.width,Me.height,0,Pe,Ze,null)}else if(A.isDataTexture)if(qe.length>0){if(V&&ne)n.texStorage2D(e.TEXTURE_2D,Xe,ke,qe[0].width,qe[0].height);for(let Te=0,xe=qe.length;Te<xe;Te++)if(Ce=qe[Te],V){if(Ne)n.texSubImage2D(e.TEXTURE_2D,Te,0,0,Ce.width,Ce.height,Pe,Ze,Ce.data)}else n.texImage2D(e.TEXTURE_2D,Te,ke,Ce.width,Ce.height,0,Pe,Ze,Ce.data);A.generateMipmaps=!1}else if(V){if(ne)n.texStorage2D(e.TEXTURE_2D,Xe,ke,Me.width,Me.height);if(Ne)G(A,Me,Pe,Ze)}else n.texImage2D(e.TEXTURE_2D,0,ke,Me.width,Me.height,0,Pe,Ze,Me.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){if(V&&ne)n.texStorage3D(e.TEXTURE_2D_ARRAY,Xe,ke,qe[0].width,qe[0].height,Me.depth);for(let Te=0,xe=qe.length;Te<xe;Te++)if(Ce=qe[Te],A.format!==Jt)if(Pe!==null)if(V){if(Ne)if(A.layerUpdates.size>0){let Ye=jh(Ce.width,Ce.height,A.format,A.type);for(let lt of A.layerUpdates){let At=Ce.data.subarray(lt*Ye/Ce.data.BYTES_PER_ELEMENT,(lt+1)*Ye/Ce.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Te,0,0,lt,Ce.width,Ce.height,1,Pe,At)}A.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Te,0,0,0,Ce.width,Ce.height,Me.depth,Pe,Ce.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Te,ke,Ce.width,Ce.height,Me.depth,0,Ce.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(V){if(Ne)n.texSubImage3D(e.TEXTURE_2D_ARRAY,Te,0,0,0,Ce.width,Ce.height,Me.depth,Pe,Ze,Ce.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,Te,ke,Ce.width,Ce.height,Me.depth,0,Pe,Ze,Ce.data)}else{if(V&&ne)n.texStorage2D(e.TEXTURE_2D,Xe,ke,qe[0].width,qe[0].height);for(let Te=0,xe=qe.length;Te<xe;Te++)if(Ce=qe[Te],A.format!==Jt)if(Pe!==null)if(V){if(Ne)n.compressedTexSubImage2D(e.TEXTURE_2D,Te,0,0,Ce.width,Ce.height,Pe,Ce.data)}else n.compressedTexImage2D(e.TEXTURE_2D,Te,ke,Ce.width,Ce.height,0,Ce.data);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(V){if(Ne)n.texSubImage2D(e.TEXTURE_2D,Te,0,0,Ce.width,Ce.height,Pe,Ze,Ce.data)}else n.texImage2D(e.TEXTURE_2D,Te,ke,Ce.width,Ce.height,0,Pe,Ze,Ce.data)}else if(A.isDataArrayTexture)if(V){if(ne)n.texStorage3D(e.TEXTURE_2D_ARRAY,Xe,ke,Me.width,Me.height,Me.depth);if(Ne)if(A.layerUpdates.size>0){let Te=jh(Me.width,Me.height,A.format,A.type);for(let xe of A.layerUpdates){let Ye=Me.data.subarray(xe*Te/Me.data.BYTES_PER_ELEMENT,(xe+1)*Te/Me.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,xe,Me.width,Me.height,1,Pe,Ze,Ye)}A.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Me.width,Me.height,Me.depth,Pe,Ze,Me.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ke,Me.width,Me.height,Me.depth,0,Pe,Ze,Me.data);else if(A.isData3DTexture)if(V){if(ne)n.texStorage3D(e.TEXTURE_3D,Xe,ke,Me.width,Me.height,Me.depth);if(Ne)n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Me.width,Me.height,Me.depth,Pe,Ze,Me.data)}else n.texImage3D(e.TEXTURE_3D,0,ke,Me.width,Me.height,Me.depth,0,Pe,Ze,Me.data);else if(A.isFramebufferTexture){if(ne)if(V)n.texStorage2D(e.TEXTURE_2D,Xe,ke,Me.width,Me.height);else{let Te=Me.width,xe=Me.height;for(let Ye=0;Ye<Xe;Ye++)n.texImage2D(e.TEXTURE_2D,Ye,ke,Te,xe,0,Pe,Ze,null),Te>>=1,xe>>=1}}else if(qe.length>0){if(V&&ne){let Te=rt(qe[0]);n.texStorage2D(e.TEXTURE_2D,Xe,ke,Te.width,Te.height)}for(let Te=0,xe=qe.length;Te<xe;Te++)if(Ce=qe[Te],V){if(Ne)n.texSubImage2D(e.TEXTURE_2D,Te,0,0,Pe,Ze,Ce)}else n.texImage2D(e.TEXTURE_2D,Te,ke,Pe,Ze,Ce);A.generateMipmaps=!1}else if(V){if(ne){let Te=rt(Me);n.texStorage2D(e.TEXTURE_2D,Xe,ke,Te.width,Te.height)}if(Ne)n.texSubImage2D(e.TEXTURE_2D,0,0,0,Pe,Ze,Me)}else n.texImage2D(e.TEXTURE_2D,0,ke,Pe,Ze,Me);if(m(A))p(ue);if(Fe.__version=oe.version,A.onUpdate)A.onUpdate(A)}U.__version=A.version}function te(U,A,Z){if(A.image.length!==6)return;let ue=Ge(U,A),ye=A.source;n.bindTexture(e.TEXTURE_CUBE_MAP,U.__webglTexture,e.TEXTURE0+Z);let oe=i.get(ye);if(ye.version!==oe.__version||ue===!0){n.activeTexture(e.TEXTURE0+Z);let Fe=mt.getPrimaries(mt.workingColorSpace),Ae=A.colorSpace===xs?null:mt.getPrimaries(A.colorSpace),Ve=A.colorSpace===xs||Fe===Ae?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,A.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,A.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ve);let Ke=A.isCompressedTexture||A.image[0].isCompressedTexture,Me=A.image[0]&&A.image[0].isDataTexture,Pe=[];for(let xe=0;xe<6;xe++){if(!Ke&&!Me)Pe[xe]=x(A.image[xe],!0,s.maxCubemapSize);else Pe[xe]=Me?A.image[xe].image:A.image[xe];Pe[xe]=tt(A,Pe[xe])}let Ze=Pe[0],ke=r.convert(A.format,A.colorSpace),Ce=r.convert(A.type),qe=y(A.internalFormat,ke,Ce,A.colorSpace),V=A.isVideoTexture!==!0,ne=oe.__version===void 0||ue===!0,Ne=ye.dataReady,Xe=C(A,Ze);ve(e.TEXTURE_CUBE_MAP,A);let Te;if(Ke){if(V&&ne)n.texStorage2D(e.TEXTURE_CUBE_MAP,Xe,qe,Ze.width,Ze.height);for(let xe=0;xe<6;xe++){Te=Pe[xe].mipmaps;for(let Ye=0;Ye<Te.length;Ye++){let lt=Te[Ye];if(A.format!==Jt)if(ke!==null)if(V){if(Ne)n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye,0,0,lt.width,lt.height,ke,lt.data)}else n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye,qe,lt.width,lt.height,0,lt.data);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(V){if(Ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye,0,0,lt.width,lt.height,ke,Ce,lt.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye,qe,lt.width,lt.height,0,ke,Ce,lt.data)}}}else{if(Te=A.mipmaps,V&&ne){if(Te.length>0)Xe++;let xe=rt(Pe[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,Xe,qe,xe.width,xe.height)}for(let xe=0;xe<6;xe++)if(Me){if(V){if(Ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,Pe[xe].width,Pe[xe].height,ke,Ce,Pe[xe].data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,qe,Pe[xe].width,Pe[xe].height,0,ke,Ce,Pe[xe].data);for(let Ye=0;Ye<Te.length;Ye++){let At=Te[Ye].image[xe].image;if(V){if(Ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye+1,0,0,At.width,At.height,ke,Ce,At.data)}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye+1,qe,At.width,At.height,0,ke,Ce,At.data)}}else{if(V){if(Ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,0,0,ke,Ce,Pe[xe])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0,qe,ke,Ce,Pe[xe]);for(let Ye=0;Ye<Te.length;Ye++){let lt=Te[Ye];if(V){if(Ne)n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye+1,0,0,ke,Ce,lt.image[xe])}else n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ye+1,qe,ke,Ce,lt.image[xe])}}}if(m(A))p(e.TEXTURE_CUBE_MAP);if(oe.__version=ye.version,A.onUpdate)A.onUpdate(A)}U.__version=A.version}function le(U,A,Z,ue,ye,oe){let Fe=r.convert(Z.format,Z.colorSpace),Ae=r.convert(Z.type),Ve=y(Z.internalFormat,Fe,Ae,Z.colorSpace),Ke=i.get(A),Me=i.get(Z);if(Me.__renderTarget=A,!Ke.__hasExternalTextures){let Pe=Math.max(1,A.width>>oe),Ze=Math.max(1,A.height>>oe);if(ye===e.TEXTURE_3D||ye===e.TEXTURE_2D_ARRAY)n.texImage3D(ye,oe,Ve,Pe,Ze,A.depth,0,Fe,Ae,null);else n.texImage2D(ye,oe,Ve,Pe,Ze,0,Fe,Ae,null)}if(n.bindFramebuffer(e.FRAMEBUFFER,U),Se(A))a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,ue,ye,Me.__webglTexture,0,be(A));else if(ye===e.TEXTURE_2D||ye>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&ye<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)e.framebufferTexture2D(e.FRAMEBUFFER,ue,ye,Me.__webglTexture,oe);n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ee(U,A,Z){if(e.bindRenderbuffer(e.RENDERBUFFER,U),A.depthBuffer){let ue=A.depthTexture,ye=ue&&ue.isDepthTexture?ue.type:null,oe=S(A.stencilBuffer,ye),Fe=A.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,Ae=be(A);if(Se(A))a.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ae,oe,A.width,A.height);else if(Z)e.renderbufferStorageMultisample(e.RENDERBUFFER,Ae,oe,A.width,A.height);else e.renderbufferStorage(e.RENDERBUFFER,oe,A.width,A.height);e.framebufferRenderbuffer(e.FRAMEBUFFER,Fe,e.RENDERBUFFER,U)}else{let ue=A.textures;for(let ye=0;ye<ue.length;ye++){let oe=ue[ye],Fe=r.convert(oe.format,oe.colorSpace),Ae=r.convert(oe.type),Ve=y(oe.internalFormat,Fe,Ae,oe.colorSpace),Ke=be(A);if(Z&&Se(A)===!1)e.renderbufferStorageMultisample(e.RENDERBUFFER,Ke,Ve,A.width,A.height);else if(Se(A))a.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ke,Ve,A.width,A.height);else e.renderbufferStorage(e.RENDERBUFFER,Ve,A.width,A.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function We(U,A){if(A&&A.isWebGLCubeRenderTarget)throw Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(e.FRAMEBUFFER,U),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let ue=i.get(A.depthTexture);if(ue.__renderTarget=A,!ue.__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0;X(A.depthTexture,0);let ye=ue.__webglTexture,oe=be(A);if(A.depthTexture.format===pa)if(Se(A))a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,ye,0,oe);else e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,ye,0);else if(A.depthTexture.format===gs)if(Se(A))a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,ye,0,oe);else e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,ye,0);else throw Error("Unknown depthTexture format")}function ct(U){let A=i.get(U),Z=U.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==U.depthTexture){let ue=U.depthTexture;if(A.__depthDisposeCallback)A.__depthDisposeCallback();if(ue){let ye=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,ue.removeEventListener("dispose",ye)};ue.addEventListener("dispose",ye),A.__depthDisposeCallback=ye}A.__boundDepthTexture=ue}if(U.depthTexture&&!A.__autoAllocateDepthBuffer){if(Z)throw Error("target.depthTexture not supported in Cube render targets");let ue=U.texture.mipmaps;if(ue&&ue.length>0)We(A.__webglFramebuffer[0],U);else We(A.__webglFramebuffer,U)}else if(Z){A.__webglDepthbuffer=[];for(let ue=0;ue<6;ue++)if(n.bindFramebuffer(e.FRAMEBUFFER,A.__webglFramebuffer[ue]),A.__webglDepthbuffer[ue]===void 0)A.__webglDepthbuffer[ue]=e.createRenderbuffer(),Ee(A.__webglDepthbuffer[ue],U,!1);else{let ye=U.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,oe=A.__webglDepthbuffer[ue];e.bindRenderbuffer(e.RENDERBUFFER,oe),e.framebufferRenderbuffer(e.FRAMEBUFFER,ye,e.RENDERBUFFER,oe)}}else{let ue=U.texture.mipmaps;if(ue&&ue.length>0)n.bindFramebuffer(e.FRAMEBUFFER,A.__webglFramebuffer[0]);else n.bindFramebuffer(e.FRAMEBUFFER,A.__webglFramebuffer);if(A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=e.createRenderbuffer(),Ee(A.__webglDepthbuffer,U,!1);else{let ye=U.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,oe=A.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,oe),e.framebufferRenderbuffer(e.FRAMEBUFFER,ye,e.RENDERBUFFER,oe)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function z(U,A,Z){let ue=i.get(U);if(A!==void 0)le(ue.__webglFramebuffer,U,U.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0);if(Z!==void 0)ct(U)}function ce(U){let A=U.texture,Z=i.get(U),ue=i.get(A);U.addEventListener("dispose",E);let ye=U.textures,oe=U.isWebGLCubeRenderTarget===!0,Fe=ye.length>1;if(!Fe){if(ue.__webglTexture===void 0)ue.__webglTexture=e.createTexture();ue.__version=A.version,o.memory.textures++}if(oe){Z.__webglFramebuffer=[];for(let Ae=0;Ae<6;Ae++)if(A.mipmaps&&A.mipmaps.length>0){Z.__webglFramebuffer[Ae]=[];for(let Ve=0;Ve<A.mipmaps.length;Ve++)Z.__webglFramebuffer[Ae][Ve]=e.createFramebuffer()}else Z.__webglFramebuffer[Ae]=e.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){Z.__webglFramebuffer=[];for(let Ae=0;Ae<A.mipmaps.length;Ae++)Z.__webglFramebuffer[Ae]=e.createFramebuffer()}else Z.__webglFramebuffer=e.createFramebuffer();if(Fe)for(let Ae=0,Ve=ye.length;Ae<Ve;Ae++){let Ke=i.get(ye[Ae]);if(Ke.__webglTexture===void 0)Ke.__webglTexture=e.createTexture(),o.memory.textures++}if(U.samples>0&&Se(U)===!1){Z.__webglMultisampledFramebuffer=e.createFramebuffer(),Z.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let Ae=0;Ae<ye.length;Ae++){let Ve=ye[Ae];Z.__webglColorRenderbuffer[Ae]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,Z.__webglColorRenderbuffer[Ae]);let Ke=r.convert(Ve.format,Ve.colorSpace),Me=r.convert(Ve.type),Pe=y(Ve.internalFormat,Ke,Me,Ve.colorSpace,U.isXRRenderTarget===!0),Ze=be(U);e.renderbufferStorageMultisample(e.RENDERBUFFER,Ze,Pe,U.width,U.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ae,e.RENDERBUFFER,Z.__webglColorRenderbuffer[Ae])}if(e.bindRenderbuffer(e.RENDERBUFFER,null),U.depthBuffer)Z.__webglDepthRenderbuffer=e.createRenderbuffer(),Ee(Z.__webglDepthRenderbuffer,U,!0);n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(oe){n.bindTexture(e.TEXTURE_CUBE_MAP,ue.__webglTexture),ve(e.TEXTURE_CUBE_MAP,A);for(let Ae=0;Ae<6;Ae++)if(A.mipmaps&&A.mipmaps.length>0)for(let Ve=0;Ve<A.mipmaps.length;Ve++)le(Z.__webglFramebuffer[Ae][Ve],U,A,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,Ve);else le(Z.__webglFramebuffer[Ae],U,A,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0);if(m(A))p(e.TEXTURE_CUBE_MAP);n.unbindTexture()}else if(Fe){for(let Ae=0,Ve=ye.length;Ae<Ve;Ae++){let Ke=ye[Ae],Me=i.get(Ke),Pe=e.TEXTURE_2D;if(U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)Pe=U.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(Pe,Me.__webglTexture),ve(Pe,Ke),le(Z.__webglFramebuffer,U,Ke,e.COLOR_ATTACHMENT0+Ae,Pe,0),m(Ke))p(Pe)}n.unbindTexture()}else{let Ae=e.TEXTURE_2D;if(U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)Ae=U.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY;if(n.bindTexture(Ae,ue.__webglTexture),ve(Ae,A),A.mipmaps&&A.mipmaps.length>0)for(let Ve=0;Ve<A.mipmaps.length;Ve++)le(Z.__webglFramebuffer[Ve],U,A,e.COLOR_ATTACHMENT0,Ae,Ve);else le(Z.__webglFramebuffer,U,A,e.COLOR_ATTACHMENT0,Ae,0);if(m(A))p(Ae);n.unbindTexture()}if(U.depthBuffer)ct(U)}function pe(U){let A=U.textures;for(let Z=0,ue=A.length;Z<ue;Z++){let ye=A[Z];if(m(ye)){let oe=M(U),Fe=i.get(ye).__webglTexture;n.bindTexture(oe,Fe),p(oe),n.unbindTexture()}}}let me=[],de=[];function Ie(U){if(U.samples>0){if(Se(U)===!1){let{textures:A,width:Z,height:ue}=U,ye=e.COLOR_BUFFER_BIT,oe=U.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,Fe=i.get(U),Ae=A.length>1;if(Ae)for(let Ke=0;Ke<A.length;Ke++)n.bindFramebuffer(e.FRAMEBUFFER,Fe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ke,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,Fe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ke,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,Fe.__webglMultisampledFramebuffer);let Ve=U.texture.mipmaps;if(Ve&&Ve.length>0)n.bindFramebuffer(e.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer[0]);else n.bindFramebuffer(e.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let Ke=0;Ke<A.length;Ke++){if(U.resolveDepthBuffer){if(U.depthBuffer)ye|=e.DEPTH_BUFFER_BIT;if(U.stencilBuffer&&U.resolveStencilBuffer)ye|=e.STENCIL_BUFFER_BIT}if(Ae){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,Fe.__webglColorRenderbuffer[Ke]);let Me=i.get(A[Ke]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Me,0)}if(e.blitFramebuffer(0,0,Z,ue,0,0,Z,ue,ye,e.NEAREST),l===!0){if(me.length=0,de.length=0,me.push(e.COLOR_ATTACHMENT0+Ke),U.depthBuffer&&U.resolveDepthBuffer===!1)me.push(oe),de.push(oe),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,de);e.invalidateFramebuffer(e.READ_FRAMEBUFFER,me)}}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),Ae)for(let Ke=0;Ke<A.length;Ke++){n.bindFramebuffer(e.FRAMEBUFFER,Fe.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ke,e.RENDERBUFFER,Fe.__webglColorRenderbuffer[Ke]);let Me=i.get(A[Ke]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,Fe.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ke,e.TEXTURE_2D,Me,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,Fe.__webglMultisampledFramebuffer)}else if(U.depthBuffer&&U.resolveDepthBuffer===!1&&l){let A=U.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[A])}}}function be(U){return Math.min(s.maxSamples,U.samples)}function Se(U){let A=i.get(U);return U.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function st(U){let A=o.render.frame;if(h.get(U)!==A)h.set(U,A),U.update()}function tt(U,A){let{colorSpace:Z,format:ue,type:ye}=U;if(U.isCompressedTexture===!0||U.isVideoTexture===!0)return A;if(Z!==Dt&&Z!==xs)if(mt.getTransfer(Z)===Ct){if(ue!==Jt||ye!==pi)console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else console.error("THREE.WebGLTextures: Unsupported texture color space:",Z);return A}function rt(U){if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement)c.width=U.naturalWidth||U.width,c.height=U.naturalHeight||U.height;else if(typeof VideoFrame<"u"&&U instanceof VideoFrame)c.width=U.displayWidth,c.height=U.displayHeight;else c.width=U.width,c.height=U.height;return c}this.allocateTextureUnit=H,this.resetTextureUnits=B,this.setTexture2D=X,this.setTexture2DArray=q,this.setTexture3D=re,this.setTextureCube=W,this.rebindTextures=z,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=pe,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=ct,this.setupFrameBufferTexture=le,this.useMultisampledRTT=Se}function Kg(e,t){function n(i,s=xs){let r,o=mt.getTransfer(s);if(i===pi)return e.UNSIGNED_BYTE;if(i===Ic)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Pc)return e.UNSIGNED_SHORT_5_5_5_1;if(i===If)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===Pf)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===Rf)return e.BYTE;if(i===Cf)return e.SHORT;if(i===eo)return e.UNSIGNED_SHORT;if(i===Cc)return e.INT;if(i===Qs)return e.UNSIGNED_INT;if(i===hn)return e.FLOAT;if(i===It)return e.HALF_FLOAT;if(i===Df)return e.ALPHA;if(i===Lf)return e.RGB;if(i===Jt)return e.RGBA;if(i===pa)return e.DEPTH_COMPONENT;if(i===gs)return e.DEPTH_STENCIL;if(i===vs)return e.RED;if(i===Dc)return e.RED_INTEGER;if(i===Ji)return e.RG;if(i===Lc)return e.RG_INTEGER;if(i===Nc)return e.RGBA_INTEGER;if(i===ma||i===ga||i===va||i===xa)if(o===Ct)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ma)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ga)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===xa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ma)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ga)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===va)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===xa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Uc||i===Fc||i===Oc||i===Bc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Uc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Fc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Oc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Bc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===zc||i===Hc||i===kc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===zc||i===Hc)return o===Ct?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===kc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Gc||i===Wc||i===Vc||i===Xc||i===qc||i===Yc||i===Zc||i===Kc||i===Jc||i===jc||i===Qc||i===$c||i===eh||i===th)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Gc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Wc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Vc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Xc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===qc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Yc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Zc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Kc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Jc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===jc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qc)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===$c)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===eh)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===th)return o===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===nh||i===ih||i===sh)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===nh)return o===Ct?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ih)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===sh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===rh||i===oh||i===ah||i===lh)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===rh)return r.COMPRESSED_RED_RGTC1_EXT;if(i===oh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ah)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===lh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(i===Ki)return e.UNSIGNED_INT_24_8;return e[i]!==void 0?e[i]:null}return{convert:n}}var Mw=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Sw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Jg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ea(e.texture);if(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)this.depthNear=e.depthNear,this.depthFar=e.depthFar;this.texture=n}}getMesh(e){if(this.texture!==null){if(this.mesh===null){let t=e.cameras[0].viewport,n=new xt({vertexShader:Mw,fragmentShader:Sw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new vt(new Qt(20,20),n)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class jg extends ei{constructor(e,t){super();let n=this,i=null,s=1,r=null,o="local-floor",a=1,l=null,c=null,h=null,u=null,f=null,d=null,g=typeof XRWebGLBinding<"u",x=new Jg,m={},p=t.getContextAttributes(),M=null,y=null,S=[],C=[],R=new se,E=null,D=new Ot;D.viewport=new bt;let w=new Ot;w.viewport=new bt;let T=[D,w],P=new Xh,B=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(G){let Y=S[G];if(Y===void 0)Y=new oo,S[G]=Y;return Y.getTargetRaySpace()},this.getControllerGrip=function(G){let Y=S[G];if(Y===void 0)Y=new oo,S[G]=Y;return Y.getGripSpace()},this.getHand=function(G){let Y=S[G];if(Y===void 0)Y=new oo,S[G]=Y;return Y.getHandSpace()};function k(G){let Y=C.indexOf(G.inputSource);if(Y===-1)return;let te=S[Y];if(te!==void 0)te.update(G.inputSource,G.frame,l||r),te.dispatchEvent({type:G.type,data:G.inputSource})}function X(){i.removeEventListener("select",k),i.removeEventListener("selectstart",k),i.removeEventListener("selectend",k),i.removeEventListener("squeeze",k),i.removeEventListener("squeezestart",k),i.removeEventListener("squeezeend",k),i.removeEventListener("end",X),i.removeEventListener("inputsourceschange",q);for(let G=0;G<S.length;G++){let Y=C[G];if(Y===null)continue;C[G]=null,S[G].disconnect(Y)}B=null,H=null,x.reset();for(let G in m)delete m[G];e.setRenderTarget(M),f=null,u=null,h=null,i=null,y=null,Oe.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(G){if(s=G,n.isPresenting===!0)console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(G){if(o=G,n.isPresenting===!0)console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(G){l=G},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){if(h===null&&g)h=new XRWebGLBinding(i,t);return h},this.getFrame=function(){return d},this.getSession=function(){return i},this.setSession=async function(G){if(i=G,i!==null){if(M=e.getRenderTarget(),i.addEventListener("select",k),i.addEventListener("selectstart",k),i.addEventListener("selectend",k),i.addEventListener("squeeze",k),i.addEventListener("squeezestart",k),i.addEventListener("squeezeend",k),i.addEventListener("end",X),i.addEventListener("inputsourceschange",q),p.xrCompatible!==!0)await t.makeXRCompatible();if(E=e.getPixelRatio(),e.getSize(R),!(g&&("createProjectionLayer"in XRWebGLBinding.prototype))){let te={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(i,t,te),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Ft(f.framebufferWidth,f.framebufferHeight,{format:Jt,type:pi,colorSpace:e.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let te=null,le=null,Ee=null;if(p.depth)Ee=p.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=p.stencil?gs:pa,le=p.stencil?Ki:Qs;let We={colorFormat:t.RGBA8,depthFormat:Ee,scaleFactor:s};h=this.getBinding(),u=h.createProjectionLayer(We),i.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new Ft(u.textureWidth,u.textureHeight,{format:Jt,type:pi,depthTexture:new lr(u.textureWidth,u.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:p.stencil,colorSpace:e.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(a),l=null,r=await i.requestReferenceSpace(o),Oe.setContext(i),Oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function q(G){for(let Y=0;Y<G.removed.length;Y++){let te=G.removed[Y],le=C.indexOf(te);if(le>=0)C[le]=null,S[le].disconnect(te)}for(let Y=0;Y<G.added.length;Y++){let te=G.added[Y],le=C.indexOf(te);if(le===-1){for(let We=0;We<S.length;We++)if(We>=C.length){C.push(te),le=We;break}else if(C[We]===null){C[We]=te,le=We;break}if(le===-1)break}let Ee=S[le];if(Ee)Ee.connect(te)}}let re=new I,W=new I;function Q(G,Y,te){re.setFromMatrixPosition(Y.matrixWorld),W.setFromMatrixPosition(te.matrixWorld);let le=re.distanceTo(W),Ee=Y.projectionMatrix.elements,We=te.projectionMatrix.elements,ct=Ee[14]/(Ee[10]-1),z=Ee[14]/(Ee[10]+1),ce=(Ee[9]+1)/Ee[5],pe=(Ee[9]-1)/Ee[5],me=(Ee[8]-1)/Ee[0],de=(We[8]+1)/We[0],Ie=ct*me,be=ct*de,Se=le/(-me+de),st=Se*-me;if(Y.matrixWorld.decompose(G.position,G.quaternion,G.scale),G.translateX(st),G.translateZ(Se),G.matrixWorld.compose(G.position,G.quaternion,G.scale),G.matrixWorldInverse.copy(G.matrixWorld).invert(),Ee[10]===-1)G.projectionMatrix.copy(Y.projectionMatrix),G.projectionMatrixInverse.copy(Y.projectionMatrixInverse);else{let tt=ct+Se,rt=z+Se,U=Ie-st,A=be+(le-st),Z=ce*z/rt*tt,ue=pe*z/rt*tt;G.projectionMatrix.makePerspective(U,A,Z,ue,tt,rt),G.projectionMatrixInverse.copy(G.projectionMatrix).invert()}}function ae(G,Y){if(Y===null)G.matrixWorld.copy(G.matrix);else G.matrixWorld.multiplyMatrices(Y.matrixWorld,G.matrix);G.matrixWorldInverse.copy(G.matrixWorld).invert()}this.updateCamera=function(G){if(i===null)return;let{near:Y,far:te}=G;if(x.texture!==null){if(x.depthNear>0)Y=x.depthNear;if(x.depthFar>0)te=x.depthFar}if(P.near=w.near=D.near=Y,P.far=w.far=D.far=te,B!==P.near||H!==P.far)i.updateRenderState({depthNear:P.near,depthFar:P.far}),B=P.near,H=P.far;P.layers.mask=G.layers.mask|6,D.layers.mask=P.layers.mask&3,w.layers.mask=P.layers.mask&5;let le=G.parent,Ee=P.cameras;ae(P,le);for(let We=0;We<Ee.length;We++)ae(Ee[We],le);if(Ee.length===2)Q(P,D,w);else P.projectionMatrix.copy(D.projectionMatrix);ge(G,P,le)};function ge(G,Y,te){if(te===null)G.matrix.copy(Y.matrixWorld);else G.matrix.copy(te.matrixWorld),G.matrix.invert(),G.matrix.multiply(Y.matrixWorld);if(G.matrix.decompose(G.position,G.quaternion,G.scale),G.updateMatrixWorld(!0),G.projectionMatrix.copy(Y.projectionMatrix),G.projectionMatrixInverse.copy(Y.projectionMatrixInverse),G.isPerspectiveCamera)G.fov=Vs*2*Math.atan(1/G.projectionMatrix.elements[5]),G.zoom=1}this.getCamera=function(){return P},this.getFoveation=function(){if(u===null&&f===null)return;return a},this.setFoveation=function(G){if(a=G,u!==null)u.fixedFoveation=G;if(f!==null&&f.fixedFoveation!==void 0)f.fixedFoveation=G},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(P)},this.getCameraTexture=function(G){return m[G]};let ve=null;function Ge(G,Y){if(c=Y.getViewerPose(l||r),d=Y,c!==null){let te=c.views;if(f!==null)e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y);let le=!1;if(te.length!==P.cameras.length)P.cameras.length=0,le=!0;for(let z=0;z<te.length;z++){let ce=te[z],pe=null;if(f!==null)pe=f.getViewport(ce);else{let de=h.getViewSubImage(u,ce);if(pe=de.viewport,z===0)e.setRenderTargetTextures(y,de.colorTexture,de.depthStencilTexture),e.setRenderTarget(y)}let me=T[z];if(me===void 0)me=new Ot,me.layers.enable(z),me.viewport=new bt,T[z]=me;if(me.matrix.fromArray(ce.transform.matrix),me.matrix.decompose(me.position,me.quaternion,me.scale),me.projectionMatrix.fromArray(ce.projectionMatrix),me.projectionMatrixInverse.copy(me.projectionMatrix).invert(),me.viewport.set(pe.x,pe.y,pe.width,pe.height),z===0)P.matrix.copy(me.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale);if(le===!0)P.cameras.push(me)}let Ee=i.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&g){h=n.getBinding();let z=h.getDepthInformation(te[0]);if(z&&z.isValid&&z.texture)x.init(z,i.renderState)}if(Ee&&Ee.includes("camera-access")&&g){e.state.unbindTexture(),h=n.getBinding();for(let z=0;z<te.length;z++){let ce=te[z].camera;if(ce){let pe=m[ce];if(!pe)pe=new Ea,m[ce]=pe;let me=h.getCameraImage(ce);pe.sourceTexture=me}}}}for(let te=0;te<S.length;te++){let le=C[te],Ee=S[te];if(le!==null&&Ee!==void 0)Ee.update(le,Y,l||r)}if(ve)ve(G,Y);if(Y.detectedPlanes)n.dispatchEvent({type:"planesdetected",data:Y});d=null}let Oe=new zg;Oe.setAnimationLoop(Ge),this.setAnimationLoop=function(G){ve=G},this.dispose=function(){}}}var gr=new gn,ww=new He;function bw(e,t){function n(m,p){if(m.matrixAutoUpdate===!0)m.updateMatrix();p.value.copy(m.matrix)}function i(m,p){if(p.color.getRGB(m.fogColor.value,td(e)),p.isFog)m.fogNear.value=p.near,m.fogFar.value=p.far;else if(p.isFogExp2)m.fogDensity.value=p.density}function s(m,p,M,y,S){if(p.isMeshBasicMaterial)r(m,p);else if(p.isMeshLambertMaterial)r(m,p);else if(p.isMeshToonMaterial)r(m,p),u(m,p);else if(p.isMeshPhongMaterial)r(m,p),h(m,p);else if(p.isMeshStandardMaterial){if(r(m,p),f(m,p),p.isMeshPhysicalMaterial)d(m,p,S)}else if(p.isMeshMatcapMaterial)r(m,p),g(m,p);else if(p.isMeshDepthMaterial)r(m,p);else if(p.isMeshDistanceMaterial)r(m,p),x(m,p);else if(p.isMeshNormalMaterial)r(m,p);else if(p.isLineBasicMaterial){if(o(m,p),p.isLineDashedMaterial)a(m,p)}else if(p.isPointsMaterial)l(m,p,M,y);else if(p.isSpriteMaterial)c(m,p);else if(p.isShadowMaterial)m.color.value.copy(p.color),m.opacity.value=p.opacity;else if(p.isShaderMaterial)p.uniformsNeedUpdate=!1}function r(m,p){if(m.opacity.value=p.opacity,p.color)m.diffuse.value.copy(p.color);if(p.emissive)m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity);if(p.map)m.map.value=p.map,n(p.map,m.mapTransform);if(p.alphaMap)m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform);if(p.bumpMap){if(m.bumpMap.value=p.bumpMap,n(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===vn)m.bumpScale.value*=-1}if(p.normalMap){if(m.normalMap.value=p.normalMap,n(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===vn)m.normalScale.value.negate()}if(p.displacementMap)m.displacementMap.value=p.displacementMap,n(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias;if(p.emissiveMap)m.emissiveMap.value=p.emissiveMap,n(p.emissiveMap,m.emissiveMapTransform);if(p.specularMap)m.specularMap.value=p.specularMap,n(p.specularMap,m.specularMapTransform);if(p.alphaTest>0)m.alphaTest.value=p.alphaTest;let M=t.get(p),{envMap:y,envMapRotation:S}=M;if(y){if(m.envMap.value=y,gr.copy(S),gr.x*=-1,gr.y*=-1,gr.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1)gr.y*=-1,gr.z*=-1;m.envMapRotation.value.setFromMatrix4(ww.makeRotationFromEuler(gr)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio}if(p.lightMap)m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,n(p.lightMap,m.lightMapTransform);if(p.aoMap)m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,n(p.aoMap,m.aoMapTransform)}function o(m,p){if(m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map)m.map.value=p.map,n(p.map,m.mapTransform)}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,y){if(m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=y*0.5,p.map)m.map.value=p.map,n(p.map,m.uvTransform);if(p.alphaMap)m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform);if(p.alphaTest>0)m.alphaTest.value=p.alphaTest}function c(m,p){if(m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map)m.map.value=p.map,n(p.map,m.mapTransform);if(p.alphaMap)m.alphaMap.value=p.alphaMap,n(p.alphaMap,m.alphaMapTransform);if(p.alphaTest>0)m.alphaTest.value=p.alphaTest}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,0.0001)}function u(m,p){if(p.gradientMap)m.gradientMap.value=p.gradientMap}function f(m,p){if(m.metalness.value=p.metalness,p.metalnessMap)m.metalnessMap.value=p.metalnessMap,n(p.metalnessMap,m.metalnessMapTransform);if(m.roughness.value=p.roughness,p.roughnessMap)m.roughnessMap.value=p.roughnessMap,n(p.roughnessMap,m.roughnessMapTransform);if(p.envMap)m.envMapIntensity.value=p.envMapIntensity}function d(m,p,M){if(m.ior.value=p.ior,p.sheen>0){if(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap)m.sheenColorMap.value=p.sheenColorMap,n(p.sheenColorMap,m.sheenColorMapTransform);if(p.sheenRoughnessMap)m.sheenRoughnessMap.value=p.sheenRoughnessMap,n(p.sheenRoughnessMap,m.sheenRoughnessMapTransform)}if(p.clearcoat>0){if(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap)m.clearcoatMap.value=p.clearcoatMap,n(p.clearcoatMap,m.clearcoatMapTransform);if(p.clearcoatRoughnessMap)m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,n(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform);if(p.clearcoatNormalMap){if(m.clearcoatNormalMap.value=p.clearcoatNormalMap,n(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===vn)m.clearcoatNormalScale.value.negate()}}if(p.dispersion>0)m.dispersion.value=p.dispersion;if(p.iridescence>0){if(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap)m.iridescenceMap.value=p.iridescenceMap,n(p.iridescenceMap,m.iridescenceMapTransform);if(p.iridescenceThicknessMap)m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,n(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform)}if(p.transmission>0){if(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap)m.transmissionMap.value=p.transmissionMap,n(p.transmissionMap,m.transmissionMapTransform);if(m.thickness.value=p.thickness,p.thicknessMap)m.thicknessMap.value=p.thicknessMap,n(p.thicknessMap,m.thicknessMapTransform);m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)}if(p.anisotropy>0){if(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap)m.anisotropyMap.value=p.anisotropyMap,n(p.anisotropyMap,m.anisotropyMapTransform)}if(m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap)m.specularColorMap.value=p.specularColorMap,n(p.specularColorMap,m.specularColorMapTransform);if(p.specularIntensityMap)m.specularIntensityMap.value=p.specularIntensityMap,n(p.specularIntensityMap,m.specularIntensityMapTransform)}function g(m,p){if(p.matcap)m.matcap.value=p.matcap}function x(m,p){let M=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Tw(e,t,n,i){let s={},r={},o=[],a=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,y){let S=y.program;i.uniformBlockBinding(M,S)}function c(M,y){let S=s[M.id];if(S===void 0)g(M),S=h(M),s[M.id]=S,M.addEventListener("dispose",m);let C=y.program;i.updateUBOMapping(M,C);let R=t.render.frame;if(r[M.id]!==R)f(M),r[M.id]=R}function h(M){let y=u();M.__bindingPointIndex=y;let S=e.createBuffer(),{__size:C,usage:R}=M;return e.bindBuffer(e.UNIFORM_BUFFER,S),e.bufferData(e.UNIFORM_BUFFER,C,R),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,y,S),S}function u(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(M){let y=s[M.id],{uniforms:S,__cache:C}=M;e.bindBuffer(e.UNIFORM_BUFFER,y);for(let R=0,E=S.length;R<E;R++){let D=Array.isArray(S[R])?S[R]:[S[R]];for(let w=0,T=D.length;w<T;w++){let P=D[w];if(d(P,R,w,C)===!0){let B=P.__offset,H=Array.isArray(P.value)?P.value:[P.value],k=0;for(let X=0;X<H.length;X++){let q=H[X],re=x(q);if(typeof q==="number"||typeof q==="boolean")P.__data[0]=q,e.bufferSubData(e.UNIFORM_BUFFER,B+k,P.__data);else if(q.isMatrix3)P.__data[0]=q.elements[0],P.__data[1]=q.elements[1],P.__data[2]=q.elements[2],P.__data[3]=0,P.__data[4]=q.elements[3],P.__data[5]=q.elements[4],P.__data[6]=q.elements[5],P.__data[7]=0,P.__data[8]=q.elements[6],P.__data[9]=q.elements[7],P.__data[10]=q.elements[8],P.__data[11]=0;else q.toArray(P.__data,k),k+=re.storage/Float32Array.BYTES_PER_ELEMENT}e.bufferSubData(e.UNIFORM_BUFFER,B,P.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function d(M,y,S,C){let R=M.value,E=y+"_"+S;if(C[E]===void 0){if(typeof R==="number"||typeof R==="boolean")C[E]=R;else C[E]=R.clone();return!0}else{let D=C[E];if(typeof R==="number"||typeof R==="boolean"){if(D!==R)return C[E]=R,!0}else if(D.equals(R)===!1)return D.copy(R),!0}return!1}function g(M){let y=M.uniforms,S=0,C=16;for(let E=0,D=y.length;E<D;E++){let w=Array.isArray(y[E])?y[E]:[y[E]];for(let T=0,P=w.length;T<P;T++){let B=w[T],H=Array.isArray(B.value)?B.value:[B.value];for(let k=0,X=H.length;k<X;k++){let q=H[k],re=x(q),W=S%C,Q=W%re.boundary,ae=W+Q;if(S+=Q,ae!==0&&C-ae<re.storage)S+=C-ae;B.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=S,S+=re.storage}}}let R=S%C;if(R>0)S+=C-R;return M.__size=S,M.__cache={},this}function x(M){let y={boundary:0,storage:0};if(typeof M==="number"||typeof M==="boolean")y.boundary=4,y.storage=4;else if(M.isVector2)y.boundary=8,y.storage=8;else if(M.isVector3||M.isColor)y.boundary=16,y.storage=12;else if(M.isVector4)y.boundary=16,y.storage=16;else if(M.isMatrix3)y.boundary=48,y.storage=48;else if(M.isMatrix4)y.boundary=64,y.storage=64;else if(M.isTexture)console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.");else console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M);return y}function m(M){let y=M.target;y.removeEventListener("dispose",m);let S=o.indexOf(y.__bindingPointIndex);o.splice(S,1),e.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(let M in s)e.deleteBuffer(s[M]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}class nu{constructor(e={}){let{canvas:t=qf(),context:n=null,depth:i=!0,stencil:s=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:a=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=r;let d=new Uint32Array(4),g=new Int32Array(4),x=null,m=null,p=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,S=!1;this._outputColorSpace=en;let C=0,R=0,E=null,D=-1,w=null,T=new bt,P=new bt,B=null,H=new fe(0),k=0,{width:X,height:q}=t,re=1,W=null,Q=null,ae=new bt(0,0,X,q),ge=new bt(0,0,X,q),ve=!1,Ge=new _s,Oe=!1,G=!1,Y=new He,te=new I,le=new bt,Ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},We=!1;function ct(){return E===null?re:1}let z=n;function ce(v,b){return t.getContext(v,b)}try{let v={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:a,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in t)t.setAttribute("data-engine",`three.js r${of}`);if(t.addEventListener("webglcontextlost",ne,!1),t.addEventListener("webglcontextrestored",Ne,!1),t.addEventListener("webglcontextcreationerror",Xe,!1),z===null){if(z=ce("webgl2",v),z===null)if(ce("webgl2"))throw Error("Error creating WebGL context with your selected attributes.");else throw Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let pe,me,de,Ie,be,Se,st,tt,rt,U,A,Z,ue,ye,oe,Fe,Ae,Ve,Ke,Me,Pe,Ze,ke,Ce;function qe(){if(pe=new VS(z),pe.init(),Ze=new Kg(z,pe),me=new OS(z,pe,e,Ze),de=new yw(z,pe),me.reversedDepthBuffer&&u)de.buffers.depth.setReversed(!0);Ie=new YS(z),be=new ow,Se=new _w(z,pe,de,be,me,Ze,Ie),st=new zS(y),tt=new WS(y),rt=new $y(z),ke=new US(z,rt),U=new XS(z,rt,Ie,ke),A=new KS(z,U,rt,Ie),Ke=new ZS(z,me,Se),Fe=new BS(be),Z=new rw(y,st,tt,pe,me,ke,Fe),ue=new bw(y,be),ye=new lw,oe=new pw(pe),Ve=new NS(y,st,tt,de,A,f,a),Ae=new vw(y,A,me),Ce=new Tw(z,Ie,me,de),Me=new FS(z,pe,Ie),Pe=new qS(z,pe,Ie),Ie.programs=Z.programs,y.capabilities=me,y.extensions=pe,y.properties=be,y.renderLists=ye,y.shadowMap=Ae,y.state=de,y.info=Ie}qe();let V=new jg(y,z);this.xr=V,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let v=pe.get("WEBGL_lose_context");if(v)v.loseContext()},this.forceContextRestore=function(){let v=pe.get("WEBGL_lose_context");if(v)v.restoreContext()},this.getPixelRatio=function(){return re},this.setPixelRatio=function(v){if(v===void 0)return;re=v,this.setSize(X,q,!1)},this.getSize=function(v){return v.set(X,q)},this.setSize=function(v,b,L=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}if(X=v,q=b,t.width=Math.floor(v*re),t.height=Math.floor(b*re),L===!0)t.style.width=v+"px",t.style.height=b+"px";this.setViewport(0,0,v,b)},this.getDrawingBufferSize=function(v){return v.set(X*re,q*re).floor()},this.setDrawingBufferSize=function(v,b,L){X=v,q=b,re=L,t.width=Math.floor(v*L),t.height=Math.floor(b*L),this.setViewport(0,0,v,b)},this.getCurrentViewport=function(v){return v.copy(T)},this.getViewport=function(v){return v.copy(ae)},this.setViewport=function(v,b,L,F){if(v.isVector4)ae.set(v.x,v.y,v.z,v.w);else ae.set(v,b,L,F);de.viewport(T.copy(ae).multiplyScalar(re).round())},this.getScissor=function(v){return v.copy(ge)},this.setScissor=function(v,b,L,F){if(v.isVector4)ge.set(v.x,v.y,v.z,v.w);else ge.set(v,b,L,F);de.scissor(P.copy(ge).multiplyScalar(re).round())},this.getScissorTest=function(){return ve},this.setScissorTest=function(v){de.setScissorTest(ve=v)},this.setOpaqueSort=function(v){W=v},this.setTransparentSort=function(v){Q=v},this.getClearColor=function(v){return v.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(v=!0,b=!0,L=!0){let F=0;if(v){let O=!1;if(E!==null){let N=E.texture.format;O=N===Nc||N===Lc||N===Dc}if(O){let N=E.texture.type,j=N===pi||N===Qs||N===eo||N===Ki||N===Ic||N===Pc,J=Ve.getClearColor(),K=Ve.getClearAlpha(),{r:ee,g:he,b:ie}=J;if(j)d[0]=ee,d[1]=he,d[2]=ie,d[3]=K,z.clearBufferuiv(z.COLOR,0,d);else g[0]=ee,g[1]=he,g[2]=ie,g[3]=K,z.clearBufferiv(z.COLOR,0,g)}else F|=z.COLOR_BUFFER_BIT}if(b)F|=z.DEPTH_BUFFER_BIT;if(L)F|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);z.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ne,!1),t.removeEventListener("webglcontextrestored",Ne,!1),t.removeEventListener("webglcontextcreationerror",Xe,!1),Ve.dispose(),ye.dispose(),oe.dispose(),be.dispose(),st.dispose(),tt.dispose(),A.dispose(),ke.dispose(),Ce.dispose(),Z.dispose(),V.dispose(),V.removeEventListener("sessionstart",Vn),V.removeEventListener("sessionend",Xn),Oi.stop()};function ne(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function Ne(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;let v=Ie.autoReset,b=Ae.enabled,L=Ae.autoUpdate,F=Ae.needsUpdate,O=Ae.type;qe(),Ie.autoReset=v,Ae.enabled=b,Ae.autoUpdate=L,Ae.needsUpdate=F,Ae.type=O}function Xe(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Te(v){let b=v.target;b.removeEventListener("dispose",Te),xe(b)}function xe(v){Ye(v),be.remove(v)}function Ye(v){let b=be.get(v).programs;if(b!==void 0){if(b.forEach(function(L){Z.releaseProgram(L)}),v.isShaderMaterial)Z.releaseShaderCache(v)}}this.renderBufferDirect=function(v,b,L,F,O,N){if(b===null)b=Ee;let j=O.isMesh&&O.matrixWorld.determinant()<0,J=Dl(v,b,L,F,O);de.setMaterial(F,j);let K=L.index,ee=1;if(F.wireframe===!0){if(K=U.getWireframeAttribute(L),K===void 0)return;ee=2}let he=L.drawRange,ie=L.attributes.position,_e=he.start*ee,De=(he.start+he.count)*ee;if(N!==null)_e=Math.max(_e,N.start*ee),De=Math.min(De,(N.start+N.count)*ee);if(K!==null)_e=Math.max(_e,0),De=Math.min(De,K.count);else if(ie!==void 0&&ie!==null)_e=Math.max(_e,0),De=Math.min(De,ie.count);let we=De-_e;if(we<0||we===1/0)return;ke.setup(O,F,J,L,K);let Re,Ue=Me;if(K!==null)Re=rt.get(K),Ue=Pe,Ue.setIndex(Re);if(O.isMesh)if(F.wireframe===!0)de.setLineWidth(F.wireframeLinewidth*ct()),Ue.setMode(z.LINES);else Ue.setMode(z.TRIANGLES);else if(O.isLine){let Le=F.linewidth;if(Le===void 0)Le=1;if(de.setLineWidth(Le*ct()),O.isLineSegments)Ue.setMode(z.LINES);else if(O.isLineLoop)Ue.setMode(z.LINE_LOOP);else Ue.setMode(z.LINE_STRIP)}else if(O.isPoints)Ue.setMode(z.POINTS);else if(O.isSprite)Ue.setMode(z.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Yr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Ue.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(!pe.get("WEBGL_multi_draw")){let{_multiDrawStarts:Le,_multiDrawCounts:Qe,_multiDrawCount:je}=O,ut=K?rt.get(K).bytesPerElement:1,$e=be.get(F).currentProgram.getUniforms();for(let yt=0;yt<je;yt++)$e.setValue(z,"_gl_DrawID",yt),Ue.render(Le[yt]/ut,Qe[yt])}else Ue.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else if(O.isInstancedMesh)Ue.renderInstances(_e,we,O.count);else if(L.isInstancedBufferGeometry){let Le=L._maxInstanceCount!==void 0?L._maxInstanceCount:1/0,Qe=Math.min(L.instanceCount,Le);Ue.renderInstances(_e,we,Qe)}else Ue.render(_e,we)};function lt(v,b,L){if(v.transparent===!0&&v.side===$t&&v.forceSinglePass===!1)v.side=vn,v.needsUpdate=!0,wr(v,b,L),v.side=Yi,v.needsUpdate=!0,wr(v,b,L),v.side=$t;else wr(v,b,L)}this.compile=function(v,b,L=null){if(L===null)L=v;if(m=oe.get(L),m.init(b),M.push(m),L.traverseVisible(function(O){if(O.isLight&&O.layers.test(b.layers)){if(m.pushLight(O),O.castShadow)m.pushShadow(O)}}),v!==L)v.traverseVisible(function(O){if(O.isLight&&O.layers.test(b.layers)){if(m.pushLight(O),O.castShadow)m.pushShadow(O)}});m.setupLights();let F=new Set;return v.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;let N=O.material;if(N)if(Array.isArray(N))for(let j=0;j<N.length;j++){let J=N[j];lt(J,L,O),F.add(J)}else lt(N,L,O),F.add(N)}),m=M.pop(),F},this.compileAsync=function(v,b,L=null){let F=this.compile(v,b,L);return new Promise((O)=>{function N(){if(F.forEach(function(j){if(be.get(j).currentProgram.isReady())F.delete(j)}),F.size===0){O(v);return}setTimeout(N,10)}if(pe.get("KHR_parallel_shader_compile")!==null)N();else setTimeout(N,10)})};let At=null;function Et(v){if(At)At(v)}function Vn(){Oi.stop()}function Xn(){Oi.start()}let Oi=new zg;if(Oi.setAnimationLoop(Et),typeof self<"u")Oi.setContext(self);this.setAnimationLoop=function(v){At=v,V.setAnimationLoop(v),v===null?Oi.stop():Oi.start()},V.addEventListener("sessionstart",Vn),V.addEventListener("sessionend",Xn),this.render=function(v,b){if(b!==void 0&&b.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(v.matrixWorldAutoUpdate===!0)v.updateMatrixWorld();if(b.parent===null&&b.matrixWorldAutoUpdate===!0)b.updateMatrixWorld();if(V.enabled===!0&&V.isPresenting===!0){if(V.cameraAutoUpdate===!0)V.updateCamera(b);b=V.getCamera()}if(v.isScene===!0)v.onBeforeRender(y,v,b,E);if(m=oe.get(v,M.length),m.init(b),M.push(m),Y.multiplyMatrices(b.projectionMatrix,b.matrixWorldInverse),Ge.setFromProjectionMatrix(Y,ph,b.reversedDepth),G=this.localClippingEnabled,Oe=Fe.init(this.clippingPlanes,G),x=ye.get(v,p.length),x.init(),p.push(x),V.enabled===!0&&V.isPresenting===!0){let N=y.xr.getDepthSensingMesh();if(N!==null)Co(N,b,-1/0,y.sortObjects)}if(Co(v,b,0,y.sortObjects),x.finish(),y.sortObjects===!0)x.sort(W,Q);if(We=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,We)Ve.addToRenderList(x,v);if(this.info.render.frame++,Oe===!0)Fe.beginShadows();let L=m.state.shadowsArray;if(Ae.render(L,v,b),Oe===!0)Fe.endShadows();if(this.info.autoReset===!0)this.info.reset();let F=x.opaque,O=x.transmissive;if(m.setupLights(),b.isArrayCamera){let N=b.cameras;if(O.length>0)for(let j=0,J=N.length;j<J;j++){let K=N[j];Rl(F,O,v,K)}if(We)Ve.render(v);for(let j=0,J=N.length;j<J;j++){let K=N[j];Al(x,v,K,K.viewport)}}else{if(O.length>0)Rl(F,O,v,b);if(We)Ve.render(v);Al(x,v,b)}if(E!==null&&R===0)Se.updateMultisampleRenderTarget(E),Se.updateRenderTargetMipmap(E);if(v.isScene===!0)v.onAfterRender(y,v,b);if(ke.resetDefaultState(),D=-1,w=null,M.pop(),M.length>0){if(m=M[M.length-1],Oe===!0)Fe.setGlobalState(y.clippingPlanes,m.state.camera)}else m=null;if(p.pop(),p.length>0)x=p[p.length-1];else x=null};function Co(v,b,L,F){if(v.visible===!1)return;if(v.layers.test(b.layers)){if(v.isGroup)L=v.renderOrder;else if(v.isLOD){if(v.autoUpdate===!0)v.update(b)}else if(v.isLight){if(m.pushLight(v),v.castShadow)m.pushShadow(v)}else if(v.isSprite){if(!v.frustumCulled||Ge.intersectsSprite(v)){if(F)le.setFromMatrixPosition(v.matrixWorld).applyMatrix4(Y);let j=A.update(v),J=v.material;if(J.visible)x.push(v,j,J,L,le.z,null)}}else if(v.isMesh||v.isLine||v.isPoints){if(!v.frustumCulled||Ge.intersectsObject(v)){let j=A.update(v),J=v.material;if(F){if(v.boundingSphere!==void 0){if(v.boundingSphere===null)v.computeBoundingSphere();le.copy(v.boundingSphere.center)}else{if(j.boundingSphere===null)j.computeBoundingSphere();le.copy(j.boundingSphere.center)}le.applyMatrix4(v.matrixWorld).applyMatrix4(Y)}if(Array.isArray(J)){let K=j.groups;for(let ee=0,he=K.length;ee<he;ee++){let ie=K[ee],_e=J[ie.materialIndex];if(_e&&_e.visible)x.push(v,j,_e,L,le.z,ie)}}else if(J.visible)x.push(v,j,J,L,le.z,null)}}}let N=v.children;for(let j=0,J=N.length;j<J;j++)Co(N[j],b,L,F)}function Al(v,b,L,F){let{opaque:O,transmissive:N,transparent:j}=v;if(m.setupLightsView(L),Oe===!0)Fe.setGlobalState(y.clippingPlanes,L);if(F)de.viewport(T.copy(F));if(O.length>0)Cs(O,b,L);if(N.length>0)Cs(N,b,L);if(j.length>0)Cs(j,b,L);de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Rl(v,b,L,F){if((L.isScene===!0?L.overrideMaterial:null)!==null)return;if(m.state.transmissionRenderTarget[F.id]===void 0)m.state.transmissionRenderTarget[F.id]=new Ft(1,1,{generateMipmaps:!0,type:pe.has("EXT_color_buffer_half_float")||pe.has("EXT_color_buffer_float")?It:pi,minFilter:$n,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:mt.workingColorSpace});let N=m.state.transmissionRenderTarget[F.id],j=F.viewport||T;N.setSize(j.z*y.transmissionResolutionScale,j.w*y.transmissionResolutionScale);let J=y.getRenderTarget(),K=y.getActiveCubeFace(),ee=y.getActiveMipmapLevel();if(y.setRenderTarget(N),y.getClearColor(H),k=y.getClearAlpha(),k<1)y.setClearColor(16777215,0.5);if(y.clear(),We)Ve.render(L);let he=y.toneMapping;y.toneMapping=Ci;let ie=F.viewport;if(F.viewport!==void 0)F.viewport=void 0;if(m.setupLightsView(F),Oe===!0)Fe.setGlobalState(y.clippingPlanes,F);if(Cs(v,L,F),Se.updateMultisampleRenderTarget(N),Se.updateRenderTargetMipmap(N),pe.has("WEBGL_multisampled_render_to_texture")===!1){let _e=!1;for(let De=0,we=b.length;De<we;De++){let Re=b[De],{object:Ue,geometry:Le,material:Qe,group:je}=Re;if(Qe.side===$t&&Ue.layers.test(F.layers)){let ut=Qe.side;Qe.side=vn,Qe.needsUpdate=!0,Cl(Ue,L,F,Le,Qe,je),Qe.side=ut,Qe.needsUpdate=!0,_e=!0}}if(_e===!0)Se.updateMultisampleRenderTarget(N),Se.updateRenderTargetMipmap(N)}if(y.setRenderTarget(J,K,ee),y.setClearColor(H,k),ie!==void 0)F.viewport=ie;y.toneMapping=he}function Cs(v,b,L){let F=b.isScene===!0?b.overrideMaterial:null;for(let O=0,N=v.length;O<N;O++){let j=v[O],{object:J,geometry:K,group:ee,material:he}=j;if(he.allowOverride===!0&&F!==null)he=F;if(J.layers.test(L.layers))Cl(J,b,L,K,he,ee)}}function Cl(v,b,L,F,O,N){if(v.onBeforeRender(y,b,L,F,O,N),v.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),O.onBeforeRender(y,b,L,F,v,N),O.transparent===!0&&O.side===$t&&O.forceSinglePass===!1)O.side=vn,O.needsUpdate=!0,y.renderBufferDirect(L,b,F,O,v,N),O.side=Yi,O.needsUpdate=!0,y.renderBufferDirect(L,b,F,O,v,N),O.side=$t;else y.renderBufferDirect(L,b,F,O,v,N);v.onAfterRender(y,b,L,F,O,N)}function wr(v,b,L){if(b.isScene!==!0)b=Ee;let F=be.get(v),O=m.state.lights,N=m.state.shadowsArray,j=O.state.version,J=Z.getParameters(v,O.state,N,b,L),K=Z.getProgramCacheKey(J),ee=F.programs;if(F.environment=v.isMeshStandardMaterial?b.environment:null,F.fog=b.fog,F.envMap=(v.isMeshStandardMaterial?tt:st).get(v.envMap||F.environment),F.envMapRotation=F.environment!==null&&v.envMap===null?b.environmentRotation:v.envMapRotation,ee===void 0)v.addEventListener("dispose",Te),ee=new Map,F.programs=ee;let he=ee.get(K);if(he!==void 0){if(F.currentProgram===he&&F.lightsStateVersion===j)return Pl(v,J),he}else J.uniforms=Z.getUniforms(v),v.onBeforeCompile(J,y),he=Z.acquireProgram(J,K),ee.set(K,he),F.uniforms=J.uniforms;let ie=F.uniforms;if(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)ie.clippingPlanes=Fe.uniform;if(Pl(v,J),F.needsLights=pu(v),F.lightsStateVersion=j,F.needsLights)ie.ambientLightColor.value=O.state.ambient,ie.lightProbe.value=O.state.probe,ie.directionalLights.value=O.state.directional,ie.directionalLightShadows.value=O.state.directionalShadow,ie.spotLights.value=O.state.spot,ie.spotLightShadows.value=O.state.spotShadow,ie.rectAreaLights.value=O.state.rectArea,ie.ltc_1.value=O.state.rectAreaLTC1,ie.ltc_2.value=O.state.rectAreaLTC2,ie.pointLights.value=O.state.point,ie.pointLightShadows.value=O.state.pointShadow,ie.hemisphereLights.value=O.state.hemi,ie.directionalShadowMap.value=O.state.directionalShadowMap,ie.directionalShadowMatrix.value=O.state.directionalShadowMatrix,ie.spotShadowMap.value=O.state.spotShadowMap,ie.spotLightMatrix.value=O.state.spotLightMatrix,ie.spotLightMap.value=O.state.spotLightMap,ie.pointShadowMap.value=O.state.pointShadowMap,ie.pointShadowMatrix.value=O.state.pointShadowMatrix;return F.currentProgram=he,F.uniformsList=null,he}function Il(v){if(v.uniformsList===null){let b=v.currentProgram.getUniforms();v.uniformsList=Ja.seqWithValue(b.seq,v.uniforms)}return v.uniformsList}function Pl(v,b){let L=be.get(v);L.outputColorSpace=b.outputColorSpace,L.batching=b.batching,L.batchingColor=b.batchingColor,L.instancing=b.instancing,L.instancingColor=b.instancingColor,L.instancingMorph=b.instancingMorph,L.skinning=b.skinning,L.morphTargets=b.morphTargets,L.morphNormals=b.morphNormals,L.morphColors=b.morphColors,L.morphTargetsCount=b.morphTargetsCount,L.numClippingPlanes=b.numClippingPlanes,L.numIntersection=b.numClipIntersection,L.vertexAlphas=b.vertexAlphas,L.vertexTangents=b.vertexTangents,L.toneMapping=b.toneMapping}function Dl(v,b,L,F,O){if(b.isScene!==!0)b=Ee;Se.resetTextureUnits();let N=b.fog,j=F.isMeshStandardMaterial?b.environment:null,J=E===null?y.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Dt,K=(F.isMeshStandardMaterial?tt:st).get(F.envMap||j),ee=F.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,he=!!L.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),ie=!!L.morphAttributes.position,_e=!!L.morphAttributes.normal,De=!!L.morphAttributes.color,we=Ci;if(F.toneMapped){if(E===null||E.isXRRenderTarget===!0)we=y.toneMapping}let Re=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,Ue=Re!==void 0?Re.length:0,Le=be.get(F),Qe=m.state.lights;if(Oe===!0){if(G===!0||v!==w){let Lt=v===w&&F.id===D;Fe.setState(F,v,Lt)}}let je=!1;if(F.version===Le.__version){if(Le.needsLights&&Le.lightsStateVersion!==Qe.state.version)je=!0;else if(Le.outputColorSpace!==J)je=!0;else if(O.isBatchedMesh&&Le.batching===!1)je=!0;else if(!O.isBatchedMesh&&Le.batching===!0)je=!0;else if(O.isBatchedMesh&&Le.batchingColor===!0&&O.colorTexture===null)je=!0;else if(O.isBatchedMesh&&Le.batchingColor===!1&&O.colorTexture!==null)je=!0;else if(O.isInstancedMesh&&Le.instancing===!1)je=!0;else if(!O.isInstancedMesh&&Le.instancing===!0)je=!0;else if(O.isSkinnedMesh&&Le.skinning===!1)je=!0;else if(!O.isSkinnedMesh&&Le.skinning===!0)je=!0;else if(O.isInstancedMesh&&Le.instancingColor===!0&&O.instanceColor===null)je=!0;else if(O.isInstancedMesh&&Le.instancingColor===!1&&O.instanceColor!==null)je=!0;else if(O.isInstancedMesh&&Le.instancingMorph===!0&&O.morphTexture===null)je=!0;else if(O.isInstancedMesh&&Le.instancingMorph===!1&&O.morphTexture!==null)je=!0;else if(Le.envMap!==K)je=!0;else if(F.fog===!0&&Le.fog!==N)je=!0;else if(Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==Fe.numPlanes||Le.numIntersection!==Fe.numIntersection))je=!0;else if(Le.vertexAlphas!==ee)je=!0;else if(Le.vertexTangents!==he)je=!0;else if(Le.morphTargets!==ie)je=!0;else if(Le.morphNormals!==_e)je=!0;else if(Le.morphColors!==De)je=!0;else if(Le.toneMapping!==we)je=!0;else if(Le.morphTargetsCount!==Ue)je=!0}else je=!0,Le.__version=F.version;let ut=Le.currentProgram;if(je===!0)ut=wr(F,b,O);let $e=!1,yt=!1,Ut=!1,nt=ut.getUniforms(),ot=Le.uniforms;if(de.useProgram(ut.program))$e=!0,yt=!0,Ut=!0;if(F.id!==D)D=F.id,yt=!0;if($e||w!==v){if(de.buffers.depth.getReversed()&&v.reversedDepth!==!0)v._reversedDepth=!0,v.updateProjectionMatrix();nt.setValue(z,"projectionMatrix",v.projectionMatrix),nt.setValue(z,"viewMatrix",v.matrixWorldInverse);let qt=nt.map.cameraPosition;if(qt!==void 0)qt.setValue(z,te.setFromMatrixPosition(v.matrixWorld));if(me.logarithmicDepthBuffer)nt.setValue(z,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2));if(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)nt.setValue(z,"isOrthographic",v.isOrthographicCamera===!0);if(w!==v)w=v,yt=!0,Ut=!0}if(O.isSkinnedMesh){nt.setOptional(z,O,"bindMatrix"),nt.setOptional(z,O,"bindMatrixInverse");let Lt=O.skeleton;if(Lt){if(Lt.boneTexture===null)Lt.computeBoneTexture();nt.setValue(z,"boneTexture",Lt.boneTexture,Se)}}if(O.isBatchedMesh){if(nt.setOptional(z,O,"batchingTexture"),nt.setValue(z,"batchingTexture",O._matricesTexture,Se),nt.setOptional(z,O,"batchingIdTexture"),nt.setValue(z,"batchingIdTexture",O._indirectTexture,Se),nt.setOptional(z,O,"batchingColorTexture"),O._colorsTexture!==null)nt.setValue(z,"batchingColorTexture",O._colorsTexture,Se)}let gt=L.morphAttributes;if(gt.position!==void 0||gt.normal!==void 0||gt.color!==void 0)Ke.update(O,L,ut);if(yt||Le.receiveShadow!==O.receiveShadow)Le.receiveShadow=O.receiveShadow,nt.setValue(z,"receiveShadow",O.receiveShadow);if(F.isMeshGouraudMaterial&&F.envMap!==null)ot.envMap.value=K,ot.flipEnvMap.value=K.isCubeTexture&&K.isRenderTargetTexture===!1?-1:1;if(F.isMeshStandardMaterial&&F.envMap===null&&b.environment!==null)ot.envMapIntensity.value=b.environmentIntensity;if(yt){if(nt.setValue(z,"toneMappingExposure",y.toneMappingExposure),Le.needsLights)Ll(ot,Ut);if(N&&F.fog===!0)ue.refreshFogUniforms(ot,N);ue.refreshMaterialUniforms(ot,F,re,q,m.state.transmissionRenderTarget[v.id]),Ja.upload(z,Il(Le),ot,Se)}if(F.isShaderMaterial&&F.uniformsNeedUpdate===!0)Ja.upload(z,Il(Le),ot,Se),F.uniformsNeedUpdate=!1;if(F.isSpriteMaterial)nt.setValue(z,"center",O.center);if(nt.setValue(z,"modelViewMatrix",O.modelViewMatrix),nt.setValue(z,"normalMatrix",O.normalMatrix),nt.setValue(z,"modelMatrix",O.matrixWorld),F.isShaderMaterial||F.isRawShaderMaterial){let Lt=F.uniformsGroups;for(let qt=0,Rn=Lt.length;qt<Rn;qt++){let qn=Lt[qt];Ce.update(qn,ut),Ce.bind(qn,ut)}}return ut}function Ll(v,b){v.ambientLightColor.needsUpdate=b,v.lightProbe.needsUpdate=b,v.directionalLights.needsUpdate=b,v.directionalLightShadows.needsUpdate=b,v.pointLights.needsUpdate=b,v.pointLightShadows.needsUpdate=b,v.spotLights.needsUpdate=b,v.spotLightShadows.needsUpdate=b,v.rectAreaLights.needsUpdate=b,v.hemisphereLights.needsUpdate=b}function pu(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(v,b,L){let F=be.get(v);if(F.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,F.__autoAllocateDepthBuffer===!1)F.__useRenderToTexture=!1;be.get(v.texture).__webglTexture=b,be.get(v.depthTexture).__webglTexture=F.__autoAllocateDepthBuffer?void 0:L,F.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,b){let L=be.get(v);L.__webglFramebuffer=b,L.__useDefaultFramebuffer=b===void 0};let Bi=z.createFramebuffer();this.setRenderTarget=function(v,b=0,L=0){E=v,C=b,R=L;let F=!0,O=null,N=!1,j=!1;if(v){let K=be.get(v);if(K.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(z.FRAMEBUFFER,null),F=!1;else if(K.__webglFramebuffer===void 0)Se.setupRenderTarget(v);else if(K.__hasExternalTextures)Se.rebindTextures(v,be.get(v.texture).__webglTexture,be.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let ie=v.depthTexture;if(K.__boundDepthTexture!==ie){if(ie!==null&&be.has(ie)&&(v.width!==ie.image.width||v.height!==ie.image.height))throw Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Se.setupDepthRenderbuffer(v)}}let ee=v.texture;if(ee.isData3DTexture||ee.isDataArrayTexture||ee.isCompressedArrayTexture)j=!0;let he=be.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget){if(Array.isArray(he[b]))O=he[b][L];else O=he[b];N=!0}else if(v.samples>0&&Se.useMultisampledRTT(v)===!1)O=be.get(v).__webglMultisampledFramebuffer;else if(Array.isArray(he))O=he[L];else O=he;T.copy(v.viewport),P.copy(v.scissor),B=v.scissorTest}else T.copy(ae).multiplyScalar(re).floor(),P.copy(ge).multiplyScalar(re).floor(),B=ve;if(L!==0)O=Bi;if(de.bindFramebuffer(z.FRAMEBUFFER,O)&&F)de.drawBuffers(v,O);if(de.viewport(T),de.scissor(P),de.setScissorTest(B),N){let K=be.get(v.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+b,K.__webglTexture,L)}else if(j){let K=b;for(let ee=0;ee<v.textures.length;ee++){let he=be.get(v.textures[ee]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+ee,he.__webglTexture,L,K)}}else if(v!==null&&L!==0){let K=be.get(v.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,K.__webglTexture,L)}D=-1},this.readRenderTargetPixels=function(v,b,L,F,O,N,j,J=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let K=be.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&j!==void 0)K=K[j];if(K){de.bindFramebuffer(z.FRAMEBUFFER,K);try{let ee=v.textures[J],{format:he,type:ie}=ee;if(!me.textureFormatReadable(he)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!me.textureTypeReadable(ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(b>=0&&b<=v.width-F&&(L>=0&&L<=v.height-O)){if(v.textures.length>1)z.readBuffer(z.COLOR_ATTACHMENT0+J);z.readPixels(b,L,F,O,Ze.convert(he),Ze.convert(ie),N)}}finally{let ee=E!==null?be.get(E).__webglFramebuffer:null;de.bindFramebuffer(z.FRAMEBUFFER,ee)}}},this.readRenderTargetPixelsAsync=async function(v,b,L,F,O,N,j,J=0){if(!(v&&v.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let K=be.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&j!==void 0)K=K[j];if(K)if(b>=0&&b<=v.width-F&&(L>=0&&L<=v.height-O)){de.bindFramebuffer(z.FRAMEBUFFER,K);let ee=v.textures[J],{format:he,type:ie}=ee;if(!me.textureFormatReadable(he))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!me.textureTypeReadable(ie))throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let _e=z.createBuffer();if(z.bindBuffer(z.PIXEL_PACK_BUFFER,_e),z.bufferData(z.PIXEL_PACK_BUFFER,N.byteLength,z.STREAM_READ),v.textures.length>1)z.readBuffer(z.COLOR_ATTACHMENT0+J);z.readPixels(b,L,F,O,Ze.convert(he),Ze.convert(ie),0);let De=E!==null?be.get(E).__webglFramebuffer:null;de.bindFramebuffer(z.FRAMEBUFFER,De);let we=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await $0(z,we,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,_e),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,N),z.deleteBuffer(_e),z.deleteSync(we),N}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,b=null,L=0){let F=Math.pow(2,-L),O=Math.floor(v.image.width*F),N=Math.floor(v.image.height*F),j=b!==null?b.x:0,J=b!==null?b.y:0;Se.setTexture2D(v,0),z.copyTexSubImage2D(z.TEXTURE_2D,L,0,0,j,J,O,N),de.unbindTexture()};let wi=z.createFramebuffer(),_=z.createFramebuffer();if(this.copyTextureToTexture=function(v,b,L=null,F=null,O=0,N=null){if(N===null)if(O!==0)Yr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),N=O,O=0;else N=0;let j,J,K,ee,he,ie,_e,De,we,Re=v.isCompressedTexture?v.mipmaps[N]:v.image;if(L!==null)j=L.max.x-L.min.x,J=L.max.y-L.min.y,K=L.isBox3?L.max.z-L.min.z:1,ee=L.min.x,he=L.min.y,ie=L.isBox3?L.min.z:0;else{let gt=Math.pow(2,-O);if(j=Math.floor(Re.width*gt),J=Math.floor(Re.height*gt),v.isDataArrayTexture)K=Re.depth;else if(v.isData3DTexture)K=Math.floor(Re.depth*gt);else K=1;ee=0,he=0,ie=0}if(F!==null)_e=F.x,De=F.y,we=F.z;else _e=0,De=0,we=0;let Ue=Ze.convert(b.format),Le=Ze.convert(b.type),Qe;if(b.isData3DTexture)Se.setTexture3D(b,0),Qe=z.TEXTURE_3D;else if(b.isDataArrayTexture||b.isCompressedArrayTexture)Se.setTexture2DArray(b,0),Qe=z.TEXTURE_2D_ARRAY;else Se.setTexture2D(b,0),Qe=z.TEXTURE_2D;z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,b.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,b.unpackAlignment);let je=z.getParameter(z.UNPACK_ROW_LENGTH),ut=z.getParameter(z.UNPACK_IMAGE_HEIGHT),$e=z.getParameter(z.UNPACK_SKIP_PIXELS),yt=z.getParameter(z.UNPACK_SKIP_ROWS),Ut=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,Re.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Re.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,ee),z.pixelStorei(z.UNPACK_SKIP_ROWS,he),z.pixelStorei(z.UNPACK_SKIP_IMAGES,ie);let nt=v.isDataArrayTexture||v.isData3DTexture,ot=b.isDataArrayTexture||b.isData3DTexture;if(v.isDepthTexture){let gt=be.get(v),Lt=be.get(b),qt=be.get(gt.__renderTarget),Rn=be.get(Lt.__renderTarget);de.bindFramebuffer(z.READ_FRAMEBUFFER,qt.__webglFramebuffer),de.bindFramebuffer(z.DRAW_FRAMEBUFFER,Rn.__webglFramebuffer);for(let qn=0;qn<K;qn++){if(nt)z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,be.get(v).__webglTexture,O,ie+qn),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,be.get(b).__webglTexture,N,we+qn);z.blitFramebuffer(ee,he,j,J,_e,De,j,J,z.DEPTH_BUFFER_BIT,z.NEAREST)}de.bindFramebuffer(z.READ_FRAMEBUFFER,null),de.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(O!==0||v.isRenderTargetTexture||be.has(v)){let gt=be.get(v),Lt=be.get(b);de.bindFramebuffer(z.READ_FRAMEBUFFER,wi),de.bindFramebuffer(z.DRAW_FRAMEBUFFER,_);for(let qt=0;qt<K;qt++){if(nt)z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,gt.__webglTexture,O,ie+qt);else z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,gt.__webglTexture,O);if(ot)z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Lt.__webglTexture,N,we+qt);else z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Lt.__webglTexture,N);if(O!==0)z.blitFramebuffer(ee,he,j,J,_e,De,j,J,z.COLOR_BUFFER_BIT,z.NEAREST);else if(ot)z.copyTexSubImage3D(Qe,N,_e,De,we+qt,ee,he,j,J);else z.copyTexSubImage2D(Qe,N,_e,De,ee,he,j,J)}de.bindFramebuffer(z.READ_FRAMEBUFFER,null),de.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(ot)if(v.isDataTexture||v.isData3DTexture)z.texSubImage3D(Qe,N,_e,De,we,j,J,K,Ue,Le,Re.data);else if(b.isCompressedArrayTexture)z.compressedTexSubImage3D(Qe,N,_e,De,we,j,J,K,Ue,Re.data);else z.texSubImage3D(Qe,N,_e,De,we,j,J,K,Ue,Le,Re);else if(v.isDataTexture)z.texSubImage2D(z.TEXTURE_2D,N,_e,De,j,J,Ue,Le,Re.data);else if(v.isCompressedTexture)z.compressedTexSubImage2D(z.TEXTURE_2D,N,_e,De,Re.width,Re.height,Ue,Re.data);else z.texSubImage2D(z.TEXTURE_2D,N,_e,De,j,J,Ue,Le,Re);if(z.pixelStorei(z.UNPACK_ROW_LENGTH,je),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ut),z.pixelStorei(z.UNPACK_SKIP_PIXELS,$e),z.pixelStorei(z.UNPACK_SKIP_ROWS,yt),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Ut),N===0&&b.generateMipmaps)z.generateMipmap(Qe);de.unbindTexture()},this.initRenderTarget=function(v){if(be.get(v).__webglFramebuffer===void 0)Se.setupRenderTarget(v)},this.initTexture=function(v){if(v.isCubeTexture)Se.setTextureCube(v,0);else if(v.isData3DTexture)Se.setTexture3D(v,0);else if(v.isDataArrayTexture||v.isCompressedArrayTexture)Se.setTexture2DArray(v,0);else Se.setTexture2D(v,0);de.unbindTexture()},this.resetState=function(){C=0,R=0,E=null,de.reset(),ke.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ph}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=mt._getDrawingBufferColorSpace(e),t.unpackColorSpace=mt._getUnpackColorSpace()}}function Ew(e,t,n=!0){if(!t||!t.isReady)throw Error("BufferGeometryUtils: Initialized MikkTSpace library required.");if(!e.hasAttribute("position")||!e.hasAttribute("normal")||!e.hasAttribute("uv"))throw Error('BufferGeometryUtils: Tangents require "position", "normal", and "uv" attributes.');function i(o){if(o.normalized||o.isInterleavedBufferAttribute){let a=new Float32Array(o.count*o.itemSize);for(let l=0,c=0;l<o.count;l++)if(a[c++]=o.getX(l),a[c++]=o.getY(l),o.itemSize>2)a[c++]=o.getZ(l);return a}if(o.array instanceof Float32Array)return o.array;return new Float32Array(o.array)}let s=e.index?e.toNonIndexed():e,r=t.generateTangents(i(s.attributes.position),i(s.attributes.normal),i(s.attributes.uv));if(n)for(let o=3;o<r.length;o+=4)r[o]*=-1;if(s.setAttribute("tangent",new at(r,4)),e!==s)e.copy(s);return e}function ja(e,t=!1){let n=e[0].index!==null,i=new Set(Object.keys(e[0].attributes)),s=new Set(Object.keys(e[0].morphAttributes)),r={},o={},a=e[0].morphTargetsRelative,l=new Je,c=0;for(let h=0;h<e.length;++h){let u=e[h],f=0;if(n!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in u.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;if(r[d]===void 0)r[d]=[];r[d].push(u.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in u.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;if(o[d]===void 0)o[d]=[];o[d].push(u.morphAttributes[d])}if(t){let d;if(n)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(n){let h=0,u=[];for(let f=0;f<e.length;++f){let d=e[f].index;for(let g=0;g<d.count;++g)u.push(d.getX(g)+h);h+=e[f].attributes.position.count}l.setIndex(u)}for(let h in r){let u=tp(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){let d=[];for(let x=0;x<o[h].length;++x)d.push(o[h][x][f]);let g=tp(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function tp(e){let t,n,i,s=-1,r=0;for(let c=0;c<e.length;++c){let h=e[c];if(t===void 0)t=h.array.constructor;if(t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(n===void 0)n=h.itemSize;if(n!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0)i=h.normalized;if(i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1)s=h.gpuType;if(s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*n}let o=new t(r),a=new at(o,n,i),l=0;for(let c=0;c<e.length;++c){let h=e[c];if(h.isInterleavedBufferAttribute){let u=l/n;for(let f=0,d=h.count;f<d;f++)for(let g=0;g<n;g++){let x=h.getComponent(f,g);a.setComponent(f+u,g,x)}}else o.set(h.array,l);l+=h.count*n}if(s!==void 0)a.gpuType=s;return a}function Aw(e){if(e.isInstancedInterleavedBufferAttribute||e.isInterleavedBufferAttribute)return iu(e);if(e.isInstancedBufferAttribute)return new Tn().copy(e);return new at().copy(e)}function Rw(e){let t,n=0,i=0;for(let c=0,h=e.length;c<h;++c){let u=e[c];if(t===void 0)t=u.array.constructor;if(t!==u.array.constructor)return console.error("AttributeBuffers of different types cannot be interleaved"),null;n+=u.array.length,i+=u.itemSize}let s=new Ii(new t(n),i),r=0,o=[],a=["getX","getY","getZ","getW"],l=["setX","setY","setZ","setW"];for(let c=0,h=e.length;c<h;c++){let u=e[c],{itemSize:f,count:d}=u,g=new Kn(s,f,r,u.normalized);o.push(g),r+=f;for(let x=0;x<d;x++)for(let m=0;m<f;m++)g[l[m]](x,u[a[m]](x))}return o}function iu(e){let t=e.data.array.constructor,{count:n,itemSize:i,normalized:s}=e,r=new t(n*i),o;if(e.isInstancedInterleavedBufferAttribute)o=new Tn(r,i,s,e.meshPerAttribute);else o=new at(r,i,s);for(let a=0;a<n;a++){if(o.setX(a,e.getX(a)),i>=2)o.setY(a,e.getY(a));if(i>=3)o.setZ(a,e.getZ(a));if(i>=4)o.setW(a,e.getW(a))}return o}function Cw(e){let{attributes:t,morphTargets:n}=e,i=new Map;for(let s in t){let r=t[s];if(r.isInterleavedBufferAttribute){if(!i.has(r))i.set(r,iu(r));t[s]=i.get(r)}}for(let s in n){let r=n[s];if(r.isInterleavedBufferAttribute){if(!i.has(r))i.set(r,iu(r));n[s]=i.get(r)}}}function Iw(e){let t=0;for(let i in e.attributes){let s=e.getAttribute(i);t+=s.count*s.itemSize*s.array.BYTES_PER_ELEMENT}let n=e.getIndex();return t+=n?n.count*n.itemSize*n.array.BYTES_PER_ELEMENT:0,t}function Pw(e,t=0.0001){t=Math.max(t,Number.EPSILON);let n={},i=e.getIndex(),s=e.getAttribute("position"),r=i?i.count:s.count,o=0,a=Object.keys(e.attributes),l={},c={},h=[],u=["getX","getY","getZ","getW"],f=["setX","setY","setZ","setW"];for(let M=0,y=a.length;M<y;M++){let S=a[M],C=e.attributes[S];l[S]=new C.constructor(new C.array.constructor(C.count*C.itemSize),C.itemSize,C.normalized);let R=e.morphAttributes[S];if(R){if(!c[S])c[S]=[];R.forEach((E,D)=>{let w=new E.array.constructor(E.count*E.itemSize);c[S][D]=new E.constructor(w,E.itemSize,E.normalized)})}}let d=t*0.5,g=Math.log10(1/t),x=Math.pow(10,g),m=d*x;for(let M=0;M<r;M++){let y=i?i.getX(M):M,S="";for(let C=0,R=a.length;C<R;C++){let E=a[C],D=e.getAttribute(E),w=D.itemSize;for(let T=0;T<w;T++)S+=`${~~(D[u[T]](y)*x+m)},`}if(S in n)h.push(n[S]);else{for(let C=0,R=a.length;C<R;C++){let E=a[C],D=e.getAttribute(E),w=e.morphAttributes[E],T=D.itemSize,P=l[E],B=c[E];for(let H=0;H<T;H++){let k=u[H],X=f[H];if(P[X](o,D[k](y)),w)for(let q=0,re=w.length;q<re;q++)B[q][X](o,w[q][k](y))}}n[S]=o,h.push(o),o++}}let p=e.clone();for(let M in e.attributes){let y=l[M];if(p.setAttribute(M,new y.constructor(y.array.slice(0,o*y.itemSize),y.itemSize,y.normalized)),!(M in c))continue;for(let S=0;S<c[M].length;S++){let C=c[M][S];p.morphAttributes[M][S]=new C.constructor(C.array.slice(0,o*C.itemSize),C.itemSize,C.normalized)}}return p.setIndex(h),p}function su(e,t){if(t===hh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t===$s||t===to){let n=e.getIndex();if(n===null){let o=[],a=e.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);e.setIndex(o),n=e.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e}let i=n.count-2,s=[];if(t===$s)for(let o=1;o<=i;o++)s.push(n.getX(0)),s.push(n.getX(o)),s.push(n.getX(o+1));else for(let o=0;o<i;o++)if(o%2===0)s.push(n.getX(o)),s.push(n.getX(o+1)),s.push(n.getX(o+2));else s.push(n.getX(o+2)),s.push(n.getX(o+1)),s.push(n.getX(o));if(s.length/3!==i)console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=e.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e}function Dw(e){let t=new I,n=new I,i=new I,s=new I,r=new I,o=new I,a=new I,l=new I,c=new I;function h(Q,ae,ge,ve,Ge,Oe,G,Y){t.fromBufferAttribute(ae,Ge),n.fromBufferAttribute(ae,Oe),i.fromBufferAttribute(ae,G);let te=Q.morphTargetInfluences;if(ge&&te){a.set(0,0,0),l.set(0,0,0),c.set(0,0,0);for(let le=0,Ee=ge.length;le<Ee;le++){let We=te[le],ct=ge[le];if(We===0)continue;if(s.fromBufferAttribute(ct,Ge),r.fromBufferAttribute(ct,Oe),o.fromBufferAttribute(ct,G),ve)a.addScaledVector(s,We),l.addScaledVector(r,We),c.addScaledVector(o,We);else a.addScaledVector(s.sub(t),We),l.addScaledVector(r.sub(n),We),c.addScaledVector(o.sub(i),We)}t.add(a),n.add(l),i.add(c)}if(Q.isSkinnedMesh)Q.applyBoneTransform(Ge,t),Q.applyBoneTransform(Oe,n),Q.applyBoneTransform(G,i);Y[Ge*3+0]=t.x,Y[Ge*3+1]=t.y,Y[Ge*3+2]=t.z,Y[Oe*3+0]=n.x,Y[Oe*3+1]=n.y,Y[Oe*3+2]=n.z,Y[G*3+0]=i.x,Y[G*3+1]=i.y,Y[G*3+2]=i.z}let{geometry:u,material:f}=e,d,g,x,m=u.index,p=u.attributes.position,M=u.morphAttributes.position,y=u.morphTargetsRelative,S=u.attributes.normal,C=u.morphAttributes.position,{groups:R,drawRange:E}=u,D,w,T,P,B,H,k,X=new Float32Array(p.count*p.itemSize),q=new Float32Array(S.count*S.itemSize);if(m!==null)if(Array.isArray(f))for(D=0,T=R.length;D<T;D++){B=R[D],H=Math.max(B.start,E.start),k=Math.min(B.start+B.count,E.start+E.count);for(w=H,P=k;w<P;w+=3)d=m.getX(w),g=m.getX(w+1),x=m.getX(w+2),h(e,p,M,y,d,g,x,X),h(e,S,C,y,d,g,x,q)}else{H=Math.max(0,E.start),k=Math.min(m.count,E.start+E.count);for(D=H,T=k;D<T;D+=3)d=m.getX(D),g=m.getX(D+1),x=m.getX(D+2),h(e,p,M,y,d,g,x,X),h(e,S,C,y,d,g,x,q)}else if(Array.isArray(f))for(D=0,T=R.length;D<T;D++){B=R[D],H=Math.max(B.start,E.start),k=Math.min(B.start+B.count,E.start+E.count);for(w=H,P=k;w<P;w+=3)d=w,g=w+1,x=w+2,h(e,p,M,y,d,g,x,X),h(e,S,C,y,d,g,x,q)}else{H=Math.max(0,E.start),k=Math.min(p.count,E.start+E.count);for(D=H,T=k;D<T;D+=3)d=D,g=D+1,x=D+2,h(e,p,M,y,d,g,x,X),h(e,S,C,y,d,g,x,q)}let re=new ze(X,3),W=new ze(q,3);return{positionAttribute:p,normalAttribute:S,morphedPositionAttribute:re,morphedNormalAttribute:W}}function Lw(e){if(e.groups.length===0)return console.warn("THREE.BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge."),e;let t=e.groups;if(t=t.sort((o,a)=>{if(o.materialIndex!==a.materialIndex)return o.materialIndex-a.materialIndex;return o.start-a.start}),e.getIndex()===null){let o=e.getAttribute("position"),a=[];for(let l=0;l<o.count;l+=3)a.push(l,l+1,l+2);e.setIndex(a)}let n=e.getIndex(),i=[];for(let o=0;o<t.length;o++){let a=t[o],l=a.start,c=l+a.count;for(let h=l;h<c;h++)i.push(n.getX(h))}e.dispose(),e.setIndex(i);let s=0;for(let o=0;o<t.length;o++){let a=t[o];a.start=s,s+=a.count}let r=t[0];e.groups=[r];for(let o=1;o<t.length;o++){let a=t[o];if(r.materialIndex===a.materialIndex)r.count+=a.count;else r=a,e.groups.push(r)}return e}function Nw(e,t=Math.PI/3){let n=Math.cos(t),i=100.00000001000001,s=[new I,new I,new I],r=new I,o=new I,a=new I,l=new I;function c(x){let m=~~(x.x*100.00000001000001),p=~~(x.y*100.00000001000001),M=~~(x.z*100.00000001000001);return`${m},${p},${M}`}let h=e.index?e.toNonIndexed():e,u=h.attributes.position,f={};for(let x=0,m=u.count/3;x<m;x++){let p=3*x,M=s[0].fromBufferAttribute(u,p+0),y=s[1].fromBufferAttribute(u,p+1),S=s[2].fromBufferAttribute(u,p+2);r.subVectors(S,y),o.subVectors(M,y);let C=new I().crossVectors(r,o).normalize();for(let R=0;R<3;R++){let E=s[R],D=c(E);if(!(D in f))f[D]=[];f[D].push(C)}}let d=new Float32Array(u.count*3),g=new at(d,3,!1);for(let x=0,m=u.count/3;x<m;x++){let p=3*x,M=s[0].fromBufferAttribute(u,p+0),y=s[1].fromBufferAttribute(u,p+1),S=s[2].fromBufferAttribute(u,p+2);r.subVectors(S,y),o.subVectors(M,y),a.crossVectors(r,o).normalize();for(let C=0;C<3;C++){let R=s[C],E=c(R),D=f[E];l.set(0,0,0);for(let w=0,T=D.length;w<T;w++){let P=D[w];if(a.dot(P)>n)l.add(P)}l.normalize(),g.setXYZ(p+C,l.x,l.y,l.z)}}return h.setAttribute("normal",g),h}class ru extends an{constructor(e){super(e);this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new rv(t)}),this.register(function(t){return new ov(t)}),this.register(function(t){return new mv(t)}),this.register(function(t){return new gv(t)}),this.register(function(t){return new vv(t)}),this.register(function(t){return new lv(t)}),this.register(function(t){return new cv(t)}),this.register(function(t){return new hv(t)}),this.register(function(t){return new uv(t)}),this.register(function(t){return new sv(t)}),this.register(function(t){return new fv(t)}),this.register(function(t){return new av(t)}),this.register(function(t){return new pv(t)}),this.register(function(t){return new dv(t)}),this.register(function(t){return new nv(t)}),this.register(function(t){return new xv(t)}),this.register(function(t){return new yv(t)})}load(e,t,n,i){let s=this,r;if(this.resourcePath!=="")r=this.resourcePath;else if(this.path!==""){let l=ui.extractUrlBase(e);r=ui.resolveURL(l,this.path)}else r=ui.extractUrlBase(e);this.manager.itemStart(e);let o=function(l){if(i)i(l);else console.error(l);s.manager.itemError(e),s.manager.itemEnd(e)},a=new Pn(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(l){try{s.parse(l,r,function(c){t(c),s.manager.itemEnd(e)},o)}catch(c){o(c)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){if(this.pluginCallbacks.indexOf(e)===-1)this.pluginCallbacks.push(e);return this}unregister(e){if(this.pluginCallbacks.indexOf(e)!==-1)this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1);return this}parse(e,t,n,i){let s,r={},o={},a=new TextDecoder;if(typeof e==="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(a.decode(new Uint8Array(e,0,4))===_v){try{r[_t.KHR_BINARY_GLTF]=new Mv(e)}catch(h){if(i)i(h);return}s=JSON.parse(r[_t.KHR_BINARY_GLTF].content)}else s=JSON.parse(a.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){if(i)i(Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Ev(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let c=0;c<this.pluginCallbacks.length;c++){let h=this.pluginCallbacks[c](l);if(!h.name)console.error("THREE.GLTFLoader: Invalid plugin found: missing name");o[h.name]=h,r[h.name]=!0}if(s.extensionsUsed)for(let c=0;c<s.extensionsUsed.length;++c){let h=s.extensionsUsed[c],u=s.extensionsRequired||[];switch(h){case _t.KHR_MATERIALS_UNLIT:r[h]=new iv;break;case _t.KHR_DRACO_MESH_COMPRESSION:r[h]=new Sv(s,this.dracoLoader);break;case _t.KHR_TEXTURE_TRANSFORM:r[h]=new wv;break;case _t.KHR_MESH_QUANTIZATION:r[h]=new bv;break;default:if(u.indexOf(h)>=0&&o[h]===void 0)console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(r),l.setPlugins(o),l.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,s){n.parse(e,t,i,s)})}}function Uw(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}var _t={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class nv{constructor(e){this.parser=e,this.name=_t.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let s=t[n];if(s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0)e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let s=t.json,a=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],l,c=new fe(16777215);if(a.color!==void 0)c.setRGB(a.color[0],a.color[1],a.color[2],Dt);let h=a.range!==void 0?a.range:0;switch(a.type){case"directional":l=new ws(c),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new vo(c),l.distance=h;break;case"spot":l=new Ss(c),l.distance=h,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle!==void 0?a.spot.innerConeAngle:0,a.spot.outerConeAngle=a.spot.outerConeAngle!==void 0?a.spot.outerConeAngle:Math.PI/4,l.angle=a.spot.outerConeAngle,l.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw Error("THREE.GLTFLoader: Unexpected light type: "+a.type)}if(l.position.set(0,0,0),Ni(l,a),a.intensity!==void 0)l.intensity=a.intensity;return l.name=t.createUniqueName(a.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e!=="light")return;return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],o=(s.extensions&&s.extensions[this.name]||{}).light;if(o===void 0)return null;return this._loadLight(o).then(function(a){return n._getNodeRef(t.cache,o,a)})}}class iv{constructor(){this.name=_t.KHR_MATERIALS_UNLIT}getMaterialType(){return on}extendParams(e,t,n){let i=[];e.color=new fe(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let r=s.baseColorFactor;e.color.setRGB(r[0],r[1],r[2],Dt),e.opacity=r[3]}if(s.baseColorTexture!==void 0)i.push(n.assignTexture(e,"map",s.baseColorTexture,en))}return Promise.all(i)}}class sv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name].emissiveStrength;if(s!==void 0)t.emissiveIntensity=s;return Promise.resolve()}}class rv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.clearcoatFactor!==void 0)t.clearcoat=r.clearcoatFactor;if(r.clearcoatTexture!==void 0)s.push(n.assignTexture(t,"clearcoatMap",r.clearcoatTexture));if(r.clearcoatRoughnessFactor!==void 0)t.clearcoatRoughness=r.clearcoatRoughnessFactor;if(r.clearcoatRoughnessTexture!==void 0)s.push(n.assignTexture(t,"clearcoatRoughnessMap",r.clearcoatRoughnessTexture));if(r.clearcoatNormalTexture!==void 0){if(s.push(n.assignTexture(t,"clearcoatNormalMap",r.clearcoatNormalTexture)),r.clearcoatNormalTexture.scale!==void 0){let o=r.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new se(o,o)}}return Promise.all(s)}}class ov{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class av{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.iridescenceFactor!==void 0)t.iridescence=r.iridescenceFactor;if(r.iridescenceTexture!==void 0)s.push(n.assignTexture(t,"iridescenceMap",r.iridescenceTexture));if(r.iridescenceIor!==void 0)t.iridescenceIOR=r.iridescenceIor;if(t.iridescenceThicknessRange===void 0)t.iridescenceThicknessRange=[100,400];if(r.iridescenceThicknessMinimum!==void 0)t.iridescenceThicknessRange[0]=r.iridescenceThicknessMinimum;if(r.iridescenceThicknessMaximum!==void 0)t.iridescenceThicknessRange[1]=r.iridescenceThicknessMaximum;if(r.iridescenceThicknessTexture!==void 0)s.push(n.assignTexture(t,"iridescenceThicknessMap",r.iridescenceThicknessTexture));return Promise.all(s)}}class lv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[];t.sheenColor=new fe(0,0,0),t.sheenRoughness=0,t.sheen=1;let r=i.extensions[this.name];if(r.sheenColorFactor!==void 0){let o=r.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Dt)}if(r.sheenRoughnessFactor!==void 0)t.sheenRoughness=r.sheenRoughnessFactor;if(r.sheenColorTexture!==void 0)s.push(n.assignTexture(t,"sheenColorMap",r.sheenColorTexture,en));if(r.sheenRoughnessTexture!==void 0)s.push(n.assignTexture(t,"sheenRoughnessMap",r.sheenRoughnessTexture));return Promise.all(s)}}class cv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.transmissionFactor!==void 0)t.transmission=r.transmissionFactor;if(r.transmissionTexture!==void 0)s.push(n.assignTexture(t,"transmissionMap",r.transmissionTexture));return Promise.all(s)}}class hv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.thickness=r.thicknessFactor!==void 0?r.thicknessFactor:0,r.thicknessTexture!==void 0)s.push(n.assignTexture(t,"thicknessMap",r.thicknessTexture));t.attenuationDistance=r.attenuationDistance||1/0;let o=r.attenuationColor||[1,1,1];return t.attenuationColor=new fe().setRGB(o[0],o[1],o[2],Dt),Promise.all(s)}}class uv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=i.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class fv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.specularIntensity=r.specularFactor!==void 0?r.specularFactor:1,r.specularTexture!==void 0)s.push(n.assignTexture(t,"specularIntensityMap",r.specularTexture));let o=r.specularColorFactor||[1,1,1];if(t.specularColor=new fe().setRGB(o[0],o[1],o[2],Dt),r.specularColorTexture!==void 0)s.push(n.assignTexture(t,"specularColorMap",r.specularColorTexture,en));return Promise.all(s)}}class dv{constructor(e){this.parser=e,this.name=_t.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(t.bumpScale=r.bumpFactor!==void 0?r.bumpFactor:1,r.bumpTexture!==void 0)s.push(n.assignTexture(t,"bumpMap",r.bumpTexture));return Promise.all(s)}}class pv{constructor(e){this.parser=e,this.name=_t.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];if(!n.extensions||!n.extensions[this.name])return null;return Ht}extendMaterialParams(e,t){let n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let s=[],r=i.extensions[this.name];if(r.anisotropyStrength!==void 0)t.anisotropy=r.anisotropyStrength;if(r.anisotropyRotation!==void 0)t.anisotropyRotation=r.anisotropyRotation;if(r.anisotropyTexture!==void 0)s.push(n.assignTexture(t,"anisotropyMap",r.anisotropyTexture));return Promise.all(s)}}class mv{constructor(e){this.parser=e,this.name=_t.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let s=i.extensions[this.name],r=t.options.ktx2Loader;if(!r)if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");else return null;return t.loadTextureImage(e,s.source,r)}}class gv{constructor(e){this.parser=e,this.name=_t.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],o=i.images[r.source],a=n.textureLoader;if(o.uri){let l=n.options.manager.getHandler(o.uri);if(l!==null)a=l}return n.loadTextureImage(e,r.source,a)}}class vv{constructor(e){this.parser=e,this.name=_t.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,s=i.textures[e];if(!s.extensions||!s.extensions[t])return null;let r=s.extensions[t],o=i.images[r.source],a=n.textureLoader;if(o.uri){let l=n.options.manager.getHandler(o.uri);if(l!==null)a=l}return n.loadTextureImage(e,r.source,a)}}class xv{constructor(e){this.name=_t.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],s=this.parser.getDependency("buffer",i.buffer),r=this.parser.options.meshoptDecoder;if(!r||!r.supported)if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");else return null;return s.then(function(o){let a=i.byteOffset||0,l=i.byteLength||0,{count:c,byteStride:h}=i,u=new Uint8Array(o,a,l);if(r.decodeGltfBufferAsync)return r.decodeGltfBufferAsync(c,h,u,i.mode,i.filter).then(function(f){return f.buffer});else return r.ready.then(function(){let f=new ArrayBuffer(c*h);return r.decodeGltfBuffer(new Uint8Array(f),c,h,u,i.mode,i.filter),f})})}else return null}}class yv{constructor(e){this.name=_t.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let l of i.primitives)if(l.mode!==ni.TRIANGLES&&l.mode!==ni.TRIANGLE_STRIP&&l.mode!==ni.TRIANGLE_FAN&&l.mode!==void 0)return null;let r=n.extensions[this.name].attributes,o=[],a={};for(let l in r)o.push(this.parser.getDependency("accessor",r[l]).then((c)=>(a[l]=c,a[l])));if(o.length<1)return null;return o.push(this.parser.createNodeMesh(e)),Promise.all(o).then((l)=>{let c=l.pop(),h=c.isGroup?c.children:[c],u=l[0].count,f=[];for(let d of h){let g=new He,x=new I,m=new Nt,p=new I(1,1,1),M=new Ln(d.geometry,d.material,u);for(let y=0;y<u;y++){if(a.TRANSLATION)x.fromBufferAttribute(a.TRANSLATION,y);if(a.ROTATION)m.fromBufferAttribute(a.ROTATION,y);if(a.SCALE)p.fromBufferAttribute(a.SCALE,y);M.setMatrixAt(y,g.compose(x,m,p))}for(let y in a)if(y==="_COLOR_0"){let S=a[y];M.instanceColor=new Tn(S.array,S.itemSize,S.normalized)}else if(y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE")d.geometry.setAttribute(y,a[y]);dt.prototype.copy.call(M,d),this.parser.assignFinalMaterial(M),f.push(M)}if(c.isGroup)return c.clear(),c.add(...f),c;return f[0]})}}var _v="glTF",Qa=12,Qg={JSON:1313821514,BIN:5130562};class Mv{constructor(e){this.name=_t.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Qa),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==_v)throw Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");else if(this.header.version<2)throw Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Qa,s=new DataView(e,Qa),r=0;while(r<i){let o=s.getUint32(r,!0);r+=4;let a=s.getUint32(r,!0);if(r+=4,a===Qg.JSON){let l=new Uint8Array(e,Qa+r,o);this.content=n.decode(l)}else if(a===Qg.BIN){let l=Qa+r;this.body=e.slice(l,l+o)}r+=o}if(this.content===null)throw Error("THREE.GLTFLoader: JSON content not found.")}}class Sv{constructor(e,t){if(!t)throw Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=_t.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,s=e.extensions[this.name].bufferView,r=e.extensions[this.name].attributes,o={},a={},l={};for(let c in r){let h=op[c]||c.toLowerCase();o[h]=r[c]}for(let c in e.attributes){let h=op[c]||c.toLowerCase();if(r[c]!==void 0){let u=n.accessors[e.attributes[c]],f=So[u.componentType];l[h]=f.name,a[h]=u.normalized===!0}}return t.getDependency("bufferView",s).then(function(c){return new Promise(function(h,u){i.decodeDracoFile(c,function(f){for(let d in f.attributes){let g=f.attributes[d],x=a[d];if(x!==void 0)g.normalized=x}h(f)},o,l,Dt,u)})})}}class wv{constructor(){this.name=_t.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0)e.channel=t.texCoord;if(t.offset!==void 0)e.offset.fromArray(t.offset);if(t.rotation!==void 0)e.rotation=t.rotation;if(t.scale!==void 0)e.repeat.fromArray(t.scale);return e.needsUpdate=!0,e}}class bv{constructor(){this.name=_t.KHR_MESH_QUANTIZATION}}class lp extends $i{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=e*i*3+i;for(let r=0;r!==i;r++)t[r]=n[s+r];return t}interpolate_(e,t,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=o*2,l=o*3,c=i-t,h=(n-t)/c,u=h*h,f=u*h,d=e*l,g=d-l,x=-2*f+3*u,m=f-u,p=1-x,M=m-u+h;for(let y=0;y!==o;y++){let S=r[g+y+o],C=r[g+y+a]*c,R=r[d+y+o],E=r[d+y]*c;s[y]=p*S+M*C+x*R+m*E}return s}}var Fw=new Nt;class Tv extends lp{interpolate_(e,t,n,i){let s=super.interpolate_(e,t,n,i);return Fw.fromArray(s).normalize().toArray(s),s}}var ni={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},So={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},$g={9728:xn,9729:Kt,9984:da,9985:js,9986:ms,9987:$n},ev={33071:ua,33648:fa,10497:cn},ip={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},op={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ts={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Ow={CUBICSPLINE:void 0,LINEAR:ya,STEP:ch},sp={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Bw(e){if(e.DefaultMaterial===void 0)e.DefaultMaterial=new Pt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Yi});return e.DefaultMaterial}function yr(e,t,n){for(let i in n.extensions)if(e[i]===void 0)t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[i]=n.extensions[i]}function Ni(e,t){if(t.extras!==void 0)if(typeof t.extras==="object")Object.assign(e.userData,t.extras);else console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras)}function zw(e,t,n){let i=!1,s=!1,r=!1;for(let c=0,h=t.length;c<h;c++){let u=t[c];if(u.POSITION!==void 0)i=!0;if(u.NORMAL!==void 0)s=!0;if(u.COLOR_0!==void 0)r=!0;if(i&&s&&r)break}if(!i&&!s&&!r)return Promise.resolve(e);let o=[],a=[],l=[];for(let c=0,h=t.length;c<h;c++){let u=t[c];if(i){let f=u.POSITION!==void 0?n.getDependency("accessor",u.POSITION):e.attributes.position;o.push(f)}if(s){let f=u.NORMAL!==void 0?n.getDependency("accessor",u.NORMAL):e.attributes.normal;a.push(f)}if(r){let f=u.COLOR_0!==void 0?n.getDependency("accessor",u.COLOR_0):e.attributes.color;l.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],f=c[2];if(i)e.morphAttributes.position=h;if(s)e.morphAttributes.normal=u;if(r)e.morphAttributes.color=f;return e.morphTargetsRelative=!0,e})}function Hw(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,i=t.weights.length;n<i;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let i=0,s=n.length;i<s;i++)e.morphTargetDictionary[n[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function kw(e){let t,n=e.extensions&&e.extensions[_t.KHR_DRACO_MESH_COMPRESSION];if(n)t="draco:"+n.bufferView+":"+n.indices+":"+rp(n.attributes);else t=e.indices+":"+rp(e.attributes)+":"+e.mode;if(e.targets!==void 0)for(let i=0,s=e.targets.length;i<s;i++)t+=":"+rp(e.targets[i]);return t}function rp(e){let t="",n=Object.keys(e).sort();for(let i=0,s=n.length;i<s;i++)t+=n[i]+":"+e[n[i]]+";";return t}function ap(e){switch(e){case Int8Array:return 0.007874015748031496;case Uint8Array:return 0.00392156862745098;case Int16Array:return 0.00003051850947599719;case Uint16Array:return 0.000015259021896696422;default:throw Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Gw(e){if(e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0)return"image/jpeg";if(e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0)return"image/webp";if(e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0)return"image/ktx2";return"image/png"}var Ww=new He;class Ev{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Uw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,s=!1,r=-1;if(typeof navigator<"u"){let o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;let a=o.match(/Version\/(\d+)/);i=n&&a?parseInt(a[1],10):-1,s=o.indexOf("Firefox")>-1,r=s?o.match(/Firefox\/([0-9]+)\./)[1]:-1}if(typeof createImageBitmap>"u"||n&&i<17||s&&r<98)this.textureLoader=new Va(this.options.manager);else this.textureLoader=new qa(this.options.manager);if(this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Pn(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials")this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(r){return r._markDefs&&r._markDefs()}),Promise.all(this._invokeAll(function(r){return r.beforeRoot&&r.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(r){let o={scene:r[0][i.scene||0],scenes:r[0],animations:r[1],cameras:r[2],asset:i.asset,parser:n,userData:{}};return yr(s,o,i),Ni(o,i),Promise.all(n._invokeAll(function(a){return a.afterRoot&&a.afterRoot(o)})).then(function(){for(let a of o.scenes)a.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,s=t.length;i<s;i++){let r=t[i].joints;for(let o=0,a=r.length;o<a;o++)e[r[o]].isBone=!0}for(let i=0,s=e.length;i<s;i++){let r=e[i];if(r.mesh!==void 0){if(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0)n[r.mesh].isSkinnedMesh=!0}if(r.camera!==void 0)this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){if(t===void 0)return;if(e.refs[t]===void 0)e.refs[t]=e.uses[t]=0;e.refs[t]++}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),s=(r,o)=>{let a=this.associations.get(r);if(a!=null)this.associations.set(o,a);for(let[l,c]of r.children.entries())s(c,o.children[l])};return s(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let s=e(t[i]);if(s)n.push(s)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":i=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!i)throw Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(s,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[_t.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(s,r){n.load(ui.resolveURL(t.uri,i.path),s,void 0,function(){r(Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let r=ip[i.type],o=So[i.componentType],a=i.normalized===!0,l=new o(i.count*r);return Promise.resolve(new at(l,r,a))}let s=[];if(i.bufferView!==void 0)s.push(this.getDependency("bufferView",i.bufferView));else s.push(null);if(i.sparse!==void 0)s.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",i.sparse.values.bufferView));return Promise.all(s).then(function(r){let o=r[0],a=ip[i.type],l=So[i.componentType],c=l.BYTES_PER_ELEMENT,h=c*a,u=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,d=i.normalized===!0,g,x;if(f&&f!==h){let m=Math.floor(u/f),p="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count,M=t.cache.get(p);if(!M)g=new l(o,m*f,i.count*f/c),M=new Ii(g,f/c),t.cache.add(p,M);x=new Kn(M,a,u%f/c,d)}else{if(o===null)g=new l(i.count*a);else g=new l(o,u,i.count*a);x=new at(g,a,d)}if(i.sparse!==void 0){let m=ip.SCALAR,p=So[i.sparse.indices.componentType],M=i.sparse.indices.byteOffset||0,y=i.sparse.values.byteOffset||0,S=new p(r[1],M,i.sparse.count*m),C=new l(r[2],y,i.sparse.count*a);if(o!==null)x=new at(x.array.slice(),x.itemSize,x.normalized);x.normalized=!1;for(let R=0,E=S.length;R<E;R++){let D=S[R];if(x.setX(D,C[R*a]),a>=2)x.setY(D,C[R*a+1]);if(a>=3)x.setZ(D,C[R*a+2]);if(a>=4)x.setW(D,C[R*a+3]);if(a>=5)throw Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}x.normalized=d}return x})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,r=t.images[s],o=this.textureLoader;if(r.uri){let a=n.manager.getHandler(r.uri);if(a!==null)o=a}return this.loadTextureImage(e,s,o)}loadTextureImage(e,t,n){let i=this,s=this.json,r=s.textures[e],o=s.images[t],a=(o.uri||o.bufferView)+":"+r.sampler;if(this.textureCache[a])return this.textureCache[a];let l=this.loadImageSource(t,n).then(function(c){if(c.flipY=!1,c.name=r.name||o.name||"",c.name===""&&typeof o.uri==="string"&&o.uri.startsWith("data:image/")===!1)c.name=o.uri;let u=(s.samplers||{})[r.sampler]||{};return c.magFilter=$g[u.magFilter]||Kt,c.minFilter=$g[u.minFilter]||$n,c.wrapS=ev[u.wrapS]||cn,c.wrapT=ev[u.wrapT]||cn,c.generateMipmaps=!c.isCompressedTexture&&c.minFilter!==xn&&c.minFilter!==Kt,i.associations.set(c,{textures:e}),c}).catch(function(){return null});return this.textureCache[a]=l,l}loadImageSource(e,t){let n=this,i=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then((h)=>h.clone());let r=i.images[e],o=self.URL||self.webkitURL,a=r.uri||"",l=!1;if(r.bufferView!==void 0)a=n.getDependency("bufferView",r.bufferView).then(function(h){l=!0;let u=new Blob([h],{type:r.mimeType});return a=o.createObjectURL(u),a});else if(r.uri===void 0)throw Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let c=Promise.resolve(a).then(function(h){return new Promise(function(u,f){let d=u;if(t.isImageBitmapLoader===!0)d=function(g){let x=new Rt(g);x.needsUpdate=!0,u(x)};t.load(ui.resolveURL(h,s.path),d,void 0,f)})}).then(function(h){if(l===!0)o.revokeObjectURL(a);return Ni(h,r),h.userData.mimeType=r.mimeType||Gw(r.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",a),h});return this.sourceCache[e]=c,c}assignTexture(e,t,n,i){let s=this;return this.getDependency("texture",n.index).then(function(r){if(!r)return null;if(n.texCoord!==void 0&&n.texCoord>0)r=r.clone(),r.channel=n.texCoord;if(s.extensions[_t.KHR_TEXTURE_TRANSFORM]){let o=n.extensions!==void 0?n.extensions[_t.KHR_TEXTURE_TRANSFORM]:void 0;if(o){let a=s.associations.get(r);r=s.extensions[_t.KHR_TEXTURE_TRANSFORM].extendTexture(r,o),s.associations.set(r,a)}}if(i!==void 0)r.colorSpace=i;return e[t]=r,r})}assignFinalMaterial(e){let{geometry:t,material:n}=e,i=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,r=t.attributes.normal===void 0;if(e.isPoints){let o="PointsMaterial:"+n.uuid,a=this.cache.get(o);if(!a)a=new ar,Gt.prototype.copy.call(a,n),a.color.copy(n.color),a.map=n.map,a.sizeAttenuation=!1,this.cache.add(o,a);n=a}else if(e.isLine){let o="LineBasicMaterial:"+n.uuid,a=this.cache.get(o);if(!a)a=new tn,Gt.prototype.copy.call(a,n),a.color.copy(n.color),a.map=n.map,this.cache.add(o,a);n=a}if(i||s||r){let o="ClonedMaterial:"+n.uuid+":";if(i)o+="derivative-tangents:";if(s)o+="vertex-colors:";if(r)o+="flat-shading:";let a=this.cache.get(o);if(!a){if(a=n.clone(),s)a.vertexColors=!0;if(r)a.flatShading=!0;if(i){if(a.normalScale)a.normalScale.y*=-1;if(a.clearcoatNormalScale)a.clearcoatNormalScale.y*=-1}this.cache.add(o,a),this.associations.set(a,this.associations.get(n))}n=a}e.material=n}getMaterialType(){return Pt}loadMaterial(e){let t=this,n=this.json,i=this.extensions,s=n.materials[e],r,o={},a=s.extensions||{},l=[];if(a[_t.KHR_MATERIALS_UNLIT]){let h=i[_t.KHR_MATERIALS_UNLIT];r=h.getMaterialType(),l.push(h.extendParams(o,s,t))}else{let h=s.pbrMetallicRoughness||{};if(o.color=new fe(1,1,1),o.opacity=1,Array.isArray(h.baseColorFactor)){let u=h.baseColorFactor;o.color.setRGB(u[0],u[1],u[2],Dt),o.opacity=u[3]}if(h.baseColorTexture!==void 0)l.push(t.assignTexture(o,"map",h.baseColorTexture,en));if(o.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,o.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0)l.push(t.assignTexture(o,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(o,"roughnessMap",h.metallicRoughnessTexture));r=this._invokeOne(function(u){return u.getMaterialType&&u.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(u){return u.extendMaterialParams&&u.extendMaterialParams(e,o)})))}if(s.doubleSided===!0)o.side=$t;let c=s.alphaMode||sp.OPAQUE;if(c===sp.BLEND)o.transparent=!0,o.depthWrite=!1;else if(o.transparent=!1,c===sp.MASK)o.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:0.5;if(s.normalTexture!==void 0&&r!==on){if(l.push(t.assignTexture(o,"normalMap",s.normalTexture)),o.normalScale=new se(1,1),s.normalTexture.scale!==void 0){let h=s.normalTexture.scale;o.normalScale.set(h,h)}}if(s.occlusionTexture!==void 0&&r!==on){if(l.push(t.assignTexture(o,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0)o.aoMapIntensity=s.occlusionTexture.strength}if(s.emissiveFactor!==void 0&&r!==on){let h=s.emissiveFactor;o.emissive=new fe().setRGB(h[0],h[1],h[2],Dt)}if(s.emissiveTexture!==void 0&&r!==on)l.push(t.assignTexture(o,"emissiveMap",s.emissiveTexture,en));return Promise.all(l).then(function(){let h=new r(o);if(s.name)h.name=s.name;if(Ni(h,s),t.associations.set(h,{materials:e}),s.extensions)yr(i,h,s);return h})}createUniqueName(e){let t=St.sanitizeNodeName(e||"");if(t in this.nodeNamesUsed)return t+"_"+ ++this.nodeNamesUsed[t];else return this.nodeNamesUsed[t]=0,t}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function s(o){return n[_t.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(a){return tv(a,o,t)})}let r=[];for(let o=0,a=e.length;o<a;o++){let l=e[o],c=kw(l),h=i[c];if(h)r.push(h.promise);else{let u;if(l.extensions&&l.extensions[_t.KHR_DRACO_MESH_COMPRESSION])u=s(l);else u=tv(new Je,l,t);i[c]={primitive:l,promise:u},r.push(u)}}return Promise.all(r)}loadMesh(e){let t=this,n=this.json,i=this.extensions,s=n.meshes[e],r=s.primitives,o=[];for(let a=0,l=r.length;a<l;a++){let c=r[a].material===void 0?Bw(this.cache):this.getDependency("material",r[a].material);o.push(c)}return o.push(t.loadGeometries(r)),Promise.all(o).then(function(a){let l=a.slice(0,a.length-1),c=a[a.length-1],h=[];for(let f=0,d=c.length;f<d;f++){let g=c[f],x=r[f],m,p=l[f];if(x.mode===ni.TRIANGLES||x.mode===ni.TRIANGLE_STRIP||x.mode===ni.TRIANGLE_FAN||x.mode===void 0){if(m=s.isSkinnedMesh===!0?new ao(g,p):new vt(g,p),m.isSkinnedMesh===!0)m.normalizeSkinWeights();if(x.mode===ni.TRIANGLE_STRIP)m.geometry=su(m.geometry,to);else if(x.mode===ni.TRIANGLE_FAN)m.geometry=su(m.geometry,$s)}else if(x.mode===ni.LINES)m=new _n(g,p);else if(x.mode===ni.LINE_STRIP)m=new Jn(g,p);else if(x.mode===ni.LINE_LOOP)m=new lo(g,p);else if(x.mode===ni.POINTS)m=new co(g,p);else throw Error("THREE.GLTFLoader: Primitive mode unsupported: "+x.mode);if(Object.keys(m.geometry.morphAttributes).length>0)Hw(m,s);if(m.name=t.createUniqueName(s.name||"mesh_"+e),Ni(m,s),x.extensions)yr(i,m,x);t.assignFinalMaterial(m),h.push(m)}for(let f=0,d=h.length;f<d;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1){if(s.extensions)yr(i,h[0],s);return h[0]}let u=new wt;if(s.extensions)yr(i,u,s);t.associations.set(u,{meshes:e});for(let f=0,d=h.length;f<d;f++)u.add(h[f]);return u})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}if(n.type==="perspective")t=new Ot(er.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2000000);else if(n.type==="orthographic")t=new Li(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar);if(n.name)t.name=this.createUniqueName(n.name);return Ni(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,s=t.joints.length;i<s;i++)n.push(this._loadNodeShallow(t.joints[i]));if(t.inverseBindMatrices!==void 0)n.push(this.getDependency("accessor",t.inverseBindMatrices));else n.push(null);return Promise.all(n).then(function(i){let s=i.pop(),r=i,o=[],a=[];for(let l=0,c=r.length;l<c;l++){let h=r[l];if(h){o.push(h);let u=new He;if(s!==null)u.fromArray(s.array,l*16);a.push(u)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new or(o,a)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],s=i.name?i.name:"animation_"+e,r=[],o=[],a=[],l=[],c=[];for(let h=0,u=i.channels.length;h<u;h++){let f=i.channels[h],d=i.samplers[f.sampler],g=f.target,x=g.node,m=i.parameters!==void 0?i.parameters[d.input]:d.input,p=i.parameters!==void 0?i.parameters[d.output]:d.output;if(g.node===void 0)continue;r.push(this.getDependency("node",x)),o.push(this.getDependency("accessor",m)),a.push(this.getDependency("accessor",p)),l.push(d),c.push(g)}return Promise.all([Promise.all(r),Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c)]).then(function(h){let u=h[0],f=h[1],d=h[2],g=h[3],x=h[4],m=[];for(let M=0,y=u.length;M<y;M++){let S=u[M],C=f[M],R=d[M],E=g[M],D=x[M];if(S===void 0)continue;if(S.updateMatrix)S.updateMatrix();let w=n._createAnimationTracks(S,C,R,E,D);if(w)for(let T=0;T<w.length;T++)m.push(w[T])}let p=new hi(s,void 0,m);return Ni(p,i),p})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];if(i.mesh===void 0)return null;return n.getDependency("mesh",i.mesh).then(function(s){let r=n._getNodeRef(n.meshCache,i.mesh,s);if(i.weights!==void 0)r.traverse(function(o){if(!o.isMesh)return;for(let a=0,l=i.weights.length;a<l;a++)o.morphTargetInfluences[a]=i.weights[a]});return r})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],s=n._loadNodeShallow(e),r=[],o=i.children||[];for(let l=0,c=o.length;l<c;l++)r.push(n.getDependency("node",o[l]));let a=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([s,Promise.all(r),a]).then(function(l){let c=l[0],h=l[1],u=l[2];if(u!==null)c.traverse(function(f){if(!f.isSkinnedMesh)return;f.bind(u,Ww)});for(let f=0,d=h.length;f<d;f++)c.add(h[f]);return c})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],r=s.name?i.createUniqueName(s.name):"",o=[],a=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});if(a)o.push(a);if(s.camera!==void 0)o.push(i.getDependency("camera",s.camera).then(function(l){return i._getNodeRef(i.cameraCache,s.camera,l)}));return i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){o.push(l)}),this.nodeCache[e]=Promise.all(o).then(function(l){let c;if(s.isBone===!0)c=new rr;else if(l.length>1)c=new wt;else if(l.length===1)c=l[0];else c=new dt;if(c!==l[0])for(let h=0,u=l.length;h<u;h++)c.add(l[h]);if(s.name)c.userData.name=s.name,c.name=r;if(Ni(c,s),s.extensions)yr(n,c,s);if(s.matrix!==void 0){let h=new He;h.fromArray(s.matrix),c.applyMatrix4(h)}else{if(s.translation!==void 0)c.position.fromArray(s.translation);if(s.rotation!==void 0)c.quaternion.fromArray(s.rotation);if(s.scale!==void 0)c.scale.fromArray(s.scale)}if(!i.associations.has(c))i.associations.set(c,{});else if(s.mesh!==void 0&&i.meshCache.refs[s.mesh]>1){let h=i.associations.get(c);i.associations.set(c,{...h})}return i.associations.get(c).nodes=e,c}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,s=new wt;if(n.name)s.name=i.createUniqueName(n.name);if(Ni(s,n),n.extensions)yr(t,s,n);let r=n.nodes||[],o=[];for(let a=0,l=r.length;a<l;a++)o.push(i.getDependency("node",r[a]));return Promise.all(o).then(function(a){for(let c=0,h=a.length;c<h;c++)s.add(a[c]);let l=(c)=>{let h=new Map;for(let[u,f]of i.associations)if(u instanceof Gt||u instanceof Rt)h.set(u,f);return c.traverse((u)=>{let f=i.associations.get(u);if(f!=null)h.set(u,f)}),h};return i.associations=l(s),s})}_createAnimationTracks(e,t,n,i,s){let r=[],o=e.name?e.name:e.uuid,a=[];if(Ts[s.path]===Ts.weights)e.traverse(function(u){if(u.morphTargetInfluences)a.push(u.name?u.name:u.uuid)});else a.push(o);let l;switch(Ts[s.path]){case Ts.weights:l=Ri;break;case Ts.rotation:l=ti;break;case Ts.translation:case Ts.scale:l=jn;break;default:switch(n.itemSize){case 1:l=Ri;break;case 2:case 3:default:l=jn;break}break}let c=i.interpolation!==void 0?Ow[i.interpolation]:ya,h=this._getArrayFromAccessor(n);for(let u=0,f=a.length;u<f;u++){let d=new l(a[u]+"."+Ts[s.path],t.array,h,c);if(i.interpolation==="CUBICSPLINE")this._createCubicSplineTrackInterpolant(d);r.push(d)}return r}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=ap(t.constructor),i=new Float32Array(t.length);for(let s=0,r=t.length;s<r;s++)i[s]=t[s]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){return new(this instanceof ti?Tv:lp)(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Vw(e,t,n){let i=t.attributes,s=new zt;if(i.POSITION!==void 0){let a=n.json.accessors[i.POSITION],{min:l,max:c}=a;if(l!==void 0&&c!==void 0){if(s.set(new I(l[0],l[1],l[2]),new I(c[0],c[1],c[2])),a.normalized){let h=ap(So[a.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=t.targets;if(r!==void 0){let a=new I,l=new I;for(let c=0,h=r.length;c<h;c++){let u=r[c];if(u.POSITION!==void 0){let f=n.json.accessors[u.POSITION],{min:d,max:g}=f;if(d!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(g[2]))),f.normalized){let x=ap(So[f.componentType]);l.multiplyScalar(x)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}e.boundingBox=s;let o=new Xt;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,e.boundingSphere=o}function tv(e,t,n){let i=t.attributes,s=[];function r(o,a){return n.getDependency("accessor",o).then(function(l){e.setAttribute(a,l)})}for(let o in i){let a=op[o]||o.toLowerCase();if(a in e.attributes)continue;s.push(r(i[o],a))}if(t.indices!==void 0&&!e.index){let o=n.getDependency("accessor",t.indices).then(function(a){e.setIndex(a)});s.push(o)}if(mt.workingColorSpace!==Dt&&"COLOR_0"in i)console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${mt.workingColorSpace}" not supported.`);return Ni(e,t),Vw(e,t,n),Promise.all(s).then(function(){return t.targets!==void 0?zw(e,t.targets,n):e})}/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var ii=Uint8Array,wo=Uint16Array,Xw=Int32Array,Av=new ii([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Rv=new ii([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),qw=new ii([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Cv=function(e,t){var n=new wo(31);for(var i=0;i<31;++i)n[i]=t+=1<<e[i-1];var s=new Xw(n[30]);for(var i=1;i<30;++i)for(var r=n[i];r<n[i+1];++r)s[r]=r-n[i]<<5|i;return{b:n,r:s}},Iv=Cv(Av,2),{b:Pv,r:Yw}=Iv;Pv[28]=258,Yw[258]=28;var Dv=Cv(Rv,0),{b:Zw,r:Yb}=Dv,up=new wo(32768);for(Mt=0;Mt<32768;++Mt)Ui=(Mt&43690)>>1|(Mt&21845)<<1,Ui=(Ui&52428)>>2|(Ui&13107)<<2,Ui=(Ui&61680)>>4|(Ui&3855)<<4,up[Mt]=((Ui&65280)>>8|(Ui&255)<<8)>>1;var Ui,Mt,$a=function(e,t,n){var i=e.length,s=0,r=new wo(t);for(;s<i;++s)if(e[s])++r[e[s]-1];var o=new wo(t);for(s=1;s<t;++s)o[s]=o[s-1]+r[s-1]<<1;var a;if(n){a=new wo(1<<t);var l=15-t;for(s=0;s<i;++s)if(e[s]){var c=s<<4|e[s],h=t-e[s],u=o[e[s]-1]++<<h;for(var f=u|(1<<h)-1;u<=f;++u)a[up[u]>>l]=c}}else{a=new wo(i);for(s=0;s<i;++s)if(e[s])a[s]=up[o[e[s]-1]++]>>15-e[s]}return a},el=new ii(288);for(Mt=0;Mt<144;++Mt)el[Mt]=8;var Mt;for(Mt=144;Mt<256;++Mt)el[Mt]=9;var Mt;for(Mt=256;Mt<280;++Mt)el[Mt]=7;var Mt;for(Mt=280;Mt<288;++Mt)el[Mt]=8;var Mt,Lv=new ii(32);for(Mt=0;Mt<32;++Mt)Lv[Mt]=5;var Mt;var Kw=$a(el,9,1);var Jw=$a(Lv,5,1),cp=function(e){var t=e[0];for(var n=1;n<e.length;++n)if(e[n]>t)t=e[n];return t},vi=function(e,t,n){var i=t/8|0;return(e[i]|e[i+1]<<8)>>(t&7)&n},hp=function(e,t){var n=t/8|0;return(e[n]|e[n+1]<<8|e[n+2]<<16)>>(t&7)},jw=function(e){return(e+7)/8|0},Qw=function(e,t,n){if(t==null||t<0)t=0;if(n==null||n>e.length)n=e.length;return new ii(e.subarray(t,n))};var $w=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],xi=function(e,t,n){var i=Error(t||$w[e]);if(i.code=e,Error.captureStackTrace)Error.captureStackTrace(i,xi);if(!n)throw i;return i},eb=function(e,t,n,i){var s=e.length,r=i?i.length:0;if(!s||t.f&&!t.l)return n||new ii(0);var o=!n,a=o||t.i!=2,l=t.i;if(o)n=new ii(s*3);var c=function(ct){var z=n.length;if(ct>z){var ce=new ii(Math.max(z*2,ct));ce.set(n),n=ce}},h=t.f||0,u=t.p||0,f=t.b||0,{l:d,d:g,m:x,n:m}=t,p=s*8;do{if(!d){h=vi(e,u,1);var M=vi(e,u+1,3);if(u+=3,!M){var y=jw(u)+4,S=e[y-4]|e[y-3]<<8,C=y+S;if(C>s){if(l)xi(0);break}if(a)c(f+S);n.set(e.subarray(y,C),f),t.b=f+=S,t.p=u=C*8,t.f=h;continue}else if(M==1)d=Kw,g=Jw,x=9,m=5;else if(M==2){var R=vi(e,u,31)+257,E=vi(e,u+10,15)+4,D=R+vi(e,u+5,31)+1;u+=14;var w=new ii(D),T=new ii(19);for(var P=0;P<E;++P)T[qw[P]]=vi(e,u+P*3,7);u+=E*3;var B=cp(T),H=(1<<B)-1,k=$a(T,B,1);for(var P=0;P<D;){var X=k[vi(e,u,H)];u+=X&15;var y=X>>4;if(y<16)w[P++]=y;else{var q=0,re=0;if(y==16)re=3+vi(e,u,3),u+=2,q=w[P-1];else if(y==17)re=3+vi(e,u,7),u+=3;else if(y==18)re=11+vi(e,u,127),u+=7;while(re--)w[P++]=q}}var W=w.subarray(0,R),Q=w.subarray(R);x=cp(W),m=cp(Q),d=$a(W,x,1),g=$a(Q,m,1)}else xi(1);if(u>p){if(l)xi(0);break}}if(a)c(f+131072);var ae=(1<<x)-1,ge=(1<<m)-1,ve=u;for(;;ve=u){var q=d[hp(e,u)&ae],Ge=q>>4;if(u+=q&15,u>p){if(l)xi(0);break}if(!q)xi(2);if(Ge<256)n[f++]=Ge;else if(Ge==256){ve=u,d=null;break}else{var Oe=Ge-254;if(Ge>264){var P=Ge-257,G=Av[P];Oe=vi(e,u,(1<<G)-1)+Pv[P],u+=G}var Y=g[hp(e,u)&ge],te=Y>>4;if(!Y)xi(3);u+=Y&15;var Q=Zw[te];if(te>3){var G=Rv[te];Q+=hp(e,u)&(1<<G)-1,u+=G}if(u>p){if(l)xi(0);break}if(a)c(f+131072);var le=f+Oe;if(f<Q){var Ee=r-Q,We=Math.min(Q,le);if(Ee+f<0)xi(3);for(;f<We;++f)n[f]=i[Ee+f]}for(;f<le;++f)n[f]=n[f-Q]}}if(t.l=d,t.p=ve,t.b=f,t.f=h,d)h=1,t.m=x,t.d=g,t.n=m}while(!h);return f!=n.length&&o?Qw(n,0,f):n.subarray(0,f)};var tb=new ii(0);var nb=function(e,t){if((e[0]&15)!=8||e[0]>>4>7||(e[0]<<8|e[1])%31)xi(6,"invalid zlib data");if((e[1]>>5&1)==+!t)xi(6,"invalid zlib data: "+(e[1]&32?"need":"unexpected")+" dictionary");return(e[1]>>3&4)+2};function tl(e,t){return eb(e.subarray(nb(e,t&&t.dictionary),-4),{i:2},t&&t.out,t&&t.dictionary)}var ib=typeof TextDecoder<"u"&&new TextDecoder,sb=0;try{ib.decode(tb,{stream:!0}),sb=1}catch(e){}class nl extends dr{constructor(e){super(e);this.type=It,this.outputFormat=Jt}parse(e){let D=Math.pow(2.7182818,2.2);function w(_,v){let b=0;for(let F=0;F<65536;++F)if(F==0||_[F>>3]&1<<(F&7))v[b++]=F;let L=b-1;while(b<65536)v[b++]=0;return L}function T(_){for(let v=0;v<16384;v++)_[v]={},_[v].len=0,_[v].lit=0,_[v].p=null}let P={l:0,c:0,lc:0};function B(_,v,b,L,F){while(b<_)v=v<<8|Ze(L,F),b+=8;b-=_,P.l=v>>b&(1<<_)-1,P.c=v,P.lc=b}let H=Array(59);function k(_){for(let b=0;b<=58;++b)H[b]=0;for(let b=0;b<65537;++b)H[_[b]]+=1;let v=0;for(let b=58;b>0;--b){let L=v+H[b]>>1;H[b]=v,v=L}for(let b=0;b<65537;++b){let L=_[b];if(L>0)_[b]=L|H[L]++<<6}}function X(_,v,b,L,F,O){let N=v,j=0,J=0;for(;L<=F;L++){if(N.value-v.value>b)return!1;B(6,j,J,_,N);let K=P.l;if(j=P.c,J=P.lc,O[L]=K,K==63){if(N.value-v.value>b)throw Error("Something wrong with hufUnpackEncTable");B(8,j,J,_,N);let ee=P.l+6;if(j=P.c,J=P.lc,L+ee>F+1)throw Error("Something wrong with hufUnpackEncTable");while(ee--)O[L++]=0;L--}else if(K>=59){let ee=K-59+2;if(L+ee>F+1)throw Error("Something wrong with hufUnpackEncTable");while(ee--)O[L++]=0;L--}}k(O)}function q(_){return _&63}function re(_){return _>>6}function W(_,v,b,L){for(;v<=b;v++){let F=re(_[v]),O=q(_[v]);if(F>>O)throw Error("Invalid table entry");if(O>14){let N=L[F>>O-14];if(N.len)throw Error("Invalid table entry");if(N.lit++,N.p){let j=N.p;N.p=Array(N.lit);for(let J=0;J<N.lit-1;++J)N.p[J]=j[J]}else N.p=[,];N.p[N.lit-1]=v}else if(O){let N=0;for(let j=1<<14-O;j>0;j--){let J=L[(F<<14-O)+N];if(J.len||J.p)throw Error("Invalid table entry");J.len=O,J.lit=v,N++}}}return!0}let Q={c:0,lc:0};function ae(_,v,b,L){_=_<<8|Ze(b,L),v+=8,Q.c=_,Q.lc=v}let ge={c:0,lc:0};function ve(_,v,b,L,F,O,N,j,J){if(_==v){if(L<8)ae(b,L,F,O),b=Q.c,L=Q.lc;L-=8;let K=b>>L;if(K=new Uint8Array([K])[0],j.value+K>J)return!1;let ee=N[j.value-1];while(K-- >0)N[j.value++]=ee}else if(j.value<J)N[j.value++]=_;else return!1;ge.c=b,ge.lc=L}function Ge(_){return _&65535}function Oe(_){let v=Ge(_);return v>32767?v-65536:v}let G={a:0,b:0};function Y(_,v){let b=Oe(_),F=Oe(v),O=b+(F&1)+(F>>1),N=O,j=O-F;G.a=N,G.b=j}function te(_,v){let b=Ge(_),L=Ge(v),F=b-(L>>1)&65535,O=L+F-32768&65535;G.a=O,G.b=F}function le(_,v,b,L,F,O,N){let j=N<16384,J=b>F?F:b,K=1,ee,he;while(K<=J)K<<=1;K>>=1,ee=K,K>>=1;while(K>=1){he=0;let ie=he+O*(F-ee),_e=O*K,De=O*ee,we=L*K,Re=L*ee,Ue,Le,Qe,je;for(;he<=ie;he+=De){let ut=he,$e=he+L*(b-ee);for(;ut<=$e;ut+=Re){let yt=ut+we,Ut=ut+_e,nt=Ut+we;if(j)Y(_[ut+v],_[Ut+v]),Ue=G.a,Qe=G.b,Y(_[yt+v],_[nt+v]),Le=G.a,je=G.b,Y(Ue,Le),_[ut+v]=G.a,_[yt+v]=G.b,Y(Qe,je),_[Ut+v]=G.a,_[nt+v]=G.b;else te(_[ut+v],_[Ut+v]),Ue=G.a,Qe=G.b,te(_[yt+v],_[nt+v]),Le=G.a,je=G.b,te(Ue,Le),_[ut+v]=G.a,_[yt+v]=G.b,te(Qe,je),_[Ut+v]=G.a,_[nt+v]=G.b}if(b&K){let yt=ut+_e;if(j)Y(_[ut+v],_[yt+v]);else te(_[ut+v],_[yt+v]);Ue=G.a,_[yt+v]=G.b,_[ut+v]=Ue}}if(F&K){let ut=he,$e=he+L*(b-ee);for(;ut<=$e;ut+=Re){let yt=ut+we;if(j)Y(_[ut+v],_[yt+v]);else te(_[ut+v],_[yt+v]);Ue=G.a,_[yt+v]=G.b,_[ut+v]=Ue}}ee=K,K>>=1}return he}function Ee(_,v,b,L,F,O,N,j,J){let K=0,ee=0,he=N,ie=Math.trunc(L.value+(F+7)/8);while(L.value<ie){ae(K,ee,b,L),K=Q.c,ee=Q.lc;while(ee>=14){let De=K>>ee-14&16383,we=v[De];if(we.len)ee-=we.len,ve(we.lit,O,K,ee,b,L,j,J,he),K=ge.c,ee=ge.lc;else{if(!we.p)throw Error("hufDecode issues");let Re;for(Re=0;Re<we.lit;Re++){let Ue=q(_[we.p[Re]]);while(ee<Ue&&L.value<ie)ae(K,ee,b,L),K=Q.c,ee=Q.lc;if(ee>=Ue){if(re(_[we.p[Re]])==(K>>ee-Ue&(1<<Ue)-1)){ee-=Ue,ve(we.p[Re],O,K,ee,b,L,j,J,he),K=ge.c,ee=ge.lc;break}}}if(Re==we.lit)throw Error("hufDecode issues")}}}let _e=8-F&7;K>>=_e,ee-=_e;while(ee>0){let De=v[K<<14-ee&16383];if(De.len)ee-=De.len,ve(De.lit,O,K,ee,b,L,j,J,he),K=ge.c,ee=ge.lc;else throw Error("hufDecode issues")}return!0}function We(_,v,b,L,F,O){let N={value:0},j=b.value,J=Pe(v,b),K=Pe(v,b);b.value+=4;let ee=Pe(v,b);if(b.value+=4,J<0||J>=65537||K<0||K>=65537)throw Error("Something wrong with HUF_ENCSIZE");let he=Array(65537),ie=Array(16384);T(ie);let _e=L-(b.value-j);if(X(_,b,_e,J,K,he),ee>8*(L-(b.value-j)))throw Error("Something wrong with hufUncompress");W(he,J,K,ie),Ee(he,ie,_,b,ee,K,O,F,N)}function ct(_,v,b){for(let L=0;L<b;++L)v[L]=_[v[L]]}function z(_){for(let v=1;v<_.length;v++){let b=_[v-1]+_[v]-128;_[v]=b}}function ce(_,v){let b=0,L=Math.floor((_.length+1)/2),F=0,O=_.length-1;while(!0){if(F>O)break;if(v[F++]=_[b++],F>O)break;v[F++]=_[L++]}}function pe(_){let v=_.byteLength,b=[],L=0,F=new DataView(_);while(v>0){let O=F.getInt8(L++);if(O<0){let N=-O;v-=N+1;for(let j=0;j<N;j++)b.push(F.getUint8(L++))}else{let N=O;v-=2;let j=F.getUint8(L++);for(let J=0;J<N+1;J++)b.push(j)}}return b}function me(_,v,b,L,F,O){let N=new DataView(O.buffer),j=b[_.idx[0]].width,J=b[_.idx[0]].height,K=3,ee=Math.floor(j/8),he=Math.ceil(j/8),ie=Math.ceil(J/8),_e=j-(he-1)*8,De=J-(ie-1)*8,we={value:0},Re=Array(K),Ue=Array(K),Le=Array(K),Qe=Array(K),je=Array(K);for(let $e=0;$e<K;++$e)je[$e]=v[_.idx[$e]],Re[$e]=$e<1?0:Re[$e-1]+he*ie,Ue[$e]=new Float32Array(64),Le[$e]=new Uint16Array(64),Qe[$e]=new Uint16Array(he*64);for(let $e=0;$e<ie;++$e){let yt=8;if($e==ie-1)yt=De;let Ut=8;for(let ot=0;ot<he;++ot){if(ot==he-1)Ut=_e;for(let gt=0;gt<K;++gt)Le[gt].fill(0),Le[gt][0]=F[Re[gt]++],Ie(we,L,Le[gt]),be(Le[gt],Ue[gt]),Se(Ue[gt]);if(K==3)st(Ue);for(let gt=0;gt<K;++gt)tt(Ue[gt],Qe[gt],ot*64)}let nt=0;for(let ot=0;ot<K;++ot){let gt=b[_.idx[ot]].type;for(let Lt=8*$e;Lt<8*$e+yt;++Lt){nt=je[ot][Lt];for(let qt=0;qt<ee;++qt){let Rn=qt*64+(Lt&7)*8;N.setUint16(nt+0*gt,Qe[ot][Rn+0],!0),N.setUint16(nt+2*gt,Qe[ot][Rn+1],!0),N.setUint16(nt+4*gt,Qe[ot][Rn+2],!0),N.setUint16(nt+6*gt,Qe[ot][Rn+3],!0),N.setUint16(nt+8*gt,Qe[ot][Rn+4],!0),N.setUint16(nt+10*gt,Qe[ot][Rn+5],!0),N.setUint16(nt+12*gt,Qe[ot][Rn+6],!0),N.setUint16(nt+14*gt,Qe[ot][Rn+7],!0),nt+=16*gt}}if(ee!=he)for(let Lt=8*$e;Lt<8*$e+yt;++Lt){let qt=je[ot][Lt]+8*ee*2*gt,Rn=ee*64+(Lt&7)*8;for(let qn=0;qn<Ut;++qn)N.setUint16(qt+qn*2*gt,Qe[ot][Rn+qn],!0)}}}let ut=new Uint16Array(j);N=new DataView(O.buffer);for(let $e=0;$e<K;++$e){b[_.idx[$e]].decoded=!0;let yt=b[_.idx[$e]].type;if(b[$e].type!=2)continue;for(let Ut=0;Ut<J;++Ut){let nt=je[$e][Ut];for(let ot=0;ot<j;++ot)ut[ot]=N.getUint16(nt+ot*2*yt,!0);for(let ot=0;ot<j;++ot)N.setFloat32(nt+ot*2*yt,ne(ut[ot]),!0)}}}function de(_,v,b,L,F,O){let N=new DataView(O.buffer),j=b[_],{width:J,height:K}=j,ee=Math.ceil(J/8),he=Math.ceil(K/8),ie=Math.floor(J/8),_e=J-(ee-1)*8,De=K-(he-1)*8,we={value:0},Re=0,Ue=new Float32Array(64),Le=new Uint16Array(64),Qe=new Uint16Array(ee*64);for(let je=0;je<he;++je){let ut=8;if(je==he-1)ut=De;for(let $e=0;$e<ee;++$e)Le.fill(0),Le[0]=F[Re++],Ie(we,L,Le),be(Le,Ue),Se(Ue),tt(Ue,Qe,$e*64);for(let $e=8*je;$e<8*je+ut;++$e){let yt=v[_][$e];for(let Ut=0;Ut<ie;++Ut){let nt=Ut*64+($e&7)*8;for(let ot=0;ot<8;++ot)N.setUint16(yt+ot*2*j.type,Qe[nt+ot],!0);yt+=16*j.type}if(ee!=ie){let Ut=ie*64+($e&7)*8;for(let nt=0;nt<_e;++nt)N.setUint16(yt+nt*2*j.type,Qe[Ut+nt],!0)}}}j.decoded=!0}function Ie(_,v,b){let L,F=1;while(F<64){if(L=v[_.value],L==65280)F=64;else if(L>>8==255)F+=L&255;else b[F]=L,F++;_.value++}}function be(_,v){v[0]=ne(_[0]),v[1]=ne(_[1]),v[2]=ne(_[5]),v[3]=ne(_[6]),v[4]=ne(_[14]),v[5]=ne(_[15]),v[6]=ne(_[27]),v[7]=ne(_[28]),v[8]=ne(_[2]),v[9]=ne(_[4]),v[10]=ne(_[7]),v[11]=ne(_[13]),v[12]=ne(_[16]),v[13]=ne(_[26]),v[14]=ne(_[29]),v[15]=ne(_[42]),v[16]=ne(_[3]),v[17]=ne(_[8]),v[18]=ne(_[12]),v[19]=ne(_[17]),v[20]=ne(_[25]),v[21]=ne(_[30]),v[22]=ne(_[41]),v[23]=ne(_[43]),v[24]=ne(_[9]),v[25]=ne(_[11]),v[26]=ne(_[18]),v[27]=ne(_[24]),v[28]=ne(_[31]),v[29]=ne(_[40]),v[30]=ne(_[44]),v[31]=ne(_[53]),v[32]=ne(_[10]),v[33]=ne(_[19]),v[34]=ne(_[23]),v[35]=ne(_[32]),v[36]=ne(_[39]),v[37]=ne(_[45]),v[38]=ne(_[52]),v[39]=ne(_[54]),v[40]=ne(_[20]),v[41]=ne(_[22]),v[42]=ne(_[33]),v[43]=ne(_[38]),v[44]=ne(_[46]),v[45]=ne(_[51]),v[46]=ne(_[55]),v[47]=ne(_[60]),v[48]=ne(_[21]),v[49]=ne(_[34]),v[50]=ne(_[37]),v[51]=ne(_[47]),v[52]=ne(_[50]),v[53]=ne(_[56]),v[54]=ne(_[59]),v[55]=ne(_[61]),v[56]=ne(_[35]),v[57]=ne(_[36]),v[58]=ne(_[48]),v[59]=ne(_[49]),v[60]=ne(_[57]),v[61]=ne(_[58]),v[62]=ne(_[62]),v[63]=ne(_[63])}function Se(_){let v=0.5*Math.cos(0.7853975),b=0.5*Math.cos(0.196349375),L=0.5*Math.cos(0.39269875),F=0.5*Math.cos(0.5890481249999999),O=0.5*Math.cos(0.981746875),N=0.5*Math.cos(1.1780962499999998),j=0.5*Math.cos(1.374445625),J=[,,,,],K=[,,,,],ee=[,,,,],he=[,,,,];for(let ie=0;ie<8;++ie){let _e=ie*8;J[0]=L*_[_e+2],J[1]=N*_[_e+2],J[2]=L*_[_e+6],J[3]=N*_[_e+6],K[0]=b*_[_e+1]+F*_[_e+3]+O*_[_e+5]+j*_[_e+7],K[1]=F*_[_e+1]-j*_[_e+3]-b*_[_e+5]-O*_[_e+7],K[2]=O*_[_e+1]-b*_[_e+3]+j*_[_e+5]+F*_[_e+7],K[3]=j*_[_e+1]-O*_[_e+3]+F*_[_e+5]-b*_[_e+7],ee[0]=v*(_[_e+0]+_[_e+4]),ee[3]=v*(_[_e+0]-_[_e+4]),ee[1]=J[0]+J[3],ee[2]=J[1]-J[2],he[0]=ee[0]+ee[1],he[1]=ee[3]+ee[2],he[2]=ee[3]-ee[2],he[3]=ee[0]-ee[1],_[_e+0]=he[0]+K[0],_[_e+1]=he[1]+K[1],_[_e+2]=he[2]+K[2],_[_e+3]=he[3]+K[3],_[_e+4]=he[3]-K[3],_[_e+5]=he[2]-K[2],_[_e+6]=he[1]-K[1],_[_e+7]=he[0]-K[0]}for(let ie=0;ie<8;++ie)J[0]=L*_[16+ie],J[1]=N*_[16+ie],J[2]=L*_[48+ie],J[3]=N*_[48+ie],K[0]=b*_[8+ie]+F*_[24+ie]+O*_[40+ie]+j*_[56+ie],K[1]=F*_[8+ie]-j*_[24+ie]-b*_[40+ie]-O*_[56+ie],K[2]=O*_[8+ie]-b*_[24+ie]+j*_[40+ie]+F*_[56+ie],K[3]=j*_[8+ie]-O*_[24+ie]+F*_[40+ie]-b*_[56+ie],ee[0]=v*(_[ie]+_[32+ie]),ee[3]=v*(_[ie]-_[32+ie]),ee[1]=J[0]+J[3],ee[2]=J[1]-J[2],he[0]=ee[0]+ee[1],he[1]=ee[3]+ee[2],he[2]=ee[3]-ee[2],he[3]=ee[0]-ee[1],_[0+ie]=he[0]+K[0],_[8+ie]=he[1]+K[1],_[16+ie]=he[2]+K[2],_[24+ie]=he[3]+K[3],_[32+ie]=he[3]-K[3],_[40+ie]=he[2]-K[2],_[48+ie]=he[1]-K[1],_[56+ie]=he[0]-K[0]}function st(_){for(let v=0;v<64;++v){let b=_[0][v],L=_[1][v],F=_[2][v];_[0][v]=b+1.5747*F,_[1][v]=b-0.1873*L-0.4682*F,_[2][v]=b+1.8556*L}}function tt(_,v,b){for(let L=0;L<64;++L)v[b+L]=mi.toHalfFloat(rt(_[L]))}function rt(_){if(_<=1)return Math.sign(_)*Math.pow(Math.abs(_),2.2);else return Math.sign(_)*Math.pow(D,Math.abs(_)-1)}function U(_){return new DataView(_.array.buffer,_.offset.value,_.size)}function A(_){let v=_.viewer.buffer.slice(_.offset.value,_.offset.value+_.size),b=new Uint8Array(pe(v)),L=new Uint8Array(b.length);return z(b),ce(b,L),new DataView(L.buffer)}function Z(_){let v=_.array.slice(_.offset.value,_.offset.value+_.size),b=tl(v),L=new Uint8Array(b.length);return z(b),ce(b,L),new DataView(L.buffer)}function ue(_){let v=_.viewer,b={value:_.offset.value},L=new Uint16Array(_.columns*_.lines*(_.inputChannels.length*_.type)),F=new Uint8Array(8192),O=0,N=Array(_.inputChannels.length);for(let De=0,we=_.inputChannels.length;De<we;De++)N[De]={},N[De].start=O,N[De].end=N[De].start,N[De].nx=_.columns,N[De].ny=_.lines,N[De].size=_.type,O+=N[De].nx*N[De].ny*N[De].size;let j=Ne(v,b),J=Ne(v,b);if(J>=8192)throw Error("Something is wrong with PIZ_COMPRESSION BITMAP_SIZE");if(j<=J)for(let De=0;De<J-j+1;De++)F[De+j]=ke(v,b);let K=new Uint16Array(65536),ee=w(F,K),he=Pe(v,b);We(_.array,v,b,he,L,O);for(let De=0;De<_.inputChannels.length;++De){let we=N[De];for(let Re=0;Re<N[De].size;++Re)le(L,we.start+Re,we.nx,we.size,we.ny,we.nx*we.size,ee)}ct(K,L,O);let ie=0,_e=new Uint8Array(L.buffer.byteLength);for(let De=0;De<_.lines;De++)for(let we=0;we<_.inputChannels.length;we++){let Re=N[we],Ue=Re.nx*Re.size,Le=new Uint8Array(L.buffer,Re.end*2,Ue*2);_e.set(Le,ie),ie+=Ue*2,Re.end+=Ue}return new DataView(_e.buffer)}function ye(_){let v=_.array.slice(_.offset.value,_.offset.value+_.size),b=tl(v),L=_.inputChannels.length*_.lines*_.columns*_.totalBytes,F=new ArrayBuffer(L),O=new DataView(F),N=0,j=0,J=[,,,,];for(let K=0;K<_.lines;K++)for(let ee=0;ee<_.inputChannels.length;ee++){let he=0;switch(_.inputChannels[ee].pixelType){case 1:J[0]=N,J[1]=J[0]+_.columns,N=J[1]+_.columns;for(let _e=0;_e<_.columns;++_e){let De=b[J[0]++]<<8|b[J[1]++];he+=De,O.setUint16(j,he,!0),j+=2}break;case 2:J[0]=N,J[1]=J[0]+_.columns,J[2]=J[1]+_.columns,N=J[2]+_.columns;for(let _e=0;_e<_.columns;++_e){let De=b[J[0]++]<<24|b[J[1]++]<<16|b[J[2]++]<<8;he+=De,O.setUint32(j,he,!0),j+=4}break}}return O}function oe(_){let v=_.viewer,b={value:_.offset.value},L=new Uint8Array(_.columns*_.lines*(_.inputChannels.length*_.type*2)),F={version:Ce(v,b),unknownUncompressedSize:Ce(v,b),unknownCompressedSize:Ce(v,b),acCompressedSize:Ce(v,b),dcCompressedSize:Ce(v,b),rleCompressedSize:Ce(v,b),rleUncompressedSize:Ce(v,b),rleRawSize:Ce(v,b),totalAcUncompressedCount:Ce(v,b),totalDcUncompressedCount:Ce(v,b),acCompression:Ce(v,b)};if(F.version<2)throw Error("EXRLoader.parse: "+Bi.compression+" version "+F.version+" is unsupported");let O=[],N=Ne(v,b)-2;while(N>0){let we=Fe(v.buffer,b),Re=ke(v,b),Ue=Re>>2&3,Le=(Re>>4)-1,Qe=new Int8Array([Le])[0],je=ke(v,b);O.push({name:we,index:Qe,type:je,compression:Ue}),N-=we.length+3}let j=Bi.channels,J=Array(_.inputChannels.length);for(let we=0;we<_.inputChannels.length;++we){let Re=J[we]={},Ue=j[we];Re.name=Ue.name,Re.compression=0,Re.decoded=!1,Re.type=Ue.pixelType,Re.pLinear=Ue.pLinear,Re.width=_.columns,Re.height=_.lines}let K={idx:[,,,]};for(let we=0;we<_.inputChannels.length;++we){let Re=J[we];for(let Ue=0;Ue<O.length;++Ue){let Le=O[Ue];if(Re.name==Le.name){if(Re.compression=Le.compression,Le.index>=0)K.idx[Le.index]=we;Re.offset=we}}}let ee,he,ie;if(F.acCompressedSize>0)switch(F.acCompression){case 0:ee=new Uint16Array(F.totalAcUncompressedCount),We(_.array,v,b,F.acCompressedSize,ee,F.totalAcUncompressedCount);break;case 1:let we=_.array.slice(b.value,b.value+F.totalAcUncompressedCount),Re=tl(we);ee=new Uint16Array(Re.buffer),b.value+=F.totalAcUncompressedCount;break}if(F.dcCompressedSize>0){let we={array:_.array,offset:b,size:F.dcCompressedSize};he=new Uint16Array(Z(we).buffer),b.value+=F.dcCompressedSize}if(F.rleRawSize>0){let we=_.array.slice(b.value,b.value+F.rleCompressedSize),Re=tl(we);ie=pe(Re.buffer),b.value+=F.rleCompressedSize}let _e=0,De=Array(J.length);for(let we=0;we<De.length;++we)De[we]=[];for(let we=0;we<_.lines;++we)for(let Re=0;Re<J.length;++Re)De[Re].push(_e),_e+=J[Re].width*_.type*2;if(K.idx[0]!==void 0&&J[K.idx[0]])me(K,De,J,ee,he,L);for(let we=0;we<J.length;++we){let Re=J[we];if(Re.decoded)continue;switch(Re.compression){case 2:let Ue=0,Le=0;for(let Qe=0;Qe<_.lines;++Qe){let je=De[we][Ue];for(let ut=0;ut<Re.width;++ut){for(let $e=0;$e<2*Re.type;++$e)L[je++]=ie[Le+$e*Re.width*Re.height];Le++}Ue++}break;case 1:de(we,De,J,ee,he,L);break;default:throw Error("EXRLoader.parse: unsupported channel compression")}}return new DataView(L.buffer)}function Fe(_,v){let b=new Uint8Array(_),L=0;while(b[v.value+L]!=0)L+=1;let F=new TextDecoder().decode(b.slice(v.value,v.value+L));return v.value=v.value+L+1,F}function Ae(_,v,b){let L=new TextDecoder().decode(new Uint8Array(_).slice(v.value,v.value+b));return v.value=v.value+b,L}function Ve(_,v){let b=Me(_,v),L=Pe(_,v);return[b,L]}function Ke(_,v){let b=Pe(_,v),L=Pe(_,v);return[b,L]}function Me(_,v){let b=_.getInt32(v.value,!0);return v.value=v.value+4,b}function Pe(_,v){let b=_.getUint32(v.value,!0);return v.value=v.value+4,b}function Ze(_,v){let b=_[v.value];return v.value=v.value+1,b}function ke(_,v){let b=_.getUint8(v.value);return v.value=v.value+1,b}let Ce=function(_,v){let b;if("getBigInt64"in DataView.prototype)b=Number(_.getBigInt64(v.value,!0));else b=_.getUint32(v.value+4,!0)+Number(_.getUint32(v.value,!0)<<32);return v.value+=8,b};function qe(_,v){let b=_.getFloat32(v.value,!0);return v.value+=4,b}function V(_,v){return mi.toHalfFloat(qe(_,v))}function ne(_){let v=(_&31744)>>10,b=_&1023;return(_>>15?-1:1)*(v?v===31?b?NaN:1/0:Math.pow(2,v-15)*(1+b/1024):0.00006103515625*(b/1024))}function Ne(_,v){let b=_.getUint16(v.value,!0);return v.value+=2,b}function Xe(_,v){return ne(Ne(_,v))}function Te(_,v,b,L){let F=b.value,O=[];while(b.value<F+L-1){let N=Fe(v,b),j=Me(_,b),J=ke(_,b);b.value+=3;let K=Me(_,b),ee=Me(_,b);O.push({name:N,pixelType:j,pLinear:J,xSampling:K,ySampling:ee})}return b.value+=1,O}function xe(_,v){let b=qe(_,v),L=qe(_,v),F=qe(_,v),O=qe(_,v),N=qe(_,v),j=qe(_,v),J=qe(_,v),K=qe(_,v);return{redX:b,redY:L,greenX:F,greenY:O,blueX:N,blueY:j,whiteX:J,whiteY:K}}function Ye(_,v){let b=["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"],L=ke(_,v);return b[L]}function lt(_,v){let b=Me(_,v),L=Me(_,v),F=Me(_,v),O=Me(_,v);return{xMin:b,yMin:L,xMax:F,yMax:O}}function At(_,v){let b=["INCREASING_Y","DECREASING_Y","RANDOM_Y"],L=ke(_,v);return b[L]}function Et(_,v){let b=["ENVMAP_LATLONG","ENVMAP_CUBE"],L=ke(_,v);return b[L]}function Vn(_,v){let b=["ONE_LEVEL","MIPMAP_LEVELS","RIPMAP_LEVELS"],L=["ROUND_DOWN","ROUND_UP"],F=Pe(_,v),O=Pe(_,v),N=ke(_,v);return{xSize:F,ySize:O,levelMode:b[N&15],roundingMode:L[N>>4]}}function Xn(_,v){let b=qe(_,v),L=qe(_,v);return[b,L]}function Oi(_,v){let b=qe(_,v),L=qe(_,v),F=qe(_,v);return[b,L,F]}function Co(_,v,b,L,F){if(L==="string"||L==="stringvector"||L==="iccProfile")return Ae(v,b,F);else if(L==="chlist")return Te(_,v,b,F);else if(L==="chromaticities")return xe(_,b);else if(L==="compression")return Ye(_,b);else if(L==="box2i")return lt(_,b);else if(L==="envmap")return Et(_,b);else if(L==="tiledesc")return Vn(_,b);else if(L==="lineOrder")return At(_,b);else if(L==="float")return qe(_,b);else if(L==="v2f")return Xn(_,b);else if(L==="v3f")return Oi(_,b);else if(L==="int")return Me(_,b);else if(L==="rational")return Ve(_,b);else if(L==="timecode")return Ke(_,b);else if(L==="preview")return b.value+=F,"skipped";else{b.value+=F;return}}function Al(_,v){let b=Math.log2(_);return v=="ROUND_DOWN"?Math.floor(b):Math.ceil(b)}function Rl(_,v,b){let L=0;switch(_.levelMode){case"ONE_LEVEL":L=1;break;case"MIPMAP_LEVELS":L=Al(Math.max(v,b),_.roundingMode)+1;break;case"RIPMAP_LEVELS":throw Error("THREE.EXRLoader: RIPMAP_LEVELS tiles currently unsupported.")}return L}function Cs(_,v,b,L){let F=Array(_);for(let O=0;O<_;O++){let N=1<<O,j=v/N|0;if(L=="ROUND_UP"&&j*N<v)j+=1;let J=Math.max(j,1);F[O]=(J+b-1)/b|0}return F}function Cl(){let _=this,v=_.offset,b={value:0};for(let L=0;L<_.tileCount;L++){let F=Me(_.viewer,v),O=Me(_.viewer,v);v.value+=8,_.size=Pe(_.viewer,v);let N=F*_.blockWidth,j=O*_.blockHeight;_.columns=N+_.blockWidth>_.width?_.width-N:_.blockWidth,_.lines=j+_.blockHeight>_.height?_.height-j:_.blockHeight;let J=_.columns*_.totalBytes,ee=_.size<_.lines*J?_.uncompress(_):U(_);v.value+=_.size;for(let he=0;he<_.lines;he++){let ie=he*_.columns*_.totalBytes;for(let _e=0;_e<_.inputChannels.length;_e++){let De=Bi.channels[_e].name,we=_.channelByteOffsets[De]*_.columns,Re=_.decodeChannels[De];if(Re===void 0)continue;b.value=ie+we;let Ue=(_.height-(1+j+he))*_.outLineWidth;for(let Le=0;Le<_.columns;Le++){let Qe=Ue+(Le+N)*_.outputChannels+Re;_.byteArray[Qe]=_.getter(ee,b)}}}}}function wr(){let _=this,v=_.offset,b={value:0};for(let L=0;L<_.height/_.blockHeight;L++){let F=Me(_.viewer,v)-Bi.dataWindow.yMin;_.size=Pe(_.viewer,v),_.lines=F+_.blockHeight>_.height?_.height-F:_.blockHeight;let O=_.columns*_.totalBytes,j=_.size<_.lines*O?_.uncompress(_):U(_);v.value+=_.size;for(let J=0;J<_.blockHeight;J++){let K=L*_.blockHeight,ee=J+_.scanOrder(K);if(ee>=_.height)continue;let he=J*O,ie=(_.height-1-ee)*_.outLineWidth;for(let _e=0;_e<_.inputChannels.length;_e++){let De=Bi.channels[_e].name,we=_.channelByteOffsets[De]*_.columns,Re=_.decodeChannels[De];if(Re===void 0)continue;b.value=he+we;for(let Ue=0;Ue<_.columns;Ue++){let Le=ie+Ue*_.outputChannels+Re;_.byteArray[Le]=_.getter(j,b)}}}}}function Il(_,v,b){let L={};if(_.getUint32(0,!0)!=20000630)throw Error("THREE.EXRLoader: Provided file doesn't appear to be in OpenEXR format.");L.version=_.getUint8(4);let F=_.getUint8(5);L.spec={singleTile:!!(F&2),longName:!!(F&4),deepFormat:!!(F&8),multiPart:!!(F&16)},b.value=8;let O=!0;while(O){let N=Fe(v,b);if(N==="")O=!1;else{let j=Fe(v,b),J=Pe(_,b),K=Co(_,v,b,j,J);if(K===void 0)console.warn(`THREE.EXRLoader: Skipped unknown header attribute type '${j}'.`);else L[N]=K}}if((F&-7)!=0)throw console.error("THREE.EXRHeader:",L),Error("THREE.EXRLoader: Provided file is currently unsupported.");return L}function Pl(_,v,b,L,F,O){let N={size:0,viewer:v,array:b,offset:L,width:_.dataWindow.xMax-_.dataWindow.xMin+1,height:_.dataWindow.yMax-_.dataWindow.yMin+1,inputChannels:_.channels,channelByteOffsets:{},shouldExpand:!1,scanOrder:null,totalBytes:null,columns:null,lines:null,type:null,uncompress:null,getter:null,format:null,colorSpace:Dt};switch(_.compression){case"NO_COMPRESSION":N.blockHeight=1,N.uncompress=U;break;case"RLE_COMPRESSION":N.blockHeight=1,N.uncompress=A;break;case"ZIPS_COMPRESSION":N.blockHeight=1,N.uncompress=Z;break;case"ZIP_COMPRESSION":N.blockHeight=16,N.uncompress=Z;break;case"PIZ_COMPRESSION":N.blockHeight=32,N.uncompress=ue;break;case"PXR24_COMPRESSION":N.blockHeight=16,N.uncompress=ye;break;case"DWAA_COMPRESSION":N.blockHeight=32,N.uncompress=oe;break;case"DWAB_COMPRESSION":N.blockHeight=256,N.uncompress=oe;break;default:throw Error("EXRLoader.parse: "+_.compression+" is unsupported")}let j={};for(let ie of _.channels)switch(ie.name){case"Y":case"R":case"G":case"B":case"A":j[ie.name]=!0,N.type=ie.pixelType}let J=!1,K=!1;if(j.R&&j.G&&j.B)N.outputChannels=4;else if(j.Y)N.outputChannels=1;else throw Error("EXRLoader.parse: file contains unsupported data channels.");switch(N.outputChannels){case 4:if(O==Jt)J=!j.A,N.format=Jt,N.colorSpace=Dt,N.outputChannels=4,N.decodeChannels={R:0,G:1,B:2,A:3};else if(O==Ji)N.format=Ji,N.colorSpace=Dt,N.outputChannels=2,N.decodeChannels={R:0,G:1};else if(O==vs)N.format=vs,N.colorSpace=Dt,N.outputChannels=1,N.decodeChannels={R:0};else K=!0;break;case 1:if(O==Jt)J=!0,N.format=Jt,N.colorSpace=Dt,N.outputChannels=4,N.shouldExpand=!0,N.decodeChannels={Y:0};else if(O==Ji)N.format=Ji,N.colorSpace=Dt,N.outputChannels=2,N.shouldExpand=!0,N.decodeChannels={Y:0};else if(O==vs)N.format=vs,N.colorSpace=Dt,N.outputChannels=1,N.decodeChannels={Y:0};else K=!0;break;default:K=!0}if(K)throw Error("EXRLoader.parse: invalid output format for specified file.");if(N.type==1)switch(F){case hn:N.getter=Xe;break;case It:N.getter=Ne;break}else if(N.type==2)switch(F){case hn:N.getter=qe;break;case It:N.getter=V}else throw Error("EXRLoader.parse: unsupported pixelType "+N.type+" for "+_.compression+".");N.columns=N.width;let ee=N.width*N.height*N.outputChannels;switch(F){case hn:if(N.byteArray=new Float32Array(ee),J)N.byteArray.fill(1,0,ee);break;case It:if(N.byteArray=new Uint16Array(ee),J)N.byteArray.fill(15360,0,ee);break;default:console.error("THREE.EXRLoader: unsupported type: ",F);break}let he=0;for(let ie of _.channels){if(N.decodeChannels[ie.name]!==void 0)N.channelByteOffsets[ie.name]=he;he+=ie.pixelType*2}if(N.totalBytes=he,N.outLineWidth=N.width*N.outputChannels,_.lineOrder==="INCREASING_Y")N.scanOrder=(ie)=>ie;else N.scanOrder=(ie)=>N.height-1-ie;if(_.spec.singleTile){N.blockHeight=_.tiles.ySize,N.blockWidth=_.tiles.xSize;let ie=Rl(_.tiles,N.width,N.height),_e=Cs(ie,N.width,_.tiles.xSize,_.tiles.roundingMode),De=Cs(ie,N.height,_.tiles.ySize,_.tiles.roundingMode);N.tileCount=_e[0]*De[0];for(let we=0;we<ie;we++)for(let Re=0;Re<De[we];Re++)for(let Ue=0;Ue<_e[we];Ue++)Ce(v,L);N.decode=Cl.bind(N)}else{N.blockWidth=N.width;let ie=Math.ceil(N.height/N.blockHeight);for(let _e=0;_e<ie;_e++)Ce(v,L);N.decode=wr.bind(N)}return N}let Dl={value:0},Ll=new DataView(e),pu=new Uint8Array(e),Bi=Il(Ll,e,Dl),wi=Pl(Bi,Ll,pu,Dl,this.type,this.outputFormat);if(wi.decode(),wi.shouldExpand){let _=wi.byteArray;if(this.outputFormat==Jt)for(let v=0;v<_.length;v+=4)_[v+2]=_[v+1]=_[v];else if(this.outputFormat==Ji)for(let v=0;v<_.length;v+=2)_[v+1]=_[v]}return{header:Bi,width:wi.width,height:wi.height,data:wi.byteArray,format:wi.format,colorSpace:wi.colorSpace,type:this.type}}setDataType(e){return this.type=e,this}setOutputFormat(e){return this.outputFormat=e,this}load(e,t,n,i){function s(r,o){if(r.colorSpace=o.colorSpace,r.minFilter=Kt,r.magFilter=Kt,r.generateMipmaps=!1,r.flipY=!1,t)t(r,o)}return super.load(e,s,n,i)}}class fp extends dr{constructor(e){super(e);this.type=It}parse(e){let r=function(E,D){switch(E){case 1:throw Error("THREE.HDRLoader: Read Error: "+(D||""));case 2:throw Error("THREE.HDRLoader: Write Error: "+(D||""));case 3:throw Error("THREE.HDRLoader: Bad File Format: "+(D||""));default:case 4:throw Error("THREE.HDRLoader: Memory Error: "+(D||""))}},h=function(E,D,w){D=!D?1024:D;let P=E.pos,B=-1,H=0,k="",X=String.fromCharCode.apply(null,new Uint16Array(E.subarray(P,P+128)));while(0>(B=X.indexOf(`
`))&&H<D&&P<E.byteLength)k+=X,H+=X.length,P+=128,X+=String.fromCharCode.apply(null,new Uint16Array(E.subarray(P,P+128)));if(-1<B){if(w!==!1)E.pos+=H+B+1;return k+X.slice(0,B)}return!1},u=function(E){let D=/^#\?(\S+)/,w=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,T=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,P=/^\s*FORMAT=(\S+)\s*$/,B=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,H={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0},k,X;if(E.pos>=E.byteLength||!(k=h(E)))r(1,"no header found");if(!(X=k.match(D)))r(3,"bad initial token");H.valid|=1,H.programtype=X[1],H.string+=k+`
`;while(!0){if(k=h(E),k===!1)break;if(H.string+=k+`
`,k.charAt(0)==="#"){H.comments+=k+`
`;continue}if(X=k.match(w))H.gamma=parseFloat(X[1]);if(X=k.match(T))H.exposure=parseFloat(X[1]);if(X=k.match(P))H.valid|=2,H.format=X[1];if(X=k.match(B))H.valid|=4,H.height=parseInt(X[1],10),H.width=parseInt(X[2],10);if(H.valid&2&&H.valid&4)break}if(!(H.valid&2))r(3,"missing format specifier");if(!(H.valid&4))r(3,"missing image size specifier");return H},f=function(E,D,w){let T=D;if(T<8||T>32767||(E[0]!==2||E[1]!==2||E[2]&128))return new Uint8Array(E);if(T!==(E[2]<<8|E[3]))r(3,"wrong scanline width");let P=new Uint8Array(4*D*w);if(!P.length)r(4,"unable to allocate buffer space");let B=0,H=0,k=4*T,X=new Uint8Array(4),q=new Uint8Array(k),re=w;while(re>0&&H<E.byteLength){if(H+4>E.byteLength)r(1);if(X[0]=E[H++],X[1]=E[H++],X[2]=E[H++],X[3]=E[H++],X[0]!=2||X[1]!=2||(X[2]<<8|X[3])!=T)r(3,"bad rgbe scanline format");let W=0,Q;while(W<k&&H<E.byteLength){Q=E[H++];let ge=Q>128;if(ge)Q-=128;if(Q===0||W+Q>k)r(3,"bad scanline data");if(ge){let ve=E[H++];for(let Ge=0;Ge<Q;Ge++)q[W++]=ve}else q.set(E.subarray(H,H+Q),W),W+=Q,H+=Q}let ae=T;for(let ge=0;ge<ae;ge++){let ve=0;P[B]=q[ge+ve],ve+=T,P[B+1]=q[ge+ve],ve+=T,P[B+2]=q[ge+ve],ve+=T,P[B+3]=q[ge+ve],B+=4}re--}return P},d=function(E,D,w,T){let P=E[D+3],B=Math.pow(2,P-128)/255;w[T+0]=E[D+0]*B,w[T+1]=E[D+1]*B,w[T+2]=E[D+2]*B,w[T+3]=1},g=function(E,D,w,T){let P=E[D+3],B=Math.pow(2,P-128)/255;w[T+0]=mi.toHalfFloat(Math.min(E[D+0]*B,65504)),w[T+1]=mi.toHalfFloat(Math.min(E[D+1]*B,65504)),w[T+2]=mi.toHalfFloat(Math.min(E[D+2]*B,65504)),w[T+3]=mi.toHalfFloat(1)},x=new Uint8Array(e);x.pos=0;let m=u(x),{width:p,height:M}=m,y=f(x.subarray(x.pos),p,M),S,C,R;switch(this.type){case hn:R=y.length/4;let E=new Float32Array(R*4);for(let w=0;w<R;w++)d(y,w*4,E,w*4);S=E,C=hn;break;case It:R=y.length/4;let D=new Uint16Array(R*4);for(let w=0;w<R;w++)g(y,w*4,D,w*4);S=D,C=It;break;default:throw Error("THREE.HDRLoader: Unsupported type: "+this.type)}return{width:p,height:M,data:S,header:m.string,gamma:m.gamma,exposure:m.exposure,type:C}}setDataType(e){return this.type=e,this}load(e,t,n,i){function s(r,o){switch(r.type){case hn:case It:r.colorSpace=Dt,r.minFilter=Kt,r.magFilter=Kt,r.generateMipmaps=!1,r.flipY=!0;break}if(t)t(r,o)}return super.load(e,s,n,i)}}class dp extends fp{constructor(e){console.warn("RGBELoader has been deprecated. Please use HDRLoader instead.");super(e)}}var Fi={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Mn{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}var ob=new Li(-1,1,1,-1,0,1);class Nv extends Je{constructor(){super();this.setAttribute("position",new ze([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ze([0,2,0,0,2,0],2))}}var ab=new Nv;class yi{constructor(e){this._mesh=new vt(ab,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,ob)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class _r extends Mn{constructor(e,t="tDiffuse"){super();if(this.textureID=t,this.uniforms=null,this.material=null,e instanceof xt)this.uniforms=e.uniforms,this.material=e;else if(e)this.uniforms=jt.clone(e.uniforms),this.material=new xt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader});this._fsQuad=new yi(this.material)}render(e,t,n){if(this.uniforms[this.textureID])this.uniforms[this.textureID].value=n.texture;if(this._fsQuad.material=this.material,this.renderToScreen)e.setRenderTarget(null),this._fsQuad.render(e);else{if(e.setRenderTarget(t),this.clear)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);this._fsQuad.render(e)}}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class ou extends Mn{constructor(e,t){super();this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let i=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let r,o;if(this.inverse)r=0,o=1;else r=1,o=0;if(s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),s.buffers.stencil.setFunc(i.ALWAYS,r,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear)e.clear();if(e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear)e.clear();e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(i.EQUAL,1,4294967295),s.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),s.buffers.stencil.setLocked(!0)}}class pp extends Mn{constructor(){super();this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class il{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new se);this._width=n.width,this._height=n.height,t=new Ft(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:It}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new _r(Fi),this.copyPass.material.blending=Zt,this.clock=new bs}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);if(t!==-1)this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){if(e===void 0)e=this.clock.getDelta();let t=this.renderer.getRenderTarget(),n=!1;for(let i=0,s=this.passes.length;i<s;i++){let r=this.passes[i];if(r.enabled===!1)continue;if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let o=this.renderer.getContext(),a=this.renderer.state.buffers.stencil;a.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),a.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}if(ou!==void 0){if(r instanceof ou)n=!0;else if(r instanceof pp)n=!1}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new se);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class sl extends Mn{constructor(e,t,n=null,i=null,s=null){super();this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=i,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new fe}render(e,t,n){let i=e.autoClear;e.autoClear=!1;let s,r;if(this.overrideMaterial!==null)r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial;if(this.clearColor!==null)e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha());if(this.clearAlpha!==null)s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha);if(this.clearDepth==!0)e.clearDepth();if(e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);if(e.render(this.scene,this.camera),this.clearColor!==null)e.setClearColor(this._oldClearColor);if(this.clearAlpha!==null)e.setClearAlpha(s);if(this.overrideMaterial!==null)this.scene.overrideMaterial=r;e.autoClear=i}}var Uv={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new fe(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class ns extends Mn{constructor(e,t=1,n,i){super();this.strength=t,this.radius=n,this.threshold=i,this.resolution=e!==void 0?new se(e.x,e.y):new se(256,256),this.clearColor=new fe(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new Ft(s,r,{type:It}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){let h=new Ft(s,r,{type:It});h.texture.name="UnrealBloomPass.h"+c,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);let u=new Ft(s,r,{type:It});u.texture.name="UnrealBloomPass.v"+c,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),s=Math.round(s/2),r=Math.round(r/2)}let o=Uv;this.highPassUniforms=jt.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=0.01,this.materialHighPassFilter=new xt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let a=[3,5,7,9,11];s=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(a[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new se(1/s,1/r),s=Math.round(s/2),r=Math.round(r/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=0.1;let l=[1,0.8,0.6,0.4,0.2];this.compositeMaterial.uniforms.bloomFactors.value=l,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=jt.clone(Fi.uniforms),this.blendMaterial=new xt({uniforms:this.copyUniforms,vertexShader:Fi.vertexShader,fragmentShader:Fi.fragmentShader,blending:di,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new fe,this._oldClearAlpha=1,this._basic=new on,this._fsQuad=new yi(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),i=Math.round(t/2);this.renderTargetBright.setSize(n,i);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,i),this.renderTargetsVertical[s].setSize(n,i),this.separableBlurMaterials[s].uniforms.invSize.value=new se(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(e,t,n,i,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let r=e.autoClear;if(e.autoClear=!1,e.setClearColor(this.clearColor,0),s)e.state.buffers.stencil.setTest(!1);if(this.renderToScreen)this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e);this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let a=0;a<this.nMips;a++)this._fsQuad.material=this.separableBlurMaterials[a],this.separableBlurMaterials[a].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[a].uniforms.direction.value=ns.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[a]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[a].uniforms.colorTexture.value=this.renderTargetsHorizontal[a].texture,this.separableBlurMaterials[a].uniforms.direction.value=ns.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[a]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[a];if(this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s)e.state.buffers.stencil.setTest(!0);if(this.renderToScreen)e.setRenderTarget(null),this._fsQuad.render(e);else e.setRenderTarget(n),this._fsQuad.render(e);e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=r}_getSeparableBlurMaterial(e){let t=[];for(let n=0;n<e;n++)t.push(0.39894*Math.exp(-0.5*n*n/(e*e))/e);return new xt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new se(0.5,0.5)},direction:{value:new se(0.5,0.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}_getCompositeMaterial(e){return new xt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}ns.BlurDirectionX=new se(1,0);ns.BlurDirectionY=new se(0,1);var rl={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class ol extends Mn{constructor(){super();this.uniforms=jt.clone(rl.uniforms),this.material=new po({name:rl.name,uniforms:this.uniforms,vertexShader:rl.vertexShader,fragmentShader:rl.fragmentShader}),this._fsQuad=new yi(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){if(this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping){if(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},mt.getTransfer(this._outputColorSpace)===Ct)this.material.defines.SRGB_TRANSFER="";if(this._toneMapping===oa)this.material.defines.LINEAR_TONE_MAPPING="";else if(this._toneMapping===aa)this.material.defines.REINHARD_TONE_MAPPING="";else if(this._toneMapping===la)this.material.defines.CINEON_TONE_MAPPING="";else if(this._toneMapping===Zi)this.material.defines.ACES_FILMIC_TONE_MAPPING="";else if(this._toneMapping===Ys)this.material.defines.AGX_TONE_MAPPING="";else if(this._toneMapping===Zs)this.material.defines.NEUTRAL_TONE_MAPPING="";else if(this._toneMapping===ca)this.material.defines.CUSTOM_TONE_MAPPING="";this.material.needsUpdate=!0}if(this.renderToScreen===!0)e.setRenderTarget(null),this._fsQuad.render(e);else{if(e.setRenderTarget(t),this.clear)e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil);this._fsQuad.render(e)}}dispose(){this.material.dispose(),this._fsQuad.dispose()}}function mp(e,t){if(t.getBoneName!==void 0)return t.getBoneName(e);return t.names[e.name]}function Fv(e,t,n={}){let i=new Nt,s=new I,r=new He,o=new He;n.preserveBoneMatrix=n.preserveBoneMatrix!==void 0?n.preserveBoneMatrix:!0,n.preserveBonePositions=n.preserveBonePositions!==void 0?n.preserveBonePositions:!0,n.useTargetMatrix=n.useTargetMatrix!==void 0?n.useTargetMatrix:!1,n.hip=n.hip!==void 0?n.hip:"hip",n.hipInfluence=n.hipInfluence!==void 0?n.hipInfluence:new I(1,1,1),n.scale=n.scale!==void 0?n.scale:1,n.names=n.names||{};let a=t.isObject3D?t.skeleton.bones:au(t),l=e.isObject3D?e.skeleton.bones:au(e),c,h,u,f;if(e.isObject3D)e.skeleton.pose();else n.useTargetMatrix=!0,n.preserveBoneMatrix=!1;if(n.preserveBonePositions){f=[];for(let d=0;d<l.length;d++)f.push(l[d].position.clone())}if(n.preserveBoneMatrix){e.updateMatrixWorld(),e.matrixWorld.identity();for(let d=0;d<e.children.length;++d)e.children[d].updateMatrixWorld(!0)}for(let d=0;d<l.length;++d){if(c=l[d],h=mp(c,n),u=Ov(h,a),o.copy(c.matrixWorld),u){if(u.updateMatrixWorld(),n.useTargetMatrix)r.copy(u.matrixWorld);else r.copy(e.matrixWorld).invert(),r.multiply(u.matrixWorld);if(s.setFromMatrixScale(r),r.scale(s.set(1/s.x,1/s.y,1/s.z)),o.makeRotationFromQuaternion(i.setFromRotationMatrix(r)),e.isObject3D){if(n.localOffsets){if(n.localOffsets[c.name])o.multiply(n.localOffsets[c.name])}}o.copyPosition(r)}if(h===n.hip){if(o.elements[12]*=n.scale*n.hipInfluence.x,o.elements[13]*=n.scale*n.hipInfluence.y,o.elements[14]*=n.scale*n.hipInfluence.z,n.hipPosition!==void 0)o.elements[12]+=n.hipPosition.x*n.scale,o.elements[13]+=n.hipPosition.y*n.scale,o.elements[14]+=n.hipPosition.z*n.scale}if(c.parent)c.matrix.copy(c.parent.matrixWorld).invert(),c.matrix.multiply(o);else c.matrix.copy(o);c.matrix.decompose(c.position,c.quaternion,c.scale),c.updateMatrixWorld()}if(n.preserveBonePositions){for(let d=0;d<l.length;++d)if(c=l[d],h=mp(c,n)||c.name,h!==n.hip)c.position.copy(f[d])}if(n.preserveBoneMatrix)e.updateMatrixWorld(!0)}function lb(e,t,n,i={}){if(i.useFirstFramePosition=i.useFirstFramePosition!==void 0?i.useFirstFramePosition:!1,i.fps=i.fps!==void 0?i.fps:Math.max(...n.tracks.map((p)=>p.times.length))/n.duration,i.names=i.names||[],!t.isObject3D)t=hb(t);let s=Math.round(n.duration*(i.fps/1000)*1000),r=n.duration/(s-1),o=[],a=new pr(t),l=au(e.skeleton),c=[],h,u,f,d,g;a.clipAction(n).play();let x=0,m=s;if(i.trim!==void 0)x=Math.round(i.trim[0]*i.fps),m=Math.min(Math.round(i.trim[1]*i.fps),s)-x,a.update(i.trim[0]);else a.update(0);t.updateMatrixWorld();for(let p=0;p<m;++p){let M=p*r;Fv(e,t,i);for(let y=0;y<l.length;++y)if(u=l[y],g=mp(u,i)||u.name,f=Ov(g,t.skeleton),f){if(d=c[y]=c[y]||{bone:u},i.hip===g){if(!d.pos)d.pos={times:new Float32Array(m),values:new Float32Array(m*3)};if(i.useFirstFramePosition){if(p===0)h=u.position.clone();u.position.sub(h)}d.pos.times[p]=M,u.position.toArray(d.pos.values,p*3)}if(!d.quat)d.quat={times:new Float32Array(m),values:new Float32Array(m*4)};d.quat.times[p]=M,u.quaternion.toArray(d.quat.values,p*4)}if(p===m-2)a.update(r-0.0000001);else a.update(r);t.updateMatrixWorld()}for(let p=0;p<c.length;++p)if(d=c[p],d){if(d.pos)o.push(new jn(".bones["+d.bone.name+"].position",d.pos.times,d.pos.values));o.push(new ti(".bones["+d.bone.name+"].quaternion",d.quat.times,d.quat.values))}return a.uncacheAction(n),new hi(n.name,-1,o)}function cb(e){let t=new Map,n=new Map,i=e.clone();return Bv(e,i,function(s,r){t.set(r,s),n.set(s,r)}),i.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,o=t.get(s),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return n.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),i}function Ov(e,t){for(let n=0,i=au(t);n<i.length;n++)if(e===i[n].name)return i[n]}function au(e){return Array.isArray(e)?e:e.bones}function hb(e){let t=new Za(e.bones[0]);return t.skeleton=e,t}function Bv(e,t,n){n(e,t);for(let i=0;i<e.children.length;i++)Bv(e.children[i],t.children[i],n)}function is(e=1){let t=e>>>0||1;return()=>(t^=t<<13,t^=t>>>17,t^=t<<5,(t>>>0)%1e6/1e6)}var Un=(e,t,n=0)=>{let i=e*374761393+t*668265263+n*2147483647|0;return i=Math.imul(i^i>>>13,1274126177),((i^i>>>16)>>>0)/4294967296};function ub(e,t,n,i){let s=Math.floor(e),r=Math.floor(t),o=e-s,a=t-r,l=o*o*(3-2*o),c=a*a*(3-2*a),h=(x,m)=>Un((x%n+n)%n,(m%n+n)%n,i),u=h(s,r),f=h(s+1,r),d=h(s,r+1),g=h(s+1,r+1);return u+(f-u)*l+(d-u)*c+(u-f-d+g)*l*c}function Wt(e,t,n,i={}){let{octaves:s=5,base:r=4,seed:o=7,gain:a=0.5}=i,l=1,c=0,h=0,u=r;for(let f=0;f<s;f++)c+=l*ub(e/n*u,t/n*u,u,o+f*31),h+=l,l*=a,u*=2;return c/h}function Es(e){let t=document.createElement("canvas");return t.width=t.height=e,t}function zv(e,t,n=2){let i=Es(t),s=i.getContext("2d"),r=s.createImageData(t,t),o=(a,l)=>e[(l+t)%t*t+(a+t)%t];for(let a=0;a<t;a++)for(let l=0;l<t;l++){let c=(o(l+1,a)-o(l-1,a))*n,h=(o(l,a+1)-o(l,a-1))*n,u=Math.hypot(c,h,1),f=(a*t+l)*4;r.data[f]=(-c/u*0.5+0.5)*255,r.data[f+1]=(h/u*0.5+0.5)*255,r.data[f+2]=(1/u*0.5+0.5)*255,r.data[f+3]=255}return s.putImageData(r,0,0),i}function vp(e,t){let n=Es(e),i=n.getContext("2d"),s=i.createImageData(e,e);for(let r=0;r<e;r++)for(let o=0;o<e;o++){let[a,l,c]=t(o,r),h=(r*e+o)*4;s.data[h]=Math.max(0,Math.min(255,a*255)),s.data[h+1]=Math.max(0,Math.min(255,l*255)),s.data[h+2]=Math.max(0,Math.min(255,c*255)),s.data[h+3]=255}return i.putImageData(s,0,0),n}function al(e,{color:t=!1,repeat:n=!0,aniso:i=8}={}){let s=new Pi(e);if(t)s.colorSpace=en;if(n)s.wrapS=s.wrapT=cn;return s.anisotropy=i,s.generateMipmaps=!0,s.minFilter=$n,s}var Hv=(e,t,n)=>e+(t-e)*n,Mr=(e)=>Math.max(0,Math.min(1,e)),Sr=(e,t,n)=>{let i=Mr((n-e)/(t-e));return i*i*(3-2*i)};function Fn(e){let t=new fe(e).getRGB({r:0,g:0,b:0},en);return[t.r,t.g,t.b]}var Tt=512,xp=new Map;function si(e,t,n){if(xp.has(e))return xp.get(e);let i=new Float32Array(t*t),s=new Float32Array(t*t),r=vp(t,(l,c)=>{let h=n(l,c);return i[c*t+l]=h.h,s[c*t+l]=h.r,h.c}),o=vp(t,(l,c)=>{let h=s[c*t+l];return[h,h,h]}),a={map:al(r,{color:!0}),normalMap:al(zv(i,t,3)),roughnessMap:al(o)};return xp.set(e,a),a}function _i(e,t,n,i={}){let s=new Pt({...n,...i});return s.userData.look={name:e,tile:t,uv:"meters"},s}function ll(e={}){let{tile:t=8,wet:n=0,color:i="#3a3b3d",seed:s=3}=e,r=Fn(i),o=si(`asphalt:${i}:${s}:${n.toFixed(2)}`,Tt,(a,l)=>{let c=Un(a,l,s),h=Wt(a,l,Tt,{base:3,octaves:4,seed:s}),u=Wt(a,l,Tt,{base:12,octaves:3,seed:s+5}),f=1-Math.abs(Wt(a,l,Tt,{base:6,octaves:3,seed:s+9})*2-1),d=Sr(0.965,0.995,f)*Sr(0.5,0.65,h)*0.6,g=n*Sr(0.52,0.6,1-h+(u-0.5)*0.3),x=c>0.86?0.25:c<0.08?-0.18:0,m=0.84+(h-0.5)*0.22+(u-0.5)*0.12+x*0.35-d*0.45;m*=1-n*0.35-g*0.25;let p=r.map((y)=>y*m*1.25),M=Mr(Hv(0.92-x*0.2,0.06,g)-n*0.25);return{c:p,h:g>0.3?0.4:c*0.3+u*0.2-d*0.5,r:M}});return _i("asphalt",t,{...o,color:16777215,roughness:1,metalness:0,envMapIntensity:1+n*0.8})}function cl(e={}){let{tile:t=3,slabs:n=2,color:i="#9a9893",wet:s=0,seed:r=11}=e,o=Fn(i),a=si(`pavement:${i}:${n}:${s.toFixed(2)}`,Tt,(l,c)=>{let h=Tt/n,u=l%h/h,f=c%h/h,d=Math.min(u,f,1-u,1-f)<0.012?1:0,g=Un(Math.floor(l/h),Math.floor(c/h),r),x=Wt(l,c,Tt,{base:8,octaves:5,seed:r}),m=Sr(0.62,0.75,Wt(l,c,Tt,{base:3,octaves:3,seed:r+3})),p=Un(l>>1,c>>1,r+7)>0.9993?1:0,M=0.9+(g-0.5)*0.12+(x-0.5)*0.25-m*0.18-d*0.45-p*0.4;return M*=1-s*0.3,{c:o.map((y)=>y*M),h:d?0:0.6+x*0.3,r:Mr(0.88-s*0.45+d*0.1-m*s*0.3)}});return _i("pavement",t,{...a,roughness:1})}function _p(e={}){let{tile:t=4,color:n="#8d8a84",seed:i=21,wet:s=0}=e,r=Fn(n),o=si(`concrete:${n}:${s.toFixed(2)}`,Tt,(a,l)=>{let c=Wt(a,l,Tt,{base:4,octaves:6,seed:i}),h=Un(a,l,i)>0.97?1:0,u=0.85+(c-0.5)*0.4-h*0.25;return{c:r.map((f)=>f*u*(1-s*0.3)),h:c*0.6-h*0.4,r:Mr(0.9-s*0.5)}});return _i("concrete",t,{...o,roughness:1})}function Mp(e={}){let{tile:t=2.4,color:n="#8a4b36",mortar:i="#b9b2a6",seed:s=31}=e,r=Fn(n),o=Fn(i),a=si(`brick:${n}:${i}`,Tt,(l,c)=>{let f=c/Tt*28,d=Math.floor(f),g=l/Tt*10+d%2*0.5,x=g-Math.floor(g),m=f-d,p=x<0.05||m<0.13,M=Un(Math.floor(g)%10,d,s),y=Wt(l,c,Tt,{base:16,octaves:3,seed:s}),S=0.75+M*0.45+(y-0.5)*0.3,C=M>0.9?0.6:1;return{c:p?o.map((E)=>E*(0.85+y*0.2)):r.map((E)=>E*S*C),h:p?0:0.7+y*0.3,r:p?0.95:0.8+y*0.1}});return _i("brick",t,{...a,roughness:1})}function Sp(e={}){let{tile:t=3,color:n="#d8cbb5",seed:i=41}=e,s=Fn(n),r=si(`plaster:${n}`,Tt,(o,a)=>{let l=Wt(o,a,Tt,{base:10,octaves:6,seed:i}),c=Sr(0.55,0.8,Wt(o,a,Tt,{base:2,octaves:4,seed:i+1}));return{c:s.map((h)=>h*(0.9+(l-0.5)*0.2-c*0.18)),h:l,r:0.9}});return _i("plaster",t,{...r,roughness:1})}function wp(e={}){let{tile:t=2,color:n="#9aa0a6",brushed:i=!0,roughness:s=0.35,seed:r=51}=e,o=Fn(n),a=si(`metal:${n}:${i}`,Tt,(l,c)=>{let h=i?Un(Math.floor(l/64),c,r)*0.5+Wt(l,c,Tt,{base:2,octaves:2,seed:r})*0.5:Wt(l,c,Tt,{base:6,octaves:4,seed:r});return{c:o.map((u)=>u*(0.9+(h-0.5)*0.15)),h:h*0.2,r:Mr(s+(h-0.5)*0.15)}});return _i("metal",t,{...a,metalness:1,roughness:1})}function bp(e={}){let{tile:t=3,color:n="#6f6c66",seed:i=61}=e,s=Fn(n),r=si(`gravel:${n}`,Tt,(o,a)=>{let l=Wt(o,a,Tt,{base:48,octaves:2,seed:i}),c=Un(o>>2,a>>2,i);return{c:s.map((h)=>h*(0.7+l*0.5+(c-0.5)*0.2)),h:l,r:0.95}});return _i("gravel",t,{...r,roughness:1})}function Tp(e={}){let{tile:t=4,color:n="#4a6b2e",seed:i=71}=e,s=Fn(n),r=si(`grass:${n}`,Tt,(o,a)=>{let l=Un(o,a>>1,i),c=Wt(o,a,Tt,{base:6,octaves:4,seed:i}),h=Sr(0.6,0.8,Wt(o,a,Tt,{base:2,octaves:3,seed:i+2}));return{c:[s[0]*(0.7+l*0.5)+h*0.12,s[1]*(0.7+l*0.5)+h*0.05,s[2]*(0.6+l*0.3)].map((f)=>f*(0.85+c*0.3)),h:l*0.5+c*0.5,r:0.85}});return _i("grass",t,{...r,roughness:1})}function Ep(e={}){let{tile:t=4,color:n="#6b5641",seed:i=81}=e,s=Fn(n),r=si(`dirt:${n}`,Tt,(o,a)=>{let l=Wt(o,a,Tt,{base:6,octaves:6,seed:i}),c=Un(o>>1,a>>1,i)>0.985?0.3:0;return{c:s.map((h)=>h*(0.75+l*0.5+c)),h:l+c,r:0.95}});return _i("dirt",t,{...r,roughness:1})}function hl(e={}){let{tile:t=2,color:n="#8a5a35",seed:i=91}=e,s=Fn(n),r=si(`wood:${n}`,Tt,(o,a)=>{let l=Math.floor(a/Tt*8),c=Un(l,0,i),h=Math.sin(o/Tt*40+Wt(o,a,Tt,{base:4,octaves:4,seed:i+l})*12)*0.5+0.5,u=a/Tt*8%1<0.03;return{c:s.map((f)=>f*(u?0.3:0.75+h*0.25+(c-0.5)*0.3)),h:u?0:0.5+h*0.2,r:0.7}});return _i("wood",t,{...r,roughness:1})}function bo(e={}){let{color:t="#2f4a6e",tile:n=0.25,seed:i=101,sheen:s=0.4}=e,r=Fn(t),o=si(`fabric:${t}`,256,(l,c)=>{let h=Math.sin(l*1.6)*Math.sin(c*1.6)*0.5+0.5,u=Wt(l,c,256,{base:8,octaves:3,seed:i});return{c:r.map((f)=>f*(0.85+h*0.15+(u-0.5)*0.15)),h:h*0.6+u*0.4,r:0.85}}),a=new Ht({...o,roughness:1,sheen:s,sheenColor:new fe(t).lerp(new fe("#ffffff"),0.3),sheenRoughness:0.6});return a.normalScale.set(0.6,0.6),a.userData.look={name:"fabric",tile:n,uv:"own"},a}function ul(e={}){let{color:t="#c68a68"}=e,n=new Ht({color:t,roughness:0.55,sheen:0.3,sheenColor:new fe("#ff9a80"),sheenRoughness:0.5,clearcoat:0.05});return n.userData.look={name:"skin",uv:"own"},n}function fl(e={}){let{color:t="#7a0d16",metal:n=0.6}=e,i=new Ht({color:t,metalness:n,roughness:0.32,clearcoat:1,clearcoatRoughness:0.03});return i.userData.look={name:"carPaint",uv:"own"},i}function dl(e={}){let{tint:t="#1b2a33",opacity:n=0.55,roughness:i=0.02}=e,s=new Ht({color:t,metalness:0.1,roughness:i,transparent:!0,opacity:n,envMapIntensity:1.6,clearcoat:1,clearcoatRoughness:0.02});return s.userData.look={name:"glass",uv:"own"},s}function pl(e={}){let t=new Pt({color:e.color??"#e8e8e8",metalness:1,roughness:e.roughness??0.12});return t.userData.look={name:"chrome",uv:"own"},t}function Ap(e={}){let t=new Pt({color:e.color??"#161616",roughness:0.9,metalness:0});return t.userData.look={name:"rubber",uv:"own"},t}function Rp(e={}){let{color:t="#ff2a6d",power:n=6}=e,i=new Pt({color:"#111111",emissive:t,emissiveIntensity:n,roughness:0.4});return i.userData.look={name:"neon",uv:"own",glow:t},i}function As(e={}){let{color:t="#fff1d6",power:n=8}=e,i=new Pt({color:"#ffffff",emissive:t,emissiveIntensity:n,roughness:0.2});return i.userData.look={name:"lens",uv:"own",glow:t},i}function To(e={}){let{color:t="#e9e4d4",wet:n=0}=e,i=Fn(t),s=si(`paint:${t}:${n.toFixed(2)}`,256,(o,a)=>{let c=Wt(o,a,256,{base:8,octaves:4,seed:5})>0.62?0.45:1;return{c:i.map((h)=>h*c*(1-n*0.15)),h:c,r:Mr(0.6-n*0.4)}});return _i("roadPaint",2,{...s,roughness:1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}var yp=new Map;function ln(e,t,n={}){let i=e+JSON.stringify(n);if(!yp.has(i))yp.set(i,t(n));return yp.get(i)}var lu=null;function ml(){if(lu)return lu;let e=256,t=Es(e),n=t.getContext("2d"),i=n.createImageData(e,e);for(let s=0;s<e;s++)for(let r=0;r<e;r++){let o=(s*e+r)*4;i.data[o]=Wt(r,s,e,{base:4,octaves:5,seed:1})*255,i.data[o+1]=Wt(r,s,e,{base:16,octaves:3,seed:2})*255,i.data[o+2]=Un(r,s,3)*255,i.data[o+3]=Wt(r,s,e,{base:2,octaves:4,seed:4})*255}return n.putImageData(i,0,0),lu=al(t,{aniso:4}),lu}var Mi={uTime:{value:0},uNight:{value:0},uLitFrac:{value:0.55},uDayInterior:{value:0.18},uWet:{value:0}},Rs={brick:{style:0,wall:"#7d3f2c",wall2:"#5e2e21",frame:"#e7e1d6",bay:2.8,storey:3.2,ground:4.2,winW:0.46,winH:0.52,sill:0.28,blank:0.04,shopTint:"#ffb36b"},glass:{style:1,wall:"#1d2730",wall2:"#2c3a46",frame:"#2a3138",bay:1.6,storey:3.8,ground:5,winW:0.94,winH:0.78,sill:0.16,blank:0,shopTint:"#bfe3ff",glass:"#35505f"},concrete:{style:2,wall:"#9b978f",wall2:"#7f7b74",frame:"#3b3f44",bay:3,storey:3.4,ground:4.5,winW:0.62,winH:0.5,sill:0.3,blank:0.06,shopTint:"#ffe2a8"},stucco:{style:3,wall:"#d9c7a8",wall2:"#c4ae8b",frame:"#f3efe6",bay:3.2,storey:3.1,ground:4,winW:0.42,winH:0.5,sill:0.3,blank:0.08,shopTint:"#ffc98a"},metal:{style:4,wall:"#5d646c",wall2:"#454b52",frame:"#1d2125",bay:2.4,storey:3.6,ground:4.8,winW:0.8,winH:0.42,sill:0.34,blank:0.02,shopTint:"#a8f0ff"}},fb=`
uniform float uTime, uNight, uLitFrac, uDayInterior, uWet;
uniform int uStyle;
uniform vec3 uWall, uWall2, uFrame, uGlass, uShopTint;
uniform float uBay, uStorey, uGround, uWinW, uWinH, uSill, uBlank, uSeed;
uniform sampler2D uNoise;
varying vec2 vUvM;
varying vec2 vFacade;
varying vec3 vWPos;
varying vec3 vWN;
float fh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 13.7 + vFacade.y * 7.31) * 43758.5453); }
vec3 fh3(vec2 p) { return vec3(fh(p), fh(p + 17.3), fh(p + 41.9)); }
vec3 fPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
  vec3 sx = dFdx(surf_pos), sy = dFdy(surf_pos);
  vec3 R1 = cross(sy, surf_norm), R2 = cross(surf_norm, sx);
  float det = dot(sx, R1);
  vec3 grad = sign(det) * (dHdxy.x * R1 + dHdxy.y * R2);
  return normalize(abs(det) * surf_norm - grad);
}
`,db=`
  vec3 fNw = normalize(vWN);
  vec2 m = vUvM;
  float topF = vFacade.x > 0.5 ? vFacade.x : 1e5;
  vec3 fEmit = vec3(0.0);
  float fH = 0.0;
  float vertical = 1.0 - step(0.6, abs(fNw.y));
  vec4 nzA = texture2D(uNoise, m * 0.07);
  vec4 nzB = texture2D(uNoise, m * 0.6);
  // Storeys: a taller shop floor at the bottom, then regular floors up to topF.
  float row; float ly; float cellH; float bay;
  if (m.y < uGround) { row = -1.0; ly = m.y; cellH = uGround; bay = uBay * 2.0; }
  else { row = floor((m.y - uGround) / uStorey); ly = mod(m.y - uGround, uStorey); cellH = uStorey; bay = uBay; }
  float col = floor(m.x / bay); float lx = mod(m.x, bay);
  vec2 cell = vec2(col, row);
  bool shop = row < 0.0;
  float ww = (shop ? 0.84 : uWinW) * bay;
  float x0 = (bay - ww) * 0.5;
  float sill = shop ? 0.1 * cellH : uSill * cellH;
  float wh = (shop ? 0.72 : uWinH) * cellH;
  vec2 wp = vec2(lx - x0, ly - sill);
  float inWin = step(0.0, wp.x) * step(wp.x, ww) * step(0.0, wp.y) * step(wp.y, wh) * vertical;
  if (m.y > topF) inWin = 0.0;
  if (!shop && fh(cell + 3.1) < uBlank) inWin = 0.0;
  // A shop front is a door every few bays.
  float edge = min(min(wp.x, ww - wp.x), min(wp.y, wh - wp.y));
  float frameW = uStyle == 1 ? 0.035 : 0.07;
  float inGlass = inWin * step(frameW, edge);
  if (ww > 1.5 && abs(wp.x - ww * 0.5) < 0.03) inGlass = 0.0;
  if (!shop && uStyle != 1 && abs(wp.y - wh * 0.7) < 0.025) inGlass = 0.0;
  // Far away a window is a pixel or two: draw the average instead of shimmering.
  vec2 mfw = fwidth(m);
  float lod = smoothstep(0.06, 0.22, max(mfw.x / bay, mfw.y / cellH));
  if (lod > 0.995) { inWin = 0.0; inGlass = 0.0; }

  // ---- wall ----
  vec3 wall = uWall; float wr = 0.88; float wm = 0.0;
  if (uStyle == 0) {
    vec2 b = m / vec2(0.25, 0.086); float r = floor(b.y); b.x += mod(r, 2.0) * 0.5;
    vec2 bi = floor(b); vec2 bf = fract(b);
    vec2 bfw = fwidth(m) / vec2(0.25, 0.086);
    float baa = smoothstep(0.08, 0.35, max(bfw.x, bfw.y));
    float mortar = mix(clamp(step(bf.x, 0.05) + step(bf.y, 0.12), 0.0, 1.0), 0.17, baa);
    float v = mix(fh(bi * 0.37), 0.5, baa);
    wall = mix(uWall, uWall2, v) * (0.8 + 0.4 * nzB.y);
    wall = mix(wall, vec3(0.62, 0.6, 0.56), mortar);
    fH = (1.0 - mortar) * 0.8;
    wr = mix(0.82, 0.96, mortar);
  } else if (uStyle == 1) {
    // Spandrel panels between the glass bands.
    wall = mix(uWall, uWall2, nzA.x * 0.6); wr = 0.35; wm = 0.6;
    float seam = step(fract(m.x / uBay), 0.02);
    wall *= 1.0 - seam * 0.5;
  } else if (uStyle == 2) {
    vec2 pnl = vec2(fract(m.x / (uBay * 0.5)), fract((m.y - uGround) / uStorey));
    float joint = step(pnl.x, 0.012) + step(pnl.y, 0.01);
    wall = uWall * (0.85 + 0.3 * nzA.x + 0.12 * nzB.y) * (1.0 - joint * 0.35);
    fH = 1.0 - clamp(joint, 0.0, 1.0); wr = 0.9;
  } else if (uStyle == 3) {
    wall = mix(uWall, uWall2, smoothstep(0.4, 0.8, nzA.x)) * (0.9 + 0.15 * nzB.x);
    fH = nzB.x * 0.5; wr = 0.92;
  } else {
    float band = step(fract((m.y - uGround) / (uStorey * 0.5)), 0.03);
    wall = mix(uWall, uWall2, nzA.w) * (1.0 - band * 0.4) * (0.92 + 0.12 * nzB.y);
    fH = 1.0 - band; wr = 0.42; wm = 0.75;
  }
  // Rain streaks and grime: under each sill, and darker near the ground.
  if (!shop && wp.x > 0.0 && wp.x < ww && ly < sill) {
    float s = (1.0 - ly / max(sill, 0.01)) * (0.35 + 0.65 * texture2D(uNoise, vec2(m.x * 1.7, m.y * 0.15)).x);
    wall *= 1.0 - 0.35 * s;
  }
  wall *= mix(0.62, 1.0, smoothstep(0.0, 2.2, m.y));
  wall *= 0.9 + 0.2 * nzA.w;
  // A cornice line at the top.
  if (m.y > topF && m.y < topF + 0.35) { wall = mix(wall, uFrame, 0.6); fH = 1.2; }
  // Shop floor: a fascia band over the windows.
  if (shop && ly > sill + wh + 0.1) { wall = mix(uWall2, vec3(0.05), 0.55); wr = 0.5; }
  // Wet walls get darker and shinier.
  wall *= 1.0 - uWet * 0.25; wr = mix(wr, wr * 0.55, uWet);

  vec3 fCol = wall; float fRough = wr; float fMetal = wm;
  if (inWin > 0.5) { fCol = uFrame * 0.9; fRough = 0.4; fMetal = 0.5; fH = 0.6; }
  if (inGlass > 0.5) {
    // ---- the room behind the glass ----
    vec3 dp1 = dFdx(vWPos), dp2 = dFdy(vWPos);
    vec2 du1 = dFdx(m), du2 = dFdy(m);
    vec3 p2 = cross(dp2, fNw), p1 = cross(fNw, dp1);
    vec3 T = p2 * du1.x + p1 * du2.x; vec3 B = p2 * du1.y + p1 * du2.y;
    float inv = inversesqrt(max(max(dot(T, T), dot(B, B)), 1e-12)); T *= inv; B *= inv;
    vec3 rd = normalize(vWPos - cameraPosition);
    float rx = dot(rd, T), ry = dot(rd, B), rz = max(dot(rd, -fNw), 0.04);
    float D = shop ? 7.0 : 4.5;
    float tx = rx > 0.0 ? (ww + x0 - wp.x) / max(rx, 1e-4) : (-x0 - wp.x) / min(rx, -1e-4);
    float ty = ry > 0.0 ? (cellH - sill - wp.y) / max(ry, 1e-4) : (-sill - wp.y) / min(ry, -1e-4);
    float tz = D / rz;
    float t = min(min(tx, ty), tz);
    vec3 h = vec3(wp, 0.0) + vec3(rx, ry, rz) * t;
    vec3 rc = fh3(cell * 1.7 + 0.5);
    vec3 wallC = mix(vec3(0.78, 0.74, 0.67), mix(vec3(0.55, 0.62, 0.66), vec3(0.7, 0.55, 0.5), rc.y), rc.x);
    vec3 floorC = mix(vec3(0.33, 0.22, 0.14), vec3(0.28, 0.29, 0.31), step(0.5, rc.y));
    vec3 ic;
    if (t == tz) {
      ic = wallC * 0.9;
      float fy = h.y + sill;
      // Furniture against the back wall: a sofa or a desk and a shelf.
      float fx = h.x - (ww * rc.z);
      if (fy < 0.85 && abs(fx) < 0.9) ic *= 0.32 + 0.2 * rc.x;
      if (fy > 1.3 && fy < 2.0 && abs(h.x - ww * (1.0 - rc.z)) < 0.45) ic = mix(ic, vec3(0.2, 0.25, 0.3) + rc * 0.4, 0.8);
    } else if (t == ty) {
      ic = ry > 0.0 ? vec3(0.86) : floorC;
    } else {
      ic = wallC * 0.78;
    }
    float litR = step(fh(cell + 9.0), uLitFrac);
    vec3 lc = rc.z < 0.62 ? vec3(1.0, 0.76, 0.48) : rc.z < 0.88 ? vec3(0.86, 0.93, 1.0) : vec3(0.42, 0.58, 1.0);
    float flick = rc.z >= 0.88 ? 0.65 + 0.35 * sin(uTime * 6.0 + rc.x * 40.0) * sin(uTime * 2.3 + rc.y * 9.0) : 1.0;
    float fall = 1.0 / (1.0 + 0.05 * t * t) * (0.55 + 0.45 * smoothstep(0.0, cellH, h.y + sill));
    vec3 inside = ic * (lc * litR * flick * uNight * 2.4 + uDayInterior) * fall;
    if (shop) {
      float open = step(0.25, fh(cell + 2.0));
      // Shelves of goods on the walls.
      float hy = h.y + sill;
      if (t != ty && hy > 0.3 && hy < 2.2) {
        float shelf = step(0.9, fract(hy / 0.45));
        vec2 slot = floor(vec2((h.x + h.z) * 4.0, hy / 0.45));
        vec3 g3 = fh3(slot + cell * 3.0);
        vec3 goods = mix(vec3(dot(g3, vec3(0.33))), g3, 0.55) * (0.12 + 0.4 * fh(slot * 1.3 + 7.0));
        goods *= 0.6 + 0.4 * step(0.25, fract((h.x + h.z) * 4.0));
        ic = mix(goods, vec3(0.6), shelf);
      }
      inside = ic * mix(vec3(1.0, 0.93, 0.82), uShopTint, 0.45) * fall * (open * (uNight * 1.5 + 0.12) + uDayInterior * 1.4);
    }
    // Blinds or curtains, part way down.
    float bl = mix(0.1, 0.8, fh(cell + 6.0));
    if (!shop && fh(cell + 5.0) < 0.38 && wp.y > wh * (1.0 - bl)) {
      float slat = 0.6 + 0.4 * step(0.45, fract(wp.y * 12.0));
      inside = (lc * litR * uNight * 1.3 + vec3(0.55) * uDayInterior * 2.5) * slat * mix(vec3(1.0), vec3(0.95, 0.9, 0.8), rc.y);
    }
    fEmit = inside;
    fCol = uStyle == 1 ? uGlass * 0.25 : vec3(0.02);
    fRough = 0.07;
    fMetal = uStyle == 1 ? 0.55 : 0.0;
    if (uStyle == 1) fEmit *= 0.55;
    fH = 0.0;
  }
  // Blend to the average look of the wall at a distance.
  if (lod > 0.0) {
    float wf = shop ? 0.6 : uWinW * uWinH * (1.0 - uBlank);
    vec3 avgEmit = wf * (vec3(1.0, 0.8, 0.56) * uLitFrac * uNight * (shop ? 0.9 : 1.2) + vec3(0.5) * uDayInterior);
    vec3 avgCol = mix(wall, uStyle == 1 ? uGlass * 0.3 : vec3(0.04), wf);
    if (m.y > topF) { avgEmit = vec3(0.0); avgCol = wall; wf = 0.0; }
    fCol = mix(fCol, avgCol, lod); fEmit = mix(fEmit, avgEmit, lod);
    fRough = mix(fRough, mix(wr, 0.15, wf), lod); fMetal = mix(fMetal, wm, lod); fH *= 1.0 - lod;
  }
  // Roofs and other flat faces: plain weathered concrete.
  if (vertical < 0.5) { fCol = vec3(0.38, 0.37, 0.35) * (0.75 + 0.4 * nzA.x); fRough = 0.95; fMetal = 0.0; fEmit = vec3(0.0); fH = nzB.x * 0.3; }
`,pb=0;function gl(e={}){let t={...Rs[e.style??"brick"]??Rs.brick,...e},n=new Pt({color:16777215,roughness:1,metalness:0,envMapIntensity:1}),i=++pb,s={...Mi,uStyle:{value:t.style},uWall:{value:new fe(t.wall)},uWall2:{value:new fe(t.wall2)},uFrame:{value:new fe(t.frame)},uGlass:{value:new fe(t.glass??"#2b3b45")},uShopTint:{value:new fe(t.shopTint)},uBay:{value:t.bay},uStorey:{value:t.storey},uGround:{value:t.ground},uWinW:{value:t.winW},uWinH:{value:t.winH},uSill:{value:t.sill},uBlank:{value:t.blank},uSeed:{value:e.seed??i*0.37},uNoise:{value:ml()}};return n.onBeforeCompile=(r)=>{Object.assign(r.uniforms,s),r.vertexShader=r.vertexShader.replace("#include <common>",`#include <common>
attribute vec2 facade;
varying vec2 vUvM;
varying vec2 vFacade;
varying vec3 vWPos;
varying vec3 vWN;`).replace("#include <fog_vertex>",`#include <fog_vertex>
  vUvM = uv; vFacade = facade;
  mat4 fM = modelMatrix;
  #ifdef USE_INSTANCING
  fM = modelMatrix * instanceMatrix;
  #endif
  vWPos = (fM * vec4(transformed, 1.0)).xyz;
  vWN = normalize(mat3(fM) * objectNormal);`),r.fragmentShader=r.fragmentShader.replace("#include <common>",`#include <common>
`+fb).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
`+db+`
  diffuseColor.rgb = fCol; roughnessFactor = fRough; metalnessFactor = fMetal;`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
  normal = fPerturb(-vViewPosition, normal, vec2(dFdx(fH), dFdy(fH)) * 0.25);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
  totalEmissiveRadiance += fEmit;`)},n.customProgramCacheKey=()=>"look-facade",n.userData.look={name:"facade",style:e.style??"brick",uv:"facade",bay:t.bay,storey:t.storey,ground:t.ground},n.userData.uniforms=s,n}var vl={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new se(0.0009765625,0.001953125)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},xl={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new se(0.0009765625,0.001953125)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},hu={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new se(0.0009765625,0.001953125)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};class Cp extends Mn{constructor(){super();this._edgesRT=new Ft(1,1,{depthBuffer:!1,type:It}),this._edgesRT.texture.name="SMAAPass.edges",this._weightsRT=new Ft(1,1,{depthBuffer:!1,type:It}),this._weightsRT.texture.name="SMAAPass.weights";let e=this,t=new Image;t.src=this._getAreaTexture(),t.onload=function(){e._areaTexture.needsUpdate=!0},this._areaTexture=new Rt,this._areaTexture.name="SMAAPass.area",this._areaTexture.image=t,this._areaTexture.minFilter=Kt,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;let n=new Image;n.src=this._getSearchTexture(),n.onload=function(){e._searchTexture.needsUpdate=!0},this._searchTexture=new Rt,this._searchTexture.name="SMAAPass.search",this._searchTexture.image=n,this._searchTexture.magFilter=xn,this._searchTexture.minFilter=xn,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=jt.clone(vl.uniforms),this._materialEdges=new xt({defines:Object.assign({},vl.defines),uniforms:this._uniformsEdges,vertexShader:vl.vertexShader,fragmentShader:vl.fragmentShader}),this._uniformsWeights=jt.clone(xl.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new xt({defines:Object.assign({},xl.defines),uniforms:this._uniformsWeights,vertexShader:xl.vertexShader,fragmentShader:xl.fragmentShader}),this._uniformsBlend=jt.clone(hu.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new xt({uniforms:this._uniformsBlend,vertexShader:hu.vertexShader,fragmentShader:hu.fragmentShader}),this._fsQuad=new yi(null)}render(e,t,n){if(this._uniformsEdges.tDiffuse.value=n.texture,this._fsQuad.material=this._materialEdges,e.setRenderTarget(this._edgesRT),this.clear)e.clear();if(this._fsQuad.render(e),this._fsQuad.material=this._materialWeights,e.setRenderTarget(this._weightsRT),this.clear)e.clear();if(this._fsQuad.render(e),this._uniformsBlend.tColor.value=n.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen)e.setRenderTarget(null),this._fsQuad.render(e);else{if(e.setRenderTarget(t),this.clear)e.clear();this._fsQuad.render(e)}}setSize(e,t){this._edgesRT.setSize(e,t),this._weightsRT.setSize(e,t),this._materialEdges.uniforms.resolution.value.set(1/e,1/t),this._materialWeights.uniforms.resolution.value.set(1/e,1/t),this._materialBlend.uniforms.resolution.value.set(1/e,1/t)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return"data:image/png;base64,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"}_getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}}var yl={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new se},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new He},cameraProjectionMatrixInverse:{value:new He},cameraWorldMatrix:{value:new He},radius:{value:0.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new I(-1,-1,-1)},sceneBoxMax:{value:new I(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},_l={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},uu={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function kv(e=5){let t=Math.floor(e)%2===0?Math.floor(e)+1:Math.floor(e),n=mb(t),i=n.length,s=new Uint8Array(i*4);for(let o=0;o<i;++o){let a=n[o],l=2*Math.PI*a/i,c=new I(Math.cos(l),Math.sin(l),0).normalize();s[o*4]=(c.x*0.5+0.5)*255,s[o*4+1]=(c.y*0.5+0.5)*255,s[o*4+2]=127,s[o*4+3]=255}let r=new mn(s,t,t);return r.wrapS=cn,r.wrapT=cn,r.needsUpdate=!0,r}function mb(e){let t=Math.floor(e)%2===0?Math.floor(e)+1:Math.floor(e),n=t*t,i=Array(n).fill(0),s=Math.floor(t/2),r=t-1;for(let o=1;o<=n;){if(s===-1&&r===t)r=t-2,s=0;else{if(r===t)r=0;if(s<0)s=t-1}if(i[s*t+r]!==0){r-=2,s++;continue}else i[s*t+r]=o++;r++,s--}return i}var Ml={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Ip(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new se},cameraProjectionMatrixInverse:{value:new He},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Ip(e,t,n){let i=gb(e,t,n),s="vec3[SAMPLES](";for(let r=0;r<e;r++){let o=i[r];s+=`vec3(${o.x}, ${o.y}, ${o.z})${r<e-1?",":")"}`}return s}function gb(e,t,n){let i=[];for(let s=0;s<e;s++){let r=2*Math.PI*t*s/e,o=Math.pow(s/(e-1),n);i.push(new I(Math.cos(r),Math.sin(r),o))}return i}class Pp{constructor(e=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let t=0;t<256;t++)this.p[t]=Math.floor(e.random()*256);this.perm=[];for(let t=0;t<512;t++)this.perm[t]=this.p[t&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(e,t){let n,i,s,r=0.5*(Math.sqrt(3)-1),o=(e+t)*r,a=Math.floor(e+o),l=Math.floor(t+o),c=(3-Math.sqrt(3))/6,h=(a+l)*c,u=a-h,f=l-h,d=e-u,g=t-f,x,m;if(d>g)x=1,m=0;else x=0,m=1;let p=d-x+c,M=g-m+c,y=d-1+2*c,S=g-1+2*c,C=a&255,R=l&255,E=this.perm[C+this.perm[R]]%12,D=this.perm[C+x+this.perm[R+m]]%12,w=this.perm[C+1+this.perm[R+1]]%12,T=0.5-d*d-g*g;if(T<0)n=0;else T*=T,n=T*T*this._dot(this.grad3[E],d,g);let P=0.5-p*p-M*M;if(P<0)i=0;else P*=P,i=P*P*this._dot(this.grad3[D],p,M);let B=0.5-y*y-S*S;if(B<0)s=0;else B*=B,s=B*B*this._dot(this.grad3[w],y,S);return 70*(n+i+s)}noise3d(e,t,n){let i,s,r,o,a=0.3333333333333333,l=(e+t+n)*0.3333333333333333,c=Math.floor(e+l),h=Math.floor(t+l),u=Math.floor(n+l),f=0.16666666666666666,d=(c+h+u)*0.16666666666666666,g=c-d,x=h-d,m=u-d,p=e-g,M=t-x,y=n-m,S,C,R,E,D,w;if(p>=M)if(M>=y)S=1,C=0,R=0,E=1,D=1,w=0;else if(p>=y)S=1,C=0,R=0,E=1,D=0,w=1;else S=0,C=0,R=1,E=1,D=0,w=1;else if(M<y)S=0,C=0,R=1,E=0,D=1,w=1;else if(p<y)S=0,C=1,R=0,E=0,D=1,w=1;else S=0,C=1,R=0,E=1,D=1,w=0;let T=p-S+0.16666666666666666,P=M-C+0.16666666666666666,B=y-R+0.16666666666666666,H=p-E+0.3333333333333333,k=M-D+0.3333333333333333,X=y-w+0.3333333333333333,q=p-1+0.5,re=M-1+0.5,W=y-1+0.5,Q=c&255,ae=h&255,ge=u&255,ve=this.perm[Q+this.perm[ae+this.perm[ge]]]%12,Ge=this.perm[Q+S+this.perm[ae+C+this.perm[ge+R]]]%12,Oe=this.perm[Q+E+this.perm[ae+D+this.perm[ge+w]]]%12,G=this.perm[Q+1+this.perm[ae+1+this.perm[ge+1]]]%12,Y=0.6-p*p-M*M-y*y;if(Y<0)i=0;else Y*=Y,i=Y*Y*this._dot3(this.grad3[ve],p,M,y);let te=0.6-T*T-P*P-B*B;if(te<0)s=0;else te*=te,s=te*te*this._dot3(this.grad3[Ge],T,P,B);let le=0.6-H*H-k*k-X*X;if(le<0)r=0;else le*=le,r=le*le*this._dot3(this.grad3[Oe],H,k,X);let Ee=0.6-q*q-re*re-W*W;if(Ee<0)o=0;else Ee*=Ee,o=Ee*Ee*this._dot3(this.grad3[G],q,re,W);return 32*(i+s+r+o)}noise4d(e,t,n,i){let s=this.grad4,r=this.simplex,o=this.perm,a=(Math.sqrt(5)-1)/4,l=(5-Math.sqrt(5))/20,c,h,u,f,d,g=(e+t+n+i)*a,x=Math.floor(e+g),m=Math.floor(t+g),p=Math.floor(n+g),M=Math.floor(i+g),y=(x+m+p+M)*l,S=x-y,C=m-y,R=p-y,E=M-y,D=e-S,w=t-C,T=n-R,P=i-E,B=D>w?32:0,H=D>T?16:0,k=w>T?8:0,X=D>P?4:0,q=w>P?2:0,re=T>P?1:0,W=B+H+k+X+q+re,Q=r[W][0]>=3?1:0,ae=r[W][1]>=3?1:0,ge=r[W][2]>=3?1:0,ve=r[W][3]>=3?1:0,Ge=r[W][0]>=2?1:0,Oe=r[W][1]>=2?1:0,G=r[W][2]>=2?1:0,Y=r[W][3]>=2?1:0,te=r[W][0]>=1?1:0,le=r[W][1]>=1?1:0,Ee=r[W][2]>=1?1:0,We=r[W][3]>=1?1:0,ct=D-Q+l,z=w-ae+l,ce=T-ge+l,pe=P-ve+l,me=D-Ge+2*l,de=w-Oe+2*l,Ie=T-G+2*l,be=P-Y+2*l,Se=D-te+3*l,st=w-le+3*l,tt=T-Ee+3*l,rt=P-We+3*l,U=D-1+4*l,A=w-1+4*l,Z=T-1+4*l,ue=P-1+4*l,ye=x&255,oe=m&255,Fe=p&255,Ae=M&255,Ve=o[ye+o[oe+o[Fe+o[Ae]]]]%32,Ke=o[ye+Q+o[oe+ae+o[Fe+ge+o[Ae+ve]]]]%32,Me=o[ye+Ge+o[oe+Oe+o[Fe+G+o[Ae+Y]]]]%32,Pe=o[ye+te+o[oe+le+o[Fe+Ee+o[Ae+We]]]]%32,Ze=o[ye+1+o[oe+1+o[Fe+1+o[Ae+1]]]]%32,ke=0.6-D*D-w*w-T*T-P*P;if(ke<0)c=0;else ke*=ke,c=ke*ke*this._dot4(s[Ve],D,w,T,P);let Ce=0.6-ct*ct-z*z-ce*ce-pe*pe;if(Ce<0)h=0;else Ce*=Ce,h=Ce*Ce*this._dot4(s[Ke],ct,z,ce,pe);let qe=0.6-me*me-de*de-Ie*Ie-be*be;if(qe<0)u=0;else qe*=qe,u=qe*qe*this._dot4(s[Me],me,de,Ie,be);let V=0.6-Se*Se-st*st-tt*tt-rt*rt;if(V<0)f=0;else V*=V,f=V*V*this._dot4(s[Pe],Se,st,tt,rt);let ne=0.6-U*U-A*A-Z*Z-ue*ue;if(ne<0)d=0;else ne*=ne,d=ne*ne*this._dot4(s[Ze],U,A,Z,ue);return 27*(c+h+u+f+d)}_dot(e,t,n){return e[0]*t+e[1]*n}_dot3(e,t,n,i){return e[0]*t+e[1]*n+e[2]*i}_dot4(e,t,n,i,s){return e[0]*t+e[1]*n+e[2]*i+e[3]*s}}class Si extends Mn{constructor(e,t,n=512,i=512,s,r,o){super();if(this.width=n,this.height=i,this.clear=!0,this.camera=t,this.scene=e,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=kv(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Ft(this.width,this.height,{type:It}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new xt({defines:Object.assign({},yl.defines),uniforms:jt.clone(yl.uniforms),vertexShader:yl.vertexShader,fragmentShader:yl.fragmentShader,blending:Zt,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new mo,this.normalMaterial.blending=Zt,this.pdMaterial=new xt({defines:Object.assign({},Ml.defines),uniforms:jt.clone(Ml.uniforms),vertexShader:Ml.vertexShader,fragmentShader:Ml.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new xt({defines:Object.assign({},_l.defines),uniforms:jt.clone(_l.uniforms),vertexShader:_l.vertexShader,fragmentShader:_l.fragmentShader,blending:Zt}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new xt({uniforms:jt.clone(Fi.uniforms),vertexShader:Fi.vertexShader,fragmentShader:Fi.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:jr,blendDst:ds,blendEquation:Qn,blendSrcAlpha:Jr,blendDstAlpha:ds,blendEquationAlpha:Qn}),this.blendMaterial=new xt({uniforms:jt.clone(uu.uniforms),vertexShader:uu.vertexShader,fragmentShader:uu.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Qo,blendSrc:jr,blendDst:ds,blendEquation:Qn,blendSrcAlpha:Jr,blendDstAlpha:ds,blendEquationAlpha:Qn}),this._fsQuad=new yi(null),this._originalClearColor=new fe,this.setGBuffer(s?s.depthTexture:void 0,s?s.normalTexture:void 0),r!==void 0)this.updateGtaoMaterial(r);if(o!==void 0)this.updatePdMaterial(o)}setSize(e,t){this.width=e,this.height=t,this.gtaoRenderTarget.setSize(e,t),this.normalRenderTarget.setSize(e,t),this.pdRenderTarget.setSize(e,t),this.gtaoMaterial.uniforms.resolution.value.set(e,t),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(e,t),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(e,t){if(e!==void 0)this.depthTexture=e,this.normalTexture=t,this._renderGBuffer=!1;else this.depthTexture=new lr,this.depthTexture.format=gs,this.depthTexture.type=Ki,this.normalRenderTarget=new Ft(this.width,this.height,{minFilter:xn,magFilter:xn,type:It,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0;let n=this.normalTexture?1:0,i=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=n,this.gtaoMaterial.defines.DEPTH_SWIZZLING=i,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=n,this.pdMaterial.defines.DEPTH_SWIZZLING=i,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(e){if(e)this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max);else this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0}updateGtaoMaterial(e){if(e.radius!==void 0)this.gtaoMaterial.uniforms.radius.value=e.radius;if(e.distanceExponent!==void 0)this.gtaoMaterial.uniforms.distanceExponent.value=e.distanceExponent;if(e.thickness!==void 0)this.gtaoMaterial.uniforms.thickness.value=e.thickness;if(e.distanceFallOff!==void 0)this.gtaoMaterial.uniforms.distanceFallOff.value=e.distanceFallOff,this.gtaoMaterial.needsUpdate=!0;if(e.scale!==void 0)this.gtaoMaterial.uniforms.scale.value=e.scale;if(e.samples!==void 0&&e.samples!==this.gtaoMaterial.defines.SAMPLES)this.gtaoMaterial.defines.SAMPLES=e.samples,this.gtaoMaterial.needsUpdate=!0;if(e.screenSpaceRadius!==void 0&&(e.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS)this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=e.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0}updatePdMaterial(e){let t=!1;if(e.lumaPhi!==void 0)this.pdMaterial.uniforms.lumaPhi.value=e.lumaPhi;if(e.depthPhi!==void 0)this.pdMaterial.uniforms.depthPhi.value=e.depthPhi;if(e.normalPhi!==void 0)this.pdMaterial.uniforms.normalPhi.value=e.normalPhi;if(e.radius!==void 0&&e.radius!==this.radius)this.pdMaterial.uniforms.radius.value=e.radius;if(e.radiusExponent!==void 0&&e.radiusExponent!==this.pdRadiusExponent)this.pdRadiusExponent=e.radiusExponent,t=!0;if(e.rings!==void 0&&e.rings!==this.pdRings)this.pdRings=e.rings,t=!0;if(e.samples!==void 0&&e.samples!==this.pdSamples)this.pdSamples=e.samples,t=!0;if(t)this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Ip(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0}render(e,t,n){if(this._renderGBuffer)this._overrideVisibility(),this._renderOverride(e,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility();switch(this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(e,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(e,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case Si.OUTPUT.Off:break;case Si.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Si.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Si.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Si.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(e,this.depthRenderMaterial,this.renderToScreen?null:t);break;case Si.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t);break;case Si.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=n.texture,this.copyMaterial.blending=Zt,this._renderPass(e,this.copyMaterial,this.renderToScreen?null:t),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(e,this.blendMaterial,this.renderToScreen?null:t);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(e,t,n,i,s){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),o=e.autoClear;if(e.setRenderTarget(n),e.autoClear=!1,i!==void 0&&i!==null)e.setClearColor(i),e.setClearAlpha(s||0),e.clear();this._fsQuad.material=t,this._fsQuad.render(e),e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_renderOverride(e,t,n,i,s){e.getClearColor(this._originalClearColor);let r=e.getClearAlpha(),o=e.autoClear;if(e.setRenderTarget(n),e.autoClear=!1,i=t.clearColor||i,s=t.clearAlpha||s,i!==void 0&&i!==null)e.setClearColor(i),e.setClearAlpha(s||0),e.clear();this.scene.overrideMaterial=t,e.render(this.scene,this.camera),this.scene.overrideMaterial=null,e.autoClear=o,e.setClearColor(this._originalClearColor),e.setClearAlpha(r)}_overrideVisibility(){let e=this.scene,t=this._visibilityCache;e.traverse(function(n){if((n.isPoints||n.isLine||n.isLine2)&&n.visible)n.visible=!1,t.push(n)})}_restoreVisibility(){let e=this._visibilityCache;for(let t=0;t<e.length;t++)e[t].visible=!0;e.length=0}_generateNoise(e=64){let t=new Pp,n=e*e*4,i=new Uint8Array(n);for(let r=0;r<e;r++)for(let o=0;o<e;o++){let a=r,l=o;i[(r*e+o)*4]=(t.noise(a,l)*0.5+0.5)*255,i[(r*e+o)*4+1]=(t.noise(a+e,l)*0.5+0.5)*255,i[(r*e+o)*4+2]=(t.noise(a,l+e)*0.5+0.5)*255,i[(r*e+o)*4+3]=(t.noise(a+e,l+e)*0.5+0.5)*255}let s=new mn(i,e,e,Jt,pi);return s.wrapS=cn,s.wrapT=cn,s.needsUpdate=!0,s}}Si.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Sl={"neon-rain":{about:"night city in the rain: wet streets mirroring neon, haze, lamp cones, lit windows",hdri:"night",env:0.55,tone:"aces",exposure:1.05,sky:{zenith:"#04060d",horizon:"#1a1630",ground:"#060609",glow:"#3a1f4a",clouds:0.75,cloudLight:"#2c2640",cloudDark:"#0b0b12",stars:0},sun:{color:"#7d93c4",power:0.35,el:38,az:210,shadows:!0},hemi:{sky:"#25304d",ground:"#0d0b10",power:0.35},fog:{color:"#17142a",density:0.013},bloom:{strength:0.95,radius:0.55,threshold:0.9},grade:{saturation:1.12,contrast:1.08,shadows:[0.02,0,0.05],highlights:[0.03,0.012,0],vignette:0.38,grain:0.035,aberration:0.0035},night:1,litRooms:0.55,wet:0.85,rain:1,lamps:{color:"#ffc27a",power:1},ao:1},cyberpunk:{about:"neon megacity: magenta and teal haze, heavy bloom, chromatic fringes, rain",hdri:"night",env:0.5,tone:"aces",exposure:1.1,sky:{zenith:"#07020f",horizon:"#3b0f45",ground:"#07040a",glow:"#7a1d6e",clouds:0.8,cloudLight:"#4a1a52",cloudDark:"#120616",stars:0},sun:{color:"#6fd8ff",power:0.3,el:40,az:140,shadows:!0},hemi:{sky:"#3a1f5c",ground:"#0b0612",power:0.4},fog:{color:"#2a0f3a",density:0.016},bloom:{strength:1.25,radius:0.7,threshold:0.85},grade:{saturation:1.25,contrast:1.1,shadows:[0,0.03,0.05],highlights:[0.05,0,0.03],vignette:0.42,grain:0.04,aberration:0.006},night:1,litRooms:0.65,wet:0.9,rain:0.7,lamps:{color:"#9ee7ff",power:1},ao:1},"golden-hour":{about:"low warm sun, long shadows, glowing haze, warm highlights and cool shadows",hdri:"sunset",env:0.9,tone:"aces",exposure:0.95,sky:{zenith:"#3c6aa6",horizon:"#f3b27c",ground:"#4a3b33",glow:"#ff9a52",clouds:0.35,cloudLight:"#ffd9b0",cloudDark:"#8a6a78",stars:0},sun:{color:"#ffb36b",power:3.4,el:9,az:250,shadows:!0},hemi:{sky:"#8fb2e0",ground:"#5a4537",power:0.45},fog:{color:"#e2ad85",density:0.0032},bloom:{strength:0.35,radius:0.5,threshold:1},grade:{saturation:1.08,contrast:1.06,shadows:[0,0.01,0.04],highlights:[0.04,0.015,-0.01],vignette:0.25,grain:0.02,aberration:0.0015},night:0.1,litRooms:0.25,wet:0,rain:0,lamps:null,ao:1},"clear-day":{about:"bright midday, crisp shadows, blue sky with a few clouds",hdri:"sky",env:1,tone:"aces",exposure:1,sky:{zenith:"#2a66c9",horizon:"#b9d3ee",ground:"#55524c",glow:"#000000",clouds:0.32,cloudLight:"#ffffff",cloudDark:"#9aa8ba",stars:0},sun:{color:"#fff3df",power:3.6,el:52,az:160,shadows:!0},hemi:{sky:"#a9c8f0",ground:"#6b6255",power:0.55},fog:{color:"#c2d6ea",density:0.0022},bloom:{strength:0.18,radius:0.4,threshold:1.2},grade:{saturation:1.05,contrast:1.05,shadows:[0,0,0.02],highlights:[0.01,0.01,0],vignette:0.18,grain:0.012,aberration:0},night:0,litRooms:0.1,wet:0,rain:0,lamps:null,ao:1},overcast:{about:"soft grey daylight, no hard shadows, damp streets, muted realistic colour",hdri:"city",env:1.15,tone:"agx",exposure:1.15,sky:{zenith:"#7f8a97",horizon:"#c4c9cd",ground:"#4b4b4b",glow:"#000000",clouds:0.97,cloudLight:"#d3d7dc",cloudDark:"#7b828c",stars:0},sun:{color:"#dfe6ee",power:0.7,el:60,az:180,shadows:!0},hemi:{sky:"#c8cdd3",ground:"#5a5752",power:0.8},fog:{color:"#b3b9bf",density:0.0065},bloom:{strength:0.12,radius:0.4,threshold:1.3},grade:{saturation:0.86,contrast:1.04,shadows:[0,0.01,0.02],highlights:[0,0,0],vignette:0.22,grain:0.02,aberration:0},night:0.05,litRooms:0.35,wet:0.35,rain:0,lamps:null,ao:1},"blue-hour":{about:"just after sunset: deep blue sky, orange horizon, first lights and lit windows",hdri:"dawn",env:0.6,tone:"aces",exposure:1.1,sky:{zenith:"#14244f",horizon:"#d98a6a",ground:"#1c1a22",glow:"#ff8a5a",clouds:0.4,cloudLight:"#d58f8f",cloudDark:"#2a2a45",stars:0.3},sun:{color:"#ff9a6a",power:0.5,el:2,az:255,shadows:!0},hemi:{sky:"#4a5a8f",ground:"#221d24",power:0.45},fog:{color:"#5a5070",density:0.006},bloom:{strength:0.6,radius:0.55,threshold:0.95},grade:{saturation:1.1,contrast:1.06,shadows:[0,0,0.05],highlights:[0.04,0.015,0],vignette:0.3,grain:0.025,aberration:0.002},night:0.75,litRooms:0.5,wet:0.2,rain:0,lamps:{color:"#ffb870",power:0.9},ao:1},noir:{about:"black-and-white crime film: hard light, deep shadows, rain, heavy grain",hdri:"night",env:0.5,tone:"aces",exposure:1.1,sky:{zenith:"#030303",horizon:"#1c1c1c",ground:"#050505",glow:"#151515",clouds:0.8,cloudLight:"#2a2a2a",cloudDark:"#0a0a0a",stars:0},sun:{color:"#cfd6e0",power:0.5,el:35,az:200,shadows:!0},hemi:{sky:"#30343a",ground:"#0b0b0b",power:0.3},fog:{color:"#161616",density:0.014},bloom:{strength:0.7,radius:0.5,threshold:0.9},grade:{saturation:0.08,contrast:1.28,shadows:[0,0,0],highlights:[0.02,0.02,0.02],vignette:0.55,grain:0.07,aberration:0},night:1,litRooms:0.4,wet:0.95,rain:1,lamps:{color:"#fff0d6",power:1.2},ao:1},"misty-forest":{about:"damp woods in morning mist: soft green light, deep fog, gentle shafts of sun",hdri:"forest",env:0.9,tone:"agx",exposure:1.1,sky:{zenith:"#8ea3a8",horizon:"#c9d2c8",ground:"#3d4636",glow:"#000000",clouds:0.85,cloudLight:"#e0e6df",cloudDark:"#9aa59c",stars:0},sun:{color:"#fff0cf",power:1.6,el:25,az:120,shadows:!0},hemi:{sky:"#b8c9b8",ground:"#3f4a33",power:0.7},fog:{color:"#b7c2b5",density:0.022},bloom:{strength:0.25,radius:0.6,threshold:1.1},grade:{saturation:0.95,contrast:1.02,shadows:[0,0.02,0.01],highlights:[0.02,0.02,0],vignette:0.25,grain:0.02,aberration:0},night:0,litRooms:0,wet:0.4,rain:0,lamps:null,ao:1},desert:{about:"harsh high sun, bleached colours, heat haze on the horizon",hdri:"sunrise",env:0.9,tone:"aces",exposure:0.95,sky:{zenith:"#3577d4",horizon:"#e6d3ad",ground:"#8a7354",glow:"#f0c890",clouds:0.08,cloudLight:"#ffffff",cloudDark:"#c9c3b8",stars:0},sun:{color:"#fff0d6",power:4.2,el:64,az:190,shadows:!0},hemi:{sky:"#b7cdea",ground:"#a48a62",power:0.6},fog:{color:"#e2cfa8",density:0.0035},bloom:{strength:0.2,radius:0.5,threshold:1.2},grade:{saturation:1.05,contrast:1.1,shadows:[0.02,0.01,0],highlights:[0.03,0.02,0],vignette:0.2,grain:0.015,aberration:0},night:0,litRooms:0,wet:0,rain:0,lamps:null,ao:1},studio:{about:"showroom lighting for one object or character: soft boxes, clean grey backdrop",hdri:"studio",env:1.2,tone:"agx",exposure:1,sky:{zenith:"#2a2c30",horizon:"#4a4d52",ground:"#2a2a2c",glow:"#000000",clouds:0,cloudLight:"#ffffff",cloudDark:"#ffffff",stars:0},sun:{color:"#ffffff",power:2.2,el:50,az:135,shadows:!0},hemi:{sky:"#ffffff",ground:"#444444",power:0.4},fog:null,bloom:{strength:0.15,radius:0.4,threshold:1.3},grade:{saturation:1,contrast:1.04,shadows:[0,0,0],highlights:[0,0,0],vignette:0.2,grain:0.01,aberration:0},night:0,litRooms:0,wet:0,rain:0,lamps:null,ao:1}},Gv=["bridge","city","dawn","forest","night","park","sky","studio","sunrise","sunset","venice","warehouse"];function Wv(e=""){let t=String(e).toLowerCase();if(/cyber|synth|blade|neon city|megacity/.test(t))return"cyberpunk";if(/noir|black.and.white|detective|crime film/.test(t))return"noir";if(/rain|neon|night|vice|gta|tide|dark street/.test(t))return"neon-rain";if(/sunset|golden|evening|dusk light/.test(t))return"golden-hour";if(/dusk|twilight|blue hour/.test(t))return"blue-hour";if(/fog|mist|forest|woods|swamp/.test(t))return"misty-forest";if(/desert|sand|western|mars|dune/.test(t))return"desert";if(/overcast|grey|gray|cloudy|london|realistic/.test(t))return"overcast";if(/showroom|studio|product|character viewer/.test(t))return"studio";return"clear-day"}function Dp(){let e={uZenith:{value:new fe("#2f6fd0")},uHorizon:{value:new fe("#b8d4ef")},uGround:{value:new fe("#3a3a3a")},uGlow:{value:new fe("#000000")},uSunDir:{value:new I(0.3,0.6,-0.5).normalize()},uSunColor:{value:new fe("#fff4e0")},uSunSize:{value:1},uClouds:{value:0.3},uCloudLight:{value:new fe("#ffffff")},uCloudDark:{value:new fe("#8a96a8")},uStars:{value:0},uTime:{value:0},uNoise:{value:ml()}},t=new xt({uniforms:e,side:vn,depthWrite:!1,fog:!1,vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform vec3 uZenith, uHorizon, uGround, uGlow, uSunDir, uSunColor, uCloudLight, uCloudDark;
      uniform float uSunSize, uClouds, uStars, uTime;
      uniform sampler2D uNoise;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uZenith, pow(clamp(h, 0.0, 1.0), 0.5));
        col = mix(col, uGround, smoothstep(0.0, -0.12, h));
        col += uGlow * exp(-abs(h) * 7.0);
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        vec3 sun = uSunColor * (smoothstep(1.0 - 0.00012 * uSunSize * uSunSize, 1.0 - 0.00005 * uSunSize * uSunSize, sd) * 30.0 + pow(sd, 18.0) * 0.5 + pow(sd, 4.0) * 0.12);
        if (h > 0.0) {
          vec2 cp = d.xz / (h + 0.12) * 0.3 + vec2(uTime * 0.003, uTime * 0.001);
          float c = texture2D(uNoise, cp * 0.22).x * 0.55 + texture2D(uNoise, cp * 0.8 + 3.1).y * 0.3 + texture2D(uNoise, cp * 2.6).w * 0.15;
          float cov = smoothstep(1.0 - uClouds, 1.0 - uClouds + 0.3, c) * smoothstep(0.0, 0.12, h);
          vec3 cc = mix(uCloudDark, uCloudLight, smoothstep(0.35, 0.95, c)) + uSunColor * pow(sd, 5.0) * 0.5;
          sun *= 1.0 - cov * 0.9;
          col = mix(col, cc, cov * 0.94);
          vec2 sp = floor(d.xz / (h + 0.25) * 450.0);
          float st = step(0.9982, fract(sin(dot(sp, vec2(12.9898, 78.233))) * 43758.5453));
          col += vec3(st) * uStars * (1.0 - cov) * smoothstep(0.08, 0.35, h) * 2.0;
        }
        gl_FragColor = vec4(col + sun, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}),n=new vt(new un(1,48,24),t);return n.frustumCulled=!1,n.renderOrder=-1000,n.userData.look={name:"sky"},n.userData.noShadow=!0,n.onBeforeRender=(i,s,r)=>{n.position.copy(r.position),n.scale.setScalar(r.far*0.9),n.updateMatrixWorld()},{mesh:n,uniforms:e}}var Eo=512;function Lp(e,t,n){return new xt({uniforms:n,vertexShader:e,fragmentShader:t,transparent:!0,depthWrite:!1,blending:di,fog:!1,toneMapped:!0})}var Np=`
  varying vec2 vUv; varying vec3 vCol; varying float vDist; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vCol = vec3(1.0);
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = modelMatrix * instanceMatrix;
    #endif
    #ifdef USE_INSTANCING_COLOR
      vCol = instanceColor;
    #endif
    vec4 wp = m * vec4(position, 1.0);
    vN = normalize(mat3(m) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    vDist = distance(cameraPosition, wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;class Up{constructor(e,t="high"){this.scene=e,this.lamps=[],this.glows=[],this.dirty=!0,this.real=[],this.uniforms={uOn:{value:1},uWet:{value:0},uFog:{value:0.01},uHaze:{value:1}};let n=t==="high"?8:t==="medium"?4:2;for(let s=0;s<n;s++){let r=new Ss(16761466,0,34,0.95,0.65,2);r.castShadow=!1,r.userData.noShadow=!0,e.add(r,r.target),this.real.push(r)}let i=this.uniforms;this.pools=new Ln(new Qt(1,1).rotateX(-Math.PI/2),Lp(Np,`
      uniform float uOn, uFog; varying vec2 vUv; varying vec3 vCol; varying float vDist;
      void main() { float r = length(vUv - 0.5) * 2.0; float a = pow(max(1.0 - r, 0.0), 2.2); gl_FragColor = vec4(vCol * a * 0.32 * uOn * exp(-uFog * vDist * 0.5), 1.0); }`,i),Eo),this.cones=new Ln(new En(0.12,1,1,24,1,!0).translate(0,-0.5,0),Lp(Np,`
      uniform float uOn, uHaze; varying vec2 vUv; varying vec3 vCol; varying vec3 vN; varying vec3 vV;
      void main() { float f = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float a = f * pow(vUv.y, 1.4) * 0.11 * uHaze * uOn; gl_FragColor = vec4(vCol * a, 1.0); }`,i),Eo),this.cones.material.side=$t,this.streaks=new Ln(new Qt(1,1).rotateX(-Math.PI/2),Lp(Np,`
      uniform float uWet, uFog; varying vec2 vUv; varying vec3 vCol; varying float vDist;
      void main() {
        float x = (vUv.x - 0.5) * 2.0; float y = 1.0 - vUv.y;
        float a = exp(-x * x * 6.0) * smoothstep(0.0, 0.04, y) * pow(1.0 - y, 1.6);
        a *= 0.75 + 0.25 * sin(y * 90.0 + x * 7.0);
        gl_FragColor = vec4(vCol * a * 0.9 * uWet * exp(-uFog * vDist * 0.6), 1.0);
      }`,i),Eo);for(let s of[this.pools,this.cones,this.streaks])s.count=0,s.frustumCulled=!1,s.userData.noShadow=!0,s.userData.look={name:"lighting-fx"},s.instanceColor=new Tn(new Float32Array(Eo*3),3),e.add(s);this.cones.renderOrder=10,this._m=new He,this._c=new fe,this._frame=0}addLamp({position:e,color:t=null,power:n=1,reach:i=null}){let s={position:e.clone(),color:t?new fe(t):null,power:n,reach:i??e.y*1.3};return this.lamps.push(s),this.glows.push({position:s.position,color:s.color,power:n*0.9,lamp:!0,lampRef:s}),this.dirty=!0,s}addGlow({position:e,color:t="#ff2a6d",power:n=1}){let i={position:e.clone?e.clone():new I(...e),color:new fe(t),power:n};return this.glows.push(i),i}removeGlow(e){let t=this.glows.indexOf(e);if(t>=0)this.glows.splice(t,1)}update(e,t){let n=t.lampsOn,i=this.uniforms;i.uOn.value=n?1:0,i.uWet.value=t.wet,i.uFog.value=t.fogDensity,i.uHaze.value=0.6+t.fogDensity*40+t.rain*0.6;let s=t.lampColor,r=this._m,o=this._c;if(this.dirty){this.dirty=!1;let c=Math.min(this.lamps.length,Eo);for(let h=0;h<c;h++){let u=this.lamps[h],f=u.color??s,d=u.reach;r.makeScale(d*2,1,d*2).setPosition(u.position.x,0.03,u.position.z),this.pools.setMatrixAt(h,r),this.pools.setColorAt(h,o.copy(f).multiplyScalar(u.power)),r.makeScale(d*0.8,u.position.y-0.1,d*0.8).setPosition(u.position.x,u.position.y-0.05,u.position.z),this.cones.setMatrixAt(h,r),this.cones.setColorAt(h,o.copy(f).multiplyScalar(u.power))}this.pools.count=this.cones.count=c;for(let h of[this.pools,this.cones])if(h.instanceMatrix.needsUpdate=!0,h.instanceColor)h.instanceColor.needsUpdate=!0}if(this.pools.visible=this.cones.visible=n&&this.lamps.length>0,n&&this._frame++%8===0){let c=e.position,h=this.lamps.map((u)=>[u,u.position.distanceToSquared(c)]).sort((u,f)=>u[1]-f[1]).slice(0,this.real.length);this.real.forEach((u,f)=>{let d=h[f]?.[0];if(!d)return u.intensity=0;u.position.copy(d.position),u.target.position.set(d.position.x,0,d.position.z),u.target.updateMatrixWorld(),u.color.copy(d.color??s),u.intensity=90*d.power,u.distance=d.reach*2.6})}if(!n)this.real.forEach((c)=>c.intensity=0);let a=t.wet,l=0;if(a>0.05){let c=e.position;for(let h of this.glows){if(l>=Eo)break;if(h.object){if(!h.object.parent)continue;h.object.getWorldPosition(h.position)}if(h.lamp&&!n)continue;let u=h.position,f=c.x-u.x,d=c.z-u.z,g=Math.hypot(f,d);if(g>160||g<0.5)continue;let x=Math.min(u.y*2.2+2,g*0.9),m=Math.atan2(f,d);r.makeRotationY(m),r.scale(new I(Math.max(0.5,u.y*0.18),1,x)),r.setPosition(u.x+f/g*x*0.5,0.04,u.z+d/g*x*0.5),this.streaks.setMatrixAt(l,r),this.streaks.setColorAt(l,o.copy(h.color??s).multiplyScalar(h.power)),l++}}if(this.streaks.count=l,this.streaks.visible=l>0,this.streaks.instanceMatrix.needsUpdate=!0,this.streaks.instanceColor)this.streaks.instanceColor.needsUpdate=!0}}function Vv(e=6000){let t=new Float32Array(e*2*3),n=new Float32Array(e*2*4);for(let u=0;u<e;u++){let f=[Math.random(),Math.random(),Math.random(),Math.random()];for(let d=0;d<2;d++)t.set([0,d,0],(u*2+d)*3),n.set(f,(u*2+d)*4)}let i=new Je;i.setAttribute("position",new at(t,3)),i.setAttribute("aSeed",new at(n,4));let s={uTime:{value:0},uCam:{value:new I},uAmount:{value:1},uWind:{value:new se(1.2,0.4)},uColor:{value:new fe("#a9b8d8")}},r=new xt({uniforms:s,transparent:!0,depthWrite:!1,blending:di,fog:!1,vertexShader:`
      attribute vec4 aSeed; uniform float uTime, uAmount; uniform vec3 uCam; uniform vec2 uWind; varying float vA;
      void main() {
        vec3 box = vec3(50.0, 26.0, 50.0);
        float speed = 22.0 + aSeed.w * 8.0;
        vec3 base = vec3(aSeed.x * box.x, aSeed.y * box.y - uTime * speed, aSeed.z * box.z);
        base.xz += uWind * uTime;
        vec3 p = uCam + mod(base - uCam, box) - box * 0.5;
        vec3 dir = normalize(vec3(uWind.x, -speed, uWind.y));
        p -= dir * position.y * (0.55 + aSeed.w * 0.3);
        vA = (aSeed.w < uAmount ? 1.0 : 0.0) * (0.25 + 0.5 * position.y);
        float d = distance(p, cameraPosition);
        vA *= smoothstep(1.0, 4.0, d) * (1.0 - smoothstep(18.0, 25.0, d));
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,fragmentShader:`
      uniform vec3 uColor; varying float vA;
      void main() { gl_FragColor = vec4(uColor * vA * 0.5, 1.0); }`}),o=new _n(i,r);o.frustumCulled=!1,o.userData.noShadow=!0,o.userData.look={name:"rain"};let a=500,l=new Ln(new Qt(1,1).rotateX(-Math.PI/2),new xt({uniforms:{uTime:s.uTime,uAmount:s.uAmount,uColor:s.uColor},transparent:!0,depthWrite:!1,blending:di,vertexShader:`
      varying vec2 vUv; varying float vPh;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec4 o = instanceMatrix[3];
        vPh = fract(uTime * 1.6 + o.x * 0.37 + o.z * 0.91);
        vec3 p = position * (0.05 + vPh * 0.2);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(p, 1.0);
      }`,fragmentShader:`
      uniform float uAmount; uniform vec3 uColor; varying vec2 vUv; varying float vPh;
      void main() { float r = length(vUv - 0.5) * 2.0; float ring = smoothstep(0.75, 0.9, r) * (1.0 - smoothstep(0.9, 1.0, r)); gl_FragColor = vec4(uColor * ring * (1.0 - vPh) * (1.0 - vPh) * 0.22 * uAmount, 1.0); }`}),a),c=new He;for(let u=0;u<a;u++)l.setMatrixAt(u,c.makeTranslation((Math.random()-0.5)*24,0.035,(Math.random()-0.5)*24));l.frustumCulled=!1,l.userData.noShadow=!0,l.userData.look={name:"rain"};let h=new wt;return h.add(o,l),h.userData.look={name:"rain"},{group:h,uniforms:s,update(u,f,d){s.uTime.value=u,s.uCam.value.copy(f.position),s.uAmount.value=d,h.visible=d>0.01,l.position.set(Math.round(f.position.x/24)*24,0,Math.round(f.position.z/24)*24)}}}var Xv=new I,vb=new Nt,xb=new I;function qv(e){let t=e?.userData?.look;if(!t)return null;if(t.uv==="meters")return t.tile??4;if(t.uv==="facade")return 1;return null}function wl(e,t=new I(1,1,1),n=1,i={}){let s=e.attributes.position,r=e.attributes.normal;if(!s)return e;if(!r)e.computeVertexNormals();let o=e.attributes.normal;e.computeBoundingBox();let a=e.boundingBox.min,l=e.boundingBox.max,c=new Float32Array(s.count*2);for(let h=0;h<s.count;h++){let u=(s.getX(h)-a.x)*t.x,f=(s.getY(h)-a.y)*t.y,d=(s.getZ(h)-a.z)*t.z,g=Math.abs(o.getX(h)),x=Math.abs(o.getY(h)),m=Math.abs(o.getZ(h)),p,M;if(x>=g&&x>=m)p=u,M=d;else if(g>=m)p=o.getX(h)>0?(l.z-a.z)*t.z-d:d,M=f;else p=o.getZ(h)>0?u:(l.x-a.x)*t.x-u,M=f;c[h*2]=p/n,c[h*2+1]=M/n}if(i.bay){let h=(l.x-a.x)*t.x,u=(l.z-a.z)*t.z;for(let f=0;f<s.count;f++){let d=Math.abs(o.getX(f)),g=Math.abs(o.getY(f)),x=Math.abs(o.getZ(f));if(g>=d&&g>=x)continue;let m=d>=x?u:h,p=Math.max(1,Math.round(m/i.bay));c[f*2]*=p*i.bay/Math.max(m,0.001)}}return e.setAttribute("uv",new at(c,2)),e.userData.lookUV=!0,e}function bl(e){if(!e.isMesh||e.isInstancedMesh||e.geometry?.userData?.lookUV)return!1;let n=(Array.isArray(e.material)?e.material:[e.material]).find((i)=>qv(i)!=null);if(!n)return!1;return e.updateWorldMatrix(!0,!1),e.matrixWorld.decompose(xb,vb,Xv),e.geometry=wl(e.geometry.clone(),Xv,qv(n),{bay:n.userData.look.uv==="facade"?n.userData.look.bay:0}),!0}function Yv(e){let t=0;return e.traverse((n)=>{if(n.isMesh&&bl(n))t++}),t}var yb={uniforms:{tDiffuse:{value:null},uTime:{value:0},uRes:{value:new se(1,1)},uSat:{value:1},uContrast:{value:1},uShadow:{value:new I},uHigh:{value:new I},uVignette:{value:0.25},uGrain:{value:0.02},uCA:{value:0}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uTime, uSat, uContrast, uVignette, uGrain, uCA; uniform vec2 uRes; uniform vec3 uShadow, uHigh;
    varying vec2 vUv;
    float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 c;
      if (uCA > 0.0) { vec2 o = d * uCA * (0.5 + r2 * 4.0); c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b); }
      else c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSat);
      c = (c - 0.5) * uContrast + 0.5;
      c += uShadow * (1.0 - smoothstep(0.0, 0.55, l)) + uHigh * smoothstep(0.45, 1.0, l);
      c *= 1.0 - uVignette * smoothstep(0.1, 0.65, r2 * 1.8);
      c += (rand(vUv * uRes + fract(uTime * 7.31)) - 0.5) * uGrain;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`};function _b(){try{let t=new URLSearchParams(location.search).get("quality");if(t==="low"||t==="medium"||t==="high")return t}catch{}return(navigator.maxTouchPoints||0)>0&&Math.min(screen.width,screen.height)<820?"medium":"high"}function Mb(e,t){let n=window.LOOK_HDRI=window.LOOK_HDRI||{};if(n[e])return t(n[e]);let i=document.querySelector('script[src*="look.js"]');if(!i)return;let s=document.createElement("script");s.src=i.src.replace(/look\.js(\?.*)?$/,`hdri/${e}.js`),s.onload=()=>n[e]&&t(n[e]),document.head.appendChild(s)}var Sb={aces:Zi,agx:Ys,neutral:Zs,filmic:Zi};function fu(e){if(!e||e.userData?.lookUpgraded||!(e.isMeshLambertMaterial||e.isMeshPhongMaterial||e.isMeshToonMaterial))return e;let t=new Pt({color:e.color,map:e.map,emissive:e.emissive,emissiveMap:e.emissiveMap,emissiveIntensity:e.emissiveIntensity??1,transparent:e.transparent,opacity:e.opacity,side:e.side,vertexColors:e.vertexColors,alphaTest:e.alphaTest,alphaMap:e.alphaMap,normalMap:e.normalMap??null,flatShading:e.flatShading,fog:e.fog,depthWrite:e.depthWrite,wireframe:e.wireframe,roughness:e.isMeshPhongMaterial?Math.max(0.15,1-Math.sqrt((e.shininess??30)/100)):0.85,metalness:0});if(t.name=e.name,t.userData={...e.userData,lookUpgraded:!0,upgradedFrom:e.type},e.onBeforeCompile&&e.onBeforeCompile.toString().length>20)return e;return t}function Zv(e={}){let t=e.quality??_b(),n=e.container??document.body,i=e.renderer??new nu({canvas:e.canvas,antialias:t==="low",powerPreference:"high-performance",preserveDrawingBuffer:!!e.preserveDrawingBuffer});if(i.setPixelRatio(Math.min(window.devicePixelRatio||1,t==="high"?2:1.25)),i.outputColorSpace=en,i.shadowMap.enabled=!0,i.shadowMap.type=jo,!e.renderer&&!e.canvas)n.appendChild(i.domElement),Object.assign(i.domElement.style,{display:"block",width:"100%",height:"100%"});let s=e.scene??new sr,r=e.camera??new Ot(e.fov??60,1,e.near??0.1,e.far??1500);if(!r.parent&&!e.camera)r.position.set(0,1.7,6);let o=Dp();s.add(o.mesh);let a=new ws(16777215,3);a.castShadow=!0;let l=t==="high"?2048:t==="medium"?1024:512;a.shadow.mapSize.set(l,l);let c=e.shadowSpan??45;Object.assign(a.shadow.camera,{left:-c,right:c,top:c,bottom:-c,near:1,far:400}),a.shadow.bias=-0.0004,a.shadow.normalBias=0.04,a.shadow.radius=3,a.userData.look={name:"sun"},s.add(a,a.target);let h=new go(16777215,4473924,0.5);s.add(h);let u=new Up(s,t),f=Vv(t==="low"?2500:t==="medium"?4500:7000);s.add(f.group);let d=new _o(i),g=null,x=()=>{let G=new sr,Y=Dp();for(let le of Object.keys(Y.uniforms))if(le!=="uNoise")Y.uniforms[le].value=o.uniforms[le].value.clone?o.uniforms[le].value.clone():o.uniforms[le].value;return G.add(Y.mesh),d.fromScene(G,0.02).texture},m=null,p=null,M=null,y=null;if(t!=="low"){if(m=new il(i),m.addPass(new sl(s,r)),t==="high")y=new Si(s,r,1,1),y.blendIntensity=0.85,y.updateGtaoMaterial({radius:0.6,distanceExponent:1.5,thickness:1.2,scale:1,samples:12}),m.addPass(y);if(p=new ns(new se(256,256),0.5,0.5,1),m.addPass(p),m.addPass(new ol),t==="high")m.addPass(new Cp(1,1));M=new _r(yb),m.addPass(M)}let S={name:"",wet:0,rain:0,night:0,lampsOn:!1,lampColor:new fe("#ffc27a"),fogDensity:0,preset:null},C=new I,R=new I,E=0;function D(G){let Y=typeof G==="object"?G:Sl[G];if(!Y)throw Error(`LOOK: unknown preset "${G}". Presets: ${Object.keys(Sl).join(", ")}`);S.name=typeof G==="string"?G:"custom",S.preset=Y,i.toneMapping=Sb[Y.tone]??Zi,i.toneMappingExposure=Y.exposure??1;let te=Y.sky,le=o.uniforms;le.uZenith.value.set(te.zenith),le.uHorizon.value.set(te.horizon),le.uGround.value.set(te.ground),le.uGlow.value.set(te.glow??"#000000"),le.uClouds.value=te.clouds??0,le.uCloudLight.value.set(te.cloudLight??"#ffffff"),le.uCloudDark.value.set(te.cloudDark??"#888888"),le.uStars.value=te.stars??0;let Ee=er.degToRad(Y.sun.el),We=er.degToRad(Y.sun.az);if(C.set(Math.cos(Ee)*Math.sin(We),Math.sin(Ee),Math.cos(Ee)*Math.cos(We)).normalize(),le.uSunDir.value.copy(C),le.uSunColor.value.set(Y.sun.color).multiplyScalar(Y.sun.el>-2?Math.min(1.5,Y.sun.power/2.5)+(Y.night>0.5?0.25:0):0),le.uSunSize.value=Y.night>0.5?0.6:1,a.color.set(Y.sun.color),a.intensity=Y.sun.power,a.castShadow=Y.sun.shadows!==!1,h.color.set(Y.hemi.sky),h.groundColor.set(Y.hemi.ground),h.intensity=Y.hemi.power,Y.fog)s.fog=new ir(new fe(Y.fog.color),Y.fog.density),S.fogDensity=Y.fog.density;else s.fog=null,S.fogDensity=0;if(p)Object.assign(p,{strength:Y.bloom.strength,radius:Y.bloom.radius,threshold:Y.bloom.threshold});if(M){let z=Y.grade,ce=M.uniforms;ce.uSat.value=z.saturation,ce.uContrast.value=z.contrast,ce.uShadow.value.set(...z.shadows),ce.uHigh.value.set(...z.highlights),ce.uVignette.value=z.vignette,ce.uGrain.value=z.grain,ce.uCA.value=z.aberration}if(S.wet=Y.wet??0,S.rain=Y.rain??0,S.night=Y.night??0,S.lampsOn=!!Y.lamps,Y.lamps)S.lampColor.set(Y.lamps.color);if(Mi.uNight.value=S.night,Mi.uLitFrac.value=Y.litRooms??0.5,Mi.uWet.value=S.wet,Mi.uDayInterior.value=0.2*(1-S.night)+0.03,s.environmentIntensity=Y.env??1,g)g.dispose?.();g=x(),s.environment=g,s.background=null;let ct=++E;if(Y.hdri)Mb(Y.hdri,(z)=>{new nl().load(z,(ce)=>{if(ct!==E)return ce.dispose();ce.mapping=Js;let pe=d.fromEquirectangular(ce);ce.dispose(),g?.dispose?.(),g=pe.texture,s.environment=g},void 0,()=>{})});return Oe}let w=new WeakSet,T=[],P=new I;function B(){s.updateMatrixWorld(),s.traverse((G)=>{if(w.has(G))return;w.add(G);let Y=G.userData;if(Y.lookLamp)u.addLamp({position:P.setFromMatrixPosition(G.matrixWorld),color:Y.lookLamp.color,power:Y.lookLamp.power??1});if(Y.lookGlow&&(Y.lookGlow.power??1)>0){let Ee=u.addGlow({position:P.setFromMatrixPosition(G.matrixWorld),color:Y.lookGlow.color,power:Y.lookGlow.power??1});if(Y.lookGlow.follow)Ee.object=G}if(Y.lookTraffic)T.push(Y.lookTraffic);if(!(G.isMesh||G.isInstancedMesh)||G.userData.noShadow||G.userData.look?.name==="sky")return;if(e.upgrade!==!1)if(Array.isArray(G.material))G.material=G.material.map(fu);else G.material=fu(G.material);let le=(Array.isArray(G.material)?G.material:[G.material]).every((Ee)=>Ee&&!Ee.transparent&&Ee.blending===fs);if(e.shadows!==!1&&le){if(G.userData.castShadow!==!1)G.castShadow=!0;G.receiveShadow=!0}bl(G)})}let H=0,k=0;function X(){let G=i.domElement.parentElement&&!e.canvas?i.domElement.parentElement:i.domElement,Y=(e.width??(G===document.body?window.innerWidth:G.clientWidth))||window.innerWidth,te=(e.height??(G===document.body?window.innerHeight:G.clientHeight))||window.innerHeight;if(Y===H&&te===k)return;if(H=Y,k=te,i.setSize(Y,te,!e.canvas),r.isPerspectiveCamera)r.aspect=Y/te,r.updateProjectionMatrix();if(m)m.setSize(Y,te),M.uniforms.uRes.value.set(Y,te)}window.addEventListener("resize",X);let q=0,re=0,W=0;function Q(G=0.016666666666666666){if(q+=G,X(),re++%30===0)B();if(o.uniforms.uTime.value=q,Mi.uTime.value=q,M)M.uniforms.uTime.value=q;let Y=Oe.focus.lengthSq()>0?Oe.focus:r.position;a.target.position.copy(Y),a.position.copy(Y).addScaledVector(C,150),a.target.updateMatrixWorld(),u.update(r,S);for(let te of T){let le=(q/24+te.offset*0.5)%1,Ee=le<0.45?2:le<0.52?1:0;te.lenses.forEach((We,ct)=>We.material.emissiveIntensity=ct===Ee?7:0.04)}if(f.update(q,r,S.rain),G>0.03571428571428571)W++;else W=Math.max(0,W-1);if(W>90&&y&&y.enabled)y.enabled=!1,W=0,console.info("LOOK: frame rate low, ambient occlusion off")}function ae(){if(m)m.render();else i.render(s,r)}let ge=new bs,ve=!1;function Ge(G){ve=!0;let Y=()=>{if(!ve)return;let te=Math.min(ge.getDelta(),0.1);G?.(te,q),Q(te),ae(),requestAnimationFrame(Y)};return requestAnimationFrame(Y),Oe}let Oe={scene:s,camera:r,renderer:i,composer:m,sky:o,sun:a,hemi:h,lights:u,rain:f,quality:t,look:S,focus:R,sunDir:C,passes:{bloom:p,grade:M,gtao:y},setPreset:D,update:Q,render:ae,run:Ge,resize:X,tidy:B,stop(){ve=!1},addLamp:(G)=>u.addLamp(G),addGlow:(G)=>u.addGlow(G),set wet(G){S.wet=G,Mi.uWet.value=G},get wet(){return S.wet},set rainAmount(G){S.rain=G},set night(G){S.night=G,Mi.uNight.value=G}};if(X(),D(e.preset??"clear-day"),typeof window<"u")window.__LOOK_STAGE__=Oe;return Oe}function On(e,t,n,{y0:i=0,tile:s=1,bay:r=0,facade:o=null,v0:a=null}={}){let l=new Dn(e,t,n).translate(0,t/2,0);if(wl(l,new I(1,1,1),s,{bay:r}),a!=null){let c=l.attributes.uv,h=l.attributes.normal;for(let u=0;u<c.count;u++)if(Math.abs(h.getY(u))<0.5)c.setY(u,c.getY(u)+a/s)}if(o){let c=new Float32Array(l.attributes.position.count*2);for(let h=0;h<c.length;h+=2)c[h]=o[0],c[h+1]=o[1];l.setAttribute("facade",new at(c,2))}return l.translate(0,i,0),l}function An(e,t=20){return new ur(e.map(([n,i])=>new se(Math.max(n,0.0001),i)),t)}function Ao(e,t,n,i,s){let r=[],o=[],a=[];for(let f=0;f<=n;f++){let d=f/n,g=0.5-0.5*Math.cos(d*Math.PI),x=e+(t-e)*g,m=s(g);for(let p=0;p<i;p++){let M=p/i*Math.PI*2,y=Math.cos(M),S=Math.sin(M),C=2/m.n,R=Math.sign(y)*Math.pow(Math.abs(y),C)*m.a,E=Math.sign(S)*Math.pow(Math.abs(S),C)*m.b,D=(E/Math.max(m.b,0.0001)+1)/2;R*=1-(m.pinch??0)*D,r.push(R,m.cy+E,x),a.push(p/i,g)}}for(let f=0;f<n;f++)for(let d=0;d<i;d++){let g=f*i+d,x=f*i+(d+1)%i,m=(f+1)*i+d,p=(f+1)*i+(d+1)%i;o.push(g,x,m,x,p,m)}let l=r.length/3,c=s(0),h=s(1);r.push(0,c.cy,e,0,h.cy,t),a.push(0.5,0,0.5,1);for(let f=0;f<i;f++){o.push(l,(f+1)%i,f);let d=n*i;o.push(l+1,d+f,d+(f+1)%i)}let u=new Je;return u.setAttribute("position",new ze(r,3)),u.setAttribute("uv",new ze(a,2)),u.setIndex(o),u.computeVertexNormals(),u}function et(e,t,{cast:n=!0}={}){let i=new vt(e,t);return i.castShadow=n,i.receiveShadow=!0,i}function Ro(e){e.updateMatrixWorld(!0);let t=new He().copy(e.matrixWorld).invert(),n=new Map,i=[];e.traverse((r)=>{if(r===e)return;if(i.some((l)=>wb(r,l)))return;if(r.userData.keep||r.userData.lookLamp||r.userData.lookGlow||r.userData.lookTraffic||r.isInstancedMesh||r.isMesh&&Array.isArray(r.material)){i.push(r);return}if(!r.isMesh)return;let o=r.material.uuid+(r.geometry.index?"i":"n")+Object.keys(r.geometry.attributes).sort().join();if(!n.has(o))n.set(o,{mat:r.material,geos:[],cast:r.castShadow});let a=r.geometry.clone().applyMatrix4(new He().multiplyMatrices(t,r.matrixWorld));n.get(o).geos.push(a)});let s=new wt;s.name=e.name,s.userData={...e.userData},s.position.copy(e.position),s.quaternion.copy(e.quaternion),s.scale.copy(e.scale);for(let{mat:r,geos:o,cast:a}of n.values()){let l=o.length===1?o[0]:ja(o,!1);if(!l)continue;l.userData.lookUV=!0;let c=et(l,r,{cast:a});s.add(c)}for(let r of i){let o=new He().multiplyMatrices(t,r.matrixWorld);r.removeFromParent(),o.decompose(r.position,r.quaternion,r.scale),s.add(r)}return s}function wb(e,t){for(let n=e.parent;n;n=n.parent)if(n===t)return!0;return!1}var Bn=(e,t={})=>ln(e,cu[e],t),ss=(e,t)=>t[Math.floor(e()*t.length)%t.length];function Fp(e={}){let t=is(e.seed??Math.floor(Math.random()*1e6)),n=e.style??ss(t,Object.keys(Rs)),i=Rs[n]??Rs.brick,s=e.w??e.width??20,r=e.d??e.depth??18,o=Math.max(1,Math.round(((e.h??e.height??30)-i.ground-1.2)/i.storey)),a=i.ground+o*i.storey,l=a+1.2,c=t()*100,h=e.colors||e.wall?gl({style:n,...e.colors??{},...e.wall?{wall:e.wall,wall2:e.wall2??e.wall}:{}}):ln(`facade:${n}`,()=>gl({style:n})),u=Bn("concrete",{color:n==="brick"?"#b8b0a2":n==="stucco"?"#ece4d4":"#8d8a84"}),f=new wt;f.name=e.name??`building-${n}`;let d=[];if(l>45&&t()<0.75){let m=i.ground+Math.round(o*(0.55+t()*0.15))*i.storey;d.push({w:s,d:r,y0:0,y1:m});let p=2+t()*2.5,M=Math.max(8,s-p*2),y=Math.max(8,r-p*2);if(l>80&&t()<0.6){let S=m+Math.round((a-m)/i.storey*0.6)*i.storey;d.push({w:M,d:y,y0:m,y1:S}),d.push({w:Math.max(6,M-p*2),d:Math.max(6,y-p*2),y0:S,y1:l})}else d.push({w:M,d:y,y0:m,y1:l})}else d.push({w:s,d:r,y0:0,y1:l});d.forEach((m,p)=>{let M=p===d.length-1,y=M?a:m.y1;if(f.add(et(On(m.w,m.y1-m.y0,m.d,{y0:m.y0,v0:m.y0,bay:i.bay,facade:[y,c+p]}),h)),f.add(et(On(m.w+0.5,0.35,m.d+0.5,{y0:m.y1-(M?0:0.2),tile:4}),u)),p===0)f.add(et(On(m.w+0.3,0.28,m.d+0.3,{y0:i.ground-0.2,tile:4}),u))});let g=d[d.length-1];if(e.roof!==!1){let m=Bn("metal",{color:"#8e949a",roughness:0.45}),p=2+Math.floor(t()*4);for(let y=0;y<p;y++){let S=new wt;S.add(et(On(1.6,1,1.1,{tile:2}),m));let C=et(new En(0.38,0.38,0.06,20),Bn("rubber",{color:"#2a2c2e"}));C.position.set(0,1.02,0),S.add(C),S.position.set((t()-0.5)*(g.w-4),g.y1,(t()-0.5)*(g.d-4)),S.rotation.y=Math.floor(t()*4)*(Math.PI/2),f.add(S)}let M=et(On(3,2.6,3.2,{y0:g.y1,tile:4}),u);if(M.position.set((t()-0.5)*(g.w-6),0,(t()-0.5)*(g.d-6)),f.add(M),(n==="brick"||n==="stucco")&&t()<0.6)f.add(Eb(g,t));if(l>60&&t()<0.5){let y=et(An([[0.25,0],[0.12,6],[0.04,14]],10),m);y.position.set(0,g.y1,0),f.add(y);let S=et(new un(0.18,12,8),As({color:"#ff3030",power:6}),{cast:!1});S.position.set(0,g.y1+14,0),f.add(S)}}let x=e.front??["+z"];for(let m of x){let p=m.endsWith("z")?s:r,M=(m.endsWith("z")?r:s)/2,y=Math.max(1,Math.round(p/i.bay/2)),S=p/y;for(let C=0;C<y;C++){let R=-p/2+S*(C+0.5),E=t();if(E<0.45&&e.awnings!==!1){let D=Op(S*0.8,ss(t,["#7a1f1f","#1f4d3a","#23395d","#5b2a5e","#8a5a14"]));D.position.set(0,i.ground*0.72,M),Kv(D,m,R),f.add(D)}else if(E<0.8&&e.signs!==!1){let D=du({text:e.signText??ss(t,bb),color:ss(t,Tb),height:0.7+t()*0.4});D.position.set(0,i.ground-0.75,M+0.12),Kv(D,m,R),f.add(D)}}}return f.position.set(e.x??0,0,e.z??0),f.rotation.y=e.rotation??0,f.userData.look={name:"building",style:n,height:l,storeys:o},f.userData.collider={w:s,d:r},e.merge===!1?f:Ro(f)}function Kv(e,t,n){if(t==="+z")e.position.x=n;else if(t==="-z")e.position.x=-n,e.position.z*=-1,e.rotation.y=Math.PI;else if(t==="+x"){let i=e.position.z;e.position.set(i,e.position.y,-n),e.rotation.y=Math.PI/2}else if(t==="-x"){let i=e.position.z;e.position.set(-i,e.position.y,n),e.rotation.y=-Math.PI/2}}var bb=["NOODLES","BAR","HOTEL","24/7","PHARMACY","PAWN","DINER","TATTOO","LIQUOR","ARCADE","RAMEN","LAUNDRY","PIZZA","CLUB","MOTEL","SUSHI","DELI","BOOKS"],Tb=["#ff2a6d","#05d9e8","#ff9f1c","#b967ff","#39ff88","#fffb96","#ff4d4d"];function Eb(e,t){let n=new wt,i=Bn("wood",{color:"#6b4a30"}),s=Bn("metal",{color:"#3b3f44",roughness:0.6}),r=et(new En(1.4,1.4,2.6,24),i);r.position.y=3.6;let o=et(new ji(1.55,0.9,24),s);o.position.y=5.35,n.add(r,o);for(let a=0;a<4;a++){let l=et(new En(0.07,0.07,2.3,8),s);l.position.set(Math.cos(a*1.57+0.78)*1.1,1.15,Math.sin(a*1.57+0.78)*1.1),n.add(l)}return n.position.set((t()-0.5)*(e.w-5),e.y1,(t()-0.5)*(e.d-5)),n}function Op(e=3,t="#7a1f1f"){let n=Es(128),i=n.getContext("2d");i.fillStyle=t,i.fillRect(0,0,128,128),i.fillStyle="rgba(255,255,255,0.85)";for(let h=0;h<128;h+=32)i.fillRect(h,0,16,128);let s=new Pi(n);s.colorSpace=en,s.wrapS=cn,s.repeat.set(e/1.2,1);let r=new Ht({map:s,roughness:0.8,sheen:0.5,sheenColor:new fe("#ffffff"),side:$t}),o=new wt,a=new ci;a.moveTo(0,0),a.lineTo(1.3,-0.7),a.lineTo(1.3,-0.95),a.lineTo(1.24,-0.95),a.lineTo(1.24,-0.74),a.lineTo(0,-0.06);let l=new hr(a,{depth:e,bevelEnabled:!1}).translate(0,0,-e/2).rotateY(-Math.PI/2);l.computeVertexNormals();let c=et(l,r);return o.add(c),o.userData.look={name:"awning"},o}function du(e={}){let{text:t="OPEN",color:n="#ff2a6d",height:i=0.8,power:s=5,font:r="700 96px 'Arial Narrow', Arial, sans-serif"}=e,o=document.createElement("canvas"),a=o.getContext("2d");a.font=r;let l=Math.ceil(a.measureText(t).width)+60;o.width=Math.min(2048,l),o.height=150,a.font=r,a.textAlign="center",a.textBaseline="middle",a.fillStyle="#000",a.fillRect(0,0,o.width,o.height),a.lineWidth=9,a.strokeStyle="#fff",a.lineJoin="round",a.strokeText(t,o.width/2,o.height/2+4),a.fillStyle="#222",a.fillText(t,o.width/2,o.height/2+4);let c=new Pi(o);c.colorSpace=en,c.anisotropy=8;let h=i*o.width/o.height,u=new wt,f=et(On(h+0.3,i+0.25,0.12,{tile:2,y0:-(i+0.25)/2}),Bn("metal",{color:"#1a1c20",roughness:0.5})),d=new vt(new Qt(h,i),new Pt({color:"#050505",emissive:n,emissiveMap:c,emissiveIntensity:s,roughness:0.4,transparent:!1}));d.position.z=0.065,d.userData.noShadow=!0;let g=new dt;return g.userData.lookGlow={color:n,power:1.2},u.add(f,d,g),u.userData.look={name:"neonSign",text:t},u}function Bp(e={}){let{height:t=7.5,reach:n=1.6,color:i=null,power:s=1}=e,r=Bn("metal",{color:"#2b2f33",roughness:0.5,brushed:!1}),o=new wt;o.add(et(An([[0.16,0],[0.13,0.5],[0.09,0.6],[0.075,t-0.4],[0.06,t]],14),r));let a=new cr(new I(0,t-0.6,0),new I(0,t+0.15,0),new I(n,t+0.05,0));o.add(et(new fr(a,16,0.05,8),r));let l=new wt;l.add(et(On(0.75,0.16,0.34,{tile:2}),r));let c=new vt(new Qt(0.6,0.24).rotateX(Math.PI/2),As({color:i??"#ffe2b0",power:10}));c.position.y=-0.005,c.userData.noShadow=!0,l.add(c),l.position.set(n+0.2,t-0.05,0);let h=new dt;return h.position.y=-0.1,h.userData.lookLamp={color:i,power:s},l.add(h),o.add(l),o.userData.look={name:"streetLamp"},o}function zp(e={}){let{arm:t=4.5}=e,n=Bn("metal",{color:"#2d3136",roughness:0.55,brushed:!1}),i=new wt;i.add(et(An([[0.14,0],[0.1,0.4],[0.09,5.6]],12),n));let s=et(new En(0.06,0.07,t,10).rotateZ(Math.PI/2),n);s.position.set(t/2,5.4,0),i.add(s);let r=new wt;r.add(et(On(0.38,1.05,0.3,{tile:2,y0:-0.52}),Bn("metal",{color:"#1d2024",roughness:0.6})));let a=["#ff2a1a","#ffb000","#20ff70"].map((l,c)=>{let h=new vt(new Ms(0.11,20),new Pt({color:"#111",emissive:l,emissiveIntensity:0.05}));return h.position.set(0,0.32-c*0.32,0.155),h.userData.noShadow=!0,r.add(h),h});return r.position.set(t-0.4,5.25,0),r.userData.lookTraffic={lenses:a,offset:e.offset??0},r.userData.keep=!0,i.add(r),i.userData.look={name:"trafficLight"},i}function Hp(){let e=ln("hydrant",()=>new Ht({color:"#b3201a",roughness:0.45,clearcoat:0.4})),t=new wt;t.add(et(An([[0.16,0],[0.14,0.08],[0.12,0.1],[0.12,0.55],[0.14,0.58],[0.1,0.7],[0.05,0.78],[0,0.8]],16),e));let n=et(new En(0.05,0.05,0.36,10).rotateZ(Math.PI/2),e);return n.position.y=0.45,t.add(n),t.userData.look={name:"hydrant"},t}function kp(){let e=new wt;return e.add(et(An([[0.27,0],[0.3,0.9],[0.31,0.92],[0.3,0.95],[0,0.97]],18),Bn("metal",{color:"#2f4a3a",roughness:0.55,brushed:!1}))),e.userData.look={name:"trashCan"},e}var Tl=null;function Ab(){if(Tl)return Tl;let e=Es(256),t=e.getContext("2d");t.clearRect(0,0,256,256);let n=is(9);for(let i=0;i<70;i++){let s=40+n()*176,r=40+n()*176,o=n()*Math.PI*2,a=10+n()*16;t.save(),t.translate(s,r),t.rotate(o);let l=90+Math.floor(n()*80);t.fillStyle=`rgb(${40+Math.floor(n()*30)},${l},${30+Math.floor(n()*25)})`,t.beginPath(),t.ellipse(0,0,a,a*0.45,0,0,Math.PI*2),t.fill(),t.strokeStyle="rgba(0,0,0,0.25)",t.lineWidth=1,t.beginPath(),t.moveTo(-a,0),t.lineTo(a,0),t.stroke(),t.restore()}return Tl=new Pi(e),Tl.colorSpace=en,Tl}function Gp(e={}){let t=is(e.seed??Math.floor(Math.random()*1e6)),n=e.height??6+t()*3,i=ln("bark",()=>{let p=hl({color:"#4a3b2e",seed:3});return p.userData.look={name:"bark",uv:"own"},p}),s=new wt;s.add(et(An([[0.22,0],[0.16,0.4],[0.14,n*0.45],[0.08,n*0.8],[0.02,n]],10),i));let r=new I(0,n*0.72,0);for(let p=0;p<5;p++){let M=p/5*Math.PI*2+t(),y=n*0.35,S=et(An([[0.07,0],[0.02,y]],6),i);S.position.set(0,n*(0.45+t()*0.2),0),S.rotation.set(0,M,0.7+t()*0.3),s.add(S)}let o=e.leaves??260,a=ln("leaf",()=>new Pt({map:Ab(),alphaTest:0.45,side:$t,roughness:0.75})),l=new Ln(new Qt(1.3,1.3),a,o),c=new He,h=new Nt,u=new gn,f=new I,d=new I,g=new fe,x=n*0.36,m=n*0.3;for(let p=0;p<o;p++){let M,y,S;do M=t()*2-1,y=t()*2-1,S=t()*2-1;while(M*M+y*y+S*S>1);f.set(r.x+M*x,r.y+y*m,r.z+S*x),h.setFromEuler(u.set(t()*6.28,t()*6.28,t()*6.28));let C=0.7+t()*0.6;l.setMatrixAt(p,c.compose(f,h,d.set(C,C,C)));let R=0.6+(y+1)*0.25+t()*0.15;l.setColorAt(p,g.setRGB(R*0.95,R,R*0.85))}return l.castShadow=!0,l.receiveShadow=!0,s.add(l),s.userData.look={name:"tree"},s}var Jv={sedan:{L:4.7,W:1.86,H:1.45,belt:0.98,hood:0.86,trunk:0.98,cab:[-1.25,0.85],roof:[-0.6,0.2],n:3.2,clear:0.3,wheel:0.34,wb:2.8},hatch:{L:4.1,W:1.8,H:1.5,belt:0.98,hood:0.84,trunk:1.02,cab:[-1.95,0.75],roof:[-1.75,0.15],n:3.4,clear:0.3,wheel:0.32,wb:2.6},suv:{L:4.8,W:1.95,H:1.78,belt:1.12,hood:1.05,trunk:1.15,cab:[-2.2,0.95],roof:[-2.05,0.3],n:4.5,clear:0.42,wheel:0.4,wb:2.9},sport:{L:4.5,W:1.95,H:1.2,belt:0.84,hood:0.68,trunk:0.88,cab:[-1,0.6],roof:[-0.55,-0.05],n:2.8,clear:0.22,wheel:0.34,wb:2.65},taxi:{L:4.7,W:1.86,H:1.45,belt:0.98,hood:0.86,trunk:0.98,cab:[-1.25,0.85],roof:[-0.6,0.2],n:3.2,clear:0.3,wheel:0.34,wb:2.8}},Rb=["#7a0d16","#0f2f5c","#1c1c1e","#d9d9d6","#6e7378","#2f4f3a","#8a6a2a","#3a1f4f","#b5b9bd","#0c3b3a"];function Wp(e={}){let t=is(e.seed??Math.floor(Math.random()*1e6)),n=e.type??ss(t,["sedan","sedan","hatch","suv","sport"]),i=Jv[n]??Jv.sedan,s=e.color??(n==="taxi"?"#f2b705":ss(t,Rb)),r=fl({color:s}),o=Bn("rubber",{color:"#0b0c0d"}),a=Bn("metal",{color:"#151617",roughness:0.4,brushed:!1}),l=new wt,c=i.L,h=i.W/2,u=-c/2,f=c/2,d=(W,Q,ae)=>{let ge=Math.min(1,Math.max(0,(ae-W)/(Q-W)));return ge*ge*(3-2*ge)},g=Ao(u,f,40,36,(W)=>{let Q=u+(f-u)*W,ae=d(0,0.07,W)*d(1,0.92,W),ge=Q>i.cab[1]?i.hood+(i.belt-i.hood)*d(f,i.cab[1],Q)*0.9-0.12*d(f-0.6,f,Q):Q<i.cab[0]?i.trunk-0.05*d(u+0.5,u,Q):i.belt,ve=i.clear,Ge=(ge-ve)/2;return{a:h*(0.82+0.18*ae),b:Ge*(0.7+0.3*Math.sqrt(ae)),cy:ve+Ge,n:i.n,pinch:0.06}});l.add(et(g,r));let[x,m]=i.cab,[p,M]=i.roof,y=Ao(x,m,24,32,(W)=>{let Q=x+(m-x)*W,ae=Q<p?d(x,p,Q):Q>M?d(m,M,Q):1,ge=(i.H-i.belt)*(0.08+0.92*ae);return{a:h*0.9,b:ge/2+0.04,cy:i.belt-0.04+ge/2,n:3,pinch:0.28}});l.add(et(y,dl({tint:"#0e1418",opacity:0.92})));let S=Ao(p-0.08,M+0.05,10,32,(W)=>({a:h*0.68,b:0.05,cy:i.H-0.02,n:4}));l.add(et(S,r));let C=[],R=An([[0,-0.12],[i.wheel-0.05,-0.12],[i.wheel,-0.09],[i.wheel,0.09],[i.wheel-0.05,0.12],[0,0.12]],28);R.rotateZ(Math.PI/2);let E=pl({color:"#c9ccd0",roughness:0.25});for(let[W,Q]of[[1,1],[-1,1],[1,-1],[-1,-1]]){let ae=new wt;ae.add(et(R,o));let ge=et(new En(i.wheel*0.62,i.wheel*0.62,0.05,24).rotateZ(Math.PI/2),E);ge.position.x=W*0.1,ae.add(ge);for(let Ge=0;Ge<5;Ge++){let Oe=et(new Dn(0.03,i.wheel*1.1,0.06),E);Oe.position.x=W*0.125,Oe.rotation.x=Ge/5*Math.PI,ae.add(Oe)}ae.position.set(W*(h-0.14),i.wheel,Q*i.wb/2);let ve=new vt(new Ms(i.wheel+0.06,24,0,Math.PI),new Pt({color:"#050505",roughness:1,side:$t}));ve.rotation.y=W*Math.PI/2,ve.position.set(W*(h-0.02),i.wheel,Q*i.wb/2),l.add(ve,ae),C.push(ae)}let D=As({color:"#f4f6ff",power:e.lightsOn===!1?0.3:6}),w=As({color:"#ff1a1a",power:e.lightsOn===!1?0.4:3.5});for(let W of[1,-1]){let Q=new vt(new Dn(0.42,0.1,0.06),D);Q.position.set(W*(h-0.3),i.hood-0.12,f-0.07),Q.rotation.y=W*-0.25;let ae=new vt(new Dn(0.5,0.09,0.05),w);ae.position.set(W*(h-0.32),i.trunk-0.13,u+0.05),Q.userData.noShadow=ae.userData.noShadow=!0,l.add(Q,ae);let ge=et(On(0.2,0.12,0.1,{tile:1}),r);ge.position.set(W*(h+0.05),i.belt+0.04,i.cab[1]-0.25),l.add(ge)}let T=et(On(i.W*0.48,0.16,0.05,{tile:1}),a);T.position.set(0,i.hood-0.32,f-0.03),l.add(T);let P=Es(128),B=P.getContext("2d");P.height=64,B.fillStyle="#e8e8e0",B.fillRect(0,0,128,64),B.fillStyle="#1a2a6a",B.font="bold 34px monospace",B.textAlign="center",B.fillText(String(Math.floor(t()*9000+1000))+"X",64,44);let H=new Pi(P);H.colorSpace=en;let k=new vt(new Qt(0.52,0.12),new Pt({map:H,roughness:0.4}));if(k.position.set(0,i.trunk-0.35,u-0.005),k.rotation.y=Math.PI,l.add(k),n==="taxi"){let W=du({text:"TAXI",color:"#fff3b0",height:0.2,power:2.5});W.position.set(0,i.H+0.12,(p+M)/2),W.rotation.y=Math.PI/2,l.add(W)}let X=new dt;X.position.set(0,0.7,f),X.userData.lookGlow={color:"#f4f6ff",power:e.lightsOn===!1?0:0.9,follow:!0};let q=new dt;q.position.set(0,0.85,u),q.userData.lookGlow={color:"#ff1a1a",power:e.lightsOn===!1?0:0.6,follow:!0},l.add(X,q),l.userData.look={name:"car",type:n},l.userData.wheels=C,l.userData.collider={w:i.W,d:i.L},l.userData.size={length:i.L,width:i.W,height:i.H};let re=0;return l.userData.drive=(W,Q,ae=0)=>{re+=Q*W/i.wheel,C.forEach((ge,ve)=>{ge.rotation.set(re,ve<2?ae:0,0,"YXZ")})},l.drive=l.userData.drive,l}var Cb=[{shirt:"#2f4a6e",pants:"#24262b",shoes:"#141414",hair:"#2a1d14"},{shirt:"#8a2b2b",pants:"#3b4a63",shoes:"#2b2b2b",hair:"#120d0a"},{shirt:"#d9d4c7",pants:"#45403a",shoes:"#3a2a1e",hair:"#6b4a2a"},{shirt:"#1e1e22",pants:"#1a1a1d",shoes:"#0d0d0d",hair:"#c9a467"},{shirt:"#3d6b4a",pants:"#2c2f36",shoes:"#e8e8e8",hair:"#3b2a20"}],Ib=["#f1c8a8","#d9a07a","#b9805a","#8d5a3b","#5e3a26"];function jv(e={}){let t=is(e.seed??Math.floor(Math.random()*1e6)),n={...ss(t,Cb),...e},i=ul({color:e.skin??ss(t,Ib)}),s=bo({color:n.shirt}),r=bo({color:n.pants,sheen:0.2}),o=new Pt({color:n.shoes,roughness:0.55}),a=new Pt({color:n.hair,roughness:0.65}),l=e.height??1.76,c=l/1.76,h=new wt,u=(T,P,B,H,k)=>{let X=new wt;return X.name=T,X.position.set(B,H,k),P.add(X),X},f=(T,P,B,H=1,k=1)=>{let X=et(An(P,18),B);return X.rotation.x=Math.PI,X.scale.set(H,1,k),T.add(X),X},d=u("hips",h,0,0.95*c,0),g=et(An([[0,-0.1],[0.12,-0.08],[0.165,0],[0.155,0.1]],20),r);g.scale.set(1.15,1,0.75),d.add(g);let x=u("spine",d,0,0.1,0),m=et(An([[0.15,0],[0.14,0.12],[0.16,0.28],[0.18,0.4],[0.165,0.46],[0.08,0.5],[0,0.505]],22),s);m.scale.set(1.18,1,0.68),x.add(m);let p=u("neck",x,0,0.5,0);p.add(et(An([[0.055,0],[0.05,0.1]],12),i));let M=u("head",p,0,0.1,0.01),y=et(new un(0.105,28,20),i);y.scale.set(0.92,1.12,1),y.position.y=0.11,M.add(y);let S=et(new un(0.08,20,14),i);S.scale.set(0.95,0.8,1),S.position.set(0,0.05,0.02),M.add(S);let C=et(new ji(0.018,0.045,10).rotateX(Math.PI/2),i);C.position.set(0,0.095,0.105),M.add(C);for(let T of[1,-1]){let P=et(new un(0.025,10,8),i);P.scale.set(0.5,1,0.8),P.position.set(T*0.098,0.1,0),M.add(P);let B=new vt(new un(0.012,10,8),new Pt({color:"#1b1410",roughness:0.2}));B.position.set(T*0.035,0.125,0.093),M.add(B)}let R=et(new un(0.112,28,16,0,Math.PI*2,0,Math.PI*0.55),a);R.scale.set(0.95,1.12,1.06),R.position.set(0,0.12,-0.01),R.rotation.x=-0.25,M.add(R);let E={root:h,hips:d,spine:x,neck:p,head:M,arms:[],legs:[]};for(let T of[1,-1]){let P=u("shoulder",x,T*0.19,0.44,0);P.add(et(new un(0.06,14,10),s)),f(P,[[0.055,0],[0.05,0.14],[0.042,0.29]],s);let B=u("elbow",P,0,-0.29,0);f(B,[[0.04,0],[0.036,0.14],[0.028,0.25]],e.sleeves==="short"?i:s);let H=et(new un(0.045,12,10),i);H.scale.set(0.6,1.3,1),H.position.y=-0.3,B.add(H);let k=u("hip",d,T*0.09,-0.05,0);f(k,[[0.085,0],[0.075,0.2],[0.055,0.43]],r);let X=u("knee",k,0,-0.43,0);f(X,[[0.052,0],[0.05,0.12],[0.036,0.42]],r);let q=et(On(0.1,0.08,0.25,{tile:1}),o);q.position.set(0,-0.47,0.06),X.add(q),E.arms.push({sh:P,el:B,side:T}),E.legs.push({hip:k,knee:X,side:T})}h.userData.look={name:"human"},h.userData.parts=E,h.userData.collider={w:0.5,d:0.35};let D=0,w=0;return h.userData.animate=(T,P=0)=>{let B=Math.min(1,Math.max(0,(P-1.8)/2.5)),H=Math.min(1,P/0.6);w+=(H-w)*Math.min(1,T*8),D+=T*(P>0.05?P/(1.3+B*0.9)*Math.PI*2*0.55:1.2);let k=Math.sin(D),X=Math.cos(D),q=(0.45+B*0.35)*w,re=(0.35+B*0.5)*w;E.legs.forEach(({hip:Q,knee:ae,side:ge})=>{let ve=ge>0?k:-k;Q.rotation.x=ve*q-B*0.15*w,ae.rotation.x=Math.max(0,-Math.cos(D+(ge>0?0:Math.PI))*(0.55+B*0.7))*w+0.05}),E.arms.forEach(({sh:Q,el:ae,side:ge})=>{let ve=ge>0?-k:k;Q.rotation.x=ve*re,Q.rotation.z=ge*(0.03+B*0.05),ae.rotation.x=-(0.15+B*1.1*w+Math.max(0,ve)*0.3*w)});let W=Math.sin(D*0.5)*0.004*(1-w);d.position.y=0.95*c-Math.abs(X)*(0.03+B*0.04)*w+W,x.rotation.x=B*0.18*w,x.rotation.y=k*0.08*w,M.rotation.y=-k*0.05*w},h.animate=h.userData.animate,h.scale.setScalar(e.scale??1),h}function Qv(e={}){let{size:t=400,material:n="grass",y:i=0}=e,s=typeof n==="string"?Bn(n,e.options??{}):n,r=et(new Qt(t,t).rotateX(-Math.PI/2),s,{cast:!1});return r.position.y=i,r.userData.look={name:"ground"},r}function Vp(e={}){let t=is(e.seed??7),n=e.blocks??3,i=e.block??64,s=e.road??14,r=e.sidewalk??4.5,o=e.wet??0,a=i+s,l=n*a,c=-l/2,h=e.styles??["brick","brick","concrete","glass","stucco","metal"],[u,f]=e.heights??[12,90],d=new wt;d.name="city";let g=new wt,x=[],m=[],p=ll({wet:o,tile:8}),M=et(new Qt(l+s*2+200,l+s*2+200).rotateX(-Math.PI/2),p,{cast:!1});M.position.y=0,d.add(M);let y=cl({wet:o*0.8}),S=Bn("concrete",{color:"#a19d95",wet:o*0.7}),C=To({wet:o}),R=To({color:"#e0b43a",wet:o}),E={white:[],yellow:[]},D=(P,B,H,k,X,q=0)=>{let re=new Qt(k,X).rotateX(-Math.PI/2).rotateY(q).translate(B,0.012,H);P.push(re)};for(let P=0;P<n;P++)for(let B=0;B<n;B++){let H=c+P*a+s/2,k=c+B*a+s/2,X=H+i/2,q=k+i/2,re=et(On(i,0.15,i,{tile:1}),[S,S,y,S,S,S]);re.geometry=On(i,0.15,i,{tile:3}),re.material=[S,S,y,S,S,S],re.position.set(X,0,q),g.add(re);let W=i-r*2,Q=El({x:X-W/2,z:q-W/2,w:W,d:W},t,22,3),ae=Math.hypot(X,q)/(l*0.7);for(let ve of Q){let Ge=0.4+t()*0.8,Oe=ve.w-Ge,G=ve.d-Ge;if(Oe<6||G<6)continue;let Y=Math.pow(t(),1.6)*(1-Math.min(1,ae)*0.7),te=u+(f-u)*Y,le=[];if(Math.abs(ve.z+ve.d-(q+W/2))<0.5)le.push("+z");if(Math.abs(ve.z-(q-W/2))<0.5)le.push("-z");if(Math.abs(ve.x+ve.w-(X+W/2))<0.5)le.push("+x");if(Math.abs(ve.x-(X-W/2))<0.5)le.push("-x");let Ee=Fp({w:Oe,d:G,h:te,style:ss(t,h),seed:Math.floor(t()*1e6),x:ve.x+ve.w/2,z:ve.z+ve.d/2,front:le.slice(0,2),merge:!1,signs:e.signs,awnings:e.awnings});Ee.position.y=0.15,g.add(Ee),x.push({minX:ve.x+ve.w/2-Oe/2,maxX:ve.x+ve.w/2+Oe/2,minZ:ve.z+ve.d/2-G/2,maxZ:ve.z+ve.d/2+G/2})}let ge=i/2-0.6;for(let ve=0;ve<4;ve++){let Ge=ve*Math.PI/2,Oe=new I(Math.sin(Ge),0,Math.cos(Ge)),G=new I(Oe.z,0,-Oe.x);for(let Y=-i/2+8;Y<=i/2-8;Y+=24){let te=Bp({color:e.lampColor}),le=new I(X,0.15,q).addScaledVector(Oe,ge).addScaledVector(G,Y+ve%2*12);te.position.copy(le),te.rotation.y=Ge-Math.PI/2,g.add(te)}if(e.trees!==!1)for(let Y=-i/2+14;Y<=i/2-14;Y+=18){if(t()<0.45)continue;let te=Gp({seed:Math.floor(t()*1e6),height:6+t()*2.5});te.position.copy(new I(X,0.15,q).addScaledVector(Oe,ge-1.4).addScaledVector(G,Y)),g.add(te)}for(let Y=-i/2+5;Y<=i/2-5;Y+=9){let te=t(),le=new I(X,0.15,q).addScaledVector(Oe,ge-0.6).addScaledVector(G,Y);if(te<0.06){let Ee=Hp();Ee.position.copy(le),g.add(Ee)}else if(te<0.12){let Ee=kp();Ee.position.copy(le),g.add(Ee)}}if(e.cars!==!1)for(let Y=-i/2+10;Y<=i/2-10;Y+=6.5){if(t()>(e.parked??0.35))continue;let te=Wp({seed:Math.floor(t()*1e6),lightsOn:!1}),le=new I(X,0,q).addScaledVector(Oe,i/2+1.3).addScaledVector(G,Y);te.position.copy(le),te.rotation.y=Ge+Math.PI/2+(t()-0.5)*0.04;let Ee=Ro(te);Ee.position.copy(te.position),Ee.rotation.copy(te.rotation),d.add(Ee),x.push({minX:le.x-2.4,maxX:le.x+2.4,minZ:le.z-2.4,maxZ:le.z+2.4,car:!0})}}}for(let P=0;P<=n;P++){let B=c+P*a;for(let H=0;H<n;H++){let k=c+H*a+s/2+6,X=c+(H+1)*a-s/2-6,q=X-k,re=(k+X)/2;D(E.yellow,B-0.12,re,0.12,q),D(E.yellow,B+0.12,re,0.12,q),D(E.yellow,re,B-0.12,q,0.12),D(E.yellow,re,B+0.12,q,0.12);for(let W=k+1.5;W<X-1;W+=6)D(E.white,B-s/4,W,0.12,3),D(E.white,B+s/4,W,0.12,3),D(E.white,W,B-s/4,3,0.12),D(E.white,W,B+s/4,3,0.12);for(let W of[k-3,X+3])for(let Q=-s/2+0.8;Q<s/2-0.5;Q+=1.1)D(E.white,B+Q,W,0.55,3.2),D(E.white,W,B+Q,3.2,0.55);m.push({from:[B+s/4,k],to:[B+s/4,X]},{from:[B-s/4,X],to:[B-s/4,k]}),m.push({from:[k,B-s/4],to:[X,B-s/4]},{from:[X,B+s/4],to:[k,B+s/4]})}}let w=(P,B)=>{if(!P.length)return;let H=et(Pb(P),B,{cast:!1});H.geometry.userData.lookUV=!0,d.add(H)};w(E.white,C),w(E.yellow,R);for(let P=1;P<n;P++)for(let B=1;B<n;B++){let H=c+P*a,k=c+B*a;[[1,1,0],[-1,-1,Math.PI],[1,-1,Math.PI/2],[-1,1,-Math.PI/2]].forEach(([X,q,re],W)=>{let Q=zp({arm:s/2-0.5,offset:W%2});Q.position.set(H+X*(s/2+0.5),0.15,k+q*(s/2+0.5)),Q.rotation.y=re+Math.PI,d.add(Q)})}d.add(Ro(g)),d.userData.look={name:"city",blocks:n,pitch:a};let T=new I(c+a+s/2+2,0.15,c+a+s/2+10);return{group:d,colliders:x,lanes:m,spawn:T,size:l,blocked(P,B,H=0.3,k=!0){return x.some((X)=>(k||!X.car)&&P>X.minX-H&&P<X.maxX+H&&B>X.minZ-H&&B<X.maxZ+H)},heightAt(P,B){let H=((P-c)%a+a)%a,k=((B-c)%a+a)%a;return H>s/2&&H<a-s/2&&k>s/2&&k<a-s/2?0.15:0}}}function Pb(e){return ja(e,!1)}function El(e,t,n,i){if(i<=0||e.w<n*1.6&&e.d<n*1.6)return[e];let s=e.w>=e.d,r=0.35+t()*0.3;if(s){let a=e.w*r;return[...El({x:e.x,z:e.z,w:a,d:e.d},t,n,i-1),...El({x:e.x+a,z:e.z,w:e.w-a,d:e.d},t,n,i-1)]}let o=e.d*r;return[...El({x:e.x,z:e.z,w:e.w,d:o},t,n,i-1),...El({x:e.x,z:e.z+o,w:e.w,d:e.d-o},t,n,i-1)]}var Lb={asphalt:(e)=>ln("asphalt",ll,e),pavement:(e)=>ln("pavement",cl,e),concrete:(e)=>ln("concrete",_p,e),brick:(e)=>ln("brick",Mp,e),plaster:(e)=>ln("plaster",Sp,e),metal:(e)=>ln("metal",wp,e),gravel:(e)=>ln("gravel",bp,e),grass:(e)=>ln("grass",Tp,e),dirt:(e)=>ln("dirt",Ep,e),wood:(e)=>ln("wood",hl,e),fabric:bo,skin:ul,carPaint:fl,glass:dl,chrome:pl,rubber:Ap,neon:Rp,lens:As,roadPaint:To,facade:(e={})=>gl(typeof e==="string"?{style:e}:e)};async function Nb(e,t={}){let n=await new ru().loadAsync(e),i=n.scene;if(i.traverse((s)=>{if(s.isMesh)s.castShadow=!0,s.receiveShadow=!0}),t.height){let s=new zt().setFromObject(i),r=s.max.y-s.min.y;if(r>0)i.scale.multiplyScalar(t.height/r);let o=new zt().setFromObject(i);i.position.y-=o.min.y}if(i.userData.animations=n.animations,n.animations?.length){let s=new pr(i);i.userData.mixer=s,i.userData.play=(r)=>{let o=n.animations.find((a)=>a.name.toLowerCase().includes(String(r).toLowerCase()))??n.animations[0];s.stopAllAction(),s.clipAction(o).play()}}return i}function Ub(e,t={}){let{distance:n=5.5,height:i=2.2,lookHeight:s=1.4,stiffness:r=6}=t,o=new I,a=new I;return{distance:n,height:i,update(l,c,h){o.set(c.x-Math.sin(h)*this.distance,c.y+this.height,c.z-Math.cos(h)*this.distance),e.position.lerp(o,1-Math.exp(-r*l)),a.set(c.x,c.y+s,c.z),e.lookAt(a)}}}function Fb(){return window.__LOOK_AUDIT__?window.__LOOK_AUDIT__():null}var $v={version:"1.0.0",stage:Zv,presets:Sl,hdris:Gv,presetFor:Wv,mat:Lb,styles:Rs,facadeUniforms:Mi,building:Fp,city:Vp,street:Vp,car:Wp,human:jv,tree:Gp,streetLamp:Bp,trafficLight:zp,neonSign:du,awning:Op,hydrant:Hp,trashCan:kp,ground:Qv,model:Nb,chaseCamera:Ub,fitUV:bl,fitAll:Yv,metreUV:wl,mergeStatic:Ro,loft:Ao,lathe:An,upgradeMaterial:fu,audit:Fb,addons:{GLTFLoader:ru,EXRLoader:nl,RGBELoader:dp,EffectComposer:il,RenderPass:sl,UnrealBloomPass:ns,OutputPass:ol,ShaderPass:_r,BufferGeometryUtils:np,SkeletonUtils:gp}};if(typeof window<"u")window.THREE=Wn,window.LOOK=$v;var Bb=$v;})();

window.__LOOK_AUDIT__ = function () { return (function lookAudit() {
  const seen = window.__LOOK_SEEN__ || { scenes: [], renderers: [] };
  const stage = window.__LOOK_STAGE__;
  const scenes = new Set(seen.scenes);
  const renderers = new Set(seen.renderers);
  if (stage) { scenes.add(stage.scene); renderers.add(stage.renderer); }
  const out = {
    three: window.__THREE__ || null, look: !!window.LOOK, preset: stage ? stage.look.name : null, quality: stage ? stage.quality : null,
    scenes: scenes.size, renderers: renderers.size, meshes: 0, triangles: 0, materials: {}, flatBig: 0, flatBigNames: [], stretched: [], boxes: 0, primitives: 0,
    shadowsOn: false, toneMapping: null, colorSpace: null, env: false, fog: false, lights: {}, castShadow: 0, emissive: 0,
    bigPlanes: 0, people: [], buildings: [], post: stage ? !!stage.composer : null, sky: false, extent: 0, instanced: 0, textures: 0,
  };
  const TONES = { 0: "none", 1: "linear", 2: "reinhard", 3: "cineon", 4: "aces", 6: "agx", 7: "neutral", 5: "custom" };
  for (const r of renderers) {
    out.shadowsOn = out.shadowsOn || !!(r.shadowMap && r.shadowMap.enabled);
    out.toneMapping = TONES[r.toneMapping] || String(r.toneMapping);
    out.colorSpace = r.outputColorSpace || (r.outputEncoding === 3001 ? "srgb" : "linear");
  }
  const texSeen = new Set();
  const size = (o) => {
    const g = o.geometry;
    if (!g) return null;
    if (!g.boundingBox) g.computeBoundingBox();
    const b = g.boundingBox;
    const s = o.getWorldScale ? o.getWorldScale(new o.position.constructor()) : { x: 1, y: 1, z: 1 };
    return { x: (b.max.x - b.min.x) * Math.abs(s.x), y: (b.max.y - b.min.y) * Math.abs(s.y), z: (b.max.z - b.min.z) * Math.abs(s.z) };
  };
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const scene of scenes) {
    out.env = out.env || !!scene.environment;
    out.fog = out.fog || !!scene.fog;
    if (scene.background && scene.background.isTexture) out.sky = true;
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      if (o.isLight) {
        const k = o.type;
        out.lights[k] = (out.lights[k] || 0) + 1;
        return;
      }
      if (!o.isMesh && !o.isInstancedMesh) return;
      if (o.userData && o.userData.look && o.userData.look.name === "sky") { out.sky = true; return; }
      if (o.material && o.material.isShaderMaterial && o.geometry && o.geometry.type && /Sphere/.test(o.geometry.type) && o.material.side === 1) out.sky = true;
      out.meshes++;
      if (o.isInstancedMesh) out.instanced++;
      const g = o.geometry;
      const tris = g ? (g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)) / 3 : 0;
      out.triangles += tris * (o.isInstancedMesh ? o.count : 1);
      const gt = g && g.type;
      if (gt === "BoxGeometry" || gt === "CylinderGeometry" || gt === "SphereGeometry" || gt === "CapsuleGeometry" || gt === "PlaneGeometry" || gt === "ConeGeometry") out.primitives++;
      if (gt === "BoxGeometry" && tris <= 12) out.boxes++;
      if (o.castShadow) out.castShadow++;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const s = size(o);
      const big = s ? Math.max(s.x, s.y, s.z) : 0;
      if (s) {
        const p = o.getWorldPosition(new (o.position.constructor)());
        minX = Math.min(minX, p.x - s.x / 2); maxX = Math.max(maxX, p.x + s.x / 2); minZ = Math.min(minZ, p.z - s.z / 2); maxZ = Math.max(maxZ, p.z + s.z / 2);
        if (gt === "BoxGeometry" && s.y > 8 && s.y > s.x * 0.4) out.buildings.push(Math.round(s.y));
      }
      for (const m of mats) {
        if (!m) continue;
        out.materials[m.type] = (out.materials[m.type] || 0) + 1;
        if (m.emissive && (m.emissiveIntensity || 0) * Math.max(m.emissive.r, m.emissive.g, m.emissive.b) > 0.8) out.emissive++;
        const lookMat = m.userData && m.userData.look;
        const textured = !!(m.map || m.normalMap || m.roughnessMap || m.emissiveMap || m.isShaderMaterial || (m.onBeforeCompile && String(m.onBeforeCompile).length > 30) || lookMat);
        if (!textured && big > 6 && !m.isMeshBasicMaterial && !o.isInstancedMesh) {
          out.flatBig++;
          if (out.flatBigNames.length < 6) out.flatBigNames.push((o.name || gt || "mesh") + ` (${Math.round(big)} m)`);
        }
        if (gt === "PlaneGeometry" && s && Math.max(s.x, s.z) > 80 && !textured) out.bigPlanes++;
        // Texture pixels per metre: under ~24 a texture looks smeared up close.
        const t = m.map || m.emissiveMap;
        if (t && t.image && t.image.width && s && !lookMat && !(m.isShaderMaterial)) {
          if (!texSeen.has(t)) { texSeen.add(t); out.textures++; }
          const rep = Math.max(Math.abs(t.repeat ? t.repeat.x : 1), 0.001);
          const uvSpan = g.attributes.uv ? spanOf(g.attributes.uv) : 1;
          const ppm = (t.image.width * rep * uvSpan) / Math.max(1e-3, Math.max(s.x, s.z, s.y));
          if (ppm < 24 && big > 5 && out.stretched.length < 8) out.stretched.push(`${o.name || gt} (${Math.round(big)} m, ${ppm.toFixed(1)} px/m)`);
        }
      }
    });
  }
  function spanOf(uv) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < Math.min(uv.count, 400); i++) { const u = uv.getX(i); lo = Math.min(lo, u); hi = Math.max(hi, u); }
    return Math.max(1e-3, hi - lo);
  }
  if (isFinite(minX)) out.extent = Math.round(Math.max(maxX - minX, maxZ - minZ));
  out.buildings = out.buildings.sort((a, b) => a - b).slice(0, 200);
  // A person, if the game made one: the tallest thing named like one.
  try {
    for (const scene of scenes) scene.traverse((o) => {
      const n = (o.name || "") + " " + ((o.userData && o.userData.look && o.userData.look.name) || "");
      if (!/(^|\b)(player|hero|character|human|person)(\b|$)/i.test(n) || o.isScene) return;
      const V = o.position.constructor;
      let lo = Infinity, hi = -Infinity;
      o.traverse((m) => {
        const g = m.geometry;
        if (!g || !g.attributes || !g.attributes.position) return;
        if (!g.boundingBox) g.computeBoundingBox();
        const b = g.boundingBox;
        for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
          const v = new V(x, y, z).applyMatrix4(m.matrixWorld);
          lo = Math.min(lo, v.y); hi = Math.max(hi, v.y);
        }
      });
      if (isFinite(hi)) out.people.push({ name: n.trim(), height: +(hi - lo).toFixed(2) });
    });
  } catch (e) {}
  out.people = out.people.slice(0, 4);
  return out;
})(); };
