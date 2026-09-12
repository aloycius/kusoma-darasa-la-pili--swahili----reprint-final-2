(function () {
  "use strict";
  // Covers are outside pages.json: the numbered spine and video-N keys remain stable.
  const id = document.querySelector('meta[name="title-id"]')?.content;
  const front = id === "cover-front";
  const back = id === "cover-back";
  const cover = front || back;
  const previous = front ? null : back ? "pg088_sec001.html" : id === "pg001_sec001" ? "index.html" : null;
  const next = front ? "pg001_sec001.html" : back ? null : id === "pg088_sec001" ? "back-cover.html" : null;
  let scheduled = false;

  function addLink(counter, direction, href, label) {
    const parent = counter.parentElement;
    const order = direction === "previous" ? "order-2" : "order-4";
    const native = parent.querySelector("button." + order);
    if (!native || !href) return;
    if (!native.hasAttribute("data-cover-native-control")) {
      native.setAttribute("data-cover-native-control", "");
      native.setAttribute("aria-hidden", "true");
      native.setAttribute("tabindex", "-1");
    }
    if (parent.querySelector('[data-cover-direction="' + direction + '"]')) return;
    const a = document.createElement("a");
    a.href = href;
    a.className = "book-cover-nav " + order;
    a.dataset.coverDirection = direction;
    a.setAttribute("aria-label", label);
    a.title = label;
    const icon = native.querySelector("svg");
    if (icon) a.append(icon.cloneNode(true));
    else a.textContent = direction === "previous" ? "←" : "→";
    parent.append(a);
  }

  function refresh() {
    scheduled = false;
    document.querySelectorAll('#nav-container .tabular-nums').forEach(counter => {
      addLink(counter, "previous", previous, back ? "Ukurasa uliopita" : "Jalada la mbele");
      addLink(counter, "next", next, front ? "Fungua kitabu" : "Jalada la nyuma");
      if (cover && !counter.hasAttribute("data-cover-native-control")) {
        counter.setAttribute("data-cover-native-control", "");
        counter.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.className = "order-3 book-cover-counter";
        label.textContent = front ? "Jalada la mbele" : "Jalada la nyuma";
        counter.after(label);
      }
      document.querySelectorAll('.book-cover-fallback').forEach(n => { if (!n.hidden) n.hidden = true; });
    });
    // The legacy reader labels the first numbered entry as a cover; it is now the title page.
    document.querySelectorAll('button[aria-label^="Page 1 ("]').forEach(button => {
      button.setAttribute("aria-label", "Page 1");
      button.title = "Page 1";
      const label = button.querySelector("span");
      if (label) label.textContent = "1";
    });
  }
  new MutationObserver(() => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(refresh); }
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("keydown", event => {
    const target = event.target;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    const href = event.key === "ArrowLeft" ? previous : event.key === "ArrowRight" ? next : null;
    if (href) { event.preventDefault(); event.stopImmediatePropagation(); location.href = href; }
  }, true);
  refresh();
})();
