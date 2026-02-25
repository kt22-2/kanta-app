export default function LoadingSpinner({ label = "読み込み中..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8899AA]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1C2D3E] border-t-[#C8A96E]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
