/**
 * Layout helpers for embedded ApexChat widgets.
 * - Full chat window: fixed size and bottom anchoring inside the iframe.
 * - Popup invitations: horizontal alignment only (never touch vertical positioning).
 * - CHAT NOW tab: only nudged on narrow screens, transform is never cleared.
 */
(function () {
  var DESKTOP_CHAT_WIDTH = 492;
  var DESKTOP_CHAT_WIDTH_WIDE = 540;
  var WIDE_CONTAINER_BREAKPOINT = 600;
  var DESKTOP_CHAT_HEIGHT = 620;
  var DESKTOP_CHAT_LEFT = 64;
  var TAB_WIDTH = 52;
  var MOBILE_SIDE_PADDING = 8;
  var DESKTOP_BREAKPOINT = 560;
  var BORDER_RADIUS = '12px';
  var containerWidth = document.body.clientWidth || document.documentElement.clientWidth || window.innerWidth;
  var containerHeight = document.body.clientHeight || window.innerHeight;

  function getChatHeight() {
    var bottomPad = 10;
    var tallMax = Math.min(760, Math.floor(containerHeight * 0.95));
    return Math.max(320, Math.min(tallMax, containerHeight - bottomPad));
  }

  function getLayoutMetrics() {
    var width = containerWidth;

    if (width >= DESKTOP_BREAKPOINT) {
      var sideSpace = DESKTOP_CHAT_LEFT + 12;
      var chatWidth = width >= WIDE_CONTAINER_BREAKPOINT
        ? Math.min(DESKTOP_CHAT_WIDTH_WIDE, width - sideSpace)
        : DESKTOP_CHAT_WIDTH;

      return {
        chatLeft: DESKTOP_CHAT_LEFT,
        chatWidth: Math.max(DESKTOP_CHAT_WIDTH, chatWidth)
      };
    }

    var chatLeft = MOBILE_SIDE_PADDING + TAB_WIDTH;
    var chatWidth = Math.min(
      DESKTOP_CHAT_WIDTH,
      width - chatLeft - MOBILE_SIDE_PADDING
    );

    return {
      chatLeft: chatLeft,
      chatWidth: Math.max(260, chatWidth)
    };
  }

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

  function alignPopupHorizontally(wrapper, frame, metrics) {
    if (!isVisible(wrapper)) return;

    applyStyles(wrapper, {
      right: 'auto',
      left: metrics.chatLeft + 'px',
      width: metrics.chatWidth + 'px',
      'max-width': metrics.chatWidth + 'px',
      'border-radius': BORDER_RADIUS
    });

    if (frame) {
      applyStyles(frame, {
        width: metrics.chatWidth + 'px',
        'max-width': metrics.chatWidth + 'px',
        'border-radius': BORDER_RADIUS
      });
      styleInnerFrame(frame);
    }
  }

  function alignChatWindow(wrapper, frame, metrics) {
    if (!isVisible(wrapper)) return;

    var chatHeight = getChatHeight();

    applyStyles(wrapper, {
      position: 'fixed',
      right: 'auto',
      left: metrics.chatLeft + 'px',
      top: 'auto',
      bottom: '10px',
      transform: 'none',
      width: metrics.chatWidth + 'px',
      'max-width': metrics.chatWidth + 'px',
      height: chatHeight + 'px',
      'min-height': chatHeight + 'px',
      'border-radius': BORDER_RADIUS,
      overflow: 'hidden'
    });

    if (frame) {
      applyStyles(frame, {
        width: metrics.chatWidth + 'px',
        'max-width': metrics.chatWidth + 'px',
        height: chatHeight + 'px',
        'max-height': chatHeight + 'px',
        'border-radius': BORDER_RADIUS,
        overflow: 'hidden'
      });
      styleInnerFrame(frame);
    }
  }

  function syncContainerWidth() {
    var measuredWidth = document.body.clientWidth || document.documentElement.clientWidth;
    var measuredHeight = document.body.clientHeight || window.innerHeight;
    if (measuredWidth > 0) {
      containerWidth = measuredWidth;
    }
    if (measuredHeight > 0) {
      containerHeight = measuredHeight;
    }
  }

  function alignTabOnMobile(metrics) {
    if (containerWidth >= DESKTOP_BREAKPOINT) return;

    var tabWrapper = document.getElementById('apexchat_tab_invitation_wrapper');
    if (!isVisible(tabWrapper)) return;

    applyStyles(tabWrapper, {
      left: MOBILE_SIDE_PADDING + 'px',
      right: 'auto'
    });
  }

  function fixChatLayout() {
    syncContainerWidth();
    injectGlobalStyles();

    var metrics = getLayoutMetrics();

    alignPopupHorizontally(
      document.getElementById('apexchat_popup_message_invitation_wrapper'),
      document.getElementById('apexchat_popup_message_invitation_frame'),
      metrics
    );

    alignPopupHorizontally(
      document.getElementById('apexchat_prechat_invitation_wrapper'),
      document.getElementById('apexchat_prechat_invitation_frame'),
      metrics
    );

    alignChatWindow(
      document.getElementById('apexchat_dompopup_chatwindow_wrapper'),
      document.getElementById('apexchat_dompopup_chatwindow_frame'),
      metrics
    );

    alignTabOnMobile(metrics);
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
      if (event.data.width) {
        containerWidth = event.data.width;
      }
      if (event.data.height) {
        containerHeight = event.data.height;
      }
      fixChatLayout();
    }
  });
  setInterval(fixChatLayout, 1000);
})();
