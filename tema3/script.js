(function () {
  "use strict";

  function showToast(message = "Kopyalandı!", duration = 1800) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    const msgSpan = toast.querySelector(".toast-message");
    if (msgSpan) msgSpan.textContent = message;

    toast.style.opacity = "0";
    toast.style.display = "flex";
    // Force reflow to restart transition if necessary
    // eslint-disable-next-line no-unused-expressions
    toast.offsetWidth;
    toast.style.transition = "opacity 180ms ease";
    toast.style.opacity = "1";

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast._timeout2 = setTimeout(() => {
        toast.style.display = "none";
      }, 180);
    }, duration);
  }

  function copyToClipboard(text) {
    if (!text) return Promise.reject(new Error("Boş metin"));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        (ok ? resolve : reject)();
      } catch (err) {
        reject(err);
      }
    });
  }

  function initCopyButtons() {
    document.querySelectorAll(".account-action").forEach((btn) => {
      btn.style.cursor = "pointer";
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const item = btn.closest(".account-item");
        if (!item) return;
        const valueEl = item.querySelector(".account-value");
        const text = (valueEl && (valueEl.dataset.copy || valueEl.textContent || "")).trim();
        if (!text) return;
        copyToClipboard(text)
          .then(() => {
            showToast("Kopyalandı!");
          })
          .catch(() => {
            showToast("Kopyalama başarısız");
          });
      });
    });
  }

  function initShareDock() {
    const dock = document.querySelector(".share-dock");
    if (!dock) return;
    const trigger = dock.querySelector(".share-trigger");
    const menu = dock.querySelector(".share-menu");

    function closeMenu() {
      dock.classList.remove("open");
      if (menu) menu.classList.remove("open");
    }

    function openMenu() {
      dock.classList.add("open");
      if (menu) menu.classList.add("open");
    }

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (dock.classList.contains("open")) closeMenu();
        else openMenu();
      });
    }

    document.addEventListener("click", (e) => {
      if (!dock.contains(e.target)) closeMenu();
    });

    (menu ? menu.querySelectorAll(".share-item") : []).forEach((a) => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const action = a.dataset.action;
        if (action === "qr") {
          openQrModal();
        } else if (action === "home") {
          const base = document.querySelector("base");
          window.location.href = base ? base.href : "/";
        } else if (action === "share") {
          const shareData = {
            title: document.title,
            text: (document.querySelector("meta[name=description]") || {}).content || "",
            url: window.location.href,
          };
          if (navigator.share) {
            navigator.share(shareData).catch(() => {});
          } else {
            showToast("Paylaşma desteklenmiyor");
          }
        }
        // close menu after action
        setTimeout(closeMenu, 120);
      });
    });
  }

  function openQrModal() {
    const modal = document.querySelector(".qr-modal");
    if (!modal) return;
    modal.classList.add("open");
  }

  function closeQrModal() {
    const modal = document.querySelector(".qr-modal");
    if (!modal) return;
    modal.classList.remove("open");
  }

  function initQrModal() {
    const modal = document.querySelector(".qr-modal");
    if (!modal) return;
    const closeBtn = modal.querySelector(".qr-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", (e) => { e.preventDefault(); closeQrModal(); });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQrModal();
    });
  }

  function initThemeToggle() {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;
    // initialize from localStorage
    try {
      const t = localStorage.getItem("theme");
      if (t === "light") document.body.classList.add("light-mode");
      else document.body.classList.remove("light-mode");
    } catch (e) {}

    toggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      try {
        localStorage.setItem("theme", isLight ? "light" : "dark");
      } catch (e) {}
    });
  }

  function init() {
    initCopyButtons();
    initShareDock();
    initQrModal();
    initThemeToggle();

    // Make contact items with target _blank open in new tab and be keyboard accessible
    document.querySelectorAll(".contact-item").forEach((a) => {
      // if it's an anchor and has target blank it's already fine. If not, ensure clickable keyboard support
      if (a.tagName.toLowerCase() !== "a") return;
      a.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") a.click();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();