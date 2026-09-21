/* yesyes标假名 — local Kuromoji worker v12
 * 词典和 kuromoji.js 均使用 GitHub Pages 同源本地文件。
 * 只把渲染真正需要的字段回传给主线程，避免 tokenizer 返回对象在 postMessage 时出现克隆问题。
 */
importScripts('./kuromoji/kuromoji.js');

let tokenizer = null;

self.onmessage = function(e){
  const data = e.data || {};
  if(data.type === 'init'){
    try{
      kuromoji.builder({ dicPath: './kuromoji/dict/' }).build(function(err, t){
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

  if(data.type === 'tokenize' && tokenizer){
    try{
      const lines = Array.isArray(data.lines) ? data.lines : [];
      const result = lines.map(function(line){
        const tokens = tokenizer.tokenize(String(line || ''));
        return tokens.map(function(t){
          return {
            surface_form: String(t.surface_form || ''),
            reading: t.reading ? String(t.reading) : '',
            word_position: typeof t.word_position === 'number' ? t.word_position : 0
          };
        });
      });
      self.postMessage({type:'tokens', id:data.id, result:result});
    }catch(err){
      self.postMessage({type:'tokenizeError', id:data.id, message:String(err && (err.stack || err.message) || err)});
    }
  }
};
