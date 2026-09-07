/**
 * Inserts demo scenario text into the ApexChat message input.
 * Parent page can call directly or send: { type: 'blazeo-chat-insert', text: '...' }
 */
(function () {
  var INPUT_SELECTORS = [
    '#apexchat_rd_msg_box',
    'textarea.livechat_typing_textarea',
    'textarea[placeholder*="Type your message" i]',
    'textarea[placeholder*="type your message" i]',
    '#txtAutocompleteInput'
  ];

  function isMessageInput(el) {
    if (!el || el.disabled || el.readOnly) return false;
    return el.tagName === 'TEXTAREA' ||
      (el.tagName === 'INPUT' && (!el.type || el.type === 'text' || el.type === 'search'));
  }

  function scoreInput(el) {
    var placeholder = (el.placeholder || '').toLowerCase();
    var score = 0;

    if (el.id === 'apexchat_rd_msg_box') score += 100;
    if (el.classList && el.classList.contains('livechat_typing_textarea')) score += 50;
    if (placeholder.indexOf('type your message') !== -1) score += 40;
    if (el.offsetWidth > 0 && el.offsetHeight > 0) score += 30;

    return score;
  }

  function findInDocument(doc) {
    var best = null;
    var bestScore = -1;
    var i;
    var candidates = [];

    for (i = 0; i < INPUT_SELECTORS.length; i++) {
      var selected = doc.querySelector(INPUT_SELECTORS[i]);
      if (selected) candidates.push(selected);
    }

    doc.querySelectorAll('textarea, input[type="text"]').forEach(function (el) {
      candidates.push(el);
    });

    for (i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (!isMessageInput(el)) continue;

      var score = scoreInput(el);
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }

    return best;
  }

  function findChatInput(win, depth) {
    if (!win || depth > 8) return null;

    try {
      var doc = win.document;
      var found = findInDocument(doc);
      if (found && scoreInput(found) >= 100) return found;

      var iframes = doc.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        try {
          var inner = findChatInput(iframes[i].contentWindow, depth + 1);
          if (inner) return inner;
        } catch (e) {}
      }

      return found;
    } catch (e) {}

    return null;
  }

  function setInputValue(el, value) {
    if (!el || !value) return false;

    var view = el.ownerDocument.defaultView;
    var doc = el.ownerDocument;
    var inserted = false;

    el.focus();

    try {
      el.select();
    } catch (e) {}

    try {
      if (doc.execCommand) {
        try {
          doc.execCommand('selectAll', false, null);
        } catch (e2) {}

        inserted = doc.execCommand('insertText', false, value);
      }
    } catch (e) {}

    if (!inserted || el.value !== value) {
      var proto = el.tagName === 'TEXTAREA'
        ? view.HTMLTextAreaElement.prototype
        : view.HTMLInputElement.prototype;
      var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, value);
    }

    el.dispatchEvent(new view.Event('input', { bubbles: true }));
    el.dispatchEvent(new view.Event('change', { bubbles: true }));

    try {
      el.dispatchEvent(new view.InputEvent('input', {
        bubbles: true,
        data: value,
        inputType: 'insertText'
      }));
    } catch (e) {}

    el.dispatchEvent(new view.KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' }));

    if (typeof el.setSelectionRange === 'function') {
      var length = el.value.length;
      el.setSelectionRange(length, length);
    }

    el.focus();
    return el.value === value;
  }

  function insertChatText(text) {
    if (!text) return false;
    var input = findChatInput(window, 0);
    if (!input) return false;
    return setInputValue(input, text);
  }

  window.insertChatMessage = insertChatText;

  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'blazeo-chat-insert' || !event.data.text) return;

    var success = insertChatText(event.data.text);

    if (event.source) {
      try {
        event.source.postMessage({
          type: 'blazeo-chat-insert-result',
          success: success,
          text: event.data.text
        }, '*');
      } catch (e) {}
    }
  });
})();
