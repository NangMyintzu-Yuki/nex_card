import type { Metadata } from "next";
import { MaintenanceLink as Link } from "@/components/ui/maintenance-link";
import { ArrowLeft, CreditCard, Smartphone, QrCode, User, Mail, Lock, Eye, EyeOff, Download, Share2, Settings, BarChart3, Zap, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "User Guide — NEX CARD",
  description: "NEX CARD ကို ဘယ်လိုသုံးမလဲ အဆင့်ဆင့်လမ်းညွှန်",
};

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ background: "var(--nc-brand-grad)" }}>
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold" style={{ color: "var(--nc-text)" }}>{title}</h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed" style={{ color: "var(--nc-text-2)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border p-4 text-sm"
      style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.05)" }}>
      <p className="flex items-center gap-2 font-bold" style={{ color: "#22c55e" }}>
        <CheckCircle className="h-4 w-4" /> အကြံပြုချက်
      </p>
      <p className="mt-1" style={{ color: "var(--nc-text-2)" }}>{children}</p>
    </div>
  );
}

export default function UserGuidePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--nc-bg)", color: "var(--nc-text)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b"
        style={{ background: "var(--nc-bg)", borderColor: "var(--nc-border)", backdropFilter: "blur(20px)" }}>
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link href="/"
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:opacity-80"
            style={{ borderColor: "var(--nc-border)", color: "var(--nc-text-2)" }}>
            <ArrowLeft className="h-4 w-4" />
            ပင်မ
          </Link>
          <h1 className="text-lg font-black" style={{ color: "var(--nc-text)" }}>User Guide</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-black sm:text-4xl" style={{ color: "var(--nc-text)" }}>
            NEX CARD ကို ဘယ်လိုသုံးမလဲ
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base" style={{ color: "var(--nc-text-2)" }}>
            ဒီ guide မှာ NEX CARD ကို register ဝင်ခြင်းကနေ စပြီး card design ရွေးချယ်ခြင်း၊ payment ပေးခြင်း၊
            profile ဖန်တီးခြင်း၊ QR code ရရှိခြင်း၊ NFC card ရရှိခြင်း အထိ အဆင့်ဆင့် ရှင်းပြပေးမှာပါ။
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-16 rounded-2xl border p-6"
          style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
          <h2 className="mb-4 text-lg font-bold" style={{ color: "var(--nc-text)" }}>စာရင်းအကျဉ်း</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "1. Account ဖန်တီးခြင်း (Register)",
              "2. Login ဝင်ခြင်း",
              "3. Card & Template ရွေးချယ်ခြင်း",
              "4. Payment ပေးခြင်း",
              "5. Profile Details ဖြည့်ခြင်း",
              "6. Profile Publish လုပ်ခြင်း",
              "7. QR Code ရရှိခြင်း",
              "8. Settings ပြင်ဆင်ခြင်း",
            ].map((item) => (
              <p key={item} className="text-sm" style={{ color: "var(--nc-text-2)" }}>{item}</p>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-16">

          {/* Step 1 */}
          <section>
            <Step number={1} title="Account ဖန်တီးခြင်း (Register)">
              <p>NEX CARD ကို စတင်အသုံးပြုဖို့ account ဖန်တီးရပါမယ်။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li><strong>nexcard.wetechmm.com</strong> ကို browser မှာ ဖွင့်ပါ။</li>
                <li>ညာဘက်အပေါ်ထိပ်ရှိ <strong>&quot;Start&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
                <li>သင့်နာမည် (Name) ကို ဖြည့်ပါ။</li>
                <li>သင့်အီးမေးလ် (Email) ကို ဖြည့်ပါ။</li>
                <li>လျှို့ဝှက်နံပါတ် (Password) ကို ဖြည့်ပါ။ (အနည်းဆုံး စာလုံး ၈ လုံး ပါဝင်ရပါမယ်)</li>
                <li><strong>&quot;Create Account&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
                <li>သင့်အီးမေးလ်ကို verify လုပ်ပါ — အီးမေးလ်ထဲပို့ထားတဲ့ code ကို ထည့်ပါ။</li>
              </ol>
              <Tip>Strong password တစ်ခု ဖန်တီးပါ — စာလုံးကြီး၊ စာလုံးသေး၊ ဂဏန်း၊ အထူးဖြစ်တဲ့ သင်္ကေတတွေ ပါဝင်အောင် ဖန်တီးပါ။</Tip>
            </Step>
          </section>

          {/* Step 2 */}
          <section>
            <Step number={2} title="Login ဝင်ခြင်း">
              <p>Account ဖန်တီးပြီးနောက် NEX CARD ထဲဝင်ဖို့ login လုပ်ရပါမယ်။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li><strong>nexcard.wetechmm.com/login</strong> ကို ဖွင့်ပါ။</li>
                <li>သင့်အီးမေးလ်ကို ထည့်ပါ။</li>
                <li>လျှို့ဝှက်နံပါတ်ကို ထည့်ပါ။</li>
                <li><strong>&quot;Sign In&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
                <li>Email verification code ကို ထည့်ပြီး verify လုပ်ပါ။</li>
                <li>Dashboard ထဲရောက်ပါလိမ့်မယ်။</li>
              </ol>
              <Tip>&quot;Remember for 30 days&quot; ကို ရွေးချယ်ထားရင် နောက်တစ်ကြိမ် login ပြန်ဝင်စရာ မလိုပါ။</Tip>
            </Step>
          </section>

          {/* Step 3 */}
          <section>
            <Step number={3} title="Card & Template ရွေးချယ်ခြင်း">
              <p>Dashboard ထဲမှာ card category နဲ့ template ရွေးပါ။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Dashboard ထဲဝင်ပါ။</li>
                <li><strong>&quot;+ Create First Profile&quot;</strong> ခလုတ် (သို့) <strong>&quot;+ New Profile&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
                <li>Card category ကို ရွေးချယ်ပါ:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li><strong>Digital Name Card</strong> — ကိုယ်ပွားအမည်ကဒ်</li>
                    <li><strong>Portfolio</strong> — အလုပ်ကိုယ်ရေးအကျဉ်း</li>
                    <li><strong>Business</strong> — စီးပွားရေးကြော်ငြာ</li>
                    <li><strong>Wedding</strong> — မင်္ဂလာဖိတ်ကြားစာ</li>
                  </ul>
                </li>
                <li>သင့်ကြိုက်နှစ်သက်ရာ template ကို ရွေးချယ်ပါ။</li>
                <li><strong>&quot;Select&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
              </ol>
              <Tip>Template preview ကို ကြိုက်တဲ့ template ပေါ်မှာ click ပြီးကြည့်နိုင်ပါတယ်။ Dark နဲ့ Light mode နှစ်မျိုးလုံး ကြိုက်တာ ပြောင်းကြည့်နိုင်ပါတယ်။</Tip>
            </Step>
          </section>

          {/* Step 4 */}
          <section>
            <Step number={4} title="Payment ပေးခြင်း">
              <p>Template ရွေးပြီးရင် payment ပေးရပါမယ်။ Payment approve ဖြစ်မှသာ profile details ထည့်လို့ရပါမယ်။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Template ရွေးပြီးနောက် payment page ထဲ ရောက်ပါလိမ့်မယ်။</li>
                <li>Plan ကို ရွေးချယ်ပါ (QR Only, NFC + QR)။</li>
                <li>Payment method ကို ရွေးချယ်ပါ (KBZ Pay, AYA Pay)။</li>
                <li>Account Name: <strong>Shwe Yee Win</strong></li>
                <li>Phone Number: <strong>09974133003</strong> (copy icon နှိပ်ပြီး copy ယူနိုင်ပါတယ်)</li>
                <li>ငွေပမာဏ ပေးဆောင်ပါ။</li>
                <li>Payment screenshot ကို upload လုပ်ပါ။</li>
                <li><strong>&quot;Submit Payment&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
              </ol>
              <div className="mt-4 rounded-xl border p-4 text-sm"
                style={{ borderColor: "rgba(234,179,8,0.3)", background: "rgba(234,179,8,0.05)" }}>
                <p className="flex items-center gap-2 font-bold" style={{ color: "#eab308" }}>
                  <CheckCircle className="h-4 w-4" /> အရေးကြီး
                </p>
                <p className="mt-1" style={{ color: "var(--nc-text-2)" }}>
                  Admin က payment ကို စစ်ဆေးပြီး <strong>Approve</strong> လုပ်ပေးပါမယ်။ Approve ဖြစ်မှသာ profile details ထည့်ခြင်း၊ edit ခြင်းတွေ လုပ်နိုင်ပါမယ်။ Payment status ကို Dashboard မှာ ကြည့်နိုင်ပါတယ်။
                </p>
              </div>
              <Tip>Payment reject ဖြစ်ခဲ့ရင် Dashboard ထဲမှာ &quot;Reupload&quot; ခလုတ်ပေါ်လာပြီး screenshot ပြန်တင်နိုင်ပါတယ်။</Tip>
            </Step>
          </section>

          {/* Step 5 */}
          <section>
            <Step number={5} title="Profile Details ဖြည့်ခြင်း">
              <p>Payment approve ဖြစ်ပြီးနောက်မှာ profile details တွေ ဖြည့်ရပါမယ်။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Dashboard ထဲမှာ သင့် profile ကို ရှာပါ။</li>
                <li><strong>&quot;Edit&quot;</strong> ခလုတ်ကို နှိပ်ပါ။ (Payment approve ဖြစ်ပြီးမှ Edit ခလုတ် ပေါ်လာပါမယ်)</li>
                <li>Profile details တွေ ဖြည့်ပါ:
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li><strong>Profile URL (Slug)</strong> — ဥပမာ: <code>nexcard.wetechmm.com/your-name</code></li>
                    <li><strong>Name</strong> — သင့်နာမည် (သို့) ကုမ္ပဏီနာမည်</li>
                    <li><strong>Title / Role</strong> — သင့်ရာထူး</li>
                    <li><strong>Bio</strong> — အတိုချုပ် မိတ်ဆက်ချက်</li>
                    <li><strong>Contact Info</strong> — ဖုန်းနံပါတ်၊ အီးမေးလ်၊ website URL</li>
                    <li><strong>Social Links</strong> — Facebook, Instagram, LinkedIn, Twitter စတာတွေ</li>
                    <li><strong>Profile Photo</strong> — ဓာတ်ပုံ upload လုပ်ပါ</li>
                  </ul>
                </li>
                <li><strong>&quot;Save&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
              </ol>
              <Tip>Profile details ကို နောက်မှ ဘယ်အချိန်မဆို ပြင်ဆင်နိုင်ပါတယ်။</Tip>
            </Step>
          </section>

          {/* Step 6 */}
          <section>
            <Step number={6} title="Profile Publish လုပ်ခြင်း">
              <p>Profile details ဖြည့်ပြီးရင် public ဖြစ်အောင် publish လုပ်ရပါမယ်။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Dashboard ထဲမှာ သင့် profile ကို ရှာပါ။</li>
                <li><strong>&quot;Draft — not visible&quot;</strong> ဆိုတဲ့ badge ကို မြင်ရပါလိမ့်မယ်။</li>
                <li>Edit ထဲဝင်ပြီး details အားလုံး ပြည့်စုံအောင် ဖြည့်ပါ။</li>
                <li><strong>&quot;Publish&quot;</strong> ခလုတ်ကို နှိပ်ပါ။</li>
                <li>Profile က <strong>&quot;● Live&quot;</strong> ဖြစ်သွားပါလိမ့်မယ်။</li>
              </ol>
              <p className="mt-2">Publish ပြီးရင် <code>nexcard.wetechmm.com/your-slug</code> မှာ လူတိုင်း ကြည့်နိုင်ပါပြီ။</p>
            </Step>
          </section>

          {/* Step 7 */}
          <section>
            <Step number={7} title="QR Code ရရှိခြင်း">
              <p>သင့် profile card ရဲ့ QR code ကို generate လုပ်ပါ။</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Dashboard ထဲမှာ သင့် profile ကို ရှာပါ။</li>
                <li>QR code icon ကို နှိပ်ပါ။</li>
                <li>QR code page ထဲရောက်ပါလိမ့်မယ်။</li>
                <li>QR code ကို preview ကြည့်နိုင်ပါတယ်။</li>
                <li><strong>SVG</strong> သို့မဟုတ် <strong>PNG</strong> format နဲ့ download ယူနိုင်ပါတယ်။</li>
                <li>QR code URL ကို copy ယူပြီး ဘယ်မှာမဆို share နိုင်ပါတယ်။</li>
              </ol>
              <Tip>QR code ကို print ထုတ်ပြီး physical card ပေါ်မှာ ကပ်နိုင်ပါတယ်။ Business card, sticker, poster စတာတွေမှာ အသုံးပြုနိုင်ပါတယ်။</Tip>
            </Step>
          </section>

          {/* Step 8 */}
          <section>
            <Step number={8} title="Settings ပြင်ဆင်ခြင်း">
              <p>သင့် account settings တွေ ပြင်ဆင်နိုင်ပါတယ်။</p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong>Profile Photo</strong> — ဓာတ်ပုံ ပြောင်းနိုင်ပါတယ်။</li>
                <li><strong>Name / Email</strong> — နာမည်၊ အီးမေးလ် ပြောင်းနိုင်ပါတယ်။</li>
                <li><strong>Password</strong> — လျှို့ဝှက်နံပါတ် ပြောင်းနိုင်ပါတယ်။</li>
                <li><strong>Theme</strong> — Dark / Light mode ပြောင်းနိုင်ပါတယ်။</li>
              </ul>
            </Step>
          </section>
        </div>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-black" style={{ color: "var(--nc-text)" }}>
            မေးခွန်းများနှင့် အဖြေများ (FAQ)
          </h2>
          <div className="space-y-4">
            {[
              { q: "NEX CARD ကို ဘယ်လောက် ကုန်ကျပါသလဲ?", a: "Template တစ်ခုချင်းစီကို သက်ဆိုင်ရာစျေးနှုန်းတွေ သတ်မှတ်ထားပါတယ်။ Template ရွေးပြီးတာနဲ့ စျေးနှုန်းကို မြင်ရပါမယ်။ NFC + QR card အတွက်လည်း သက်ဆိုင်ရာစျေးနှုန်း ရှိပါတယ်။" },
              { q: "Profile ကို ဘယ်နှစ်ခု ဖန်တီးနိုင်ပါသလဲ?", a: "Category တစ်ခုချင်းစီမှာ profile ၁ ခုစီ ဖန်တီးနိုင်ပါတယ်။ Total profile ၄ ခုအထိ ဖန်တီးနိုင်ပါတယ်။" },
              { q: "QR code ကို ဘယ်နှစ်ကြိမ် scan လို့ရပါသလဲ?", a: "အကန့်အသတ် မရှိပါ။ QR code ကို ဘယ်နှစ်ကြိမ်မဆို scan လို့ရပါတယ်။" },
              { q: "Profile ကို ဘယ်အချိန်မဆို ပြင်ဆင်နိုင်ပါသလဲ?", a: "Payment approve ဖြစ်ပြီးနောက်မှာ ဘယ်အချိန်မဆို ပြင်ဆင်နိုင်ပါတယ်။ Payment မတင်ရသေးခင် (သို့) approve မဖြစ်သေးခင်မှာ profile details ထည့်ခြင်း၊ edit ခြင်းတွေ မလုပ်နိုင်ပါ။" },
              { q: "NFC card ဘယ်လောက်ကြာမှ ရပါသလဲ?", a: "Order လုပ်ပြီးနောက် ၁-၂ ပတ်အတွင်း ရရှိပါတယ်။ Location ပေါ်မူတည်ပြီး ကွာခြားနိုင်ပါတယ်။" },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border p-5"
                style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
                <p className="font-bold" style={{ color: "var(--nc-text)" }}>{faq.q}</p>
                <p className="mt-2 text-sm" style={{ color: "var(--nc-text-2)" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16 rounded-2xl border p-8 text-center"
          style={{ borderColor: "var(--nc-border)", background: "var(--nc-bg-card)" }}>
          <h2 className="text-xl font-black" style={{ color: "var(--nc-text)" }}>
            အကူအညီ လိုအပ်ပါသလား?
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--nc-text-2)" }}>
            ကျွန်တော်တို့ကို ဆက်သွယ်ပါ။ ကူညီပေးဖို့ အမြဲအဆင့်သင့်ပါတယ်။
          </p>
          <Link href="mailto:sale@wetechmm.com"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: "var(--nc-brand-grad)" }}>
            <Mail className="h-4 w-4" />
            sale@wetechmm.com
          </Link>
        </section>
      </main>
    </div>
  );
}
