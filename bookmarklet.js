(function() {
  var detectDOI = function() {
    var nodes, node, childNode, matches, i, j;

    // match DOI: test on http://t.co/eIJciunBRJ
    var doi_re = /10\.\d{4,}(?:\.\d+)*\/\S+/;

    // look for meta[name=citation_doi][content]
    nodes = document.getElementsByTagName("meta");
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];

      if (node.getAttribute("name") == "citation_doi") {
        return node.getAttribute("content").replace(/^doi:/, "");
      }
    }

    // look in all text nodes for a DOI
    nodes = document.getElementsByTagName("*");
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];

      if (!node.hasChildNodes()) {
        continue;
      }

      if (node.nodeName == "SCRIPT") {
        continue;
      }

      for (j = 0; j < node.childNodes.length; j++) {
        childNode = node.childNodes[j];

        // only text nodes
        if (childNode.nodeType !== 3) {
          continue;
        }

        if (matches = doi_re.exec(childNode.nodeValue)) {
          return matches[0];
        }
      }
    }

    return null;
  };

  // get the base URL
  var loader = document.body.lastChild;
  var base = loader.getAttribute("src").replace(/[^\/]+$/, "");
  loader.parentNode.removeChild(loader);

  // build the iframe URL
  var url = base + "?url=" + encodeURIComponent(window.location);
  var doi = detectDOI();
  if (doi) {
    url += "&doi=" + encodeURIComponent(doi);
  }

  // add the iframe
  var iframe = document.createElement("iframe");
  iframe.setAttribute("allowTransparency", "true");
  iframe.setAttribute("src", url);

  iframe.style.position = "fixed";
  iframe.style.zIndex = "2147483640";
  iframe.style.border = "1px solid #ddd";
  iframe.style.background = "white";
  iframe.style.height = "100px";
  iframe.style.width = "170px";
  iframe.style.top = "0";
  iframe.style.right = "0";
  iframe.style.overflow = "hidden";

  document.body.appendChild(iframe);
})();

