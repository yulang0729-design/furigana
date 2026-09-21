/* yesyes标假名 — same-origin, fully local Kuromoji worker */
importScripts('./kuromoji/kuromoji.js');

let tokenizer = null;

self.onmessage = function(e){
  const data = e.data || {};
  const type = data.type;

  if(type === 'init'){
    try{
      const dicPath = new URL('./kuromoji/dict/', self.location.href).href;
      kuromoji.builder({ dicPath }).build(function(err, t){
        if(err){
          self.postMessage({type:'error', message:String(err && (err.stack || err.message) || err)});
          return;
        }
        tokenizer = t;
        self.postMessage({type:'ready'});
      });
    }catch(err){
      self.postMessage({type:'error', message:String(err && (err.stack || err.message) || err)});
    }
    return;
  }

  if(type === 'tokenize' && tokenizer){
    try{
      const lines = Array.isArray(data.lines) ? data.lines : [];
      const result = lines.map(function(line){ return tokenizer.tokenize(String(line || '')); });
      self.postMessage({type:'tokens', id:data.id, result:result});
    }catch(err){
      self.postMessage({type:'tokenizeError', id:data.id, message:String(err && (err.stack || err.message) || err)});
    }
  }
};
