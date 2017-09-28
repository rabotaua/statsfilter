try {
  (function (target, method) {
    target.GoogleAnalyticsObject = method;
    target[method] = target[method] || function () {
      (target[method].q = target[method].q || []).push(arguments)
    };
    target[method].l = 1 * new Date
  })(window, 'ga');

  ga('create', 'UA-84756145-4', 'auto', {'name': 'bq'});
  ga('bq.require', 'BqStreaming', {sessionIdDimension: 2});

  (function () {
    var streamHandler = function (tracker, session) {
      //developers.google.com/analytics/devguides/collection/analyticsjs/tasks?hl=ru#adding_to_a_task
      var originalSendHitTask = tracker.get("sendHitTask");
      var requestHandler = function () {

        function sendXMLHttpRequest(body) {
          var result = false;
          var request;
          try {
            window.XMLHttpRequest && "withCredentials" in (request = new XMLHttpRequest) && (
              request.open("POST", getUrl(), true),
              request.onprogress = function () {},
              request.ontimeout = function () {},
              request.onerror = function () {},
              request.onload = function () {},
              request.setRequestHeader("Content-Type", "text/plain"),
              request.send(body),
              result = true
            )
          } catch (err) {
          }
          return result;
        }

        function sendXDomainRequest(body) {
          var result = false;
          var request;
          try {
            window.XDomainRequest && (
              request = new XDomainRequest,
                request.open("POST", getUrl(false, location.protocol.slice(0, -1))),
                request.onprogress = function () {},
                request.ontimeout = function () {},
                request.onerror = function () {},
                request.onload = function () {},
                setTimeout(function () {request.send(body)}, 0),
                result = true
            )
          } catch (err) {
          }
          return result;
        }

        function createImage(queryString) {
          var image;
          var result = false;
          try {
            image = document.createElement("img");
            image.onload = function () {};
            image.src = getUrl(true) + "?" + queryString;
            result = true;
          } catch (err) {
          }
          return result
        }

        function getUrl(useDefault, protocol) {
          var url;
          protocol || (protocol = "https");
          url = protocol + "://" + mainUrl.domain + "/collect";
          useDefault || (url += "?tid=" + encodeURIComponent(tracker.get("trackingId")));
          return url;
        }

        var mainUrl = {
          domain: session && session.domain ? session.domain : "majestic-cairn-171208.appspot.com",
          debug: !1
        };

        return {
          send: function (body) {
            var result;
            if (!(result = 2036000 >= body.length && createImage(body))) { // increased value to fix data leak
              result = !1;
              try {
                result = navigator.sendBeacon && navigator.sendBeacon(getUrl(), body)
              } catch (err) {
              }
            }
            return result || sendXMLHttpRequest(body) || sendXDomainRequest(body) || createImage(body)
          }
        }
      }();
      tracker.set("sendHitTask", function (data) {
        var clientId;
        if (session && 0 < session.sessionIdDimension) {
          try {
            clientId = data.get("clientId");
            data.set("dimension" + session.sessionIdDimension, clientId);
            data.get("buildHitTask")(data);
          } catch (err) {
          }
        }
        originalSendHitTask(data);
        requestHandler.send(data.get("hitPayload"))
      })
    };
    var stream = window[window.GoogleAnalyticsObject || "ga"];
    stream && stream("provide", "BqStreaming", streamHandler)
  })();

  google_tag_manager[{{Container ID}}].onHtmlSuccess({{HTML ID}});
} catch (e) {
  google_tag_manager[{{Container ID}}].onHtmlSuccess({{HTML ID}});
}
