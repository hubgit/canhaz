var app = new function() {
  var tweetButton = $('#twitter-share-button');

  this.init = function() {
    var params = readParams();

    if (!params.url && !params.doi) {
      updateBookmarklet();
      return;
    }

    if (params.url) {
      tweetButton.attr('data-url', params.url);

      if (!params.doi) {
        showScholarLink(params.url);
        showTweetButton();
      }
    }

    if (params.doi) {
      var doi = params.doi.replace(/\/$/, "");

      fetchPMC(doi).then(handlePMC);
      fetchCrossRef(doi).then(handleCrossRef);
    }
  };

  var readParams = function() {
    var params = {};

    $.each(window.location.search.substr(1).split('&'), function() {
      var parts = this.split('=');
      var key = decodeURIComponent(parts[0]);
      var value = decodeURIComponent(parts[1]);
      params[key] = value;
    });

    return params;
  };

  var fetchPMC = function(doi) {
    return $.ajax({
        url: 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        data: {
          db: 'pmc',
          retmax: 1,
          term: doi + '[DOI]',
          tool: 'oabutton'
        },
        dataType: 'xml',
    });
  };

  var handlePMC = function(response) {
    if (response.getElementsByTagName('Count')[0].textContent === '0') {
      return;
    }

    var pmcid = response.getElementsByTagName('Id')[0].textContent;
    window.parent.location.href = 'http://www.ncbi.nlm.nih.gov/pmc/articles/PMC' + pmcid + '/';
  };

  var fetchCrossRef = function(doi) {
    return $.ajax({
        url: 'http://data.crossref.org/' + encodeURIComponent(doi),
        dataType: 'json',
    });
  };

  var handleCrossRef = function(response) {
    if (response.feed.entry) {
      var meta = parseCrossRef(response.feed.entry);

      showScholarLink(meta.url);

      tweetButton
        .attr('data-text', meta.title)
        .attr('data-url', meta.url);
    }

    showTweetButton();
  };

  var showTweetButton = function() {
    tweetButton.show();

    var script = document.createElement('script');
    script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
    document.body.appendChild(script);
  };

  var showScholarLink = function(url) {
    $('#google-scholar')
      .attr('href', 'http://scholar.google.com/scholar?cluster=' + url)
      .css("display", "block");
  };

  var parseCrossRef = function(entry) {
    var meta = {};
    var item = entry['pam:message']['pam:article'];

    if (item['prism:url']) {
      meta.url = item['prism:url'];
    }

    if (item['dc:title']) {
      meta.title = item['dc:title'].replace(/\s+/, ' ');
    }

    if (item['dc:creator']) {
      if (!$.isArray(item['dc:creator'])) {
        item['dc:creator'] = [item['dc:creator']];
      }

      meta.creator = item['dc:creator'].join(', ');
    }

    if (item['prism:publicationName']) {
      meta.publication = item['prism:publicationName'];
    }

    if (item['prism:publicationDate']) {
      meta.date = item['prism:publicationDate'];
    }

    return meta;
  };

  var updateBookmarklet = function() {
    var bookmarklet = $("#bookmarklet a");
    var url = bookmarklet.attr("href").replace(/\{PATH\}/, window.location.href);
    bookmarklet.attr("href", url).parent().show();
  };
};

$(app.init);
