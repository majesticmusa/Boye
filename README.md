# Boye Digital marketing funnel

The public entry is `/`. Send organic, referral and Meta traffic there with `utm_source`, `utm_medium` and `utm_campaign`. The ten-question assessment saves the lead, calculates a score out of 20 and recommends a next step. Results include an illustrative clinic walkthrough. The Sprint costs ₦35,000. The 60-day offer costs ₦150,000. A verified Sprint payment unlocks ₦35,000 credit for seven days from payment.

## Publish and operate

Connect the existing Netlify project **boye-funnel-build** to the **marketing-funnel** branch of majesticmusa/Boye. Leave the base directory empty. The repository root contains netlify.toml, the build command, the public directory and functions. Use Node 22. Run `npm install` and `npm run build` or use `netlify dev` locally. The build runs regression tests. Production records survive redeploys. Previews use a separate store.

The fit check always leads to the Boye Digital strategy-call calendar. Its confirmation is separate from the fit-check acknowledgement. Inspect leads, campaign attribution, qualifications and payment receipts in Netlify **Data & storage → Blobs → conversion-funnel**. Match records by lead ID. Contacts and receipts are private. For a cross-device upgrade, reconcile the customer's original payment reference before arranging the remaining balance.

## Payments and follow-up

Set secrets on the project for the production Functions scope and redeploy. Keep all keys out of Git. Use Paystack test mode and your own opted-in contacts for acceptance before enabling live charges and messaging.

| Setting | Purpose |
|---|---|
| PAYSTACK_SECRET_KEY | Enables server-initialized NGN checkout. Add the site's `/hooks/paystack` URL to the merchant dashboard. Return verification and signed payment events reconcile the same order. |
| RESEND_API_KEY | Enables email for leads who select email. |
| EMAIL_FROM | Defaults to Boye Digital <support@boyedigital.com.ng>. Verify the sending domain in Resend. |
| WA_TOKEN, WA_PHONE_ID, WA_GRAPH_VERSION | Enable WhatsApp Cloud API using the sending number ID and an API version supported by the business account. |
| WA_LANGUAGE | Exact approved template locale. Defaults to en. |

The scheduler checks every ten minutes for the current day of the seven-day series. Skipped days are never blasted later. A full-system purchase or unsubscribe ends the sequence. A Sprint buyer's email points to the upgrade. Each recipient/channel has a delivery record. Ambiguous WhatsApp delivery is marked for review. Reconcile ambiguous records against the provider before resending. Without provider settings the calendar remains usable.

## WhatsApp templates

Submit the seven marketing-category templates below to Meta. Use three positional body variables in this order: first name, offer URL, preference URL. Choose the same locale as WA_LANGUAGE. Use this format for every body: “Hi {{1}}, [day text] See your next step at {{2}}. Manage your messages at {{3}}. — Boye Digital”. Replace [day text] with the matching text below. Meta approval is separate from deployment.

| Name | Day text |
|---|---|
| boye_funnel_day_1 | Your scorecard is ready. Start with the lowest-scoring area and make one practical change this week. |
| boye_funnel_day_2 | Read your offer to someone new. Can they tell who it helps and what changes for that buyer? |
| boye_funnel_day_3 | Give the curious visitor one useful resource and a clear way to stay in touch. |
| boye_funnel_day_4 | Open your last five enquiries. Write a helpful reply to the most common question and add one clear next step. |
| boye_funnel_day_5 | Put one genuine customer example beside your booking button so buyers can see the evidence when they need it. |
| boye_funnel_day_6 | Test your latest campaign link on your phone, from first click to enquiry. Check where the lead appears. |
| boye_funnel_day_7 | Our 60-day system launches at ₦150,000. A ₦35,000 Sprint payment counts in full if you upgrade within seven days of payment. |

## Acceptance

Submit one synthetic assessment with follow-up unchecked. Confirm the result, opt-in record and campaign source, choose an offer and complete the fit check. Confirm the calendar opens. With provider test settings, verify a ₦35,000 Sprint, repeat the callback, then check the ₦115,000 upgrade. The score, offer price, checkout amount and receipt are computed or verified on the server. Card data goes to Paystack. Check delivery and opt-out separately on email and WhatsApp before sending campaign traffic.
