export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[420px] min-h-screen bg-gray-900">
      {children}
    </div>
  );
}
