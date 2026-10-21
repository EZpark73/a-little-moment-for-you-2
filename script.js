const starfield = document.getElementById("starfield");
const envelopeButton = document.getElementById("envelopeButton");
const paperNote = document.getElementById("paperNote");
const paperLines = document.getElementById("paperLines");
const envelopeHint = document.getElementById("envelopeHint");
const letterNext = document.getElementById("letterNext");
const drawCardButton = document.getElementById("drawCardButton");
const saveCardButton = document.getElementById("saveCardButton");
const emptyCard = document.getElementById("emptyCard");
const fortuneCard = document.getElementById("fortuneCard");
const saveNote = document.getElementById("saveNote");
const wishForm = document.getElementById("wishForm");
const wishMessage = document.getElementById("wishMessage");
const wishFrom = document.getElementById("wishFrom");
const wishFeedback = document.getElementById("wishFeedback");
const characterCount = document.getElementById("characterCount");
const wishesWall = document.getElementById("wishesWall");
const toast = document.getElementById("toast");

let currentCard = null;
let toastTimer;

const cards = [
  {
    number: "NO. 01",
    icon: "☾",
    label: "HAPPY ENERGY",
    title: "A little joy\nfinds its way.",
    message: "ขอให้วันนี้มีเรื่องเล็ก ๆ ที่ทำให้คุณยิ้มได้",
    color: ["#edf1ff", "#b9c9f4", "#e9d9ef"],
    image: "images/1.JPG",
  },
  {
    number: "NO. 02",
    icon: "✦",
    label: "LUCKY MOMENT",
    title: "Good things\nare on their way.",
    message: "ขอให้ความสุขเดินทางมาหาคุณในเวลาที่พอดี",
    color: ["#e6f4ff", "#b4d4f2", "#d9e1ff"],
    image: "images/2.JPG",
  },
  {
    number: "NO. 03",
    icon: "♡",
    label: "A NOTE FOR YOU",
    title: "You make this\nmoment shine.",
    message: "ขอบคุณที่เป็นส่วนหนึ่งของความทรงจำดี ๆ วันนี้",
    color: ["#fff0f8", "#eac5e2", "#d4ddff"],
    image: "images/3.JPG",
  },
  {
    number: "NO. 04",
    icon: "☼",
    label: "SOFT REMINDER",
    title: "You deserve\nsoft days, too.",
    message: "อย่าลืมใจดีกับตัวเอง เหมือนที่คุณใจดีกับคนอื่นนะ",
    color: ["#f0f2ff", "#c9d3fa", "#e9d6e9"],
    image: "images/4.JPG",
  },
  {
    number: "NO. 05",
    icon: "✧",
    label: "FANCON MEMORY",
    title: "Keep this little\nlight with you.",
    message: "ขอให้ความทรงจำวันนี้เป็นแสงเล็ก ๆ ในวันที่เหนื่อย",
    color: ["#e8edff", "#bdc8f4", "#d8e6f5"],
    image: "images/5.JPG",
  },
  {
    number: "NO. 06",
    icon: "☆",
    label: "WISHING YOU WELL",
    title: "May your heart\nfeel at home.",
    message: "ขอให้คุณได้อยู่ท่ามกลางสิ่งที่ทำให้หัวใจอบอุ่นเสมอ",
    color: ["#f2edff", "#c8c5f4", "#e5d5f1"],
    image: "images/6.JPG",
  },
];

// Preload รูปภาพการ์ดมารอไว้
cards.forEach((card) => {
  const img = new Image();
  img.src = card.image;
});

// Decorative starfield
if (starfield) {
  for (let i = 0; i < 72; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = i % 5 === 0 ? "✦" : i % 3 === 0 ? "✧" : "·";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.fontSize = `${7 + Math.random() * 12}px`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${2.5 + Math.random() * 4}s`;
    starfield.appendChild(star);
  }
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function sparkleBurst(x, y, amount = 18) {
  const symbols = ["✦", "✧", "·", "♡", "⋆"];
  for (let i = 0; i < amount; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "wish-spark";
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.fontSize = `${9 + Math.random() * 15}px`;
    sparkle.style.setProperty("--dx", `${(Math.random() - 0.5) * 250}px`);
    sparkle.style.setProperty("--dy", `${-50 + Math.random() * 190}px`);
    document.body.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove(), {
      once: true,
    });
  }
}

function showPage(name) {
  document.querySelectorAll(".page-view").forEach((page) => {
    const active = page.dataset.page === name;
    page.hidden = !active;
    page.classList.toggle("active", active);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (name === "luck") {
    currentCard = null;
    emptyCard.hidden = false;
    fortuneCard.hidden = true;
    saveCardButton.disabled = true;
    saveNote.textContent = "Your card is a little keepsake to take with you.";
  }
}

// Navigation
document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(button.dataset.go);
  });
});

// Envelope
if (envelopeButton) {
  envelopeButton.addEventListener("click", () => {
    const isOpen = envelopeButton.classList.toggle("open");
    envelopeButton.setAttribute("aria-expanded", String(isOpen));
    paperNote.hidden = !isOpen;
    paperLines.hidden = isOpen;
    letterNext.disabled = !isOpen;

    envelopeHint.innerHTML = isOpen
      ? "YOUR LETTER IS OPEN <span>♡</span>"
      : "TAP TO OPEN <span>↗</span>";

    if (isOpen) {
      const rect = envelopeButton.getBoundingClientRect();
      sparkleBurst(window.innerWidth / 2, rect.top + 65, 15);
    }
  });
}

if (letterNext) {
  letterNext.addEventListener("click", () => showPage("luck"));
}

// Draw card
if (drawCardButton) {
  drawCardButton.addEventListener("click", () => {
    let nextCard;
    do {
      nextCard = cards[Math.floor(Math.random() * cards.length)];
    } while (
      cards.length > 1 &&
      currentCard &&
      nextCard.number === currentCard.number
    );

    currentCard = nextCard;

    document.getElementById("cardNumber").textContent = currentCard.number;
    document.getElementById("cardIcon").textContent = currentCard.icon;
    document.getElementById("cardLabel").textContent = currentCard.label;

    document.getElementById("cardTitle").innerHTML = currentCard.title
      .split("\n")
      .map(escapeHtml)
      .join("<br>");

    document.getElementById("cardMessage").textContent = currentCard.message;

    fortuneCard.style.background =
      `linear-gradient(155deg, ${currentCard.color[0]} 0%, ` +
      `${currentCard.color[1]} 48%, ${currentCard.color[2]} 100%)`;

    fortuneCard.style.setProperty(
      "--card-photo",
      `url("${currentCard.image}")`,
    );

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

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function loadCardImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

// Save Card as Image (ดาวน์โหลดไฟล์ตรงทันที)
if (saveCardButton) {
  saveCardButton.addEventListener("click", async () => {
    if (!currentCard) return;

    saveCardButton.disabled = true;
    saveNote.textContent = "Preparing your little keepsake… ♡";

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scale = 2;
      const width = 700;
      const height = 980;

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      const [c1, c2, c3] = currentCard.color;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, c1);
      gradient.addColorStop(0.55, c2);
      gradient.addColorStop(1, c3);

      ctx.fillStyle = gradient;
      roundedRect(ctx, 0, 0, width, height, 100);
      ctx.fill();

      const photo = await loadCardImage(currentCard.image);

      if (photo) {
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
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 3;
      roundedRect(ctx, 19, 19, 662, 942, 80);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      [
        [90, 130],
        [600, 155],
        [95, 800],
        [610, 810],
        [130, 460],
        [570, 510],
        [350, 90],
        [350, 875],
      ].forEach(([x, y], i) => {
        drawStar(ctx, x, y, i % 2 ? 8 : 11);
      });

      const enableDarkShadow = () => {
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
      };
      const disableDarkShadow = () => {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      };

      enableDarkShadow();
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("A LITTLE MOMENT", 48, 58);

      ctx.textAlign = "right";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(currentCard.number, 652, 58);

      ctx.textAlign = "center";
      ctx.font = "100px Georgia, serif";
      ctx.fillText(currentCard.icon, 350, 330);

      ctx.font = "bold 19px sans-serif";
      ctx.fillText(currentCard.label, 350, 405);

      ctx.font = "bold 48px Georgia, serif";
      currentCard.title.split("\n").forEach((line, i) => {
        ctx.fillText(line, 350, 485 + i * 57);
      });

      ctx.font = "600 22px sans-serif";
      wrapText(ctx, currentCard.message, 350, 635, 520, 35);
      disableDarkShadow();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48, 890);
      ctx.lineTo(652, 890);
      ctx.stroke();

      enableDarkShadow();
      ctx.textAlign = "left";
      ctx.font = "bold 17px sans-serif";
      ctx.fillText("DEW ✦ TEE", 48, 927);

      ctx.textAlign = "right";
      ctx.font = "28px sans-serif";
      ctx.fillText("♡", 652, 930);
      disableDarkShadow();

      // บังคับดาวน์โหลดรูปภาพโดยตรงลงเครื่อง
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `a-little-moment-${currentCard.number.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Your little keepsake is saved. ♡");
      saveNote.textContent = "Saved! Keep this little moment close. ♡";
    } catch (error) {
      console.error("Could not save card:", error);
      showToast("Could not save the card. Please try again. ♡");
    } finally {
      saveCardButton.disabled = !currentCard;
    }
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

function drawStar(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : radius * 0.42;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const hasSpaces = text.includes(" ");
  const words = hasSpaces ? text.split(" ") : Array.from(text);
  let line = "";
  let lineIndex = 0;

  for (const word of words) {
    const test = hasSpaces
      ? line
        ? `${line} ${word}`
        : word
      : `${line}${word}`;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = word;
      lineIndex++;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
}

// Firestore Realtime Wishes
if (wishesWall) {
  db.collection("wishes")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        wishesWall.replaceChildren();

        if (snapshot.empty) {
          const empty = document.createElement("div");
          empty.className = "wall-empty";
          empty.innerHTML =
            '<span class="wall-empty-star">✧</span>' +
            "<p>The sky is waiting for its first little wish.</p>" +
            '<button class="secondary-button" type="button" data-go="wish">' +
            "Be the first to send some love</button>";

          empty.querySelector("button").addEventListener("click", () => {
            showPage("wish");
          });

          wishesWall.appendChild(empty);
          return;
        }

        snapshot.forEach((doc) => {
          const wish = doc.data();
          const card = document.createElement("article");
          card.className = "wish-card";

          const to = document.createElement("div");
          to.className = "wish-card-to";
          to.textContent = "To. Dew-Tee";

          const message = document.createElement("p");
          message.className = "wish-card-message";
          message.textContent = wish.message || "";

          const from = document.createElement("div");
          from.className = "wish-card-from";
          from.textContent = `From. ${wish.from || "Anonymous"}`;

          const star = document.createElement("span");
          star.className = "wish-card-star";
          star.textContent = "✧";

          card.append(to, message, from, star);
          wishesWall.appendChild(card);
        });
      },
      (error) => {
        console.error("Error fetching wishes: ", error);
      },
    );
}

if (wishMessage) {
  wishMessage.addEventListener("input", () => {
    characterCount.textContent = `${wishMessage.value.length} / 500`;
  });
}

if (wishForm) {
  wishForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = wishMessage.value.trim();
    const from = wishFrom.value.trim();

    if (!message || !from) {
      showToast("Please add your wish and your name. ♡");
      return;
    }

    const wishButton = document.getElementById("wishButton");
    wishButton.disabled = true;

    try {
      await db.collection("wishes").add({
        message: message,
        from: from,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const rect = wishButton.getBoundingClientRect();
      sparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 32);

      wishFeedback.textContent =
        "Your little wish is now on the wall. Thank you for sending love. ♡";

      showToast("Your wish has been saved. ♡");

      wishForm.reset();
      characterCount.textContent = "0 / 500";

      showPage("wishes");
    } catch (error) {
      console.error("Error adding wish: ", error);
      showToast("Could not save your wish. Please try again. ♡");
    } finally {
      wishButton.disabled = false;
    }
  });
}

showPage("letter");
