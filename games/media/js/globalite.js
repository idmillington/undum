var Globalite = {
  language: function(lang, obj) {
    if (this[lang] == undefined) { this[lang] = {}; }
    $.extend(this[lang], obj);
  },
  setLang: function(lang){
    lang = lang || 'en';
    $("html").attr("lang",lang);
  }
};

String.prototype.l = function(msg, args) {
  key = this;
  msg = msg == undefined ? "__localization_missing__" : msg
  // Get lang attribute from html tag
  language = $("html").attr("lang");

  if (!Globalite[language])
  	return;

  localized = Globalite[language][key];
  
  if (localized == undefined) {
    $.each(Globalite, function(k, v) {
      if (localized == undefined) { localized = v[key]; }
    });
    if (localized == undefined) { localized = msg; }
  }
  
  if (args != undefined) {
    $.each(args, function(i, arg) {
      localized = localized.replace(new RegExp("\\{"+i+"\\}"), arg);
    });
  }
  
  return localized;
}
String.prototype.localize = function(msg, args) { return this.l(msg, args); };

String.prototype.l_with_args = function(args, msg) { return this.l(msg, args) };
String.prototype.localize_with_args = function(args, msg) { return this.l(msg, args); }
