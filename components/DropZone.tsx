'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => onFiles(acceptedFiles),
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `1.5px dashed ${isDragActive ? 'var(--color-a)' : 'var(--color-bd3)'}`,
        borderRadius: '14px',
        padding: '52px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all .25s',
        background: isDragActive ? 'rgba(198,241,53,.025)' : 'var(--color-s1)',
        position: 'relative',
        marginBottom: '16px',
      }}
    >
      <input {...getInputProps()} />
      <div style={{ pointerEvents: 'none' }}>
        {/* Icon */}
        <div
          style={{
            color: isDragActive ? 'var(--color-a)' : 'var(--color-mu)',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'center',
            transition: 'all .25s',
            transform: isDragActive ? 'translateY(-4px)' : 'none',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4 L16 22 M8 14 L16 4 L24 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 26 L28 26"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>

        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '-.3px',
            marginBottom: '6px',
            color: 'var(--color-tx)',
          }}
        >
          {isDragActive ? 'Release to add images' : 'Drop images here'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-mu)',
            letterSpacing: '.5px',
          }}
        >
          JPG · PNG · WEBP · BMP — multiple files supported
        </div>
      </div>
    </div>
  );
}
