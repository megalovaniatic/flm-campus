// Tema y movimiento antes del primer pintado (evita destellos). Archivo externo para cumplir la CSP.
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('flm-campus-demo') || '{}').state || {};
    var dark = s.theme === 'oscuro' || ((!s.theme || s.theme === 'sistema') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    if (s.motion === 'reducido') document.documentElement.dataset.motion = 'reduce';
  } catch (e) {
    /* sin almacenamiento: se aplica el tema del sistema */
  }
})();
