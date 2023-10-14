import { default as seagulls } from '../../seagulls.js'
import { default as Video    } from '../../video.js'
import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';



  


const shader = `
@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> res:   vec2f;
@group(0) @binding(2) var<uniform> audio: vec3f;
@group(0) @binding(3) var<uniform> mouse: vec3f;
@group(0) @binding(4) var<uniform> redness: f32;
@group(0) @binding(5) var<uniform> cellspeed: f32;
@group(0) @binding(6) var<uniform> cellopacity: f32;
@group(0) @binding(7) var backSampler:    sampler;
@group(0) @binding(8) var backBuffer:     texture_2d<f32>;
@group(0) @binding(9) var videoSampler:   sampler;
@group(1) @binding(0) var videoBuffer:    texture_external;




@vertex 
fn vs( @location(0) input : vec2f ) ->  @builtin(position) vec4f {
  return vec4f( input, 0., 1.); 
}

fn random2( p: vec2f ) -> vec2f{
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
    }

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {

   
   
    
  var st: vec2f;
  st = pos.xy / res;
  
  var color: vec3f;
 
  st.x *=3;
  
  let i_st = vec2f(floor(st));
  let f_st = vec2f(fract(st));
  
  
  var m_dist: f32;
  m_dist = 1.;

  
  for (var y= -1; y <= 1; y++) {
       for (var x= -1; x <= 1; x++) {

         
         let neighbor = vec2f(f32(x),f32(y));
         
         var point: vec2f;
         point = random2(i_st + neighbor);
         
         
        
         point = sin(.5) + cellspeed*sin((frame/80) + 6.2831*point);
         
         let diff = (neighbor + point) - f_st;

         let dist = length(diff) * 1.;
         
         m_dist = min(m_dist, dist);
         
        
       
          
         
         
 }       
}
    
     color += m_dist * (cellopacity * 2);

      
      
  
      

      

      
     
     
  
  

  


    
 
  let vid = textureSampleBaseClampToEdge( videoBuffer, videoSampler, pos.xy / res );
  let fb  = textureSample( backBuffer, backSampler,  pos.xy / res );
  let out =  vid * .05 +  (fb * .955);

  return vec4f( redness * (out.r +  color.r * 5), out.g + (color.g/20), out.b + (color.b/20), 1. );
  
  
}`

async function main() {
  let frame = 0
  
  document.body.onclick = Audio.start

  await Video.init()

  const sg = await seagulls.init()
  
  const PARAMS = { redness:.5, cellspeed:.5, cellopacity:.5 }
  const pane = new Pane()
  pane.addBinding( PARAMS, 'redness', {
    min: 0.0,
    max: 1.0,
  })
  pane.addBinding( PARAMS, 'cellspeed', {
    min: .02,
    max: .8,
  })
  pane.addBinding( PARAMS, 'cellopacity', {
    min: 0.0,
    max: 1.0,
  })

  sg.uniforms({ 
    frame:0, 
    res:[window.innerWidth, window.innerHeight],
    audio:[0,0,0],
    mouse:[0,0,0],
    redness:0,
    cellspeed:0,
    cellopacity:0,
  })
  .onframe( ()=> {
    sg.uniforms.frame = frame++ 
    sg.uniforms.audio = [ Audio.low, Audio.mid, Audio.high ]
    sg.uniforms.redness = PARAMS.redness
    sg.uniforms.cellspeed = PARAMS.cellspeed
    sg.uniforms.cellopacity = PARAMS.cellopacity

  })
  .textures([ Video.element ]) 
  .render( shader, { uniforms: ['frame','res', 'audio', 'mouse','redness', 'cellspeed', 'cellopacity'] })
  .run()
  

  
}

main()
