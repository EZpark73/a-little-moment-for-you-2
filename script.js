(() => {
  "use strict";

  /* ---------- Elements ---------- */
  const $ = (id) => document.getElementById(id);

  const starfield = $("starfield");
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
  const toast = $("toast");

  // Firestore instance is created safely in index.html (null if unavailable)
  const firestore = window.db || null;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const DEFAULT_SAVE_NOTE = "Your card is a little keepsake to take with you.";
  const DEFAULT_WISH_FEEDBACK =
    "Some wishes are beautiful just because you made them. ♡";
  const WISH_TIMEOUT_MS = 15000;

  let currentCard = null;
  let toastTimer;
  let activeSheet = null;
  let submitting = false;

  /* ---------- Cards ---------- */
  // 6 color palettes, reused by the cards below (C[0] ... C[5])
  const C = [
    ["#f8e8c8", "#e8b36e", "#9fb0d8"],
    ["#fbe9cf", "#eeaa66", "#7f96c9"],
    ["#f6dcc0", "#d98c57", "#b8c3e3"],
    ["#f3e4c4", "#cfa76a", "#8fa6d1"],
    ["#fff0d2", "#f0bf6e", "#a9b8dc"],
    ["#f4dcc2", "#dd9a62", "#8c9fcf"],
  ];

  const cards = [
    {
      number: "NO. 01",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "You, too, can\nbecome a hero.",
      message: "เธอเองก็สามารถเป็นฮีโร่ได้",
      anime: "My Hero Academia",
      character: "All Might",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 02",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Don't let fate\ndetermine your life.",
      message: "อย่าปล่อยให้โชคชะตามาเป็นคนกำหนดชีวิตของเรา",
      anime: "Naruto",
      character: "Naruto Uzumaki",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 03",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "I'll keep trying,\neven if I'm not ready.",
      message: "แม้จะยังไม่เก่งพอ ฉันก็จะพยายามต่อไป",
      anime: "Naruto",
      character: "Hinata Hyuga",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 04",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "My dreams are\nmine to decide.",
      message: "ความฝันของฉัน ฉันจะเป็นคนตัดสินใจเอง",
      anime: "One Piece",
      character: "Monkey D. Luffy",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 05",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "We live on\nin others' memories.",
      message: "คนเรายังคงมีชีวิตอยู่ได้ในความทรงจำของคนอื่น",
      anime: "One Piece",
      character: "Dr. Hiriluk",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 06",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Choose kindness,\neven in a cruel world.",
      message: "แม้โลกจะโหดร้าย เราก็ยังเลือกที่จะอ่อนโยนได้",
      anime: "Demon Slayer",
      character: "Tanjiro Kamado",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 07",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Fear doesn't mean\nyou can't move forward.",
      message: "การกลัวไม่ได้หมายความว่าเราจะก้าวต่อไปไม่ได้",
      anime: "Demon Slayer",
      character: "Zenitsu Agatsuma",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 08",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Love gives us\nstrength to go on.",
      message: "ความรักและความผูกพันทำให้เรายังมีกำลังใจ",
      anime: "Demon Slayer",
      character: "Nezuko Kamado",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 09",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Height doesn't\ndefine how far we go.",
      message: "ส่วนสูงไม่ใช่สิ่งเดียวที่กำหนดว่าเราจะไปได้ไกลแค่ไหน",
      anime: "Haikyu!!",
      character: "Shoyo Hinata",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 10",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Passion can take us\nfurther than we imagine.",
      message: "เมื่อเราพบสิ่งที่อยากทำจริง ๆ เราอาจทุ่มเทได้มากกว่าที่คิด",
      anime: "Haikyu!!",
      character: "Kei Tsukishima",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 11",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Starting from zero\ndoesn't end the dream.",
      message: "การเริ่มต้นจากศูนย์ไม่ได้แปลว่าเราจะไปไม่ถึงฝัน",
      anime: "Slam Dunk",
      character: "Hanamichi Sakuragi",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 12",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Mistakes teach us\nthe value of what we have.",
      message: "ความผิดพลาดทำให้เราได้เรียนรู้คุณค่าของสิ่งที่มี",
      anime: "Fullmetal Alchemist: Brotherhood",
      character: "Edward Elric",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 13",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Your worth goes\nbeyond appearances.",
      message: "คุณค่าของคนไม่ได้ขึ้นอยู่กับรูปลักษณ์ภายนอก",
      anime: "Fullmetal Alchemist: Brotherhood",
      character: "Alphonse Elric",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 14",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Strength doesn't mean\nnever feeling pain.",
      message: "ความเข้มแข็งไม่ได้หมายถึงการไม่เคยเจ็บปวด",
      anime: "Fairy Tail",
      character: "Erza Scarlet",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 15",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "A world of wonders\nis waiting to be found.",
      message: "โลกใบนี้ยังมีสิ่งอีกมากมายที่รอให้เราออกไปค้นพบ",
      anime: "Hunter × Hunter",
      character: "Gon Freecss",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 16",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Someone to protect\ngives life meaning.",
      message: "การมีใครสักคนที่เราอยากปกป้อง ทำให้ชีวิตมีความหมาย",
      anime: "Hunter × Hunter",
      character: "Killua Zoldyck",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 17",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Time reveals\nthe value of someone.",
      message: "บางครั้งเราก็เพิ่งเข้าใจคุณค่าของใครบางคนเมื่อเวลาผ่านไป",
      anime: "Frieren: Beyond Journey's End",
      character: "Frieren",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 18",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Some feelings remain,\neven when memories fade.",
      message: "แม้จะจำไม่ได้ทั้งหมด แต่ความรู้สึกบางอย่างก็ยังคงอยู่",
      anime: "Your Name.",
      character: "Mitsuha Miyamizu",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 19",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Growing up means\nlearning to trust yourself.",
      message: "การเติบโตคือการค่อย ๆ เรียนรู้ที่จะเชื่อมั่นในตัวเอง",
      anime: "Kiki's Delivery Service",
      character: "Kiki",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 20",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Own the choices\nyou make in life.",
      message: "จงเป็นเจ้าของการตัดสินใจในชีวิตตัวเอง",
      anime: "Samurai Champloo",
      character: "Mugen",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 21",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Everyone grows\nin their own way.",
      message: "ทุกคนมีวิธีเติบโตเป็นตัวเองในแบบที่แตกต่างกัน",
      anime: "Assassination Classroom",
      character: "Koro-sensei",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 22",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Believe in yourself\nand break your limits.",
      message: "จงเชื่อมั่นในตัวเองและก้าวข้ามขีดจำกัดที่ตั้งไว้",
      anime: "Gurren Lagann",
      character: "Kamina",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 23",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Special powers don't\ndefine your worth.",
      message: "พลังพิเศษไม่ได้ทำให้ใครมีคุณค่ามากกว่าคนอื่น",
      anime: "Mob Psycho 100",
      character: "Shigeo Kageyama",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 24",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Try something new\nto find what you love.",
      message: "บางครั้งเราต้องลองทำสิ่งใหม่ จึงจะค้นพบสิ่งที่รัก",
      anime: "Blue Period",
      character: "Yatora Yaguchi",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 25",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Be yourself\nand follow your path.",
      message: "ไม่จำเป็นต้องเหมือนใคร เราก็สามารถเดินไปในเส้นทางของตัวเอง",
      anime: "Mashle",
      character: "Mash Burnedead",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 26",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "It's never too late\nto begin again.",
      message: "การเริ่มต้นใหม่ไม่เคยสายเกินไป หากเรายังไม่ยอมแพ้",
      anime: "Kaiju No. 8",
      character: "Kafka Hibino",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 27",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Your strengths exist,\neven if you can't see them.",
      message:
        "แม้เธอจะมองไม่เห็นข้อดีของตัวเองในตอนนี้ ก็ไม่ได้แปลว่ามันไม่มีอยู่จริง",
      anime: "Re:Zero",
      character: "Rem",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 28",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Don't let others\ndefine your worth.",
      message: "อย่าปล่อยให้คนอื่นเป็นผู้กำหนดคุณค่าของเรา",
      anime: "Gachiakuta",
      character: "Rudo",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 29",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Hold on to what\nmatters most to you.",
      message: "แม้ชีวิตจะวุ่นวาย เราก็ยังต้องรักษาสิ่งสำคัญของตัวเอง",
      anime: "Gintama",
      character: "Gintoki Sakata",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 30",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Being different\ndoesn't mean you're wrong.",
      message: "การแตกต่างจากคนอื่นไม่ได้หมายความว่าเราผิดปกติ",
      anime: "The Disastrous Life of Saiki K.",
      character: "Kusuo Saiki",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 31",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Your past doesn't\nhave to define your future.",
      message: "อดีตที่เจ็บปวดไม่จำเป็นต้องเป็นตัวกำหนดอนาคตทั้งหมด",
      anime: "Bungo Stray Dogs",
      character: "Atsushi Nakajima",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 32",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Ordinary happiness\nmay be the most precious.",
      message: "ความสุขธรรมดาอาจเป็นสิ่งที่มีค่ามากที่สุด",
      anime: "Chainsaw Man",
      character: "Denji",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 33",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "The journey matters\nas much as the destination.",
      message: "การเดินทางสำคัญไม่แพ้เป้าหมายที่เราอยากไปให้ถึง",
      anime: "Pokémon",
      character: "Ash Ketchum",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 34",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Choose your path,\neven when you're lost.",
      message: "แม้จะไม่รู้ว่าตัวเองเป็นใคร เราก็ยังเลือกเส้นทางของตัวเองได้",
      anime: "Tougen Anki",
      character: "Shiki Ichinose",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 35",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Understanding goodbye\nhelps the heart move on.",
      message: "บางครั้งการจากลาอย่างเข้าใจช่วยให้หัวใจได้ก้าวต่อไป",
      anime: "Dandelion",
      character: "Main Character",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 36",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Hard work can make\ndreams come true.",
      message: "แม้ไม่มีพรสวรรค์ เราก็ยังพยายามไปให้ถึงความฝันได้",
      anime: "Black Clover",
      character: "Asta",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 37",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Your path is yours\nto choose.",
      message: "เราไม่จำเป็นต้องเดินตามเส้นทางที่คนอื่นกำหนดให้",
      anime: "My Hero Academia",
      character: "Shoto Todoroki",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 38",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Hard work takes us\nfurther than expected.",
      message: "ความพยายามสามารถพาเราไปไกลกว่าที่ใครคาดคิด",
      anime: "Naruto",
      character: "Rock Lee",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 39",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Shared memories\ngive relationships meaning.",
      message: "ความทรงจำที่สร้างร่วมกันทำให้ความสัมพันธ์มีความหมาย",
      anime: "Fairy Tail",
      character: "Lucy Heartfilia",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 40",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Pain shouldn't define\nyour entire life.",
      message: "ความเจ็บปวดไม่ควรเป็นสิ่งเดียวที่กำหนดชีวิตของเรา",
      anime: "Hunter × Hunter",
      character: "Kurapika",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 41",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Kindness can live on\nin someone's memories.",
      message: "สิ่งดี ๆ ที่เราทำให้ผู้อื่นอาจคงอยู่ในความทรงจำไปอีกนาน",
      anime: "Frieren: Beyond Journey's End",
      character: "Himmel",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 42",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Even when lost,\nyou can find yourself again.",
      message: "แม้จะหลงทาง เราก็ยังสามารถค้นหาตัวเองอีกครั้ง",
      anime: "Spirited Away",
      character: "Haku",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 43",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Hope helps us move\nthrough the unknown.",
      message:
        "แม้เส้นทางจะเต็มไปด้วยความไม่แน่นอน ความหวังก็ยังทำให้เราก้าวต่อไปได้",
      anime: "Steins;Gate",
      character: "Rintaro Okabe",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 44",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "There's more to a person\nthan meets the eye.",
      message: "สิ่งที่เราเห็นจากภายนอกอาจไม่ใช่ทั้งหมดของใครสักคน",
      anime: "The Apothecary Diaries",
      character: "Jinshi",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 45",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Change begins when\nyou dare to take a step.",
      message: "การเปลี่ยนแปลงเริ่มขึ้นเมื่อเรากล้าก้าวออกจากจุดเดิม",
      anime: "Solo Leveling",
      character: "Sung Jinwoo",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 46",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Dreams take talent,\npatience, and perseverance.",
      message: "ความฝันต้องการทั้งความสามารถ ความอดทน และความพยายาม",
      anime: "Black Clover",
      character: "Yuno",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 47",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Every journey is better\nwith a friend by your side.",
      message: "การมีเพื่อนร่วมทางทำให้การเดินทางมีความหมายมากขึ้น — Secret",
      anime: "Pokémon",
      character: "Pikachu",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 48",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Life finds meaning\nin what we believe in.",
      message: "ชีวิตมีความหมายผ่านสิ่งที่เราเชื่อมั่น",
      anime: "Naruto",
      character: "Itachi Uchiha",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 49",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Falling isn't shameful.\nRefusing to rise is.",
      message: "การล้มไม่ใช่เรื่องน่าอายเท่ากับการไม่ยอมลุกขึ้น",
      anime: "Kuroko's Basketball",
      character: "Shintaro Midorima",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 50",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Friendship reveals\nnew sides of ourselves.",
      message: "มิตรภาพทำให้เราได้ค้นพบตัวเองในมุมใหม่",
      anime: "Hunter × Hunter",
      character: "Killua Zoldyck",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 51",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Life is precious\nin all its changes.",
      message:
        "ชีวิตมีคุณค่าเพราะเราได้สัมผัสทั้งความสุข ความเศร้า และการเปลี่ยนแปลง",
      anime: "The Tale of the Princess Kaguya",
      character: "Princess Kaguya",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 52",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Little joys are precious\njust as they are.",
      message: "ความสุขเล็ก ๆ รอบตัวมีคุณค่าโดยไม่ต้องพยายามให้ยิ่งใหญ่",
      anime: "Barakamon",
      character: "Naru Kotoishi",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 53",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Dreams are worth\npursuing despite obstacles.",
      message: "ความฝันอาจมีอุปสรรค แต่ก็ยังมีความหมายที่จะพยายาม",
      anime: "The Wind Rises",
      character: "Jiro Horikoshi",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 54",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Everyone has\ntheir own pace.",
      message: "การเดินทางของแต่ละคนมีจังหวะและระยะทางต่างกัน",
      anime: "Run with the Wind",
      character: "Kakeru Kurahara",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 55",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Be yourself,\neven on a different path.",
      message:
        "อย่ากลัวที่จะเป็นตัวเอง เพียงเพราะเส้นทางของเราแตกต่างจากคนอื่น",
      anime: "Blue Lock",
      character: "Meguru Bachira",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 56",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Imagine new possibilities,\nand everything can change.",
      message:
        "แม้จะมองไม่เห็นทางออก การกล้าคิดหาความเป็นไปได้ใหม่ ๆ ก็อาจเปลี่ยนทุกอย่างได้",
      anime: "Attack on Titan",
      character: "Armin Arlert",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 57",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Never lose sight\nof our shared humanity.",
      message: "อย่าปล่อยให้ความแตกต่างทำให้เราลืมมองเห็นหัวใจของกันและกัน",
      anime: "86",
      character: "Vladilena Milizé",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 58",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Others may see\nthe strength you can't.",
      message:
        "เธออาจยังไม่เห็นความแข็งแกร่งของตัวเอง แต่คนที่อยู่ข้างเธออาจมองเห็นมันแล้ว",
      anime: "Reborn!",
      character: "Tsunayoshi Sawada",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 59",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Stand by what you believe,\neven in uncertain times.",
      message:
        "แม้โลกจะเต็มไปด้วยความไม่แน่นอน เรายังเลือกยึดมั่นในสิ่งที่เชื่อได้",
      anime: "Psycho-Pass",
      character: "Akane Tsunemori",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 60",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Every lesson helps us\ngrow stronger.",
      message:
        "ทุกครั้งที่ได้เรียนรู้สิ่งใหม่ เรายังมีโอกาสแข็งแกร่งขึ้นกว่าเดิม",
      anime: "Dragon Ball",
      character: "Goku",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 61",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Kindness and courage\ncan share one heart.",
      message: "ความอ่อนโยนและความกล้าสามารถอยู่ในหัวใจเดียวกันได้",
      anime: "Ranking of Kings",
      character: "Bojji",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 62",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Keep searching for hope,\nno matter how hard it gets.",
      message: "แม้เส้นทางข้างหน้าจะยาก เราก็ยังค้นหาความหวังไปด้วยกันได้",
      anime: "The Promised Neverland",
      character: "Emma",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 63",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Understanding your heart\ntakes time.",
      message:
        "การเรียนรู้ที่จะเข้าใจหัวใจตัวเองอาจต้องใช้เวลา และไม่เป็นไรเลยหากจะค่อย ๆ เรียนรู้",
      anime: "Violet Evergarden",
      character: "Violet Evergarden",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 64",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Take the first step,\neven when you're afraid.",
      message:
        "อย่ารอให้ความกลัวหายไปทั้งหมดก่อนค่อยเริ่ม เพราะก้าวแรกอาจเป็นจุดเริ่มต้นของเรื่องดี ๆ",
      anime: "A Place Further than the Universe",
      character: "Mari Tamaki",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 65",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Love gives meaning\nto every effort.",
      message:
        "เมื่อมีสิ่งที่รักอยู่ในใจ การพยายามเพื่อสิ่งนั้นก็ทำให้ทุกวันมีความหมาย",
      anime: "Chihayafuru",
      character: "Chihaya Ayase",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 66",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "You don't need perfection.\nBeing yourself is enough.",
      message:
        "ไม่จำเป็นต้องทำทุกอย่างได้สมบูรณ์แบบ แค่ตั้งใจและเป็นตัวเองก็เพียงพอแล้ว",
      anime: "Skip and Loafer",
      character: "Mitsumi Iwakura",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 67",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "You deserve love\nwithout earning it.",
      message:
        "เธอสมควรได้รับความรักและความอบอุ่น โดยไม่จำเป็นต้องทำอะไรเพื่อแลกมันมา",
      anime: "The Ancient Magus' Bride",
      character: "Chise Hatori",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 68",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Not knowing your dream\ndoesn't mean you're lost.",
      message:
        "การยังไม่รู้ว่าตัวเองต้องการอะไร ไม่ได้แปลว่าเธอกำลังเดินผิดทาง",
      anime: "Silver Spoon",
      character: "Yuugo Hachiken",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 69",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Passion gives you\nstrength to begin again.",
      message:
        "แม้จะยังไปไม่ถึงฝัน ความหลงใหลในสิ่งที่ทำก็เป็นพลังให้เริ่มใหม่ได้",
      anime: "Little Witch Academia",
      character: "Akko Kagari",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 70",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Disappointment can't erase\nyour hard work.",
      message: "ความผิดหวังไม่ได้ลบล้างความพยายามทั้งหมดที่เธอเคยทุ่มเทลงไป",
      anime: "Yuri!!! on Ice",
      character: "Yuri Katsuki",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 71",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Find happiness\nin your own way.",
      message:
        "ไม่จำเป็นต้องแข่งขันกับทุกคน ลองค้นหาความสุขในแบบที่เป็นของตัวเอง",
      anime: "Free!",
      character: "Haruka Nanase",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 72",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "You still deserve\na hopeful future.",
      message:
        "แม้จะผ่านเรื่องหนักหนามา เธอก็ยังสมควรมีอนาคตที่เต็มไปด้วยความหวัง",
      anime: "86",
      character: "Shinei Nouzen",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 73",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Every new challenge\nreveals your strength.",
      message:
        "แม้จะต้องเผชิญกับสิ่งที่ไม่คุ้นเคย เธอก็ค่อย ๆ เรียนรู้และค้นพบความเข้มแข็งได้",
      anime: "Inuyasha",
      character: "Kagome Higurashi",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 74",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Your worth never changes,\neven on hard days.",
      message:
        "แม้จะมีวันที่ร้องไห้หรือทำพลาด เธอก็ยังเป็นคนที่มีคุณค่าเหมือนเดิม",
      anime: "Sailor Moon",
      character: "Usagi Tsukino",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 75",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Let little things\nmake your heart flutter.",
      message: "จงให้โอกาสตัวเองได้มีความสุขกับสิ่งเล็ก ๆ ที่ทำให้หัวใจพองโต",
      anime: "Cardcaptor Sakura",
      character: "Sakura Kinomoto",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 76",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Change is scary,\nbut you can always grow.",
      message: "การเปลี่ยนแปลงอาจน่ากลัว แต่เธอไม่จำเป็นต้องเป็นคนเดิมตลอดไป",
      anime: "Yona of the Dawn",
      character: "Yona",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 77",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "Let go when you must,\nbut keep beautiful memories.",
      message:
        "แม้จะมีบางสิ่งที่ต้องปล่อยผ่าน แต่ความทรงจำดี ๆ ก็ยังเก็บไว้ในหัวใจได้",
      anime: "Natsume's Book of Friends",
      character: "Madara (Nyanko-sensei)",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 78",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Even small efforts\nkeep the world moving.",
      message:
        "แม้จะรู้สึกว่าตัวเองเป็นเพียงส่วนเล็ก ๆ แต่สิ่งที่เธอทำก็ช่วยให้ทุกอย่างเดินหน้าต่อไป",
      anime: "Cells at Work!",
      character: "Red Blood Cell",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 79",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "Great dreams grow\nfrom small efforts.",
      message: "ความฝันที่ยิ่งใหญ่สร้างขึ้นจากความพยายามเล็ก ๆ ของผู้คนมากมาย",
      anime: "Shirobako",
      character: "Aoi Miyamori",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 80",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "As long as we're alive,\nwe can start again.",
      message: "ตราบใดที่ยังมีชีวิตอยู่ เรายังมีโอกาสเริ่มต้นใหม่ได้เสมอ",
      anime: "One Piece",
      character: "Monkey D. Luffy",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 81",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Mistakes can lead us\nto the answers.",
      message: "ความผิดพลาดไม่ใช่จุดจบ แต่มันอาจเป็นเบาะแสที่พาเราไปสู่คำตอบ",
      anime: "Blue Lock",
      character: "Yoichi Isagi",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 82",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "True strength refuses\nto be ruled by hatred.",
      message:
        "ความเข้มแข็งที่แท้จริงอาจไม่ใช่การเอาชนะใคร แต่เป็นการไม่ปล่อยให้ความเกลียดชังครอบงำหัวใจ",
      anime: "Vinland Saga",
      character: "Thorfinn",
      color: C[3],
      image: "images/4.JPG",
    },
    {
      number: "NO. 83",
      icon: "✧",
      label: "ANIME QUOTE",
      title: "A nervous first step\nis still a beginning.",
      message: "ถึงจะก้าวออกไปอย่างกล้า ๆ กลัว ๆ ก็นับว่าเราได้เริ่มต้นแล้ว",
      anime: "Bocchi the Rock!",
      character: "Hitori Gotoh",
      color: C[4],
      image: "images/5.JPG",
    },
    {
      number: "NO. 84",
      icon: "☆",
      label: "ANIME QUOTE",
      title: "Keep the goodness\nin your heart.",
      message: "จงรักษาความดีงามในหัวใจ แม้เส้นทางข้างหน้าจะไม่ง่ายเลย",
      anime: "JoJo's Bizarre Adventure",
      character: "Jonathan Joestar",
      color: C[5],
      image: "images/6.JPG",
    },
    {
      number: "NO. 85",
      icon: "☾",
      label: "ANIME QUOTE",
      title: "You don't have to\nunderstand yourself today.",
      message: "เธอไม่จำเป็นต้องเข้าใจทุกอย่างเกี่ยวกับตัวเองในวันนี้ก็ได้",
      anime: "Neon Genesis Evangelion",
      character: "Shinji Ikari",
      color: C[0],
      image: "images/1.JPG",
    },
    {
      number: "NO. 86",
      icon: "✦",
      label: "ANIME QUOTE",
      title: "Be shy if you must,\nbut keep loving what you love.",
      message:
        "ไม่เป็นไรเลยถ้าจะเขินอายบ้าง ขอเพียงอย่าปิดกั้นตัวเองจากสิ่งที่รัก",
      anime: "K-On!",
      character: "Mio Akiyama",
      color: C[1],
      image: "images/2.JPG",
    },
    {
      number: "NO. 87",
      icon: "♡",
      label: "ANIME QUOTE",
      title: "Don't let past mistakes\nstop today's efforts.",
      message:
        "อย่าปล่อยให้ความผิดพลาดในอดีตทำให้เธอลืมความหมายของการพยายามในวันนี้",
      anime: "The Seven Deadly Sins",
      character: "Meliodas",
      color: C[2],
      image: "images/3.JPG",
    },
    {
      number: "NO. 88",
      icon: "☼",
      label: "ANIME QUOTE",
      title: "Tomorrow is another\nchance to learn.",
      message:
        "แม้วันนี้จะทำได้ไม่ดีอย่างที่หวัง พรุ่งนี้ก็ยังเป็นโอกาสให้เราเรียนรู้",
      anime: "Neon Genesis Evangelion",
      character: "Misato Katsuragi",
      color: C[3],
      image: "images/4.JPG",
    },
  ];

  // Warm the image cache after the page has loaded, without blocking first paint
  window.addEventListener("load", () => {
    const idle =
      window.requestIdleCallback || ((fn) => window.setTimeout(fn, 1200));
    idle(() => {
      cards.forEach((card) => {
        const img = new Image();
        img.decoding = "async";
        img.src = card.image;
      });
    });
  });

  /* ---------- Starfield ---------- */
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

    // A few leaves drifting down slowly (skipped for reduced motion)
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
    // Safety net so sparkles can never pile up in the DOM
    setTimeout(() => created.forEach((el) => el.remove()), 1600);
  }

  function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  /* ---------- Page navigation ---------- */
  const pages = Array.from(document.querySelectorAll(".page-view"));

  function showPage(name, { scroll = true } = {}) {
    if (!pages.some((page) => page.dataset.page === name)) return;

    closeSaveSheet();

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

  /* ---------- Draw a card ---------- */
  function pickCard() {
    const pool = currentCard
      ? cards.filter((card) => card.number !== currentCard.number)
      : cards;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderCard(card) {
    $("cardNumber").textContent = card.number;
    $("cardIcon").textContent = card.icon;
    $("cardLabel").textContent = card.label;

    const titleEl = $("cardTitle");
    titleEl.replaceChildren();

    card.title.split("\n").forEach((line, index) => {
      if (index) {
        titleEl.appendChild(document.createElement("br"));
      }

      titleEl.appendChild(document.createTextNode(line));
    });

    $("cardMessage").textContent = card.message;

    // แสดงชื่ออนิเมะและชื่อตัวละคร
    const cardSource = $("cardSource");

    if (cardSource) {
      const anime = card.anime || "";
      const character = card.character || "";

      cardSource.textContent = [anime, character].filter(Boolean).join(" · ");

      cardSource.hidden = !cardSource.textContent;
    }

    fortuneCard.style.background =
      `linear-gradient(155deg, ${card.color[0]} 0%, ` +
      `${card.color[1]} 48%, ${card.color[2]} 100%)`;

    fortuneCard.style.setProperty("--card-photo", `url("${card.image}")`);
  }

  // Shrinks the card text (via the CSS variables --ic, --icm, --en, --th
  // defined in theme.css) until everything fits inside the card border.
  // Must run while the card is visible, otherwise nothing can be measured.
  function fitCardText() {
    if (!fortuneCard || fortuneCard.hidden) return;
    const border = fortuneCard.querySelector(".card-border");
    const title = $("cardTitle");
    if (!border || !title) return;

    let ic = 58; // icon size
    let icm = 34; // icon top margin
    let en = 25; // English title size
    let th = 10; // Thai message size

    const apply = () => {
      fortuneCard.style.setProperty("--ic", `${ic}px`);
      fortuneCard.style.setProperty("--icm", `${icm}px`);
      fortuneCard.style.setProperty("--en", `${en}px`);
      fortuneCard.style.setProperty("--th", `${th}px`);
    };
    apply();

    // 1) Shrink the title until no line is wider than the card
    while (title.scrollWidth > title.clientWidth + 1 && en > 14) {
      en -= 0.5;
      apply();
    }

    // 2) If the card is still too tall: icon -> spacing -> Thai text -> title
    const overflowing = () => border.scrollHeight > border.clientHeight + 1;
    for (let i = 0; i < 60 && overflowing(); i++) {
      if (ic > 30) ic -= 3;
      else if (icm > 6) icm -= 4;
      else if (th > 8.5) th -= 0.5;
      else if (en > 14) en -= 0.5;
      else break;
      apply();
    }
  }

  if (drawCardButton) {
    drawCardButton.addEventListener("click", () => {
      currentCard = pickCard();
      renderCard(currentCard);

      emptyCard.hidden = true;
      fortuneCard.hidden = false;
      fitCardText(); // after the card is visible so it can be measured

      // Restart the reveal animation
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

  window.addEventListener("resize", fitCardText);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitCardText);
  }

  /* ---------- Save card as image ---------- */

  const starLayer = document.createElement("div");

  starLayer.setAttribute("aria-hidden", "true");

  Object.assign(starLayer.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    overflow: "hidden",
    zIndex: "10",
  });

  [
    [13, 13, 11],
    [86, 16, 8],
    [14, 82, 8],
    [87, 83, 11],
    [19, 47, 6],
    [81, 52, 6],
    [50, 9, 8],
    [50, 90, 8],
  ].forEach(([x, y, size]) => {
    const star = document.createElement("span");
    star.textContent = "✦";

    Object.assign(star.style, {
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)",
      fontSize: `${size}px`,
      color: "rgba(255, 232, 170, 0.95)",
      textShadow: "0 0 8px rgba(255, 232, 170, 0.7)",
    });

    starLayer.appendChild(star);
  });

  if (getComputedStyle(clone).position === "static") {
    clone.style.position = "relative";
  }

  clone.appendChild(starLayer);

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Empty image"));
        }, "image/png");
      } catch (error) {
        reject(error);
      }
    });
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

    showToast("Your little keepsake is saved. ♡");
    saveNote.textContent = "Saved! Keep this little moment close. ♡";
  }

  // Returns "done", "cancel" or "unsupported"
  async function tryShare(blob, filename) {
    try {
      if (!navigator.share || !navigator.canShare) return "unsupported";
      const file = new File([blob], filename, { type: "image/png" });
      if (!navigator.canShare({ files: [file] })) return "unsupported";
      await navigator.share({
        files: [file],
        title: "A Little Moment for You",
      });
      return "done";
    } catch (error) {
      if (error && error.name === "AbortError") return "cancel";
      return "unsupported";
    }
  }

  function closeSaveSheet() {
    if (!activeSheet) return;
    URL.revokeObjectURL(activeSheet.url);
    activeSheet.el.remove();
    activeSheet = null;
  }

  // In-page preview so phones can long-press to save (no popups to get blocked)
  function openSaveSheet(blob) {
    closeSaveSheet();

    const url = URL.createObjectURL(blob);
    const sheet = document.createElement("div");
    sheet.className = "save-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Your card");

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Your little moment card";

    const hint = document.createElement("p");
    hint.textContent = "แตะค้างที่รูปเพื่อบันทึกลงเครื่องได้เลย ♡";

    const close = document.createElement("button");
    close.type = "button";
    close.className = "primary-button";
    close.textContent = "Close";
    close.addEventListener("click", closeSaveSheet);

    sheet.addEventListener("click", (event) => {
      if (event.target === sheet) closeSaveSheet();
    });

    sheet.append(img, hint, close);
    document.body.appendChild(sheet);
    activeSheet = { el: sheet, url };
    close.focus({ preventScroll: true });

    showToast("แตะค้างที่รูปเพื่อบันทึกได้เลย ♡");
    saveNote.textContent = "แตะค้างที่รูปเพื่อบันทึกลงเครื่องได้เลยครับ ♡";
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSaveSheet();
  });

  if (saveCardButton) {
    saveCardButton.addEventListener("click", async () => {
      const card = currentCard;
      if (!card) return;

      saveCardButton.disabled = true;
      saveNote.textContent = "Preparing your little keepsake… ♡";

      try {
        const canvas = await renderCardCanvas(card);
        const blob = await canvasToBlob(canvas);
        const fileName = `a-little-moment-${card.number
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}.png`;

        if (isMobile) {
          const result = await tryShare(blob, fileName);
          if (result === "done") {
            saveNote.textContent = "Saved! Keep this little moment close. ♡";
          } else if (result === "cancel") {
            saveNote.textContent =
              "Your card is ready to keep. Save it as an image below. ♡";
          } else {
            openSaveSheet(blob);
          }
        } else {
          triggerDownload(blob, fileName);
        }
      } catch (error) {
        console.error("Could not save card:", error);
        showToast("Could not save the card. Please try again. ♡");
        saveNote.textContent =
          "Your card is ready to keep. Save it as an image below. ♡";
      } finally {
        saveCardButton.disabled = !currentCard;
      }
    });
  }

  /* ---------- Wishes wall ---------- */
  function renderWallMessage(text, withButton) {
    wishesWall.replaceChildren();

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

  function renderWishes(snapshot) {
    if (snapshot.empty) {
      renderWallMessage("The sky is waiting for its first little wish.", true);
      return;
    }

    const fragment = document.createDocumentFragment();

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
      fragment.appendChild(card);
    });

    wishesWall.replaceChildren(fragment);
  }

  if (wishesWall) {
    if (!firestore) {
      renderWallMessage(
        "The wall can't load right now. Please refresh the page. ♡",
        false,
      );
    } else {
      try {
        firestore
          .collection("wishes")
          .orderBy("createdAt", "desc")
          .limit(100)
          .onSnapshot(renderWishes, (error) => {
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

  /* ---------- Wish form ---------- */
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

  /* ---------- Start ---------- */
  showPage("letter", { scroll: false });
})();
