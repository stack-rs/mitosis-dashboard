export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 py-4 mt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Links */}
          <div className="flex flex-wrap gap-4 text-sm justify-center items-center">
            <p className="text-sm text-gray-600">
              © 2025{" "}
              <a
                href="https://github.com/stack-rs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                stack-rs
              </a>
            </p>
            <span className="text-gray-400">•</span>
            <a
              href="https://stack.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Homepage
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://github.com/stack-rs/mitosis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Mitosis
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="http://docs.stack.rs/mitosis/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Docs
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://github.com/stack-rs/mitosis-python-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Python SDK
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="https://github.com/stack-rs/mitosis-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
