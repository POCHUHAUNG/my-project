import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const ASPECT_OPTIONS = [
  { label: '16:9（橫幅）', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1（正方形）', value: 1 },
  { label: '3:1（超寬）', value: 3 / 1 },
  { label: 'A4 直式', value: 210 / 297 },
  { label: 'A4 橫式', value: 297 / 210 },
];

function getCroppedBlob(imageSrc, croppedAreaPixels) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x, croppedAreaPixels.y,
        croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0,
        croppedAreaPixels.width, croppedAreaPixels.height
      );
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
    };
  });
}

function ImageUpload({ onUploaded, label = '上傳圖片' }) {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = '';
  }

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    setUploading(true);
    setError(null);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels);
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上傳失敗');
      onUploaded(data.url);
      setSrc(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setSrc(null);
    setError(null);
  }

  return (
    <>
      <div className="image-upload">
        <label className="upload-btn">
          {label}
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
        </label>
        {error && <span className="field-error">{error}</span>}
      </div>

      {src && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-toolbar">
              <span className="crop-label">顯示比例：</span>
              {ASPECT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  className={`crop-aspect-btn ${aspect === opt.value ? 'active' : ''}`}
                  onClick={() => setAspect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="crop-area">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="crop-zoom-bar">
              <span>縮放</span>
              <input
                type="range" min={1} max={3} step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>

            <div className="crop-actions">
              <button className="crop-cancel" onClick={handleCancel}>取消</button>
              <button className="crop-confirm" onClick={handleConfirm} disabled={uploading}>
                {uploading ? '上傳中...' : '確認裁切並上傳'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageUpload;
