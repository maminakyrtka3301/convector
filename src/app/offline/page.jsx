export const metadata = {
  title: 'Оффлайн',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Вы офлайн</h1>
        <p className="text-muted-foreground">
          Похоже, нет подключения к интернету. Проверьте сеть и попробуйте снова.
        </p>
      </div>
    </div>
  );
}


