# Andria Fitness

Lead magnet and free trial funnel for Andria Fitness, a strength and weight-loss studio.

**Flow:** landing page → one of four free 4-week plans or 7-day free trial → thank-you page → email follow-up → paid program

Static HTML, CSS and JavaScript. No build step, so the folder can be deployed as it is (Vercel, Netlify or GitHub Pages).

## Pages

```
index.html        landing page: hero, quick facts, problem list, about and video, how we
                  help, free plan picker and sign-up, how we train, how the free week works,
                  programs, fit check, reviews, FAQ, closing call to action
trial.html        7-day free trial sign-up
thank-you.html    thank-you page; ?type=plan shows the chosen plan's PDF and a trial offer,
                  ?type=trial shows the booking details and the paid programs
program.html      programs, prices and comparison (the paid step)
legal.html        privacy, terms and health notice
emails/           follow-up email templates (see below)
lead-magnet/      sources of the four free plan PDFs
assets/           styles, script, fonts (Figtree, SIL OFL), images and the PDFs
```

## Email follow-up

Load these into your email tool (Mailchimp, Brevo, ConvertKit or similar). Merge tags are written as `{{first_name}}`; rename them to match your tool. Free plan sign-ups also send `plan` (`starter`, `fat-loss`, `home` or `tone-up`) and `planName` (for example "4-Week Home Plan"): use `planName` for `{{plan_name}}` and the matching PDF link for `{{plan_url}}`.

| When | Free plan sign-ups | Trial sign-ups |
| --- | --- | --- |
| Straight away | `plan-1-welcome.html` | `trial-1-confirm.html` |
| Day 2 | `plan-2-week1.html` | |
| Day 4 | `plan-3-food.html` | |
| Day 6 | `plan-4-trial.html` | `trial-2-offer.html` |

## Notes

- **Contact details are fictional.** The email (`hello@andriafitness.com`), phone (`+44 7700 900318`) and street address look real but reach no one: the number is from Ofcom's range reserved for drama, so it never connects to a real line, and the email domain is unregistered. Replace them with the real ones before launch.
- **Visitor data is masked.** On the thank-you page the visitor's email keeps only its first 2 letters and the domain (`pr•••••@gmail.com`) and the phone only its last 2 digits.
- **Form data.** Sign-ups are kept in the browser (sessionStorage) to fill in the thank-you page. To receive them, paste a form endpoint (Formspree, a Make or Zapier webhook, or your email tool's form URL) into `endpoint` at the top of `assets/site.js`.
- **Free plan PDFs.** Four plans, each with its own colour: Starter (lime), Fat loss (maroon), Home (black) and Tone up (light green). Each PDF in `assets/` (`andria-4-week-*-plan.pdf`) is printed from its file in `lead-magnet/` (`plan.html` for the Starter plan, then `plan-fat-loss.html`, `plan-home.html`, `plan-tone-up.html`) on A4 with no margins and background graphics on. They share `lead-magnet/plan.css` and set their colours at the top of each file. Each cover on the site (`assets/img/plan-cover*.png`) is the first page of its PDF at 600 px wide. The picker text, colours and file paths are in `PLANS` at the top of `assets/site.js`.
- **Photos.** The top photo is in `assets/img/hero-yoga.jpg`. The rest come from Pexels (free licence) and load from Pexels for now; download them into `assets/img` before launch.
- **Link previews.** Before launch, set `og:image` in `index.html` to the full https URL on the live domain and add `og:url`, so WhatsApp, Facebook and LinkedIn show the share image.
- **Online class video.** A YouTube video ("Why I teach free online Zoom yoga classes"), credited under the player. Swap it for the studio's own video when there is one (see the comment in `index.html`).
- **Prices, class sizes, batch timings and reviews are sample content.** Replace them with the studio's real details and real member reviews (with permission) before launch.

## Run locally

```
npx serve .
```

Then open http://localhost:3000.
