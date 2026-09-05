/* ==========================================================================
   Talk That Science — shared site behaviour
   No build step: this fetches content/*.json (edited via /admin, Decap CMS)
   and renders it straight into the page. Works on any static host.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- tag buttons ---------------- */
  // Every tag (badges under any event card, wherever eventCard() puts one)
  // is a real <button data-tag="...">. renderEventsHub() below owns tag
  // clicks on the Events hub itself (both the tag cloud and per-card
  // tags, filtering in place). Everywhere else — no hub grids on the
  // page — a tag click just navigates to the hub pre-filtered on it.
  function initTagButtons() {
    if (document.getElementById("upcoming-events-grid") || document.getElementById("past-events-grid")) return;
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".tag[data-tag]");
      if (!btn) return;
      window.location.href = "events.html?tag=" + encodeURIComponent(btn.getAttribute("data-tag"));
    });
  }

  /* ---------------- nav toggle ---------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---------------- data fetching ---------------- */
  function fetchJSON(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.json();
    });
  }

  function loadEvents() {
    return fetchJSON("content/events.json")
      .then(function (data) { return (data && data.events) || []; })
      .catch(function (err) {
        console.error(err);
        return [];
      });
  }

  function loadSettings() {
    return fetchJSON("content/settings.json").catch(function (err) {
      console.error(err);
      return {};
    });
  }

  /* ---------------- helpers ---------------- */
  function formatDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isUpcoming(iso) {
    var d = new Date(iso + "T23:59:59");
    return d.getTime() >= Date.now();
  }

  function sortByDate(events, ascending) {
    return events.slice().sort(function (a, b) {
      var diff = new Date(a.date) - new Date(b.date);
      return ascending ? diff : -diff;
    });
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function typeBadge(event) {
    if (event.type === "broadcast") {
      return '<span class="badge badge-broadcast">Echobox Broadcast</span>';
    }
    return '<span class="badge badge-live">Live · ' + escapeHTML(event.venue || "Oedipus Brewery") + "</span>";
  }

  function typeIcon(event) {
    if (event.type === "broadcast") {
      return '<img class="type-icon type-icon-echobox" src="assets/img/Echobox.png" alt="Echobox" />';
    }
    return '<img class="type-icon type-icon-oedipus" src="assets/img/Oedipus_-_Craft_Space.webp" alt="Oedipus" />';
  }

  function tagsHTML(tags) {
    if (!tags || !tags.length) return "";
    return (
      '<div class="tag-row">' +
      tags.map(function (t) {
        return '<button type="button" class="tag" data-tag="' + escapeHTML(t) + '">' + escapeHTML(t) + "</button>";
      }).join("") +
      "</div>"
    );
  }

  /* ---------------- card rendering ---------------- */
  function eventCard(event) {
    var upcoming = isUpcoming(event.date);
    var badges = typeIcon(event) + typeBadge(event) + (upcoming ? '<span class="badge badge-upcoming">Upcoming</span>' : "");

    var audio = event.excerptAudioUrl
      ? '<audio controls preload="none" src="' + event.excerptAudioUrl + '">' +
        "Your browser can't play this excerpt. " +
        '<a href="' + event.excerptAudioUrl + '">Download the audio</a>.</audio>'
      : "";

    var actions = "";
    if (event.slideUrl) {
      actions += '<a class="btn btn-primary" href="' + event.slideUrl + '" target="_blank" rel="noopener">View Slides</a>';
    }
    if (event.episodeLink) {
      actions += '<a class="btn btn-secondary" href="' + event.episodeLink + '" target="_blank" rel="noopener">Listen on Echobox</a>';
    }
    if (!actions) {
      actions = '<span class="hint" style="color:var(--muted); font-size:0.85rem;">Slides / audio coming after the show</span>';
    }

    var cover = event.themePhotoUrl
      ? '<img class="card-cover" src="' + event.themePhotoUrl + '" alt="" />'
      : "";

    var guestAvatars = event.guestPhotos && event.guestPhotos.length
      ? '<span class="guest-avatars">' +
        event.guestPhotos.map(function (g) {
          return '<img class="guest-avatar" src="' + g.photoUrl + '" alt="' + escapeHTML(g.name || "") + '" title="' + escapeHTML(g.name || "") + '" />';
        }).join("") +
        "</span>"
      : "";

    var titleText = escapeHTML(event.title);
    var title = event.episodeLink
      ? '<a href="' + event.episodeLink + '" target="_blank" rel="noopener">' + titleText + "</a>"
      : titleText;

    return (
      '<article class="card">' +
      cover +
      '<div class="meta-row">' + badges + "</div>" +
      '<h3 class="card-title">' + title + "</h3>" +
      '<div class="meta-row">' + guestAvatars + '<strong>' + formatDate(event.date) + "</strong> &middot; " + escapeHTML(event.guest || "") + "</div>" +
      '<p class="card-desc">' + escapeHTML(event.description || "") + "</p>" +
      tagsHTML(event.tags) +
      audio +
      '<div class="card-actions">' + actions + "</div>" +
      "</article>"
    );
  }

  function timelineItem(event) {
    var isBroadcast = event.type === "broadcast";
    var where = isBroadcast ? "Echobox Radio (live broadcast)" : (event.venue || "Oedipus Brewery");
    return (
      '<div class="timeline-item ' + (isBroadcast ? "is-broadcast" : "is-live") + '">' +
      '<div class="timeline-date">' + formatDate(event.date) + "</div>" +
      '<h3 style="margin:0.2rem 0 0.15rem;">' + escapeHTML(event.title) + "</h3>" +
      '<div class="meta-row" style="margin-bottom:0.4rem;">' + typeBadge(event) + "<span>" + escapeHTML(where) + "</span></div>" +
      '<p class="card-desc">' + escapeHTML(event.description || "") + "</p>" +
      "</div>"
    );
  }

  /* ---------------- page: home ---------------- */
  function renderHome() {
    var nextEventsEl = document.getElementById("next-events-teaser");
    var latestEl = document.getElementById("latest-episode-teaser");
    if (!nextEventsEl && !latestEl) return;

    loadEvents().then(function (events) {
      var upcoming = sortByDate(events.filter(function (e) { return isUpcoming(e.date); }), true);
      var past = sortByDate(events.filter(function (e) { return !isUpcoming(e.date); }), false);

      if (nextEventsEl) {
        // Always show both slots — the next Echobox broadcast AND the
        // next live Oedipus night — rather than just whichever of the
        // two happens to fall first chronologically.
        var nextBroadcast = upcoming.filter(function (e) { return e.type === "broadcast"; })[0];
        var nextLive = upcoming.filter(function (e) { return e.type === "live_event"; })[0];
        nextEventsEl.innerHTML =
          (nextBroadcast ? eventCard(nextBroadcast) : '<div class="empty-state">No Echobox broadcast scheduled yet.</div>') +
          (nextLive ? eventCard(nextLive) : '<div class="empty-state">No live night at Oedipus scheduled yet.</div>');
      }
      if (latestEl) {
        latestEl.innerHTML = past.length
          ? eventCard(past[0])
          : '<div class="empty-state">No past episodes published yet.</div>';
      }
    });
  }

  /* ---------------- page: events hub ---------------- */
  function renderEventsHub() {
    var upcomingWrap = document.getElementById("upcoming-events-grid");
    var pastWrap = document.getElementById("past-events-grid");
    var cloudWrap = document.getElementById("tag-cloud");
    if (!upcomingWrap && !pastWrap) return;

    var currentFilter = "all";
    // A tag button clicked elsewhere on the site links here as
    // events.html?tag=... — start pre-filtered on that tag.
    var activeTag = new URLSearchParams(window.location.search).get("tag") || null;
    var allEvents = [];

    function allTags(events) {
      var set = {};
      events.forEach(function (e) { (e.tags || []).forEach(function (t) { set[t] = true; }); });
      return Object.keys(set).sort();
    }

    function drawCloud() {
      if (!cloudWrap) return;
      cloudWrap.innerHTML = allTags(allEvents).map(function (t) {
        var active = t === activeTag ? " active" : "";
        return '<button type="button" class="tag' + active + '" data-tag="' + escapeHTML(t) + '">' + escapeHTML(t) + "</button>";
      }).join("");
    }

    function draw() {
      var filtered = allEvents.filter(function (e) {
        if (currentFilter !== "all" && e.type !== currentFilter) return false;
        if (activeTag && (e.tags || []).indexOf(activeTag) === -1) return false;
        return true;
      });
      var upcoming = sortByDate(filtered.filter(function (e) { return isUpcoming(e.date); }), true);
      var past = sortByDate(filtered.filter(function (e) { return !isUpcoming(e.date); }), false);
      var emptyMsg = activeTag ? "No events tagged “" + escapeHTML(activeTag) + "”." : null;

      if (upcomingWrap) {
        upcomingWrap.innerHTML = upcoming.length
          ? upcoming.map(eventCard).join("")
          : '<div class="empty-state">' + (emptyMsg || "Nothing upcoming in this category yet.") + "</div>";
      }
      if (pastWrap) {
        pastWrap.innerHTML = past.length
          ? past.map(eventCard).join("")
          : '<div class="empty-state">' + (emptyMsg || "No past entries in this category yet.") + "</div>";
      }
      drawCloud();
    }

    loadEvents().then(function (events) {
      allEvents = events;
      draw();
    });

    var filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        draw();
      });
    });

    // Handles both the tag cloud above and the tags on each event card:
    // clicking the already-active tag clears the filter, clicking any
    // other tag selects it.
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".tag[data-tag]");
      if (!btn) return;
      var tag = btn.getAttribute("data-tag");
      activeTag = activeTag === tag ? null : tag;
      draw();
    });
  }

  /* ---------------- page: calendar ---------------- */
  function renderCalendar() {
    var wrap = document.getElementById("calendar-timeline");
    if (!wrap) return;

    loadEvents().then(function (events) {
      var upcoming = sortByDate(events.filter(function (e) { return isUpcoming(e.date); }), true);
      wrap.innerHTML = upcoming.length
        ? upcoming.map(timelineItem).join("")
        : '<div class="empty-state">Nothing scheduled yet — the next broadcast or bar night will show up here as soon as it\'s added in /admin.</div>';
    });
  }

  /* ---------------- page: review a bar night ---------------- */
  function renderReviewEventSelect() {
    var select = document.getElementById("review-event-name");
    if (!select) return;

    loadEvents().then(function (events) {
      var pastLiveEvents = sortByDate(
        events.filter(function (e) { return e.type === "live_event" && !isUpcoming(e.date); }),
        false
      );

      if (!pastLiveEvents.length) {
        select.innerHTML = '<option value="">No past bar nights yet</option>';
        return;
      }

      select.innerHTML =
        '<option value="" disabled selected>Select a bar night…</option>' +
        pastLiveEvents.map(function (e) {
          var label = escapeHTML(e.title + " — " + formatDate(e.date));
          return '<option value="' + label + '">' + label + "</option>";
        }).join("");
    });
  }

  /* ---------------- page: about ---------------- */
  // A CMS "text" widget only gives us one string back — blank lines in it
  // mark paragraph breaks, same convention as Markdown, so a content
  // manager can add another paragraph just by leaving a blank line.
  function renderParagraphs(el, text) {
    var paragraphs = String(text)
      .split(/\n\s*\n/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean);
    el.innerHTML = paragraphs.map(function (p) { return "<p>" + escapeHTML(p) + "</p>"; }).join("");
  }

  function renderAbout() {
    var missionEl = document.getElementById("about-mission");
    var storyEl = document.getElementById("about-story");
    var teamEl = document.getElementById("about-team-note");
    var venueEl = document.getElementById("about-venue");
    if (!missionEl && !storyEl && !teamEl && !venueEl) return;

    loadSettings().then(function (settings) {
      if (missionEl && settings.about && settings.about.mission) renderParagraphs(missionEl, settings.about.mission);
      if (storyEl && settings.about && settings.about.story) renderParagraphs(storyEl, settings.about.story);
      if (teamEl && settings.about && settings.about.teamNote) teamEl.textContent = settings.about.teamNote;
      if (venueEl && settings.venue) {
        venueEl.textContent = settings.venue.name + " — " + settings.venue.address;
      }
    });
  }

  /* ---------------- forms: submit straight into a Google Sheet ---------------- */
  // No third-party form service, no server of our own — every form POSTs
  // to a Google Apps Script "Web App" bound to a Google Sheet (see README
  // "Forms" for the one-time setup). The script appends a row to a tab
  // named after the form; each field's label comes from its own <label>
  // (or its .form-field group label), so the sheet stays readable without
  // hardcoding field names here.
  //
  // Apps Script's redirect breaks normal CORS, so this uses mode:"no-cors"
  // — the request still reaches the script and the row still gets
  // written, but the response is opaque and we can't read a real success/
  // failure status back. The success message reflects that honestly.
  function labelFor(form, field) {
    if (field.id) {
      var byId = form.querySelector('label[for="' + field.id + '"]');
      if (byId) return byId.textContent.trim();
    }
    var wrap = field.closest(".form-field");
    var group = wrap ? wrap.querySelector("label") : null;
    if (group) return group.textContent.trim();
    return field.getAttribute("name");
  }

  function initForms() {
    document.querySelectorAll("form[data-sheet-endpoint]").forEach(function (form) {
      var endpoint = form.getAttribute("data-sheet-endpoint");
      var successId = form.getAttribute("data-success-target");
      var successEl = successId ? document.getElementById(successId) : null;

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Formspree-style honeypot: real visitors never see or fill this
        // field; if it's filled, silently drop the submission.
        var honeypot = form.querySelector('[name="_gotcha"]');
        if (honeypot && honeypot.value) return;

        var labels = {};
        form.querySelectorAll("[name]").forEach(function (field) {
          var name = field.getAttribute("name");
          if (name && name !== "_gotcha" && !(name in labels)) labels[name] = labelFor(form, field);
        });

        var data = new FormData(form);
        var values = {};
        var order = [];
        data.forEach(function (value, key) {
          if (key === "_gotcha" || !String(value).trim()) return;
          if (values[key]) {
            values[key] += ", " + value;
          } else {
            values[key] = value;
            order.push(key);
          }
        });

        var fields = {};
        order.forEach(function (key) { fields[labels[key] || key] = values[key]; });

        fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS preflight Apps Script can't answer
          body: JSON.stringify({
            formName: form.getAttribute("name"),
            timestamp: new Date().toISOString(),
            fields: fields,
          }),
        })
          .then(function () {
            form.reset();
            form.style.display = "none";
            if (successEl) successEl.classList.add("visible");
          })
          .catch(function () {
            // Only a genuine network failure (e.g. offline) lands here —
            // no-cors means a bad URL or script error looks the same as
            // success from fetch's point of view.
            window.alert("Couldn't reach the server — check your connection and try again.");
          });
      });
    });
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initForms();
    initTagButtons();
    renderHome();
    renderEventsHub();
    renderCalendar();
    renderReviewEventSelect();
    renderAbout();
  });
})();
