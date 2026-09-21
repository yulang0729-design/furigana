/* yesyes标假名 — same-origin local Kuromoji worker */

// 只使用 GitHub Pages 同源目录中的本地 Kuromoji，避免 CDN/版本混用。
importScripts('./kuromoji/kuromoji.js');

let tokenizer = null;

self.onmessage = function(e) {
  const data = e.data || {};

  if (data.type === 'init') {
    try {
      kuromoji.builder({
        dicPath: './kuromoji/dict/'
      }).build(function(err, t) {
        if (err) {
          self.postMessage({
            type: 'error',
            message: String(err && (err.stack || err.message) || err)
          });
          return;
        }
        tokenizer = t;
        self.postMessage({ type: 'ready' });
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: String(err && (err.stack || err.message) || err)
      });
    }
    return;
  }

  if (data.type === 'tokenize') {
    if (!tokenizer) {
      self.postMessage({
        type: 'tokenizeError',
        id: data.id,
        message: 'tokenizer is not ready'
      });
      return;
    }

    try {
      const lines = Array.isArray(data.lines) ? data.lines : [];
      const result = lines.map(function(line) {
        return tokenizer.tokenize(String(line || '')).map(function(t) {
          return {
            surface_form: String(t.surface_form || ''),
            reading: String(t.reading || ''),
            word_position: typeof t.word_position === 'number' ? t.word_position : 0
          };
        });
      });

      self.postMessage({
        type: 'tokens',
        id: data.id,
        text: String(data.text || ''),
        result: result
      });
    } catch (err) {
      self.postMessage({
        type: 'tokenizeError',
        id: data.id,
        message: String(err && (err.stack || err.message) || err)
      });
    }
  }
};
