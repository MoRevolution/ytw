export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-secondary rounded-lg shadow-lg overflow-hidden">
        <header className="bg-accent text-onAccent py-6 px-8">
          <h1 className="text-4xl font-bold text-center">Terms and Privacy</h1>
        </header>
        <main className="p-8">
          <p className="text-onBackground text-lg leading-relaxed">
            Please note that:
          </p>
          <ul className="mt-4 space-y-3 text-onBackground text-base">
            <li>
              <span className="font-semibold">Privacy:</span> We don’t save any of your user data with anyone. All computation and logic is client-side.
            </li>
            <li>
              <span className="font-semibold">Permissions:</span> We only request your permission to log in to Google Takeout and fetch your YouTube Takeout exports from Google Drive.
            </li>
          </ul>
          <p className="mt-6 text-onSurface text-sm">
            By using this tool, you acknowledge that this is a personal project and not an official service. Use it at your own discretion.
          </p>
        </main>
        <footer className="bg-surface py-4 px-8 text-center">
          <p className="text-onSurface text-sm">
            &copy; {new Date().getFullYear()} YouTube Wrapped. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}