const API_BASE_URL = process.env.IG_AUTOMATION_BASE_URL || 'https://mgautomation.le0.uk';
const API_TOKEN = process.env.API_TOKEN;

async function callAutomation(path, searchParams, { timeoutMs = 5000 } = {}) {
  if (!API_TOKEN) {
    throw new Error('Missing API_TOKEN for Instagram automation.');
  }

  const url = `${API_BASE_URL}${path}?${searchParams.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': API_TOKEN
      },
      method: 'GET',
      signal: controller.signal
    });

    const body = await response.text();

    if (!response.ok) {
      const reason = body || response.statusText;
      throw new Error(`Automation request failed (${response.status}): ${reason}`);
    }

    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Automation request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function addUserToInstagramThread({ threadId, username, confirmationMessage }) {
  if (!threadId || !username) {
    return { skipped: true, reason: !threadId ? 'Missing threadId' : 'Missing username' };
  }

  const addParams = new URLSearchParams({ threadid: threadId, user: username });
  const addResponse = await callAutomation('/api/addtogroup', addParams);

  let dmError = null;
  let dmResponse = null;
  if (confirmationMessage) {
    const dmParams = new URLSearchParams({ user: username, message: confirmationMessage });
    try {
      dmResponse = await callAutomation('/api/senddm', dmParams);
    } catch (error) {
      dmError = error;
    }
  }

  return { added: true, dmError, addResponse, dmResponse };
}

export async function sendInstagramDm({ username, message }) {
  if (!username || !message) {
    return { skipped: true, reason: !username ? 'Missing username' : 'Missing message' };
  }
  const params = new URLSearchParams({ user: username, message });
  const response = await callAutomation('/api/senddm', params);
  return { ok: true, response };
}
