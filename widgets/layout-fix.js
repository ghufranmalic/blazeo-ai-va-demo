/**
 * Layout helpers for embedded ApexChat widgets.
 * - Full chat window: fixed size and bottom anchoring inside the iframe.
 * - Popup invitations: horizontal alignment only (never touch vertical positioning).
 * - CHAT NOW tab: never modified (ApexChat rotates it with CSS transform).
 */
(function () {
  var CHAT_WIDTH = 492;
  var CHAT_HEIGHT = 620;
  var CHAT_LEFT = '64px';
  var BORDER_RADIUS = '12px';

  function applyStyles(el, styles) {
    if (!el) return;
    Object.keys(styles).forEach(function (prop) {
      el.style.setProperty(prop, styles[prop], 'important');
    });
  }

  function isVisible(el) {
    if (!el) return false;
    var style = getComputedStyle(el);
    return el.offsetWidth > 0 &&
      el.offsetHeight > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden';
  }

  function injectGlobalStyles() {
    if (document.getElementById('blazeo-widget-styles')) return;

    var style = document.createElement('style');
    style.id = 'blazeo-widget-styles';
    style.textContent = [
      '#apexchat_popup_message_invitation_frame,',
      '#apexchat_dompopup_chatwindow_frame,',
      '#apexchat_prechat_invitation_frame {',
      '  border-radius: ' + BORDER_RADIUS + ' !important;',
      '}',
      '#apexchat_dompopup_chatwindow_wrapper,',
      '#apexchat_dompopup_chatwindow_frame {',
      '  border-radius: ' + BORDER_RADIUS + ' !important;',
      '  overflow: hidden !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function styleInnerFrame(frame) {
    if (!frame || !frame.contentDocument) return;

    var doc = frame.contentDocument;
    if (doc.getElementById('blazeo-inner-styles')) return;

    var style = doc.createElement('style');
    style.id = 'blazeo-inner-styles';
    style.textContent = [
      '.apexchat_rd_chat_window,',
      '.card,',
      '.livechat_message_popup_wrapper,',
      '.apexchat_video_greet_invitation_wrapper {',
      '  border-radius: ' + BORDER_RADIUS + ' !important;',
      '}'
    ].join('\n');

    if (doc.head) {
      doc.head.appendChild(style);
    }
  }

  function alignPopupHorizontally(wrapper, frame) {
    if (!isVisible(wrapper)) return;

    applyStyles(wrapper, {
      right: 'auto',
      left: CHAT_LEFT,
      width: CHAT_WIDTH + 'px',
      'max-width': CHAT_WIDTH + 'px',
      'border-radius': BORDER_RADIUS
    });

    if (frame) {
      applyStyles(frame, {
        width: CHAT_WIDTH + 'px',
        'max-width': CHAT_WIDTH + 'px',
        'border-radius': BORDER_RADIUS
      });
      styleInnerFrame(frame);
    }
  }

  function alignChatWindow(wrapper, frame) {
    if (!isVisible(wrapper)) return;

    applyStyles(wrapper, {
      position: 'fixed',
      right: 'auto',
      left: CHAT_LEFT,
      top: 'auto',
      bottom: '10px',
      transform: 'none',
      width: CHAT_WIDTH + 'px',
      'max-width': CHAT_WIDTH + 'px',
      height: CHAT_HEIGHT + 'px',
      'min-height': CHAT_HEIGHT + 'px',
      'border-radius': BORDER_RADIUS,
      overflow: 'hidden'
    });

    if (frame) {
      applyStyles(frame, {
        width: CHAT_WIDTH + 'px',
        'max-width': CHAT_WIDTH + 'px',
        height: CHAT_HEIGHT + 'px',
        'max-height': CHAT_HEIGHT + 'px',
        'border-radius': BORDER_RADIUS,
        overflow: 'hidden'
      });
      styleInnerFrame(frame);
    }
  }

  function fixChatLayout() {
    injectGlobalStyles();

    alignPopupHorizontally(
      document.getElementById('apexchat_popup_message_invitation_wrapper'),
      document.getElementById('apexchat_popup_message_invitation_frame')
    );

    alignPopupHorizontally(
      document.getElementById('apexchat_prechat_invitation_wrapper'),
      document.getElementById('apexchat_prechat_invitation_frame')
    );

    alignChatWindow(
      document.getElementById('apexchat_dompopup_chatwindow_wrapper'),
      document.getElementById('apexchat_dompopup_chatwindow_frame')
    );
  }

  fixChatLayout();

  var observer = new MutationObserver(fixChatLayout);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  window.addEventListener('resize', fixChatLayout);
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'blazeo-layout-resize') {
      fixChatLayout();
    }
  });
  setInterval(fixChatLayout, 1000);
})();
