(function () {
  var script = document.currentScript;
  if (!script || document.getElementById("agent25-omni-launcher")) return;

  var host = new URL(script.src, window.location.href).origin;
  var siteId = script.getAttribute("data-site-id") || "generic";
  if (["scrollverse", "scrollatlas", "omnitech1", "generic"].indexOf(siteId) === -1) siteId = "generic";

  var style = document.createElement("style");
  style.textContent = [
    "#agent25-omni-launcher{position:fixed;right:22px;bottom:22px;z-index:2147483000;border:1px solid rgba(110,231,183,.5);border-radius:999px;padding:13px 18px;background:#07131b;color:#fff;font:600 14px system-ui;box-shadow:0 10px 35px #0005;cursor:pointer}",
    "#agent25-omni-frame{position:fixed;right:22px;bottom:82px;z-index:2147483000;width:390px;height:min(640px,78vh);border:1px solid rgba(110,231,183,.5);border-radius:16px;background:#07131b;box-shadow:0 16px 50px #0007;display:none}",
    "#agent25-omni-frame.agent25-open{display:block}",
    "@media(max-width:480px){#agent25-omni-frame{right:3vw;bottom:76px;width:94vw;height:78vh}#agent25-omni-launcher{right:14px;bottom:14px}}"
  ].join("");
  document.head.appendChild(style);

  var frame = document.createElement("iframe");
  frame.id = "agent25-omni-frame";
  frame.title = "GOD MODE Agent 25 Omni visitor assistant";
  frame.loading = "lazy";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.src = host + "/agent25/embed?siteId=" + encodeURIComponent(siteId);
  frame.setAttribute("allow", "clipboard-write");
  document.body.appendChild(frame);

  var button = document.createElement("button");
  button.id = "agent25-omni-launcher";
  button.type = "button";
  button.textContent = "Ask Agent 25";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", frame.id);
  button.addEventListener("click", function () {
    var open = frame.classList.toggle("agent25-open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close Agent 25" : "Ask Agent 25";
  });
  document.body.appendChild(button);
})();