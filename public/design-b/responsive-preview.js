/* Keep the supplied desktop and mobile concept documents isolated. */
(() => {
  const phone = window.matchMedia("(max-width: 767px)");
  function chooseLayout() {
    const target = new URL(phone.matches ? "./mobile.html" : "./index.html", window.location.href);
    target.search = window.location.search;
    target.hash = window.location.hash;
    if (target.pathname !== window.location.pathname) window.location.replace(target.href);
  }
  chooseLayout();
  phone.addEventListener("change", chooseLayout);
})();
