/* Chiusura sicura delle stanze EscapeVerse 1.0 */
(() => {
  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled||typeof state==='undefined'||!state||state.escaped||typeof selected==='undefined'||!selected||selected.id==='archivio47')return;
    const objects=[...document.querySelectorAll('.v1-object')];
    if(objects.length===5&&objects.every(x=>x.classList.contains('solved'))){
      scheduled=true;
      setTimeout(()=>{scheduled=false;if(state&&!state.escaped)finish()},900);
    }
  });
  const target=document.querySelector('#sceneObjects');
  if(target)observer.observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();