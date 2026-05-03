type Props = {
  onOpenPalette: () => void;
};

export default function TopBar({ onOpenPalette }: Props) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500" />
          <span className="font-semibold tracking-tight">Time Lens</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <button
            onClick={onOpenPalette}
            className="px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 inline-flex items-center gap-2"
          >
            <span className="font-mono text-xs">Cmd K</span>
          </button>
          <button className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900">Theme</button>
          <button className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900">Help</button>
        </div>
      </div>
    </header>
  );
}
