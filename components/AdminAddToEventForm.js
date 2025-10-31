'use client';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

function getUserLabel(user = {}) {
  const preferred = user.preferredName?.trim();
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  const handle = user.instagramHandle || '';
  let base = preferred || first || '';
  if (!base && first && last) {
    base = `${first} ${last}`.trim();
  }
  if (!base && first) {
    base = first;
  }
  if (!base) {
    return `@${handle}`;
  }
  return `${base} (@${handle})`;
}

export default function AdminAddToEventForm({ events = [], users = [] }) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
      if (timeA === timeB) {
        return (a.title || '').localeCompare(b.title || '');
      }
      return timeA - timeB;
    });
  }, [events]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const nameA = getUserLabel(a).toLowerCase();
      const nameB = getUserLabel(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [users]);

  const [formState, setFormState] = useState({
    eventId: sortedEvents[0]?.id || '',
    search: ''
  });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!sortedEvents.length) {
      setFormState((prev) => ({ ...prev, eventId: '' }));
      return;
    }
    if (!sortedEvents.some((event) => event.id === formState.eventId)) {
      setFormState((prev) => ({ ...prev, eventId: sortedEvents[0].id }));
    }
  }, [sortedEvents]);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
    setSuccess(null);
  };

  const hasEvents = sortedEvents.length > 0;
  const hasUsers = sortedUsers.length > 0;
  const lowercaseQuery = formState.search.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!lowercaseQuery) {
      return sortedUsers;
    }
    return sortedUsers.filter((user) =>
      getUserLabel(user).toLowerCase().includes(lowercaseQuery)
    );
  }, [sortedUsers, lowercaseQuery]);

  const toggleUser = (userId) => () => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    setSelectedUserIds([]);
  }, [formState.eventId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formState.eventId || selectedUserIds.length === 0) {
      setError('Please select an event and at least one member.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/events/${formState.eventId}/attendees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to add attendees to this event.');
      }
      const created = data?.created?.length ?? selectedUserIds.length;
      const skipped = data?.skipped?.length ?? 0;
      let message = `${created} member${created === 1 ? '' : 's'} added to the guest list.`;
      if (skipped) {
        message += ` ${skipped} already on the list.`;
      }
      setSuccess(message);
      setSelectedUserIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-to-event-form glass-panel" onSubmit={handleSubmit}>
      <div className="form-head">
        <span className="heading-font">Add member to an event</span>
        <p>
          Drop a member or placeholder into a guest list. Perfect for backfilling historical
          attendance or saving a seat manually.
        </p>
        {!hasEvents && <p className="empty-note">Create an event first to add attendees.</p>}
        {!hasUsers && <p className="empty-note">No members or placeholders available yet.</p>}
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Event</span>
          <select
            value={formState.eventId}
            onChange={handleChange('eventId')}
            required
            disabled={!hasEvents}
          >
            <option value="" disabled>
              Select an event
            </option>
            {sortedEvents.map((event) => {
              const start = event.startTime ? new Date(event.startTime) : null;
              const label = start ? `${event.title} • ${format(start, 'd MMM yyyy')}` : event.title;
              return (
                <option key={event.id} value={event.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>
        <label className="field">
          <span>Search members</span>
          <input
            type="text"
            placeholder="Search by name or handle"
            value={formState.search}
            onChange={handleChange('search')}
            disabled={!hasUsers}
          />
        </label>
      </div>
      <div className="pill-list">
        {filteredUsers.map((user) => {
          const label = getUserLabel(user);
          const isActive = selectedUserIds.includes(user.id);
          return (
            <button
              key={user.id}
              type="button"
              className={`pill ${isActive ? 'pill-active' : ''}`}
              onClick={toggleUser(user.id)}
              disabled={!hasUsers}
            >
              {label}
              {user.isPlaceholder && <span className="pill-tag">Placeholder</span>}
            </button>
          );
        })}
        {hasUsers && filteredUsers.length === 0 && (
          <p className="no-results">No members match that search.</p>
        )}
      </div>
      {error && <p className="status status-error">{error}</p>}
      {success && <p className="status status-success">{success}</p>}
      <div className="actions">
        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitting || !hasEvents || !hasUsers || selectedUserIds.length === 0}
        >
          {isSubmitting ? 'Adding…' : 'Add to event'}
        </button>
      </div>
      <style jsx>{`
        .add-to-event-form {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
          padding: clamp(1.75rem, 5vw, 2.5rem);
          border-radius: 24px;
        }
        .form-head {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .form-head p {
          margin: 0;
          opacity: 0.72;
          line-height: 1.6;
        }
        .empty-note {
          margin: 0;
          font-size: 0.82rem;
          color: #ffea9f;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .field span {
          font-size: 0.75rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        select,
        input {
          border-radius: 12px;
          padding: 0.75rem 1rem;
          background: rgba(15, 26, 40, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: inherit;
        }
        select:disabled,
        input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        select:focus,
        input:focus {
          outline: none;
          border-color: var(--color-gold);
        }
        .pill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          max-height: 260px;
          overflow-y: auto;
          padding: 0.35rem;
          border-radius: 18px;
          background: rgba(15, 26, 40, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.2rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(16, 27, 44, 0.7);
          color: inherit;
          letter-spacing: 0.06em;
          font-size: 0.82rem;
        }
        .pill:hover:not(:disabled) {
          border-color: rgba(255, 212, 96, 0.4);
        }
        .pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pill-active {
          background: linear-gradient(120deg, var(--color-gold), var(--color-amber));
          color: #0f1727;
          border: none;
        }
        .pill-tag {
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          background: rgba(15, 23, 39, 0.25);
          border: 1px solid rgba(15, 23, 39, 0.4);
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .no-results {
          margin: 0;
          opacity: 0.6;
        }
        .status {
          margin: 0;
          font-size: 0.82rem;
        }
        .status-error {
          color: #ff9f9f;
        }
        .status-success {
          color: #9affc7;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 720px) {
          .actions {
            justify-content: center;
          }
          .primary-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </form>
  );
}
