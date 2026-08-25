// ============================================================
// NEX CARD — Google Forms Generator
// ============================================================
// How to use:
// 1. Go to https://script.google.com
// 2. Create new project
// 3. Paste this script
// 4. Click Run → select each createXxxForm function
// 5. A Google Form link will be created in your Google Drive
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. နာမည်ကဒ် (Digital Name Card)
// ─────────────────────────────────────────────────────────────
function createDigitalNameCardForm() {
  var form = FormApp.create('NEX CARD — နာမည်ကဒ် (Digital Name Card)');
  form.setDescription('NEX CARD Profile အတွက် လိုအပ်သည့်အချက်အလက်များကို ဖြည့်ပါ။ Required fields များကို ဖြည့်ပြီး Optional fields များကို ထည့်ချင်မှ ထည့်ပါ။');
  form.setAllowResponseEdits(true);
  form.setCollectEmail(false);

  // ── Required ──
  form.addSectionHeaderItem().setTitle('📋 ဖြည့်ရမယ့်အရာများ (Required)').setHelpText('ဒီအရာတွေက မဖြည့်မဖြစ်ပါ');

  form.addTextItem()
    .setTitle('အမည် (Full Name)')
    .setHelpText('အကြီးဆုံး ၃၀ လုံး')
    .setRequired(true);

  form.addTextItem()
    .setTitle('ရာထူး (Job Title)')
    .setHelpText('ဥပမာ: Senior Product Designer, Software Engineer')
    .setRequired(true);

  // ── Optional ──
  form.addSectionHeaderItem().setTitle('📝 ထည့်ချင်မှထည့် (Optional)').setHelpText('ဒီအရာတွေက ထည့်ချင်မှသာ ထည့်ပါ');

  form.addTextItem()
    .setTitle('ကုမ္ပဏီ (Company)')
    .setHelpText('အကြီးဆုံး ၃၀ လုံး')
    .setRequired(false);

  form.addTextItem()
    .setTitle('ကိုယ်တိုင်အကြောင်း (Tagline)')
    .setHelpText('အကြီးဆုံး ၁၅၀ လုံး')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('အကျဉ်းချုပ် (Bio)')
    .setHelpText('အကြီးဆုံး ၁၀၀၀ လုံး')
    .setRequired(false);

  form.addTextItem()
    .setTitle('ပုံ URL (Avatar URL)')
    .setHelpText('Profile photo link ထည့်ပါ')
    .setRequired(false);

  form.addTextItem()
    .setTitle('အီးမေးလ် (Email)')
    .setHelpText('example@email.com')
    .setRequired(false);

  form.addTextItem()
    .setTitle('ဖုန်းနံပါတ် (Phone)')
    .setHelpText('ဥပမာ: +95 9XXXXXXXXX')
    .setRequired(false);

  form.addTextItem()
    .setTitle('လိပ်စာ (Address)')
    .setHelpText('ရုံး/အိမ်လိပ်စာ')
    .setRequired(false);

  form.addTextItem()
    .setTitle('ဝက်ဘ်ဆိုက် (Website)')
    .setHelpText('https://example.com')
    .setRequired(false);

  form.addTextItem()
    .setTitle('WhatsApp')
    .setHelpText('ဖုန်းနံပါတ် ထည့်ပါ')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Telegram')
    .setHelpText('username or link')
    .setRequired(false);

  form.addTextItem()
    .setTitle('LinkedIn URL')
    .setHelpText('https://linkedin.com/in/username')
    .setRequired(false);

  form.addTextItem()
    .setTitle('GitHub URL')
    .setHelpText('https://github.com/username')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Twitter/X URL')
    .setHelpText('https://twitter.com/username')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Instagram URL')
    .setHelpText('https://instagram.com/username')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('ကျွမ်းကျင်မှုများ (Skills)')
    .setHelpText('တစ်ကြောင်းချင်းစီမှာ skill တစ်ခုထည့်ပါ, ဥပမာ: Figma, React, Node.js')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('ကိုးကားစကား (Featured Quote)')
    .setHelpText('အကြီးဆုံး ၃၀၀ လုံး')
    .setRequired(false);

  form.addTextItem()
    .setTitle('အရောင်ကုဒ် (Accent Color)')
    .setHelpText('Hex code, ဥပမာ: #6366f1')
    .setRequired(false);

  Logger.log('Form created: ' + form.getPublishedUrl());
  Logger.log('Edit URL: ' + form.getEditUrl());
}

// ─────────────────────────────────────────────────────────────
// 2. ပါတ်ဖော့လ် (Portfolio)
// ─────────────────────────────────────────────────────────────
function createPortfolioForm() {
  var form = FormApp.create('NEX CARD — ပါတ်ဖော့လ် (Portfolio)');
  form.setDescription('NEX CARD Portfolio Profile အတွက် လိုအပ်သည့်အချက်အလက်များကို ဖြည့်ပါ။');
  form.setAllowResponseEdits(true);

  // ── Required ──
  form.addSectionHeaderItem().setTitle('📋 ဖြည့်ရမယ့်အရာများ (Required)').setHelpText('ဒီအရာတွေက မဖြည့်မဖြစ်ပါ');

  form.addTextItem()
    .setTitle('အမည် (Full Name)')
    .setHelpText('အကြီးဆုံး ၁၂၀ လုံး')
    .setRequired(true);

  form.addTextItem()
    .setTitle('ခေါင်းစဉ် (Headline)')
    .setHelpText('ဥပမာ: Full-Stack Engineer & Open Source Contributor')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('အကျဉ်းချုပ် (Bio)')
    .setHelpText('အကြီးဆုံး ၂၀၀၀ လုံး')
    .setRequired(true);

  // ── Optional ──
  form.addSectionHeaderItem().setTitle('📝 ထည့်ချင်မှထည့် (Optional)').setHelpText('ဒီအရာတွေက ထည့်ချင်မှသာ ထည့်ပါ');

  form.addTextItem()
    .setTitle('ပုံ URL (Avatar URL)')
    .setHelpText('Profile photo link')
    .setRequired(false);

  form.addTextItem()
    .setTitle('အလုပ်ရှင်စာရွက် (Resume URL)')
    .setHelpText('PDF link')
    .setRequired(false);

  form.addListItem()
    .setTitle('အလုပ်လက်ခံနိုင်မှု (Availability)')
    .setChoiceValues(['available — လက်ခံနိုင်သည်', 'limited — ကန့်သတ်ထားသည်', 'unavailable — မလက်ခံနိုင်သည်'])
    .setRequired(false);

  form.addTextItem()
    .setTitle('အလုပ်လက်ခံနိုင်မှု မှတ်ချက် (Availability Note)')
    .setHelpText('အကြီးဆုံး ၂၀၀ လုံး')
    .setRequired(false);

  form.addTextItem()
    .setTitle('အီးမေးလ် (Email)')
    .setRequired(false);

  form.addTextItem()
    .setTitle('ဖုန်းနံပါတ် (Phone)')
    .setRequired(false);

  form.addTextItem()
    .setTitle('LinkedIn URL')
    .setRequired(false);

  form.addTextItem()
    .setTitle('GitHub URL')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Twitter/X URL')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Portfolio/Website URL')
    .setRequired(false);

  // ── Projects (repeatable) ──
  form.addSectionHeaderItem().setTitle('🚀 လုပ်ငန်းများ (Projects)').setHelpText('တစ်ခုချင်းစီအတွက် section အသစ်ထည့်ပါ');

  for (var p = 1; p <= 3; p++) {
    form.addSectionHeaderItem().setTitle('Project ' + p);
    form.addTextItem().setTitle('Project ' + p + ' — ခေါင်းစဉ် (Title)').setRequired(false);
    form.addParagraphTextItem().setTitle('Project ' + p + ' — ဖော်ပြချက် (Description)').setRequired(false);
    form.addTextItem().setTitle('Project ' + p + ' — Tags').setHelpText('ဥပမာ: Next.js, TypeScript, PostgreSQL').setRequired(false);
    form.addTextItem().setTitle('Project ' + p + ' — Cover Image URL').setRequired(false);
    form.addTextItem().setTitle('Project ' + p + ' — Live URL').setRequired(false);
    form.addTextItem().setTitle('Project ' + p + ' — GitHub Repo URL').setRequired(false);
  }

  // ── Experience ──
  form.addSectionHeaderItem().setTitle('💼 အလုပ်သမိုင်း (Experience)').setHelpText('တစ်ခုချင်းစီအတွက် section အသစ်ထည့်ပါ');

  for (var e = 1; e <= 2; e++) {
    form.addSectionHeaderItem().setTitle('Experience ' + e);
    form.addTextItem().setTitle('Experience ' + e + ' — ကုမ္ပဏီ (Company)').setRequired(false);
    form.addTextItem().setTitle('Experience ' + e + ' — ရာထူး (Role)').setRequired(false);
    form.addTextItem().setTitle('Experience ' + e + ' — စတင်ရက် (Start Date)').setHelpText('ဥပမာ: 2022-03').setRequired(false);
    form.addTextItem().setTitle('Experience ' + e + ' — ပြီးဆုံးရက် (End Date)').setHelpText('ဗလာထားပါ = လက်ရှိအလုပ်လုပ်နေသည်').setRequired(false);
    form.addTextItem().setTitle('Experience ' + e + ' — နေရာ (Location)').setRequired(false);
    form.addParagraphTextItem().setTitle('Experience ' + e + ' — ဖော်ပြချက် (Description)').setRequired(false);
  }

  // ── Skills ──
  form.addSectionHeaderItem().setTitle('🛠️ ကျွမ်းကျင်မှုများ (Skills)').setHelpText('အမျိုးအစားတစ်ခုချင်းစီမှာ skill တွေထည့်ပါ');

  form.addTextItem().setTitle('Skills — Frontend').setHelpText('ဥပမာ: React, Next.js, TypeScript, Tailwind CSS').setRequired(false);
  form.addTextItem().setTitle('Skills — Backend').setHelpText('ဥပမာ: Node.js, Go, PostgreSQL, Redis').setRequired(false);
  form.addTextItem().setTitle('Skills — DevOps').setHelpText('ဥပမာ: Docker, Kubernetes, AWS').setRequired(false);
  form.addTextItem().setTitle('Skills — Other').setHelpText('ဥပမာ: Figma, Git, CI/CD').setRequired(false);

  Logger.log('Form created: ' + form.getPublishedUrl());
  Logger.log('Edit URL: ' + form.getEditUrl());
}

// ─────────────────────────────────────────────────────────────
// 3. စီးပွားရေးကြော်ငြာ (Business Ad)
// ─────────────────────────────────────────────────────────────
function createBusinessAdForm() {
  var form = FormApp.create('NEX CARD — စီးပွားရေးကြော်ငြာ (Business Ad)');
  form.setDescription('NEX CARD Business Profile အတွက် လိုအပ်သည့်အချက်အလက်များကို ဖြည့်ပါ။');
  form.setAllowResponseEdits(true);

  // ── Required ──
  form.addSectionHeaderItem().setTitle('📋 ဖြည့်ရမယ့်အရာများ (Required)').setHelpText('ဒီအရာတွေက မဖြည့်မဖြစ်ပါ');

  form.addTextItem()
    .setTitle('စီးပွားရေးအမည် (Business Name)')
    .setHelpText('အကြီးဆုံး ၁၂၀ လုံး')
    .setRequired(true);

  form.addTextItem()
    .setTitle('ကိုယ်တိုင်အကြောင်း (Tagline)')
    .setHelpText('အကြီးဆုံး ၂၀၀ လုံး')
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('ဖော်ပြချက် (Description)')
    .setHelpText('အကြီးဆုံး ၂၀၀၀ လုံး')
    .setRequired(true);

  form.addTextItem()
    .setTitle('CTA ခေါင်းစဉ် (Primary CTA Label)')
    .setHelpText('ဥပမာ: Contact Us, Get a Free Quote, Order Now')
    .setRequired(true);

  form.addTextItem()
    .setTitle('CTA Link (Primary CTA URL)')
    .setHelpText('https://... or mailto:...')
    .setRequired(true);

  // ── Services (min 1 required) ──
  form.addSectionHeaderItem().setTitle('🛒 ဝန်ဆောင်မှုများ (Services) — အနည်းဆုံး ၁ ခု ဖြည့်ရပါမည်').setHelpText('ဝန်ဆောင်မှု ၁ ခုအနည်းဆုံး ထည့်ပါ');

  for (var s = 1; s <= 5; s++) {
    form.addSectionHeaderItem().setTitle('Service ' + s);
    form.addTextItem().setTitle('Service ' + s + ' — ခေါင်းစဉ် (Title)').setRequired(s === 1);
    form.addParagraphTextItem().setTitle('Service ' + s + ' — ဖော်ပြချက် (Description)').setRequired(s === 1);
    form.addTextItem().setTitle('Service ' + s + ' — စျေးနှုန်း (Price)').setHelpText('ဥပမာ: From $2,500').setRequired(false);
    form.addTextItem().setTitle('Service ' + s + ' — Features').setHelpText('တစ်ကြောင်းချင်းစီမှာ feature တစ်ခုထည့်ပါ').setRequired(false);
  }

  // ── Optional ──
  form.addSectionHeaderItem().setTitle('📝 ထည့်ချင်မှထည့် (Optional)').setHelpText('ဒီအရာတွေက ထည့်ချင်မှသာ ထည့်ပါ');

  form.addTextItem().setTitle('Logo URL').setRequired(false);
  form.addTextItem().setTitle('Hero Image URL').setRequired(false);
  form.addTextItem().setTitle('လုပ်ငန်းအမျိုးအစား (Industry)').setHelpText('ဥပမာ: Restaurant, Tech Company').setRequired(false);
  form.addTextItem().setTitle('စတင်တည်ထောင်သည့်နှစ် (Founded)').setRequired(false);

  form.addTextItem().setTitle('အီးမေးလ် (Email)').setRequired(false);
  form.addTextItem().setTitle('ဖုန်းနံပါတ် (Phone)').setRequired(false);
  form.addTextItem().setTitle('WhatsApp').setRequired(false);
  form.addParagraphTextItem().setTitle('လိပ်စာ (Address)').setRequired(false);
  form.addTextItem().setTitle('Google Maps URL').setRequired(false);

  form.addTextItem().setTitle('Facebook URL').setRequired(false);
  form.addTextItem().setTitle('Instagram URL').setRequired(false);
  form.addTextItem().setTitle('LinkedIn URL').setRequired(false);
  form.addTextItem().setTitle('YouTube URL').setRequired(false);

  // ── Gallery ──
  form.addSectionHeaderItem().setTitle('🖼️ ပုံများ (Gallery)').setHelpText('ပုံ URL များထည့်ပါ');
  for (var g = 1; g <= 5; g++) {
    form.addTextItem().setTitle('Gallery Image ' + g + ' URL').setRequired(false);
  }

  // ── Business Hours ──
  form.addSectionHeaderItem().setTitle('🕐 ဖွင့်/ပိတ်ချိန် (Business Hours)');
  var days = ['တနင်္လာ (Mon)', 'အင်္ဂါ (Tue)', 'ဗုဒ္ဓဟူး (Wed)', 'ကြာသပတေး (Thu)', 'သောကြာ (Fri)', 'စနေ (Sat)', 'တနင်္ဂနွေ (Sun)'];
  for (var d = 0; d < days.length; d++) {
    form.addTextItem().setTitle(days[d] + ' — ဖွင့်ချိန် (Open)').setHelpText('ဥပမာ: 09:00').setRequired(false);
    form.addTextItem().setTitle(days[d] + ' — ပိတ်ချိန် (Close)').setHelpText('ဥပမာ: 18:00').setRequired(false);
  }

  // ── Testimonials ──
  form.addSectionHeaderItem().setTitle('⭐ သုံးစွဲသူများပြောစကား (Testimonials)');
  for (var t = 1; t <= 3; t++) {
    form.addTextItem().setTitle('Testimonial ' + t + ' — အမည် (Author)').setRequired(false);
    form.addScaleItem().setTitle('Testimonial ' + t + ' — Rating').setBounds(1, 5).setLabels('ညံ့သည်', 'ကောင်းသည်').setRequired(false);
    form.addParagraphTextItem().setTitle('Testimonial ' + t + ' — မှတ်ချက် (Text)').setRequired(false);
  }

  // ── FAQ ──
  form.addSectionHeaderItem().setTitle('❓ မေးခွန်းများ (FAQ)');
  for (var f = 1; f <= 5; f++) {
    form.addTextItem().setTitle('FAQ ' + f + ' — မေးခွန်း (Question)').setRequired(false);
    form.addParagraphTextItem().setTitle('FAQ ' + f + ' — အဖြေ (Answer)').setRequired(false);
  }

  Logger.log('Form created: ' + form.getPublishedUrl());
  Logger.log('Edit URL: ' + form.getEditUrl());
}

// ─────────────────────────────────────────────────────────────
// 4. မင်္ဂလာဖိတ်ကြားစာ (Wedding Invitation)
// ─────────────────────────────────────────────────────────────
function createWeddingForm() {
  var form = FormApp.create('NEX CARD — မင်္ဂလာဖိတ်ကြားစာ (Wedding Invitation)');
  form.setDescription('NEX CARD Wedding Profile အတွက် လိုအပ်သည့်အချက်အလက်များကို ဖြည့်ပါ။');
  form.setAllowResponseEdits(true);

  // ── Required ──
  form.addSectionHeaderItem().setTitle('📋 ဖြည့်ရမယ့်အရာများ (Required)').setHelpText('ဒီအရာတွေက မဖြည့်မဖြစ်ပါ');

  form.addTextItem()
    .setTitle('အမျိုးသားအမည် (Partner 1 Name)')
    .setHelpText('အကြီးဆုံး ၈၀ လုံး')
    .setRequired(true);

  form.addTextItem()
    .setTitle('အမျိုးသမီးအမည် (Partner 2 Name)')
    .setHelpText('အကြီးဆုံး ၈၀ လုံး')
    .setRequired(true);

  form.addDateTimeItem()
    .setTitle('မင်္ဂလာနေ့ (Wedding Date)')
    .setHelpText('ရက်နှင့်အချိန် ရွေးပါ')
    .setRequired(true);

  // ── Optional: Couple Info ──
  form.addSectionHeaderItem().setTitle('💑 စုံတွဲအချက်အလက် (Couple Info)').setHelpText('ထည့်ချင်မှသာ ထည့်ပါ');

  form.addTextItem().setTitle('Partner 1 — နာမည်ချော (Nickname)').setRequired(false);
  form.addTextItem().setTitle('Partner 1 — ပုံ URL (Photo)').setRequired(false);
  form.addParagraphTextItem().setTitle('Partner 1 — အကျဉ်းချုပ် (Bio)').setHelpText('အကြီးဆုံး ၆၀၀ လုံး').setRequired(false);
  form.addTextItem().setTitle('Partner 2 — နာမည်ချော (Nickname)').setRequired(false);
  form.addTextItem().setTitle('Partner 2 — ပုံ URL (Photo)').setRequired(false);
  form.addParagraphTextItem().setTitle('Partner 2 — အကျဉ်းချုပ် (Bio)').setHelpText('အကြီးဆုံး ၆၀၀ လုံး').setRequired(false);

  // ── Wedding Details ──
  form.addSectionHeaderItem().setTitle('💒 မင်္ဂလာအခမ်းအနား အသေးစိတ်');

  form.addTextItem().setTitle('ခေါင်းစဉ် (Headline)').setHelpText('ဥပမာ: နှစ်ယောက်ရဲ့အချစ်ဇာတ်လမ်း').setRequired(false);
  form.addParagraphTextItem().setTitle('စုံတွဲမိတ်ဆက် (Couple Message)').setHelpText('အကြီးဆုံး ၁၀၀၀ လုံး').setRequired(false);
  form.addTextItem().setTitle('Hashtag').setHelpText('ဥပမာ: #AryanAndPriya2025').setRequired(false);

  // ── Song ──
  form.addSectionHeaderItem().setTitle('🎵 သီချင်း (Song)');
  form.addTextItem().setTitle('သီချင်းအမည် (Song Title)').setRequired(false);
  form.addTextItem().setTitle('သီချင်းဆိုသူ (Song Artist)').setRequired(false);
  form.addTextItem().setTitle('Spotify URL').setRequired(false);

  // ── Love Story ──
  form.addSectionHeaderItem().setTitle('💕 အချစ်ဇာတ်လမ်း (Love Story) — အနည်းဆုံး ၁ ခု ဖြည့်ရပါမည်');

  for (var ls = 1; ls <= 5; ls++) {
    form.addSectionHeaderItem().setTitle('Love Story ' + ls);
    form.addTextItem().setTitle('Story ' + ls + ' — ရက် (Date)').setHelpText('ဥပမာ: March 2019').setRequired(ls === 1);
    form.addTextItem().setTitle('Story ' + ls + ' — ခေါင်းစဉ် (Title)').setRequired(ls === 1);
    form.addParagraphTextItem().setTitle('Story ' + ls + ' — ဇာတ်လမ်း (Story)').setHelpText('အကြီးဆုံး ၈၀၀ လုံး').setRequired(ls === 1);
    form.addTextItem().setTitle('Story ' + ls + ' — နေရာ (Location)').setRequired(false);
    form.addTextItem().setTitle('Story ' + ls + ' — ပုံ URL (Image)').setRequired(false);
    form.addTextItem().setTitle('Story ' + ls + ' — Emoji').setHelpText('ဥပမာ: 💍, ☕, 🌅').setRequired(false);
  }

  // ── Events ──
  form.addSectionHeaderItem().setTitle('🎉 အခမ်းအနားများ (Events) — အနည်းဆုံး ၁ ခု ဖြည့်ရပါမည်');

  for (var ev = 1; ev <= 3; ev++) {
    form.addSectionHeaderItem().setTitle('Event ' + ev);
    form.addTextItem().setTitle('Event ' + ev + ' — နာမည် (Name)').setHelpText('ဥပမာ: Nikah Ceremony, Reception').setRequired(ev === 1);
    form.addDateTimeItem().setTitle('Event ' + ev + ' — ရက်နှင့်အချိန် (Date & Time)').setRequired(ev === 1);
    form.addTextItem().setTitle('Event ' + ev + ' — နေရာ (Venue)').setRequired(ev === 1);
    form.addParagraphTextItem().setTitle('Event ' + ev + ' — လိပ်စာ (Address)').setRequired(ev === 1);
    form.addTextItem().setTitle('Event ' + ev + ' — ဝတ်စားဆင်ယင်မှု (Dress Code)').setRequired(false);
    form.addTextItem().setTitle('Event ' + ev + ' — Google Maps URL').setRequired(false);
    form.addParagraphTextItem().setTitle('Event ' + ev + ' — မှတ်ချက် (Notes)').setRequired(false);
  }

  // ── Gallery ──
  form.addSectionHeaderItem().setTitle('🖼️ ပုံများ (Gallery)');
  for (var g = 1; g <= 6; g++) {
    form.addTextItem().setTitle('Gallery Image ' + g + ' URL').setRequired(false);
  }

  // ── RSVP ──
  form.addSectionHeaderItem().setTitle('💌 RSVP');
  form.addDateTimeItem().setTitle('RSVP ပြန်ဖြေရန် ပိတ်ရက် (Deadline)').setRequired(false);
  form.addTextItem().setTitle('RSVP Form URL').setHelpText('Google Form link or website').setRequired(false);
  form.addTextItem().setTitle('ဆက်သွယ်ရန် အီးမေးလ် (Contact Email)').setRequired(false);
  form.addTextItem().setTitle('ဆက်သွယ်ရန် ဖုန်း (Contact Phone)').setRequired(false);
  form.addTextItem().setTitle('ဧည့်သည်အများဆုံး (Max Guests)').setHelpText('ဥပမာ: 2').setRequired(false);
  form.addListItem().setTitle('Plus One ခွင့်ပြုမည်လား').setChoiceValues(['ခွင့်ပြုသည်', 'မခွင့်ပြုပါ']).setRequired(false);

  Logger.log('Form created: ' + form.getPublishedUrl());
  Logger.log('Edit URL: ' + form.getEditUrl());
}

// ─────────────────────────────────────────────────────────────
// Run All
// ─────────────────────────────────────────────────────────────
function createAllForms() {
  createDigitalNameCardForm();
  createPortfolioForm();
  createBusinessAdForm();
  createWeddingForm();
  Logger.log('=== All 4 forms created! Check Google Drive ===');
}
