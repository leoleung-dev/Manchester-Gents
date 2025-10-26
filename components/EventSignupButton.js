'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EventSignupButton({ eventId, deadline, existingSignup }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [note, setNote] = useState(existingSignup?.specialRequests || '');
  const [showRequestField, setShowRequestField] = useState(Boolean(existingSignup?.specialRequests));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setNote(existingSignup?.specialRequests || '');
    setShowRequestField(Boolean(existingSignup?.specialRequests));
    setShowCancelConfirm(false);
    setError(null);
  }, [existingSignup]);

  const isLoggedIn = Boolean(session);
  const isLoading = status === 'loading';
  const isRegistered = Boolean(existingSignup);
  const isClosed = useMemo(() => {
    if (!deadline) {
      return false;
    }
    return new Date(deadline) < new Date();
  }, [deadline]);

  const handleReserve = async () => {
    if (!isLoggedIn) {
      router.push('/login?from=event');
      return;
    }
    if (isClosed) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload =
        showRequestField && note.trim().length
          ? { specialRequests: note.trim() }
          : {};
      const response = await fetch(`/api/events/${eventId}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Unable to reserve your spot right now.');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!isLoggedIn) {
      router.push('/login?from=event');
      return;
    }
    setIsCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/signup`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Unable to cancel your RSVP.');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="rsvp-container">
      {isRegistered ? (
        <div className="reserved-card">
          <span>🎩 You are confirmed for this event.</span>
          {existingSignup?.specialRequests && (
            <p className="reserved-note">
              Special request: {existingSignup.specialRequests}
            </p>
          )}
          {showCancelConfirm ? (
            <div className="cancel-panel">
              <p>Need to free up your spot?</p>
              <div className="button-row">
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={isCancelling}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep my reservation
                </button>
                <button
                  type="button"
                  className="danger-btn"
                  disabled={isCancelling}
                  onClick={handleCancel}
                >
                  {isCancelling ? 'Cancelling…' : 'Cancel RSVP'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel my RSVP
            </button>
          )}
        </div>
      ) : (
        <div className="reserve-card">
          {showRequestField && (
            <label className="request-field">
              <span>Special requests (optional)</span>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Dietary needs, access considerations, or other notes for the host."
              />
              <button
                type="button"
                className="link-button"
                onClick={() => setShowRequestField(false)}
              >
                Remove special request
              </button>
            </label>
          )}
          <div className="button-row">
            <button
              type="button"
              className="primary-btn"
              onClick={handleReserve}
              disabled={isSubmitting || isClosed}
            >
              {isClosed ? 'Registration closed' : isSubmitting ? 'Reserving…' : 'Reserve my spot'}
            </button>
            {!showRequestField && !isClosed && (
              <button
                type="button"
                className="link-button"
                onClick={() => setShowRequestField(true)}
              >
                Add special request
              </button>
            )}
          </div>
        </div>
      )}
      {!isLoggedIn && !isRegistered && !isClosed && (
        <p className="hint">Sign in to reserve your place at this event.</p>
      )}
      {isClosed && !isRegistered && (
        <p className="hint">Registration is closed for this experience.</p>
      )}
      {error && <p className="error">{error}</p>}
      <style jsx>{`
        .rsvp-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .reserve-card,
        .reserved-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .reserved-card {
          padding: 0.9rem 1.2rem;
          border-radius: 16px;
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.35);
          font-size: 0.88rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .reserved-note {
          margin: 0;
          font-size: 0.85rem;
          letter-spacing: 0;
          text-transform: none;
          opacity: 0.8;
        }
        .request-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .request-field span {
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        textarea {
          border-radius: 12px;
          padding: 0.75rem 1rem;
          background: rgba(11, 21, 35, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: inherit;
          resize: vertical;
          min-height: 120px;
        }
        .button-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }
        .primary-btn {
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0f1727;
          background: linear-gradient(120deg, var(--color-gold), var(--color-amber));
          box-shadow: 0 20px 30px rgba(255, 212, 96, 0.25);
          border: none;
        }
        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .secondary-btn {
          padding: 0.7rem 1.6rem;
          border-radius: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(20, 32, 49, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--color-gold);
        }
        .danger-btn {
          padding: 0.7rem 1.6rem;
          border-radius: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: rgba(255, 104, 104, 0.15);
          border: 1px solid rgba(255, 104, 104, 0.35);
          color: #ffb4b4;
        }
        .link-button {
          background: transparent;
          border: none;
          color: var(--color-gold);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
        }
        .link-button:hover {
          opacity: 0.8;
        }
        .cancel-panel {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          text-transform: none;
        }
        .cancel-panel p {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.8;
        }
        .hint {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.7;
        }
        .error {
          margin: 0;
          font-size: 0.8rem;
          color: #ff9f9f;
        }
      `}</style>
    </div>
  );
}
