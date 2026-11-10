// Injected before a page loads: three.js announces each Scene and renderer it
// creates to __THREE_DEVTOOLS__, so the audit can find them in any game.
(function () {
  if (window.__LOOK_SEEN__) return;
  const seen = (window.__LOOK_SEEN__ = { scenes: [], renderers: [] });
  const t = new EventTarget();
  t.addEventListener("observe", (e) => {
    const o = e.detail;
    if (o && o.isScene) seen.scenes.push(o);
    else if (o && (o.isWebGLRenderer || o.domElement)) seen.renderers.push(o);
  });
  window.__THREE_DEVTOOLS__ = t;
})();
