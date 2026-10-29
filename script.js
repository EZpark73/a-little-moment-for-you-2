(() => {
  "use strict";

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);

  const starfield = $("starfield");
  const letterPage = $("page-letter");
  const envelopeButton = $("envelopeButton");
  const paperNote = $("paperNote");
  const paperLines = $("paperLines");
  const envelopeHint = $("envelopeHint");
  const letterNext = $("letterNext");
  const drawCardButton = $("drawCardButton");
  const saveCardButton = $("saveCardButton");
  const emptyCard = $("emptyCard");
  const fortuneCard = $("fortuneCard");
  const saveNote = $("saveNote");
  const wishForm = $("wishForm");
  const wishMessage = $("wishMessage");
  const wishFrom = $("wishFrom");
  const wishButton = $("wishButton");
  const wishFeedback = $("wishFeedback");
  const characterCount = $("characterCount");
  const wishesWall = $("wishesWall");
  const pagination = $("pagination");
  const toast = $("toast");

  const firestore = window.db || null;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DEFAULT_SAVE_NOTE = "Your card is a little keepsake to take with you.";
  const DEFAULT_WISH_FEEDBACK =
    "Some wishes are beautiful just because you made them. ♡";
  const WISH_TIMEOUT_MS = 15000;
  const WISHES_PER_PAGE = 4;

  let currentCard = null;
  let toastTimer;
  let submitting = false;

  let allWishes = [];
  let wishOrder = [];
  let wishPage = 1;
  let wallReady = false;

  /* ---------- Cards ---------- */
  const PALETTES = [
    ["#f8e8c8", "#e8b36e", "#9fb0d8"],
    ["#fbe9cf", "#eeaa66", "#7f96c9"],
    ["#f6dcc0", "#d98c57", "#b8c3e3"],
    ["#f3e4c4", "#cfa76a", "#8fa6d1"],
    ["#fff0d2", "#f0bf6e", "#a9b8dc"],
    ["#f4dcc2", "#dd9a62", "#8c9fcf"],
  ];
  const ICONS = ["☾", "✦", "♡", "☼", "✧", "☆"];
  const QUOTES = Array.isArray(window.CARD_QUOTES) ? window.CARD_QUOTES : [];

  const cards = QUOTES.map((q, i) => ({
    number: `NO. ${String(i + 1).padStart(2, "0")}`,
    icon: ICONS[i % ICONS.length],
    label: "A LITTLE QUOTE",
    source: `${q[0]} — ${q[1]}`,
    title: q[2],
    message: q[3],
    color: PALETTES[i % PALETTES.length],
    image: `images/${(i % 6) + 1}.JPG`,
  }));

  if (!cards.length) {
    cards.push({
      number: "NO. 01",
      icon: "☾",
      label: "A LITTLE QUOTE",
      source: "My Hero Academia — All Might",
      title: "You, too, can become a hero.",
      message: "เธอเองก็สามารถเป็นฮีโร่ได้",
      color: PALETTES[0],
      image: "images/1.JPG",
    });
  }

  function cardSizes(card) {
    const L = card.title.length;
    const T = card.message.length;
    return {
      en: L <= 40 ? 21 : L <= 70 ? 17 : L <= 100 ? 14.5 : 12.5,
      th: T <= 40 ? 11 : T <= 70 ? 10 : 9.2,
      ic: L > 100 ? 30 : 44,
    };
  }

  window.addEventListener("load", () => {
    const idle =
      window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1200));
    idle(() => {
      for (let i = 1; i <= 6; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `images/${i}.JPG`;
      }
    });
  });

  /* ---------- Starfield & Leaf Animation ---------- */
  if (starfield) {
    const count = window.innerWidth < 600 ? 44 : 72;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = i % 5 === 0 ? "✦" : i % 3 === 0 ? "✧" : "·";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.fontSize = `${7 + Math.random() * 12}px`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${2.5 + Math.random() * 4}s`;
      fragment.appendChild(star);
    }
    starfield.appendChild(fragment);

    if (!prefersReducedMotion) {
      const leafCount = window.innerWidth < 600 ? 5 : 8;
      const leaves = document.createDocumentFragment();
      for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement("span");
        leaf.className = "leaf";
        const size = 0.8 + Math.random() * 0.8;
        leaf.style.left = `${5 + Math.random() * 90}%`;
        leaf.style.transform = `scale(${size})`;
        leaf.style.setProperty("--sway", `${20 + Math.random() * 40}px`);
        leaf.style.animationDuration = `${16 + Math.random() * 12}s`;
        leaf.style.animationDelay = `${-Math.random() * 28}s`;
        leaves.appendChild(leaf);
      }
      starfield.appendChild(leaves);
    }
  }

  /* ---------- Helpers ---------- */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function sparkleBurst(x, y, amount = 18) {
    if (prefersReducedMotion) return;
    const symbols = ["✦", "✧", "·", "♡", "⋆"];
    const fragment = document.createDocumentFragment();
    const created = [];

    for (let i = 0; i < amount; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "wish-spark";
      sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      sparkle.style.fontSize = `${9 + Math.random() * 15}px`;
      sparkle.style.setProperty("--dx", `${(Math.random() - 0.5) * 250}px`);
      sparkle.style.setProperty("--dy", `${-50 + Math.random() * 190}px`);
      sparkle.addEventListener("animationend", () => sparkle.remove(), {
        once: true,
      });
      created.push(sparkle);
      fragment.appendChild(sparkle);
    }

    document.body.appendChild(fragment);
    setTimeout(() => created.forEach((el) => el.remove()), 1600);
  }

  function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ---------- Page Navigation ---------- */
  const pages = Array.from(document.querySelectorAll(".page-view"));

  function showPage(name, { scroll = true } = {}) {
    if (!pages.some((page) => page.dataset.page === name)) return;

    pages.forEach((page) => {
      const active = page.dataset.page === name;
      page.hidden = !active;
      page.classList.toggle("active", active);
    });

    if (scroll) {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (name === "luck") {
      currentCard = null;
      emptyCard.hidden = false;
      fortuneCard.hidden = true;
      saveCardButton.disabled = true;
      saveNote.textContent = DEFAULT_SAVE_NOTE;
    }

    if (name === "wish" && !submitting) {
      wishFeedback.textContent = DEFAULT_WISH_FEEDBACK;
    }

    if (name === "wishes") {
      reshuffleWishes();
    }
  }

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(button.dataset.go);
    });
  });

  /* ---------- Envelope ---------- */
  if (envelopeButton) {
    envelopeButton.addEventListener("click", () => {
      const isOpen = envelopeButton.classList.toggle("open");
      envelopeButton.setAttribute("aria-expanded", String(isOpen));
      envelopeButton.setAttribute(
        "aria-label",
        isOpen ? "Close your letter" : "Open your letter",
      );
      paperNote.hidden = !isOpen;
      paperLines.hidden = isOpen;
      letterNext.disabled = !isOpen;
      if (letterPage) letterPage.classList.toggle("letter-open", isOpen);

      envelopeHint.innerHTML = isOpen
        ? "YOUR LETTER IS OPEN <span>♡</span>"
        : "TAP TO OPEN <span>↗</span>";

      if (isOpen) {
        const rect = envelopeButton.getBoundingClientRect();
        sparkleBurst(window.innerWidth / 2, Math.max(80, rect.top + 65), 15);
      }
    });
  }

  if (letterNext) {
    letterNext.addEventListener("click", () => showPage("luck"));
  }

  /* ---------- Draw A Card ---------- */
  function pickCard() {
    const pool =
      currentCard && cards.length > 1
        ? cards.filter((card) => card.number !== currentCard.number)
        : cards;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderCard(card) {
    $("cardNumber").textContent = card.number;
    $("cardIcon").textContent = card.icon;
    $("cardLabel").textContent = card.label;
    $("cardTitle").textContent = card.title;
    $("cardMessage").textContent = card.message;
    $("cardSource").textContent = card.source;

    const s = cardSizes(card);
    fortuneCard.style.setProperty("--en", `${s.en}px`);
    fortuneCard.style.setProperty("--th", `${s.th}px`);
    fortuneCard.style.setProperty("--ic", `${s.ic}px`);

    fortuneCard.style.background =
      `linear-gradient(155deg, ${card.color[0]} 0%, ` +
      `${card.color[1]} 48%, ${card.color[2]} 100%)`;
    fortuneCard.style.setProperty("--card-photo", `url("${card.image}")`);
  }

  if (drawCardButton) {
    drawCardButton.addEventListener("click", () => {
      currentCard = pickCard();
      renderCard(currentCard);

      emptyCard.hidden = true;
      fortuneCard.hidden = false;

      fortuneCard.style.animation = "none";
      void fortuneCard.offsetWidth;
      fortuneCard.style.animation = "";

      saveCardButton.disabled = false;
      saveNote.textContent =
        "Your card is ready to keep. Save it as an image below. ♡";

      const rect = fortuneCard.getBoundingClientRect();
      sparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    });
  }

  /* ---------- Save Card Direct Download (No Pop-up) ---------- */
  const SANS = '"DM Sans", "Noto Sans Thai", sans-serif';
  const THAI = '"Noto Sans Thai", "DM Sans", sans-serif';
  const SERIF = 'Georgia, "Noto Sans Thai", serif';

  function loadCardImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function segmentText(text) {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      try {
        const segmenter = new Intl.Segmenter("th", { granularity: "word" });
        return Array.from(segmenter.segment(text), (item) => item.segment);
      } catch (error) {}
    }
    return text.includes(" ") ? text.split(/(?<= )/) : Array.from(text);
  }

  function fillCentered(ctx, text, cx, y) {
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    const width = ctx.measureText(text).width;
    ctx.fillText(text, cx - width / 2, y);
    ctx.textAlign = previousAlign;
  }

  function wrapLines(ctx, text, maxWidth) {
    const pieces = segmentText(text);
    const lines = [];
    let line = "";

    pieces.forEach((piece) => {
      const test = line + piece;
      if (ctx.measureText(test.trimEnd()).width > maxWidth && line.trim()) {
        lines.push(line.trimEnd());
        line = piece.trimStart();
      } else {
        line = test;
      }
    });

    if (line.trim()) lines.push(line.trimEnd());
    return lines;
  }

  async function renderCardCanvas(card) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scale = 2;
    const width = 700;
    const height = 980;

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    const [c1, c2, c3] = card.color;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(0.55, c2);
    gradient.addColorStop(1, c3);

    ctx.fillStyle = gradient;
    roundedRect(ctx, 0, 0, width, height, 100);
    ctx.fill();

    const photo = await loadCardImage(card.image);

    if (photo) {
      try {
        ctx.save();
        roundedRect(ctx, 0, 0, width, height, 100);
        ctx.clip();

        const imageRatio = photo.width / photo.height;
        const cardRatio = width / height;
        let drawWidth, drawHeight;

        if (imageRatio > cardRatio) {
          drawHeight = height;
          drawWidth = height * imageRatio;
        } else {
          drawWidth = width;
          drawHeight = width / imageRatio;
        }

        const drawX = (width - drawWidth) / 2;
        const drawY = (height - drawHeight) / 2;

        ctx.globalAlpha = 0.85;
        ctx.drawImage(photo, drawX, drawY, drawWidth, drawHeight);
        ctx.globalAlpha = 1;

        const overlay = ctx.createLinearGradient(0, 0, width, height);
        overlay.addColorStop(0, "rgba(12, 20, 52, 0.35)");
        overlay.addColorStop(0.5, "rgba(12, 20, 52, 0.25)");
        overlay.addColorStop(1, "rgba(12, 20, 52, 0.40)");

        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } catch (error) {
        ctx.restore();
      }
    }

    ctx.strokeStyle = "rgba(255, 232, 178, 0.7)";
    ctx.lineWidth = 3;
    roundedRect(ctx, 19, 19, 662, 942, 80);
    ctx.stroke();

    const shadowOn = () => {
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;
    };
    const shadowOff = () => {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    };

    shadowOn();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = `bold 18px ${SANS}`;
    ctx.fillText("A LITTLE MOMENT", 48, 58);

    ctx.textAlign = "right";
    ctx.font = `bold 16px ${SANS}`;
    ctx.fillText(card.number, 652, 58);

    ctx.textAlign = "center";
    const MAXW = 540;

    ctx.font = `700 80px ${SERIF}`;
    fillCentered(ctx, card.icon, 350, 180);

    ctx.font = `bold 19px ${SANS}`;
    fillCentered(ctx, card.label, 350, 224);

    ctx.font = `italic 36px ${SERIF}`;
    const enLines = wrapLines(ctx, card.title, MAXW);
    enLines.forEach((line, i) => fillCentered(ctx, line, 350, 280 + i * 44));

    let nextY = 280 + enLines.length * 44 + 20;
    ctx.font = `600 24px ${THAI}`;
    const thLines = wrapLines(ctx, card.message, MAXW);
    thLines.forEach((line, i) => fillCentered(ctx, line, 350, nextY + i * 38));

    ctx.font = `bold 17px ${SANS}`;
    const srcLines = wrapLines(ctx, card.source.toUpperCase(), MAXW);
    srcLines.forEach((line, i) => fillCentered(ctx, line, 350, 840 + i * 26));

    shadowOff();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(48, 890);
    ctx.lineTo(652, 890);
    ctx.stroke();

    shadowOn();
    ctx.textAlign = "left";
    ctx.font = `bold 17px ${SANS}`;
    ctx.fillText("DEW ✦ TEE", 48, 927);

    ctx.textAlign = "right";
    ctx.font = `28px ${SANS}`;
    ctx.fillText("♡", 652, 930);
    shadowOff();

    return canvas;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    showToast("บันทึกการ์ดลงเครื่องแล้ว ♡");
    saveNote.textContent = "Saved to your device! ♡";
  }

  if (saveCardButton) {
    saveCardButton.addEventListener("click", async () => {
      const card = currentCard;
      if (!card) return;

      saveCardButton.disabled = true;
      saveNote.textContent = "Preparing your little keepsake… ♡";

      try {
        const canvas = await renderCardCanvas(card);
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = `a-little-moment-${card.number
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")}.png`;
            triggerDownload(blob, fileName);
          } else {
            showToast("Could not save the card. Please try again. ♡");
          }
        }, "image/png");
      } catch (error) {
        console.error("Could not save card:", error);
        showToast("Could not save the card. Please try again. ♡");
      } finally {
        saveCardButton.disabled = !currentCard;
      }
    });
  }

  /* ---------- Wishes Wall ---------- */
  function renderWallMessage(text, withButton) {
    wishesWall.replaceChildren();
    if (pagination) pagination.replaceChildren();

    const box = document.createElement("div");
    box.className = "wall-empty";

    const star = document.createElement("span");
    star.className = "wall-empty-star";
    star.textContent = "✧";

    const p = document.createElement("p");
    p.textContent = text;

    box.append(star, p);

    if (withButton) {
      const button = document.createElement("button");
      button.className = "secondary-button";
      button.type = "button";
      button.textContent = "Be the first to send some love";
      button.addEventListener("click", () => showPage("wish"));
      box.appendChild(button);
    }

    wishesWall.appendChild(box);
  }

  function pageItems(current, total) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, current, current - 1, current + 1]);
    const nums = [...set]
      .filter((n) => n >= 1 && n <= total)
      .sort((a, b) => a - b);
    const out = [];
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) out.push("…");
      out.push(n);
    });
    return out;
  }

  function renderPagination(total) {
    if (!pagination) return;
    pagination.replaceChildren();
    if (total <= 1) return;

    const make = (label, page, opts = {}) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "page-btn" + (opts.current ? " current" : "");
      b.textContent = label;
      b.disabled = !!opts.disabled;
      if (opts.aria) b.setAttribute("aria-label", opts.aria);
      if (opts.current) b.setAttribute("aria-current", "page");
      b.addEventListener("click", () => {
        wishPage = page;
        renderWishPage();
      });
      return b;
    };

    pagination.append(
      make("‹", wishPage - 1, {
        disabled: wishPage === 1,
        aria: "Previous page",
      }),
    );

    pageItems(wishPage, total).forEach((item) => {
      if (item === "…") {
        const gap = document.createElement("span");
        gap.className = "page-gap";
        gap.textContent = "…";
        pagination.append(gap);
      } else {
        pagination.append(
          make(String(item), item, { current: item === wishPage }),
        );
      }
    });

    pagination.append(
      make("›", wishPage + 1, {
        disabled: wishPage === total,
        aria: "Next page",
      }),
    );
  }

  function renderWishPage() {
    if (!wallReady) return;

    if (!allWishes.length) {
      renderWallMessage("The sky is waiting for its first little wish.", true);
      return;
    }

    const byId = new Map(allWishes.map((w) => [w.id, w]));
    const totalPages = Math.max(
      1,
      Math.ceil(wishOrder.length / WISHES_PER_PAGE),
    );
    wishPage = Math.min(Math.max(1, wishPage), totalPages);

    const start = (wishPage - 1) * WISHES_PER_PAGE;
    const fragment = document.createDocumentFragment();

    wishOrder.slice(start, start + WISHES_PER_PAGE).forEach((id) => {
      const wish = byId.get(id);
      if (!wish) return;

      const card = document.createElement("article");
      card.className = "wish-card";

      const to = document.createElement("div");
      to.className = "wish-card-to";
      to.textContent = "To. Dew-Tee";

      const message = document.createElement("p");
      message.className = "wish-card-message";
      message.textContent = wish.message;

      const from = document.createElement("div");
      from.className = "wish-card-from";
      from.textContent = `From. ${wish.from}`;

      const star = document.createElement("span");
      star.className = "wish-card-star";
      star.textContent = "✧";

      card.append(to, message, from, star);
      fragment.appendChild(card);
    });

    wishesWall.replaceChildren(fragment);
    renderPagination(totalPages);
  }

  function reshuffleWishes() {
    wishOrder = shuffle(allWishes.map((w) => w.id));
    wishPage = 1;
    renderWishPage();
  }

  function onWishesSnapshot(snapshot) {
    allWishes = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allWishes.push({
        id: doc.id,
        message: data.message || "",
        from: data.from || "Anonymous",
      });
    });
    wallReady = true;

    const known = new Set(allWishes.map((w) => w.id));
    wishOrder = wishOrder.filter((id) => known.has(id));
    const inOrder = new Set(wishOrder);
    allWishes.forEach((w) => {
      if (!inOrder.has(w.id)) {
        wishOrder.splice(
          Math.floor(Math.random() * (wishOrder.length + 1)),
          0,
          w.id,
        );
      }
    });

    renderWishPage();
  }

  if (wishesWall) {
    if (!firestore) {
      renderWallMessage(
        "The wall can't load right now. Please refresh the page. ♡",
        false,
      );
    } else {
      try {
        renderWallMessage("Loading little wishes… ♡", false);
        firestore
          .collection("wishes")
          .orderBy("createdAt", "desc")
          .limit(100)
          .onSnapshot(onWishesSnapshot, (error) => {
            console.error("Error fetching wishes:", error);
            renderWallMessage(
              "The wall can't load right now. Please try again in a moment. ♡",
              false,
            );
          });
      } catch (error) {
        console.error("Error starting wishes listener:", error);
        renderWallMessage(
          "The wall can't load right now. Please refresh the page. ♡",
          false,
        );
      }
    }
  }

  /* ---------- Wish Form ---------- */
  if (wishMessage) {
    wishMessage.addEventListener("input", () => {
      characterCount.textContent = `${wishMessage.value.length} / 500`;
    });
  }

  if (wishForm) {
    wishForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitting) return;

      const message = wishMessage.value.trim().slice(0, 500);
      const from = wishFrom.value.trim().slice(0, 60);

      if (!message || !from) {
        showToast("Please add your wish and your name. ♡");
        return;
      }

      if (!firestore) {
        showToast("Could not save your wish right now. Please refresh. ♡");
        return;
      }

      submitting = true;
      wishButton.disabled = true;
      wishFeedback.textContent = "Sending your little wish… ♡";

      try {
        await withTimeout(
          firestore.collection("wishes").add({
            message,
            from,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          }),
          WISH_TIMEOUT_MS,
        );

        const rect = wishButton.getBoundingClientRect();
        sparkleBurst(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          32,
        );

        showToast("Your wish has been saved. ♡");

        wishForm.reset();
        characterCount.textContent = "0 / 500";
        submitting = false;

        showPage("wishes");
        wishFeedback.textContent =
          "Your little wish is now on the wall. Thank you for sending love. ♡";
      } catch (error) {
        console.error("Error adding wish:", error);
        wishFeedback.textContent =
          error && error.message === "timeout"
            ? "This is taking longer than usual. Please check your connection and try again. ♡"
            : "Could not save your wish. Please try again. ♡";
        showToast("Could not save your wish. Please try again. ♡");
      } finally {
        submitting = false;
        wishButton.disabled = false;
      }
    });
  }

  showPage("letter", { scroll: false });
})();
