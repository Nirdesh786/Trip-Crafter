/**
 * Reusable confirmation modal.
 *
 * Props:
 *  - isOpen: bool
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default "Confirm")
 *  - cancelLabel: string (default "Cancel")
 *  - confirmVariant: "danger" | "primary" (default "danger")
 *  - loading: bool
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
function ConfirmModal({
  isOpen, title, message,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  confirmVariant = "danger", loading = false,
  onConfirm, onCancel,
}) {
  if (!isOpen) return null;

  const confirmClass = confirmVariant === "danger"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-[fadeIn_0.15s_ease]">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
            confirmVariant === "danger" ? "bg-red-100" : "bg-blue-100"
          }`}>
            {confirmVariant === "danger" ? "🗑️" : "✅"}
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 font-bold rounded-xl transition disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
