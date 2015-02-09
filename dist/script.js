(function($) {

  function docLoad() {
    var hash = window.location.hash.split('#/');
    if(hash.length !== 2) {
      throw 'Invalid location.';
    }
    var page = 'docs/' + hash[1].toLowerCase() + '.md';
    Flatdoc.run({
      fetcher: Flatdoc.file(page)
    });
    var threeCols = ['rest', 'gettingstarted', 'elasticsearch'];
    if(threeCols.indexOf(hash[1].toLowerCase())) $('body').removeClass('no-literate');
    else $('body').addClass('no-literate');

    return hash[1].slice(0,2);
  }

  $(window).on('hashchange', function() {
    docLoad();
  });

  var version = docLoad();

  $(document).ready(function(){
    $('a[relative]').each(function(){
      $(this).attr('href', '#/' + version + '/' + $(this).attr('href'));
    });
    $('span[switcher]').html(version);
  });

  /**
  * Style hacks
  */

  $(this).bind('flatdoc:ready', function(e){
    var $element = e.target;

    $("code").each(function(index) {
      lang = $(this).attr("class");
      if (lang)
        $(this).attr("data-language", lang.substr(5));
    });

    $("blockquote>pre>code.lang-curl").each(function(index, value) {
      $(value).parent().parent().css({"float": "left", width: "510px", "margin-left": "20px", "margin-right": "20px", "color": "#333"});
      $(value).parent().css({"padding": "10px"}); 
    });

    Rainbow.extend('javascript', [
      {
        'name': 'datatype',
        'pattern': /\((number|string|object)\)/igm
      }
      ], true);
    Rainbow.extend('curl', [
      {
        'name': 'http-url',
        'pattern': /(https?:\/\/\S+)/igm
      }
      ], false);
    Rainbow.color();
  });

})(jQuery);

