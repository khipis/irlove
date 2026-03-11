/**
 * IRLove – UI strings PL / EN.
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'irlove_lang';
  var LOCALES = {
    pl: {
      app_title: 'IRLove – spotkania na żywo',
      start_tagline: 'Zobacz kto jest w okolicy i umów się na spotkanie',
      start_instruction: 'Uzupełnij profil i wejdź na mapę',
      start_btn_enter: 'Wejdź na mapę',
      profile_title: 'Twój profil',
      profile_display_name: 'Nick / imię',
      profile_age: 'Wiek',
      profile_height: 'Wzrost (cm)',
      profile_avatar: 'Avatar (emoji lub URL)',
      profile_bio: 'Opis (1–2 zdania)',
      profile_bio_placeholder: 'Np. Lubię kawę i rozmowy…',
      profile_interests: 'Zainteresowania',
      profile_interests_toggle: 'Wybierz emoji',
      profile_radius_km: 'Zasięg (km)',
      profile_tags: 'Dostępność',
      profile_tag_chat: '💬 Pogadać',
      profile_tag_date: '❤️ Randka',
      profile_tag_beer: '🍺 Piwo',
      map_status_loading: 'Ładowanie…',
      map_status_online: 'Jesteś widoczny',
      map_status_placeholder: 'Ustaw status…',
      map_status_offline: 'Offline',
      map_nearby: 'W pobliżu',
      map_you: 'Ty',
      tooltip_you: 'Ty – tu jesteś',
      chat_title: 'Czat',
      chat_placeholder: 'Napisz wiadomość…',
      chat_send: 'Wyślij',
      chat_with: 'Z',
      notifications_new_user: 'Nowa osoba w pobliżu',
      notifications_enable: 'Włącz powiadomienia',
      status_getting_location: 'Pobieram lokalizację…',
      status_location_denied: 'Potrzebujemy dostępu do lokalizacji.',
      status_location_error: 'Błąd lokalizacji. Włącz GPS.',
      btn_back: 'Wstecz',
      btn_profile: 'Profil',
      btn_close: 'Zamknij',
      btn_random_avatar: 'Losuj avatar',
      btn_fill_random: 'Wypełnij losowo (test)',
      error_no_profile: 'Uzupełnij nick w profilu.',
      error_no_location: 'Nie udało się pobrać lokalizacji.'
    },
    en: {
      app_title: 'IRLove – meet in real life',
      start_tagline: 'See who\'s nearby and meet up',
      start_instruction: 'Fill your profile and go to the map',
      start_btn_enter: 'Go to map',
      profile_title: 'Your profile',
      profile_display_name: 'Display name',
      profile_age: 'Age',
      profile_height: 'Height (cm)',
      profile_avatar: 'Avatar (emoji or URL)',
      profile_bio: 'About (1–2 sentences)',
      profile_bio_placeholder: 'E.g. I like coffee and chats…',
      profile_interests: 'Interests',
      profile_interests_toggle: 'Pick emojis',
      profile_radius_km: 'Radius (km)',
      profile_tags: 'Availability',
      profile_tag_chat: '💬 Chat',
      profile_tag_date: '❤️ Date',
      profile_tag_beer: '🍺 Beer',
      map_status_loading: 'Loading…',
      map_status_online: 'You are visible',
      map_status_placeholder: 'Set status…',
      map_status_offline: 'Offline',
      map_nearby: 'Nearby',
      map_you: 'You',
      tooltip_you: 'You – you are here',
      chat_title: 'Chat',
      chat_placeholder: 'Type a message…',
      chat_send: 'Send',
      chat_with: 'With',
      notifications_new_user: 'New person nearby',
      notifications_enable: 'Enable notifications',
      status_getting_location: 'Getting location…',
      status_location_denied: 'We need location access.',
      status_location_error: 'Location error. Enable GPS.',
      btn_back: 'Back',
      btn_profile: 'Profile',
      btn_close: 'Close',
      btn_random_avatar: 'Random avatar',
      btn_fill_random: 'Fill randomly (test)',
      error_no_profile: 'Please set your display name in profile.',
      error_no_location: 'Could not get location.'
    }
  };

  function getStoredLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored && LOCALES[stored] ? stored : 'pl';
    } catch (e) {
      return 'pl';
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function t(key, replacements) {
    var lang = window.CURRENT_LOCALE || getStoredLang();
    var dict = LOCALES[lang] || LOCALES.pl;
    var value = dict[key];
    if (value == null) value = LOCALES.pl[key] || key;
    if (replacements && typeof value === 'string') {
      Object.keys(replacements).forEach(function (k) {
        value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), String(replacements[k]));
      });
    }
    return value;
  }

  window.LOCALES = LOCALES;
  window.CURRENT_LOCALE = getStoredLang();
  window.t = t;
  window.getStoredLang = getStoredLang;
  window.setStoredLang = setStoredLang;
})();
