export function buildReferralBroadcastEmail(firstName: string, referralCode: string) {
  const referralLink = `https://waitlist.taskgh.com/?ref=${referralCode}`;
  
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TaskGH Referral Email</title>
</head>
<body style="margin:0;padding:0;background:#0f1115;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f1115;padding:30px 15px;">
<tr>
<td align="center">

<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#1a1d24;border-radius:18px;overflow:hidden;">

<!-- HERO -->

<tr>
<td style="background:#0d6efd;padding:40px 30px;text-align:left;">

<h1 style="margin:0;font-size:42px;line-height:46px;color:#ffffff;font-weight:800;">
You’re On The List 🎉
</h1>

<p style="margin:18px 0 0 0;font-size:22px;line-height:30px;color:#dce7ff;font-weight:600;">
Refer 5 friends and get <br><span style="background:#ffffff;color:#0d6efd;padding:6px 14px;border-radius:10px;font-weight:800;">Priority Access</span>
</p>

</td>
</tr>

<!-- BODY -->

<tr>
<td style="padding:40px 30px;">

<p style="margin:0 0 25px 0;font-size:18px;line-height:30px;color:#ffffff;">
Hi ${firstName},
</p>

<p style="margin:0 0 25px 0;font-size:18px;line-height:30px;color:#d7dbe3;">
Thanks again for joining the <strong style="color:#ffffff;">TaskGH</strong> waitlist.
</p>

<p style="margin:0 0 25px 0;font-size:18px;line-height:30px;color:#d7dbe3;">
We’re building Ghana’s trusted platform for booking plumbers, electricians, AC technicians and skilled artisans on demand.
</p>

<p style="margin:0 0 25px 0;font-size:18px;line-height:30px;color:#d7dbe3;">
Want to move ahead of others on the waitlist?
</p>

<p style="margin:0 0 30px 0;font-size:22px;line-height:34px;color:#ffffff;font-weight:700;">
Invite <span style="color:#0d6efd;">5 friends</span> and unlock <br>Priority Access at launch.
</p>

<!-- CTA -->

<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 30px auto;">
<tr>
<td align="center" bgcolor="#22c55e" style="border-radius:12px;">
<a href="${referralLink}" style="display:inline-block;padding:18px 34px;font-size:18px;font-weight:700;color:#ffffff;text-decoration:none;">
Invite Friends Now
</a>
</td>
</tr>
</table>

<!-- REFERRAL BOX -->

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#11151d;border:1px solid #2b3240;border-radius:14px;">
<tr>
<td style="padding:20px;text-align:center;">

<p style="margin:0 0 12px 0;font-size:14px;color:#98a2b3;">
Your Personal Invite Link
</p>

<p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">
waitlist.taskgh.com/?ref=${referralCode}
</p>

</td>
</tr>
</table>

<p style="margin:30px 0 0 0;font-size:16px;line-height:28px;color:#98a2b3;">
The more friends you invite, the higher your chance of early access, launch offers and faster bookings.
</p>

</td>
</tr>

<!-- FOOTER -->

<tr>
<td style="padding:25px 30px;border-top:1px solid #2a2f3a;">

<p style="margin:0;font-size:14px;line-height:24px;color:#7f8796;text-align:center;">
TaskGH<br>
Trusted Artisans, On Demand 🇬🇭
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}
