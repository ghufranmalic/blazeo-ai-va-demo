/**
 * Clears ApexChat / Via Live Chat session storage so a widget can start fresh.
 * Used by Start Over - a normal page refresh alone keeps the ongoing session.
 */
(function () {
  var COOKIE_NAMES = [
    'livechat_visitor_history',
    'livechat_chat_in_progress',
    'livechat_visitorinfo_in_progress',
    'rl_visitor_history',
    'livechat_visitor_id',
    'livechat_agent_alias_id',
    'livechat_operator_id',
    'livechat_profile_id',
    'livechat_chat_id',
    'livechat_server_chatid',
    'livechat_chat_state',
    'livechat_chat_sound_enabled',
    'livechat_transfer_live_agent',
    'livechat_prechat_message_ids',
    'livechat_prechat_mapped_question',
    'livechat_prechat_message_sent',
    'livechat_invitation_traffic_sources',
    'livechat_web_sms_number',
    'livechat_is_page_refreshed',
    'livechat_v3_invitation_shown',
    'livechat_prechat_messagecounter',
    'livechat_prechat_lastmessage',
    'livechat_prechat_msg_array',
    'livechat_prechat_messages_store',
    'livechat_pokemessages_lastJoinBackTime',
    'livechat_original_referrer',
    'livechat_continue_mapping_applied',
    'livechat_input_old_value',
    'subsequent_greeting_flag',
    'livechat_show_operator_not_found_overlay',
    'transfer_chat_succeed',
    'user_reacts_on_loc_disclaimer',
    'livechat_visitor_phone',
    'livechat_visitor_name',
    'apexchat_live_contactInfo',
    'livechat_dom_auto_launched',
    'apexchat_chat_id',
    'livechat_tracker_id',
    'livechat_invitation_closed',
    'livechat_invitation_shown',
    'livechat_exitpopup_in_progress',
    'livechat_exitpopup_has_displayed',
    'livechat_has_windowed_chat_started',
    'livechat_exitpopup_is_closed',
    'livechat_exitpopup_predefined_msg_sent',
    'livechat_exitpopup_is_active',
    'livechat_exitpopup_isMinimized',
    'livechat_ep_sound_enabled'
  ];

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
    document.cookie = 'apexchat_' + name.replace(/^livechat_/, '') + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  function clearStorage() {
    COOKIE_NAMES.forEach(deleteCookie);

    try {
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && (key.indexOf('livechat') !== -1 || key.indexOf('apexchat') !== -1)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(function (key) { localStorage.removeItem(key); });
    } catch (e) {}

    try {
      var sessionKeys = [];
      for (var j = 0; j < sessionStorage.length; j++) {
        var sKey = sessionStorage.key(j);
        if (sKey && (sKey.indexOf('livechat') !== -1 || sKey.indexOf('apexchat') !== -1)) {
          sessionKeys.push(sKey);
        }
      }
      sessionKeys.forEach(function (key) { sessionStorage.removeItem(key); });
    } catch (e) {}

    if (window.ApexChat) {
      window.ApexChat.invitationv2run = false;
    }
    window.isChatWidgetOptionsLoaded = false;
  }

  window.clearChatSession = clearStorage;

  if (location.search.indexOf('reset=') !== -1) {
    clearStorage();
  }

  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'blazeo-chat-reset') {
      clearStorage();
      location.replace(location.pathname);
    }
  });
})();
