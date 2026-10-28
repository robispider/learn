import book from '@khelaghor/book-c3-math';
import { Shell } from '@khelaghor/shell';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell book={book} />
  </StrictMode>,
);
