import { useEffect, useState } from 'react';
import api from '../api';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/gallery')
      .then(({ data }) => {
        if (!cancelled) {
          setImages(data);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="section">
      <h1>Gallery</h1>

      {status === 'loading' && <p>Loading gallery&hellip;</p>}
      {status === 'error' && (
        <p className="error-text">Could not load the gallery right now.</p>
      )}
      {status === 'ready' && images.length === 0 && (
        <p>No photos have been added yet. Check back soon!</p>
      )}

      <div className="gallery-grid">
        {images.map((img) => (
          <figure className="gallery-item" key={img._id}>
            <img src={img.imageUrl} alt={img.title} loading="lazy" />
            <figcaption>{img.title}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
