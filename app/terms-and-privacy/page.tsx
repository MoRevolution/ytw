export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-secondary rounded-lg shadow-lg overflow-hidden">
        <header className="bg-accent text-onAccent py-6 px-8">
          <h1 className="text-4xl font-bold text-center">Super professional Terms of Service and Privacy Policy</h1>
        </header>
        <main className="p-8">
          <p className="text-onBackground text-lg leading-relaxed">
            Hey there! Just a quick heads-up:
          </p>
          <ul className="mt-4 space-y-3 text-onBackground text-base">
            <li>
              <span className="font-semibold">Privacy:</span> We’re not into snooping. Your data stays with you, and all the magic happens right in your browser. Feel free to check out the code and see yourself <a href="https://github.com/morevolution/ytw" className="text-primary hover:underline">here</a>.
            </li>
            <li>
              <span className="font-semibold">Permissions:</span> We just need a little nudge to access Google Takeout and grab your YouTube data from Google Drive. No funny business!
            </li>
          </ul>
          <p className="mt-6 text-onSurface text-sm">
            By using this tool, you’re basically saying, "I know this is a fun side project and not some official thing." So, enjoy and use wisely (??)!
          </p>
          <p className="mt-4 text-onSurface text-sm">
            P.S. Dear YouTube/Google gods, please don't sue us or ask us to take this page down. We promise to not be evil! 🙏
          </p>
        </main>
        <footer className="bg-surface py-4 px-8 text-center">
          <p className="text-onSurface text-sm">
            &copy; {new Date().getFullYear()} YouTube Wrapped. No rights reserved.
          </p>
          <p className="text-onSurface text-sm mt-2">
            <a href="/" className="text-primary hover:underline">Back to Home</a>
          </p>
        </footer>
      </div>
    </div>
  );
}