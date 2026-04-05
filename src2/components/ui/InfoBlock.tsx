interface InfoBlockProps {
  children: React.ReactNode;
}

export function InfoBlock({ children }: InfoBlockProps) {
  return (
    <div
      className="rounded text-[13px] text-[#1E3A8A] px-4 py-3"
      style={{
        background: '#EEF3FD',
        borderLeft: '3px solid #2B62E8',
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}
