'use client';

import { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImage } from '@/lib/cropImage';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfilePhotoUploader({ value, onChange, disabled = false }) {
  const [isOriginalUploading, setIsOriginalUploading] = useState(false);
  const [isCroppedUploading, setIsCroppedUploading] = useState(false);
  const [error, setError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const [cropSourceIsObjectUrl, setCropSourceIsObjectUrl] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => () => {
    if (cropSource && cropSourceIsObjectUrl) {
      URL.revokeObjectURL(cropSource);
    }
  }, [cropSource, cropSourceIsObjectUrl]);

  const handleFileSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are accepted.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setError(null);
    setIsOriginalUploading(true);
    try {
      const blobUrl = URL.createObjectURL(file);
      setCropSource(blobUrl);
      setCropSourceIsObjectUrl(true);
      setShowCropper(true);

      const originalUpload = await uploadToCloudinary(file, 'original');
      onChange({
        originalUrl: originalUpload.url,
        croppedUrl: value?.croppedUrl || ''
      });
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsOriginalUploading(false);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!cropSource || !croppedAreaPixels) {
      setError('Please adjust the crop before saving.');
      return;
    }
    setError(null);
    setIsCroppedUploading(true);
    try {
      const blob = await getCroppedImage(cropSource, croppedAreaPixels, {
        circle: true,
        width: 400,
        height: 400
      });
      const file = new File([blob], 'profile-cropped.png', { type: 'image/png' });
      const croppedUpload = await uploadToCloudinary(file, 'cropped');
      onChange({
        originalUrl: value?.originalUrl || '',
        croppedUrl: croppedUpload.url
      });
      setShowCropper(false);
    } catch (cropError) {
      setError(cropError.message || 'Unable to crop image.');
    } finally {
      setIsCroppedUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onChange({ originalUrl: '', croppedUrl: '' });
    setCropSource(null);
    setCropSourceIsObjectUrl(false);
    setShowCropper(false);
    setError(null);
  };

  const handleReCrop = () => {
    if (value?.originalUrl) {
      setCropSource(value.originalUrl);
      setCropSourceIsObjectUrl(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setShowCropper(true);
    }
  };

  return (
    <>
      <div className="uploader">
        <label className="upload-label">
          <span>Private reference photo</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelection}
          disabled={disabled || isOriginalUploading || isCroppedUploading}
        />
      </label>
      <p className="upload-note">
        Upload a suited photo so the admin team can recognise you when editing event imagery. We keep
        the original private — only the team can access it.
      </p>
      {(isOriginalUploading || isCroppedUploading) && <p className="upload-status">Uploading…</p>}
      {error && <p className="upload-error">{error}</p>}
      {value?.croppedUrl ? (
        <div className="preview">
          <img src={value.croppedUrl} alt="Profile reference" />
          <div className="preview-actions">
            <button type="button" onClick={handleReCrop} disabled={disabled}>
              Re-crop
            </button>
            <button type="button" onClick={handleRemovePhoto} disabled={disabled}>
              Remove
            </button>
          </div>
        </div>
      ) : null}

      </div>
      {showCropper && cropSource && (
        <div className="cropper-overlay">
          <div className="cropper-container" role="dialog" aria-modal="true">
            <div className="cropper-frame">
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="cropper-controls">
              <label>
                Zoom
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </label>
              <div className="cropper-buttons">
                <button type="button" onClick={() => setShowCropper(false)} disabled={isCroppedUploading}>
                  Cancel
                </button>
                <button type="button" onClick={handleCropConfirm} disabled={isCroppedUploading}>
                  Save crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .uploader {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .upload-label {
          display: inline-flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .upload-label input[type='file'] {
          color: inherit;
        }
        .upload-note {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.65;
        }
        .upload-status {
          margin: 0;
          font-size: 0.78rem;
          opacity: 0.7;
        }
        .upload-error {
          margin: 0;
          font-size: 0.8rem;
          color: #ff9f9f;
        }
        .preview {
          display: inline-flex;
          flex-direction: column;
          gap: 0.4rem;
          width: fit-content;
        }
        .preview img {
          width: 96px;
          height: 96px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          object-fit: cover;
        }
        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }
        .preview-actions button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 0.3rem 0.8rem;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-gold);
        }
        .cropper-overlay {
          position: fixed;
          inset: 0;
          background: rgba(14, 24, 38, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .cropper-container {
          position: relative;
          width: min(480px, 90vw);
          max-height: calc(100vh - 4rem);
          background: rgba(11, 21, 35, 0.9);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 30px 60px rgba(6, 12, 20, 0.45);
        }
        .cropper-frame {
          position: relative;
          width: 100%;
          height: min(360px, 60vh);
          border-radius: 18px;
          overflow: hidden;
          background: rgba(6, 12, 20, 0.9);
        }
        .cropper-frame :global(.reactEasyCrop_Container) {
          position: absolute !important;
          inset: 0;
        }
        .cropper-frame :global(.reactEasyCrop_CropArea) {
          border-radius: 50% !important;
        }
        .cropper-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }
        .cropper-controls label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .cropper-controls input[type='range'] {
          width: 100%;
        }
        .cropper-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .cropper-buttons button {
          padding: 0.65rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: transparent;
          color: var(--color-gold);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .cropper-buttons button:last-child {
          background: linear-gradient(120deg, var(--color-gold), var(--color-amber));
          color: #0f1727;
          border: none;
        }
      `}</style>
    </>
  );
}

async function uploadToCloudinary(file, variant) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('variant', variant);

  const response = await fetch('/api/profile/photo', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Unable to upload image.');
  }

  return response.json();
}
