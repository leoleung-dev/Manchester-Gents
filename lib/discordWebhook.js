'use server';

const DEFAULT_BASE_URL = 'https://www.mcr.gent';

function normaliseBaseUrl() {
  const raw = process.env.MCR_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, '');
}

function formatInstagram(instagram) {
  if (!instagram) {
    return { handle: null, display: 'Not provided' };
  }
  const normalised = instagram.replace(/^@/, '');
  const label = `@${normalised}`;
  const link = `https://instagram.com/${normalised}`;
  return { handle: normalised, display: `[${label}](${link})` };
}

async function postToDiscord(webhookUrl, payload, contextLabel) {
  if (!webhookUrl) {
    console.warn(`${contextLabel} webhook URL missing; skipping Discord notification.`);
    return;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(`${contextLabel} webhook failed`, response.status, text);
    }
  } catch (error) {
    console.error(`${contextLabel} webhook error`, error);
  }
}

export async function sendMemberSignupNotification(member) {
  if (!member) {
    return;
  }
  const webhookUrl = process.env.DISCORD_MEMBER_WEBHOOK_URL;
  const baseUrl = normaliseBaseUrl();
  const memberSlug = member.slug || member.instagram || member.id || '';
  const profileUrl = `${baseUrl}/admin/members/${encodeURIComponent(memberSlug)}`;
  const instagram = formatInstagram(member.instagram);

  const payload = {
    embeds: [
      {
        title: '👤 New member signup',
        fields: [
          { name: 'Name', value: member.name || 'Unknown member' },
          { name: 'Instagram', value: instagram.display },
          { name: 'Admin profile', value: `[Open profile](${profileUrl})` }
        ],
        timestamp: new Date().toISOString(),
        color: 0xffd460
      }
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Open Profile',
            url: profileUrl
          }
        ]
      }
    ]
  };

  await postToDiscord(webhookUrl, payload, 'Member signup');
}

function buildEventLinks(signup) {
  const baseUrl = normaliseBaseUrl();
  const memberSlug = signup.member?.slug || signup.member?.instagram || signup.member?.id || '';
  const memberProfileUrl = `${baseUrl}/admin/members/${encodeURIComponent(memberSlug)}`;
  const eventSlug = signup.event?.slug ? encodeURIComponent(signup.event.slug) : '';
  const signupId = encodeURIComponent(signup.id);
  const signupAdminUrl = `${baseUrl}/admin/events/${eventSlug}/signups/${signupId}`;
  const markDoneUrl = `${baseUrl}/api/groupchatconfirmation/${signupId}`;
  return { baseUrl, memberProfileUrl, signupAdminUrl, markDoneUrl };
}

function appendWaitParam(url = '') {
  if (!url) {
    return url;
  }
  return url.includes('?') ? `${url}&wait=true` : `${url}?wait=true`;
}

export async function sendEventSignupNotification(signup) {
  if (!signup) {
    return null;
  }
  const webhookUrl =
    process.env.DISCORD_EVENT_ACTION_WEBHOOK_URL ||
    process.env.DISCORD_EVENT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Event signup webhook URL missing; skipping Discord notification.');
    return null;
  }
  const { memberProfileUrl, markDoneUrl } = buildEventLinks(signup);
  const instagram = formatInstagram(signup.member?.instagram);
  const memberName = signup.member?.name || 'A member';
  const eventName = signup.event?.name || 'an event';

  const fields = [
    { name: 'Instagram', value: instagram.display },
    { name: 'Group Chat', value: signup.groupChatUrl || 'Not provided' },
    { name: 'Admin', value: `[Member Profile](${memberProfileUrl})` },
    { name: 'Mark as Done', value: `[Open confirmation link](${markDoneUrl})` }
  ];

  const payload = {
    embeds: [
      {
        title: '🎟 New event signup',
        description: `${memberName} signed up for ${eventName}.`,
        fields,
        timestamp: new Date().toISOString(),
        color: 16766048
      }
    ]
  };

  const targetUrl = appendWaitParam(webhookUrl);
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('Event signup webhook failed', response.status, text);
      return null;
    }
    const data = await response.json().catch(() => null);
    return data?.id || null;
  } catch (error) {
    console.error('Event signup webhook error', error);
    return null;
  }
}

export async function sendEventSignupCompletedNotification(signup) {
  if (!signup) {
    return;
  }
  const webhookUrl =
    process.env.DISCORD_EVENT_SIGNUP_WEBHOOK_URL ||
    process.env.DISCORD_EVENT_WEBHOOK_URL;
  const { memberProfileUrl, signupAdminUrl } = buildEventLinks(signup);
  const instagram = formatInstagram(signup.member?.instagram);

  const fields = [
    { name: 'Member', value: signup.member?.name || 'Unknown member' },
    { name: 'Instagram', value: instagram.display },
    { name: 'Group Chat', value: signup.groupChatUrl || 'Not provided' },
    { name: 'Admin', value: `[Member profile](${memberProfileUrl})\n[Signup page](${signupAdminUrl})` }
  ];

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: 'Open Member',
          url: memberProfileUrl
        },
        ...(signup.groupChatUrl
          ? [
              {
                type: 2,
                style: 5,
                label: 'Open Group Chat',
                url: signup.groupChatUrl
              }
            ]
          : []),
        {
          type: 2,
          style: 5,
          label: 'Open Signup',
          url: signupAdminUrl
        }
      ]
    }
  ];

  const payload = {
    embeds: [
      {
        title: '✅ Event signup marked done',
        description: `${signup.member?.name || 'A member'} confirmed for ${
          signup.event?.name || 'an event'
        }.`,
        fields,
        timestamp: new Date().toISOString(),
        color: 0x30a46c
      }
    ],
    components
  };

  await postToDiscord(webhookUrl, payload, 'Event signup completion');
}
