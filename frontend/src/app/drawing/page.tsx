import DrawingCanvas from '@/components/drawing/DrawingCanvas';

export default function DrawingPage() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <DrawingCanvas />
    </div>
  );
}

export const metadata = {
  title: 'P&ID Drawing Editor - Ergoplanner',
  description: 'Create and edit P&ID diagrams with the Ergoplanner drawing editor',
};