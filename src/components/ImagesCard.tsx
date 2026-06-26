import { BASE_URL } from '../config';
import type { ImageInfo } from '../types';
import { Card } from './ui';

export function ImagesCard({ images }: { images: ImageInfo[] }) {
  return (
    <Card>
      <h3>🖼️ Images ({images.length})</h3>
      <div className="images-grid">
        {images.map((image) => {
          const sizeKB = (image.size / 1024).toFixed(1);
          const src = image.url.startsWith('http') ? image.url : BASE_URL + image.url;
          return (
            <div className="img-item" key={image.id}>
              <img
                src={src}
                alt={image.originalPath}
                loading="lazy"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="img-size">{sizeKB}KB</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
