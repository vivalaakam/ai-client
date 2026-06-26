import { useState, useCallback } from 'react';
import { Alert, Upload } from 'antd';
import { FileAddOutlined, LoadingOutlined } from '@ant-design/icons';
import { api } from '../../api';
import styles from './DropZone.module.scss';

interface DropZoneProps {
  onUploadStart: (jobId: string) => void;
  onUploadComplete: (bookId: string) => void;
}

export function DropZone({ onUploadStart, onUploadComplete }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'epub' && ext !== 'fb2' && ext !== 'pdf') {
        setError('Only .epub, .fb2 and .pdf files are supported');
        return;
      }
      setError(null);
      setUploading(true);

      try {
        const result = await api.bookUpload(file);
        onUploadStart(result.jobId);
        pollJob(result.jobId, onUploadComplete);
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        setUploading(false);
      }
    },
    [onUploadStart, onUploadComplete]
  );

  const labelClick = !uploading ? 'Click to upload' : '';
  const labelDrag = !uploading ? ' or drag and drop your EPUB/FB2/PDF file' : '';
  const labelText = uploading ? 'Uploading and parsing...' : '';
  const Icon = uploading ? LoadingOutlined : FileAddOutlined;

  return (
    <div className={styles.root}>
      <Upload.Dragger
        accept=".epub,.fb2,.pdf"
        disabled={uploading}
        fileList={[]}
        multiple={false}
        showUploadList={false}
        beforeUpload={(file) => {
          handleFile(file);
          return false;
        }}
        className={styles.dropZone}
      >
        <div className={styles.icon}>
          <Icon spin={uploading} />
        </div>
        <div className={styles.label}>
          {uploading ? (
            labelText
          ) : (
            <span>
              <strong>{labelClick}</strong>
              {labelDrag}
            </span>
          )}
        </div>
        <div className={styles.hint}>Supported formats: .epub, .fb2, .pdf</div>
      </Upload.Dragger>

      {error && <Alert className={styles.errorCard} message={error} type="error" showIcon />}
    </div>
  );
}

async function pollJob(jobId: string, onComplete: (bookId: string) => void) {
  let attempts = 0;
  const poll = async () => {
    attempts++;
    try {
      const job = await api.jobGet(jobId);
      if (job.status === 'completed' || job.status === 'failed') {
        if (job.status === 'failed') return;
        const books = await api.bookList();
        const book = books.books.find((b) => b.filename === job.originalFilename);
        if (book) {
          onComplete(book.id);
        }
        return;
      }
      if (attempts < 120) {
        setTimeout(poll, 1000);
      }
    } catch {
      if (attempts < 120) {
        setTimeout(poll, 2000);
      }
    }
  };
  setTimeout(poll, 500);
}
