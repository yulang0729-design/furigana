/* yesyes标假名 — local Kuromoji worker */

importScripts('./kuromoji/kuromoji.js');

let tokenizer = null;

self.onmessage = function(e) {
  const data = e.data || {};
  const type = data.type;

  if (type === 'init') {
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

        self.postMessage({
          type: 'ready'
        });
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: String(err && (err.stack || err.message) || err)
      });
    }

    return;
  }

  if (type === 'tokenize' && tokenizer) {
    try {
      const lines = Array.isArray(data.lines) ? data.lines : [];

      const result = lines.map(function(line) {
        return tokenizer.tokenize(String(line || ''));
      });

      self.postMessage({
        type: 'tokens',
        id: data.id,
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
